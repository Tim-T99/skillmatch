"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setInterview = exports.deleteJobs = exports.updateJobs = exports.getJobs = exports.createJob = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config"));
function isPostgresError(error) {
    return typeof error === 'object' && error !== null && 'code' in error;
}
exports.createJob = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const employerId = req.user?.id;
        if (!employerId || req.user?.role_id !== 2) {
            res.status(403).json({ message: 'Access restricted to employers' });
            return;
        }
        const employerResult = await db_config_1.default.query('SELECT company_id FROM employer WHERE id = $1', [employerId]);
        if (employerResult.rows.length === 0) {
            res.status(404).json({ message: 'Employer not found' });
            return;
        }
        const companyId = employerResult.rows[0].company_id;
        const { title, description, status = 'Active', location_type, requirements, skills, application_deadline, } = req.body;
        const missingFields = [];
        if (!title)
            missingFields.push('title');
        if (!description)
            missingFields.push('description');
        if (missingFields.length > 0) {
            res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
            return;
        }
        if (status && !['Active', 'Interviewing', 'Closed'].includes(status)) {
            res.status(400).json({ message: 'Invalid status. Must be Active, Interviewing, or Closed.' });
            return;
        }
        const result = await db_config_1.default.query(`
      INSERT INTO job (
        company_id, employer_id, title, description, status, location_type,
        requirements, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, company_id, employer_id, title, description, status, location_type,
                requirements, created_at, updated_at
      `, [
            companyId,
            employerId,
            title,
            description,
            status,
            location_type || null,
            requirements ? `{${requirements.join(',')}}` : null,
        ]);
        const job = result.rows[0];
        job.requirements = job.requirements || [];
        job.applicants = [];
        job.interviews = [];
        if (skills) {
            const skillArray = skills.split(',').map((s) => s.trim());
            for (const skill of skillArray) {
                const skillResult = await db_config_1.default.query('INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id', [skill]);
                let skillId;
                if (skillResult.rows.length > 0) {
                    skillId = skillResult.rows[0].id;
                }
                else {
                    const existingSkill = await db_config_1.default.query('SELECT id FROM skills WHERE name = $1', [skill]);
                    skillId = existingSkill.rows[0].id;
                }
                await db_config_1.default.query('INSERT INTO job_skills (job_id, skill_id, required_proficiency) VALUES ($1, $2, $3)', [job.id, skillId, 1]);
            }
        }
        res.status(201).json(job);
    }
    catch (error) {
        console.error('Error creating job:', error);
        if (isPostgresError(error) && error.code === '42703') {
            res.status(500).json({ message: `Database error: Column does not exist` });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getJobs = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const employerId = req.user?.id;
        if (!employerId || req.user?.role_id !== 2) {
            res.status(403).json({ message: 'Access restricted to employers' });
            return;
        }
        const employerResult = await db_config_1.default.query('SELECT company_id FROM employer WHERE id = $1', [employerId]);
        if (employerResult.rows.length === 0) {
            res.status(404).json({ message: 'Employer not found' });
            return;
        }
        const companyId = employerResult.rows[0].company_id;
        const jobsResult = await db_config_1.default.query(`
      SELECT id, company_id, employer_id, title, description, status, location_type,
             requirements, created_at, updated_at
      FROM job
      WHERE company_id = $1 AND employer_id = $2
      ORDER BY created_at DESC
      `, [companyId, employerId]);
        const jobs = jobsResult.rows;
        for (let job of jobs) {
            const skillsResult = await db_config_1.default.query(`
        SELECT s.name
        FROM job_skills js
        JOIN skills s ON js.skill_id = s.id
        WHERE js.job_id = $1
        `, [job.id]);
            job.skills = skillsResult.rows.map(row => row.name).join(', ');
            const applicantsResult = await db_config_1.default.query(`
        SELECT 
          s.id, 
          CONCAT(s.first_name, ' ', s.second_name) AS name,
          COALESCE(a.status, 'submitted') AS application_status
        FROM application a
        JOIN seeker s ON a.seeker_id = s.id
        WHERE a.job_id = $1
        `, [job.id]);
            job.applicants = applicantsResult.rows.map(row => ({
                id: row.id.toString(),
                name: row.name.trim(),
                score: 0,
                skills: [],
            }));
            for (let applicant of job.applicants) {
                const applicantSkillsResult = await db_config_1.default.query(`
          SELECT s.name
          FROM seeker_skills ss
          JOIN skills s ON ss.skill_id = s.id
          WHERE ss.seeker_id = $1
          `, [applicant.id]);
                applicant.skills = applicantSkillsResult.rows.map(row => row.name);
            }
            const interviewsResult = await db_config_1.default.query(`
        SELECT 
          i.id, 
          a.seeker_id AS candidate_id, 
          a.job_id, 
          i.interview_date AS date, 
          i.location AS meeting_link
        FROM interviews i
        JOIN application a ON i.application_id = a.id
        WHERE a.job_id = $1
        `, [job.id]);
            job.interviews = interviewsResult.rows.map(row => ({
                id: row.id.toString(),
                candidateId: row.candidate_id.toString(),
                jobId: row.job_id.toString(),
                date: row.date.toISOString().split('T')[0],
                meetingLink: row.meeting_link || '',
            }));
            job.requirements = job.requirements || [];
        }
        res.status(200).json(jobs);
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        if (isPostgresError(error) && error.code === '42703') {
            res.status(500).json({ message: `Database error: Column does not exist` });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateJobs = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const employerId = req.user?.id;
        const { id } = req.params;
        const { title, description, status, location_type, requirements, skills, application_deadline } = req.body;
        if (!employerId || req.user?.role_id !== 2) {
            res.status(403).json({ message: 'Access restricted to employers' });
            return;
        }
        const employerResult = await db_config_1.default.query('SELECT company_id FROM employer WHERE id = $1', [employerId]);
        if (employerResult.rows.length === 0) {
            res.status(404).json({ message: 'Employer not found' });
            return;
        }
        const companyId = employerResult.rows[0].company_id;
        const jobCheck = await db_config_1.default.query('SELECT id FROM job WHERE id = $1 AND company_id = $2 AND employer_id = $3', [id, companyId, employerId]);
        if (jobCheck.rows.length === 0) {
            res.status(404).json({ message: 'Job not found or not authorized' });
            return;
        }
        if (status && !['Active', 'Interviewing', 'Closed'].includes(status)) {
            res.status(400).json({ message: 'Invalid status. Must be Active, Interviewing, or Closed.' });
            return;
        }
        const result = await db_config_1.default.query(`
      UPDATE job
      SET title = $1, description = $2, status = $3, location_type = $4,
          requirements = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, company_id, employer_id, title, description, status, location_type,
                requirements, created_at, updated_at
      `, [
            title,
            description,
            status,
            location_type || null,
            requirements ? `{${requirements.join(',')}}` : null,
            id,
        ]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        const job = result.rows[0];
        if (skills) {
            await db_config_1.default.query('DELETE FROM job_skills WHERE job_id = $1', [id]);
            const skillArray = skills.split(',').map((s) => s.trim());
            for (const skill of skillArray) {
                const skillResult = await db_config_1.default.query('INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id', [skill]);
                let skillId;
                if (skillResult.rows.length > 0) {
                    skillId = skillResult.rows[0].id;
                }
                else {
                    const existingSkill = await db_config_1.default.query('SELECT id FROM skills WHERE name = $1', [skill]);
                    skillId = existingSkill.rows[0].id;
                }
                await db_config_1.default.query('INSERT INTO job_skills (job_id, skill_id, required_proficiency) VALUES ($1, $2, $3)', [id, skillId, 1]);
            }
        }
        const applicantsResult = await db_config_1.default.query(`
      SELECT 
        s.id, 
        CONCAT(s.first_name, ' ', s.second_name) AS name,
        COALESCE(a.status, 'submitted') AS application_status
      FROM application a
      JOIN seeker s ON a.seeker_id = s.id
      WHERE a.job_id = $1
      `, [id]);
        job.applicants = applicantsResult.rows.map(row => ({
            id: row.id.toString(),
            name: row.name.trim(),
            score: 0,
            skills: [],
        }));
        for (let applicant of job.applicants) {
            const applicantSkillsResult = await db_config_1.default.query(`
        SELECT s.name
        FROM seeker_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.seeker_id = $1
        `, [applicant.id]);
            job.skills = applicantSkillsResult.rows.map(row => row.name).join(', ');
        }
        const interviewsResult = await db_config_1.default.query(`
      SELECT 
        i.id, 
        a.seeker_id AS candidate_id, 
        a.job_id, 
        i.interview_date AS date, 
        i.location AS meeting_link
      FROM interviews i
      JOIN application a ON i.application_id = a.id
      WHERE a.job_id = $1
      `, [id]);
        job.interviews = interviewsResult.rows.map(row => ({
            id: row.id.toString(),
            candidateId: row.candidate_id.toString(),
            jobId: row.job_id.toString(),
            date: row.date.toISOString().split('T')[0],
            meetingLink: row.meeting_link || '',
        }));
        job.requirements = job.requirements || [];
        res.json(job);
    }
    catch (error) {
        console.error('Error updating job:', error);
        if (isPostgresError(error) && error.code === '42703') {
            res.status(500).json({ message: `Database error: Column does not exist` });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteJobs = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const employerId = req.user?.id;
        const { id } = req.params;
        if (!employerId || req.user?.role_id !== 2) {
            res.status(403).json({ message: 'Access restricted to employers' });
            return;
        }
        const employerResult = await db_config_1.default.query('SELECT company_id FROM employer WHERE id = $1', [employerId]);
        if (employerResult.rows.length === 0) {
            res.status(404).json({ message: 'Employer not found' });
            return;
        }
        const companyId = employerResult.rows[0].company_id;
        const jobCheck = await db_config_1.default.query('SELECT id FROM job WHERE id = $1 AND company_id = $2 AND employer_id = $3', [id, companyId, employerId]);
        if (jobCheck.rows.length === 0) {
            res.status(404).json({ message: 'Job not found or not authorized' });
            return;
        }
        const result = await db_config_1.default.query('DELETE FROM job WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting job:', error);
        if (isPostgresError(error) && error.code === '42703') {
            res.status(500).json({ message: `Database error: Column does not exist` });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.setInterview = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const employerId = req.user?.id;
        const { candidateId, jobId, date, meetingLink, interviewType = 'virtual' } = req.body;
        // Validate inputs
        if (!employerId || req.user?.role_id !== 2) {
            res.status(403).json({ message: 'Access restricted to employers' });
            return;
        }
        if (!candidateId || !jobId || !date) {
            res.status(400).json({ message: 'Candidate ID, job ID, and date are required' });
            return;
        }
        // Validate date format
        if (isNaN(new Date(date).getTime())) {
            res.status(400).json({ message: 'Invalid date format' });
            return;
        }
        // Verify employer and company
        const employerResult = await db_config_1.default.query('SELECT company_id FROM employer WHERE id = $1', [employerId]);
        if (employerResult.rows.length === 0) {
            res.status(404).json({ message: 'Employer not found' });
            return;
        }
        const companyId = employerResult.rows[0].company_id;
        // Verify job ownership
        const jobCheck = await db_config_1.default.query('SELECT id FROM job WHERE id = $1 AND company_id = $2 AND employer_id = $3', [jobId, companyId, employerId]);
        if (jobCheck.rows.length === 0) {
            res.status(404).json({ message: 'Job not found or not authorized' });
            return;
        }
        // Verify application and get seeker_id
        const applicationResult = await db_config_1.default.query('SELECT id, seeker_id FROM application WHERE job_id = $1 AND seeker_id = $2', [jobId, candidateId]);
        if (applicationResult.rows.length === 0) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        const { id: applicationId, seeker_id: seekerId } = applicationResult.rows[0];
        // Insert interview
        const result = await db_config_1.default.query(`
      INSERT INTO interviews (
        application_id,
        seeker_id,
        interview_date,
        meeting_link,
        interview_type,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, application_id, seeker_id, interview_date AS date, meeting_link
      `, [applicationId, seekerId, date, meetingLink || null, interviewType]);
        const interview = result.rows[0];
        res.json({
            id: interview.id.toString(),
            applicationId: interview.application_id.toString(),
            seekerId: interview.seeker_id.toString(),
            jobId: jobId.toString(),
            date: new Date(interview.date).toISOString().split('T')[0],
            meetingLink: interview.meeting_link || null,
        });
    }
    catch (error) {
        console.error('Error scheduling interview:', error);
        if (isPostgresError(error)) {
            if (error.code === '23503') {
                res.status(400).json({ message: 'Invalid seeker or application reference' });
                return;
            }
            if (error.code === '42703') {
                res.status(500).json({ message: 'Database error: Column does not exist' });
                return;
            }
            res.status(500).json({
                message: `Database error: ${error.code}`,
                detail: error.detail || 'Unknown error',
            });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

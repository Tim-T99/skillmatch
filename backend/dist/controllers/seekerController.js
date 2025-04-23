"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSeekerProfile = exports.getSeekerProfile = exports.applyJob = exports.getSeekerStats = exports.getAllSeekerJobs = exports.getSeekerJobs = exports.getSeekerInterviews = exports.getSeekerAppliedJobs = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const db_config_1 = __importDefault(require("../config/db.config"));
function isPostgresError(error) {
    return typeof error === 'object' && error !== null && 'code' in error;
}
exports.getSeekerAppliedJobs = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const seekerId = req.user?.id;
        if (!seekerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        // Fetch jobs the seeker has applied for
        const jobsResult = await db_config_1.default.query(`
      SELECT 
        j.id,
        j.title AS position,
        c.name AS organization,
        COALESCE(j.location_type, 'Remote') AS location,
        j.status,
        COALESCE(jsm.compatibility_score, 0) AS score,
        COALESCE(j.description, 'No description provided') AS description,
        COALESCE(j.requirements, '{}') AS requirements,
        j.created_at AS posted_date,
        COALESCE(ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS skills
      FROM job j
      JOIN company c ON j.company_id = c.id
      INNER JOIN application a ON j.id = a.job_id AND a.seeker_id = $1
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      LEFT JOIN job_seeker_matches jsm ON j.id = jsm.job_id AND jsm.seeker_id = $1
      GROUP BY j.id, c.name, jsm.compatibility_score, j.title, j.location_type, j.status, j.description, j.requirements, j.created_at
      ORDER BY j.created_at DESC
      `, [seekerId]);
        const jobs = jobsResult.rows.map(row => ({
            id: row.id,
            position: row.position,
            organization: row.organization,
            location: row.location,
            status: row.status,
            score: parseFloat(row.score) || 0,
            applied: true,
            details: {
                description: row.description,
                requirements: Array.isArray(row.requirements) ? row.requirements : [],
                skills: Array.isArray(row.skills) ? row.skills : [],
                postedDate: new Date(row.posted_date).toISOString().split('T')[0],
            },
        }));
        res.status(200).json({ jobs });
    }
    catch (error) {
        console.error('Error in getSeekerAppliedJobs:', error);
        if (isPostgresError(error)) {
            res.status(500).json({
                message: `Database error: ${error.code}`,
                detail: error.detail || 'Unknown error',
            });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSeekerInterviews = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const seekerId = req.user?.id;
        if (!seekerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        // Fetch scheduled interviews for the seeker
        const interviewsResult = await db_config_1.default.query(`
      SELECT 
        i.id AS interview_id,
        i.application_id,
        j.id AS job_id,
        j.title AS position,
        c.name AS organization,
        i.interview_date,
        i.meeting_link,
        i.interview_type,
        i.outcome,
        i.notes,
        i.location
      FROM interviews i
      JOIN application a ON i.application_id = a.id
      JOIN job j ON a.job_id = j.id
      JOIN company c ON j.company_id = c.id
      WHERE a.seeker_id = $1
        AND i.interview_date >= CURRENT_TIMESTAMP
      ORDER BY i.interview_date ASC
      `, [seekerId]);
        const interviews = interviewsResult.rows.map(row => ({
            id: row.interview_id,
            applicationId: row.application_id,
            jobId: row.job_id,
            position: row.position,
            organization: row.organization,
            interview: {
                date: new Date(row.interview_date).toISOString(),
                meetingLink: row.meeting_link || null,
                type: row.interview_type || null,
                outcome: row.outcome || 'pending',
                notes: row.notes || null,
                location: row.location || null,
            },
        }));
        if (interviews.length === 0) {
            console.log('No scheduled interviews found for seekerId:', seekerId);
        }
        res.status(200).json({ interviews });
    }
    catch (error) {
        console.error('Error in getSeekerInterviews:', error);
        if (isPostgresError(error)) {
            res.status(500).json({
                message: `Database error: ${error.code}`,
                detail: error.detail || 'Unknown error',
            });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSeekerJobs = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const seekerId = req.user?.id;
        if (!seekerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        console.log('Fetching applied jobs for seekerId:', seekerId);
        // Fetch jobs the seeker has applied for, including interview details
        const jobsResult = await db_config_1.default.query(`
      SELECT 
        j.id,
        j.title AS position,
        c.name AS organization,
        COALESCE(j.location_type, 'Remote') AS location,
        j.status,
        COALESCE(jsm.compatibility_score, 0) AS score,
        COALESCE(j.description, 'No description provided') AS description,
        COALESCE(j.requirements, '{}') AS requirements,
        j.created_at AS posted_date,
        COALESCE(ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS skills,
        i.interview_date,
        i.meeting_link
      FROM job j
      JOIN company c ON j.company_id = c.id
      INNER JOIN application a ON j.id = a.job_id AND a.seeker_id = $1
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      LEFT JOIN job_seeker_matches jsm ON j.id = jsm.job_id AND jsm.seeker_id = $1
      LEFT JOIN interviews i ON a.id = i.application_id
      GROUP BY j.id, c.name, jsm.compatibility_score, j.title, j.location_type, j.status, j.description, j.requirements, j.created_at, i.interview_date, i.meeting_link
      ORDER BY j.created_at DESC
      `, [seekerId]);
        console.log('Applied jobs query result:', jobsResult.rows.length, 'rows');
        const jobs = jobsResult.rows.map(row => ({
            id: row.id,
            position: row.position,
            organization: row.organization,
            location: row.location,
            status: row.status,
            score: parseFloat(row.score) || 0,
            applied: true, // All jobs are applied by the seeker
            details: {
                description: row.description,
                requirements: Array.isArray(row.requirements) ? row.requirements : [],
                skills: Array.isArray(row.skills) ? row.skills : [],
                postedDate: new Date(row.posted_date).toISOString().split('T')[0],
            },
            ...(row.interview_date && row.meeting_link && {
                interview: {
                    date: new Date(row.interview_date).toISOString(),
                    meetingLink: row.meeting_link,
                },
            }),
        }));
        res.status(200).json({ jobs });
    }
    catch (error) {
        console.error('Error in getSeekerJobs:', error);
        if (isPostgresError(error)) {
            res.status(500).json({
                message: `Database error: ${error.code}`,
                detail: error.detail || 'Unknown error',
            });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAllSeekerJobs = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const seekerId = req.user?.id;
        if (!seekerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        console.log('Fetching jobs for seekerId:', seekerId);
        // Fetch all available jobs with application status
        const jobsResult = await db_config_1.default.query(`
      SELECT 
        j.id,
        j.title AS position,
        c.name AS organization,
        COALESCE(j.location_type, 'Remote') AS location,
        j.status,
        COALESCE(jsm.compatibility_score, 0) AS score,
        COALESCE(j.description, 'No description provided') AS description,
        COALESCE(j.requirements, '{}') AS requirements,
        j.created_at AS posted_date,
        COALESCE(ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS skills,
        EXISTS (
          SELECT 1 FROM application a 
          WHERE a.job_id = j.id AND a.seeker_id = $1
        ) AS applied
      FROM job j
      JOIN company c ON j.company_id = c.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      LEFT JOIN job_seeker_matches jsm ON j.id = jsm.job_id AND jsm.seeker_id = $1
      WHERE j.status IN ('Active', 'Interviewing')
      GROUP BY j.id, c.name, jsm.compatibility_score, j.title, j.location_type, j.status, j.description, j.requirements, j.created_at
      ORDER BY j.created_at DESC
      `, [seekerId]);
        console.log('Jobs query result:', jobsResult.rows.length, 'rows');
        const jobs = jobsResult.rows.map(row => ({
            id: row.id,
            position: row.position,
            organization: row.organization,
            location: row.location,
            status: row.status,
            score: parseFloat(row.score) || 0,
            applied: row.applied, // Reflects whether the seeker applied
            details: {
                description: row.description,
                requirements: Array.isArray(row.requirements) ? row.requirements : [],
                skills: Array.isArray(row.skills) ? row.skills : [],
                postedDate: new Date(row.posted_date).toISOString().split('T')[0],
            },
        }));
        // Fetch recommended careers by grouping jobs by title
        const careersResult = await db_config_1.default.query(`
      SELECT 
        j.title AS position,
        COUNT(*) AS jobs_available
      FROM job j
      WHERE j.status IN ('Active', 'Interviewing')
      GROUP BY j.title
      HAVING COUNT(*) > 0
      ORDER BY jobs_available DESC
      LIMIT 10
      `, []);
        console.log('Careers query result:', careersResult.rows.length, 'rows');
        const recommendedCareers = await Promise.all(careersResult.rows.map(async (row) => {
            const relatedJobsResult = await db_config_1.default.query(`
          SELECT 
            j.id,
            j.title AS position,
            c.name AS organization,
            COALESCE(j.location_type, 'Remote') AS location,
            j.status,
            COALESCE(jsm.compatibility_score, 0) AS score,
            COALESCE(j.description, 'No description provided') AS description,
            COALESCE(j.requirements, '{}') AS requirements,
            j.created_at AS posted_date,
            COALESCE(ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS skills,
            EXISTS (
              SELECT 1 FROM application a 
              WHERE a.job_id = j.id AND a.seeker_id = $1
            ) AS applied
          FROM job j
          JOIN company c ON j.company_id = c.id
          LEFT JOIN job_skills js ON j.id = js.job_id
          LEFT JOIN skills s ON js.skill_id = s.id
          LEFT JOIN job_seeker_matches jsm ON j.id = jsm.job_id AND jsm.seeker_id = $1
          WHERE j.title = $2 AND j.status IN ('Active', 'Interviewing')
          GROUP BY j.id, c.name, jsm.compatibility_score, j.title, j.location_type, j.status, j.description, j.requirements, j.created_at
          `, [seekerId, row.position]);
            const relatedJobs = relatedJobsResult.rows.map(job => ({
                id: job.id,
                position: job.position,
                organization: job.organization,
                location: job.location,
                status: job.status,
                score: parseFloat(job.score) || 0,
                applied: job.applied, // Reflects whether the seeker applied
                details: {
                    description: job.description,
                    requirements: Array.isArray(job.requirements) ? job.requirements : [],
                    skills: Array.isArray(job.skills) ? job.skills : [],
                    postedDate: new Date(job.posted_date).toISOString().split('T')[0],
                },
            }));
            return {
                position: row.position,
                jobsAvailable: parseInt(row.jobs_available),
                relatedJobs,
            };
        }));
        res.status(200).json({ jobs, recommendedCareers });
    }
    catch (error) {
        console.error('Error in getAllSeekerJobs:', error);
        if (isPostgresError(error)) {
            res.status(500).json({
                message: `Database error: ${error.code}`,
                detail: error.detail || 'Unknown error',
            });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSeekerStats = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const seekerId = req.user?.id;
        if (!seekerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay();
        const weekStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)));
        weekStart.setUTCHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setUTCHours(23, 59, 59, 999);
        const applicationsResult = await db_config_1.default.query(`
      SELECT COUNT(*) AS count
      FROM application
      WHERE seeker_id = $1
        AND created_at >= $2 AND created_at <= $3
      `, [seekerId, weekStart, weekEnd]);
        const applicationsCount = parseInt(applicationsResult.rows[0].count) || 0;
        const interviewsResult = await db_config_1.default.query(`
      SELECT COUNT(*) AS count
      FROM interviews i
      JOIN application a ON i.application_id = a.id
      WHERE a.seeker_id = $1
        AND i.interview_date >= $2 AND i.interview_date <= $3
      `, [seekerId, weekStart, weekEnd]);
        const interviewsCount = parseInt(interviewsResult.rows[0].count) || 0;
        const jobOpeningsResult = await db_config_1.default.query(`
      SELECT COUNT(*) AS count
      FROM job
      WHERE status IN ('Active', 'Interviewing')
      `, []);
        const jobOpeningsCount = parseInt(jobOpeningsResult.rows[0].count) || 0;
        res.status(200).json({
            applications: applicationsCount,
            interviews: interviewsCount,
            jobOpenings: jobOpeningsCount,
        });
    }
    catch (error) {
        console.error('Error fetching seeker stats:', error);
        if (isPostgresError(error)) {
            res.status(500).json({
                message: `Database error: ${error.code}`,
                detail: error.detail || 'Unknown error',
            });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.applyJob = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const seekerId = req.user?.id;
        if (!seekerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { jobId } = req.body;
        if (!jobId) {
            res.status(400).json({ message: 'Job ID is required' });
            return;
        }
        const jobResult = await db_config_1.default.query(`
      SELECT id, status
      FROM job
      WHERE id = $1 AND status IN ('Active', 'Interviewing')
      `, [jobId]);
        if (jobResult.rows.length === 0) {
            res.status(404).json({ message: 'Job not found or not available for application' });
            return;
        }
        const applicationResult = await db_config_1.default.query(`
      SELECT id
      FROM application
      WHERE seeker_id = $1 AND job_id = $2
      `, [seekerId, jobId]);
        if (applicationResult.rows.length > 0) {
            res.status(400).json({ message: 'You have already applied for this job' });
            return;
        }
        await db_config_1.default.query(`
      INSERT INTO application (seeker_id, job_id, status, created_at, updated_at)
      VALUES ($1, $2, 'submitted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [seekerId, jobId]);
        res.status(201).json({ message: 'Application submitted successfully' });
    }
    catch (error) {
        console.error('Error applying for job:', error);
        if (isPostgresError(error)) {
            res.status(500).json({
                message: `Database error: ${error.code}`,
                detail: error.detail || 'Unknown error',
            });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSeekerProfile = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const seekerId = req.user?.id;
        if (!seekerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        console.log('Fetching profile for seekerId:', seekerId);
        const seekerResult = await db_config_1.default.query(`
      SELECT 
        s.id,
        s.email,
        s.first_name AS firstName,
        s.second_name AS secondName,
        s.telephone_1 AS telephone1,
        s.telephone_2 AS telephone2,
        s.address,
        s.postal_code AS postalCode,
        s.education_level AS educationLevel,
        s.institution,
        COALESCE(ARRAY_AGG(sk.name) FILTER (WHERE sk.name IS NOT NULL), '{}') AS skills
      FROM seeker s
      LEFT JOIN seeker_skills ss ON s.id = ss.seeker_id
      LEFT JOIN skills sk ON ss.skill_id = sk.id
      WHERE s.id = $1
      GROUP BY s.id
      `, [seekerId]);
        if (seekerResult.rows.length === 0) {
            res.status(404).json({ message: 'Seeker not found' });
            return;
        }
        const seeker = seekerResult.rows[0];
        res.status(200).json(seeker);
    }
    catch (error) {
        console.error('Error in getSeekerProfile:', error);
        if (isPostgresError(error)) {
            res.status(500).json({
                message: `Database error: ${error.code}`,
                detail: error.detail || 'Unknown error',
            });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateSeekerProfile = (0, asyncHandler_1.default)(async (req, res, next) => {
    try {
        const seekerId = req.user?.id;
        if (!seekerId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { firstName, secondName, telephone1, telephone2, address, postalCode, educationLevel, institution, skills, password, } = req.body;
        if (!firstName ||
            !secondName ||
            !telephone1 ||
            !address ||
            !postalCode ||
            !educationLevel ||
            !institution) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const updateFields = [
            firstName && 'first_name = $2',
            secondName && 'second_name = $3',
            telephone1 && 'telephone_1 = $4',
            telephone2 && 'telephone_2 = $5',
            address && 'address = $6',
            postalCode && 'postal_code = $7',
            educationLevel && 'education_level = $8',
            institution && 'institution = $9',
            password && 'password = crypt($10, gen_salt(\'bf\'))',
            'updated_at = CURRENT_TIMESTAMP',
        ].filter(Boolean);
        const updateValues = [
            seekerId,
            firstName,
            secondName,
            telephone1,
            telephone2 || null,
            address,
            postalCode,
            educationLevel,
            institution,
            password || null,
        ].filter((val, idx) => updateFields[idx] || idx === 0);
        if (updateFields.length > 1) {
            const query = `
        UPDATE seeker
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING id
      `;
            const result = await db_config_1.default.query(query, updateValues);
            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Seeker not found' });
                return;
            }
        }
        if (Array.isArray(skills) && skills.length > 0) {
            await db_config_1.default.query(`
        DELETE FROM seeker_skills
        WHERE seeker_id = $1
        `, [seekerId]);
            for (const skillName of skills) {
                let skillResult = await db_config_1.default.query(`
          SELECT id FROM skills WHERE name = $1
          `, [skillName]);
                let skillId;
                if (skillResult.rows.length === 0) {
                    skillResult = await db_config_1.default.query(`
            INSERT INTO skills (name)
            VALUES ($1)
            RETURNING id
            `, [skillName]);
                }
                skillId = skillResult.rows[0].id;
                await db_config_1.default.query(`
          INSERT INTO seeker_skills (seeker_id, skill_id)
          VALUES ($1, $2)
          `, [seekerId, skillId]);
            }
        }
        res.status(200).json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Error in updateSeekerProfile:', error);
        if (isPostgresError(error)) {
            if (error.code === '23505' && error.detail?.includes('telephone_1')) {
                res.status(400).json({ message: 'Telephone 1 is already registered' });
                return;
            }
            if (error.code === '23505' && error.detail?.includes('telephone_2')) {
                res.status(400).json({ message: 'Telephone 2 is already registered' });
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

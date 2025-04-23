import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import pool from '../config/db.config';

// Type guard for PostgreSQL errors (from jobsController.ts)
interface PostgresError {
  code: string;
  column?: string;
}

function isPostgresError(error: unknown): error is PostgresError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export const getEmployerChart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employerId = req.user?.id;
    if (!employerId || req.user?.role_id !== 2) {
      res.status(403).json({ message: 'Access restricted to employers' });
      return;
    }

    // Fetch the employer's company_id
    const employerResult = await pool.query(
      'SELECT company_id FROM employer WHERE id = $1',
      [employerId]
    );
    if (employerResult.rows.length === 0) {
      res.status(404).json({ message: 'Employer not found' });
      return;
    }
    const companyId = employerResult.rows[0].company_id;

    const result: {
      Applicants: { Daily: number[]; Weekly: number[]; Monthly: number[] };
      Jobs: { Daily: number[]; Weekly: number[]; Monthly: number[] };
    } = {
      Applicants: {
        Daily: Array(12).fill(0),
        Weekly: Array(12).fill(0),
        Monthly: Array(12).fill(0),
      },
      Jobs: {
        Daily: Array(12).fill(0),
        Weekly: Array(12).fill(0),
        Monthly: Array(12).fill(0),
      },
    };

    // Daily Applicants
    const dailyApplicants = await pool.query(
      `
      SELECT DATE(a.created_at) AS date, COUNT(*) AS count
      FROM application a
      JOIN job j ON a.job_id = j.id
      WHERE j.company_id = $1 AND j.employer_id = $2
        AND a.created_at >= CURRENT_DATE - INTERVAL '11 days'
      GROUP BY DATE(a.created_at)
      ORDER BY DATE(a.created_at)
    `,
      [companyId, employerId]
    );
    dailyApplicants.rows.forEach(row => {
      const dayIndex = Math.floor(
        (new Date().setHours(0, 0, 0, 0) - new Date(row.date).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      if (dayIndex >= 0 && dayIndex < 12) {
        result.Applicants.Daily[11 - dayIndex] = parseInt(row.count);
      }
    });

    // Daily Jobs
    const dailyJobs = await pool.query(
      `
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM job
      WHERE company_id = $1 AND employer_id = $2
        AND created_at >= CURRENT_DATE - INTERVAL '11 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
      [companyId, employerId]
    );
    dailyJobs.rows.forEach(row => {
      const dayIndex = Math.floor(
        (new Date().setHours(0, 0, 0, 0) - new Date(row.date).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      if (dayIndex >= 0 && dayIndex < 12) {
        result.Jobs.Daily[11 - dayIndex] = parseInt(row.count);
      }
    });

    // Weekly Applicants
    const weeklyApplicants = await pool.query(
      `
      SELECT DATE_TRUNC('week', a.created_at) AS week, COUNT(*) AS count
      FROM application a
      JOIN job j ON a.job_id = j.id
      WHERE j.company_id = $1 AND j.employer_id = $2
        AND a.created_at >= CURRENT_DATE - INTERVAL '11 weeks'
      GROUP BY DATE_TRUNC('week', a.created_at)
      ORDER BY DATE_TRUNC('week', a.created_at)
    `,
      [companyId, employerId]
    );
    weeklyApplicants.rows.forEach(row => {
      const weekIndex = Math.floor(
        (new Date().setHours(0, 0, 0, 0) - new Date(row.week).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24 * 7)
      );
      if (weekIndex >= 0 && weekIndex < 12) {
        result.Applicants.Weekly[11 - weekIndex] = parseInt(row.count);
      }
    });

    // Weekly Jobs
    const weeklyJobs = await pool.query(
      `
      SELECT DATE_TRUNC('week', created_at) AS week, COUNT(*) AS count
      FROM job
      WHERE company_id = $1 AND employer_id = $2
        AND created_at >= CURRENT_DATE - INTERVAL '11 weeks'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY DATE_TRUNC('week', created_at)
    `,
      [companyId, employerId]
    );
    weeklyJobs.rows.forEach(row => {
      const weekIndex = Math.floor(
        (new Date().setHours(0, 0, 0, 0) - new Date(row.week).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24 * 7)
      );
      if (weekIndex >= 0 && weekIndex < 12) {
        result.Jobs.Weekly[11 - weekIndex] = parseInt(row.count);
      }
    });

    // Monthly Applicants
    const monthlyApplicants = await pool.query(
      `
      SELECT
        EXTRACT(YEAR FROM a.created_at) AS year,
        EXTRACT(MONTH FROM a.created_at) AS month,
        COUNT(*) AS count
      FROM application a
      JOIN job j ON a.job_id = j.id
      WHERE j.company_id = $1 AND j.employer_id = $2
        AND a.created_at >= CURRENT_DATE - INTERVAL '11 months'
      GROUP BY EXTRACT(YEAR FROM a.created_at), EXTRACT(MONTH FROM a.created_at)
      ORDER BY EXTRACT(YEAR FROM a.created_at), EXTRACT(MONTH FROM a.created_at)
    `,
      [companyId, employerId]
    );
    monthlyApplicants.rows.forEach(row => {
      const currentDate = new Date();
      const rowDate = new Date(row.year, row.month - 1, 1);
      const monthDiff =
        (currentDate.getFullYear() - rowDate.getFullYear()) * 12 +
        currentDate.getMonth() -
        rowDate.getMonth();
      if (monthDiff >= 0 && monthDiff < 12) {
        result.Applicants.Monthly[11 - monthDiff] = parseInt(row.count);
      }
    });

    // Monthly Jobs
    const monthlyJobs = await pool.query(
      `
      SELECT
        EXTRACT(YEAR FROM created_at) AS year,
        EXTRACT(MONTH FROM created_at) AS month,
        COUNT(*) AS count
      FROM job
      WHERE company_id = $1 AND employer_id = $2
        AND created_at >= CURRENT_DATE - INTERVAL '11 months'
      GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
    `,
      [companyId, employerId]
    );
    monthlyJobs.rows.forEach(row => {
      const currentDate = new Date();
      const rowDate = new Date(row.year, row.month - 1, 1);
      const monthDiff =
        (currentDate.getFullYear() - rowDate.getFullYear()) * 12 +
        currentDate.getMonth() -
        rowDate.getMonth();
      if (monthDiff >= 0 && monthDiff < 12) {
        result.Jobs.Monthly[11 - monthDiff] = parseInt(row.count);
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    if (isPostgresError(error) && error.code === '42703') {
      res.status(500).json({ message: `Database error: Column does not exist` });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const getEmployerMetrics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employerId = req.user?.id;
    if (!employerId || req.user?.role_id !== 2) {
      res.status(403).json({ message: 'Access restricted to employers' });
      return;
    }

    // Fetch the employer's company_id
    const employerResult = await pool.query(
      'SELECT company_id FROM employer WHERE id = $1',
      [employerId]
    );
    if (employerResult.rows.length === 0) {
      res.status(404).json({ message: 'Employer not found' });
      return;
    }
    const companyId = employerResult.rows[0].company_id;

    // Define the current week's start and end (Monday to Sunday) in UTC
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const weekStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)));
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    // Log the week range for debugging
    console.log('Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());

    // Fetch applications for the current week
    const applicationsResult = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM application a
      JOIN job j ON a.job_id = j.id
      WHERE j.company_id = $1 AND j.employer_id = $2
        AND a.created_at >= $3
        AND a.created_at <= $4
      `,
      [companyId, employerId, weekStart, weekEnd]
    );
    const applicationsCount = parseInt(applicationsResult.rows[0].count) || 0;
    console.log('Applications count:', applicationsCount);

    // Fetch interviews scheduled for the current week
    const interviewsResult = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM interviews i
      JOIN application a ON i.application_id = a.id
      JOIN job j ON a.job_id = j.id
      WHERE j.company_id = $1 AND j.employer_id = $2
        AND i.interview_date >= $3
        AND i.interview_date <= $4
      `,
      [companyId, employerId, weekStart, weekEnd]
    );
    const interviewsCount = parseInt(interviewsResult.rows[0].count) || 0;
    console.log('Interviews count:', interviewsCount);

    // Fetch jobs created this week
    const jobsResult = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM job
      WHERE company_id = $1 AND employer_id = $2
        AND created_at >= $3 AND created_at <= $4
        AND status IN ('Active', 'Interviewing')
      `,
      [companyId, employerId, weekStart, weekEnd]
    );
    const jobsCount = parseInt(jobsResult.rows[0].count) || 0;
    console.log('Job Openings count:', jobsCount);

    res.status(200).json({
      applications: applicationsCount,
      interviews: interviewsCount,
      jobOpenings: jobsCount,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    if (isPostgresError(error) && error.code === '42703') {
      res.status(500).json({ message: `Database error: Column does not exist` });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});
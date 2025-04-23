import { Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler'; 
import pool from '../config/db.config';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const applications = await pool.query('SELECT COUNT(*) FROM application');
  const interviews = await pool.query(
    'SELECT COUNT(*) FROM interviews WHERE interview_date >= NOW()'
  );
  const jobs = await pool.query('SELECT COUNT(*) FROM job WHERE status = $1', ['Active']);

  res.json({
    applications: parseInt(applications.rows[0].count),
    interviewsScheduled: parseInt(interviews.rows[0].count),
    jobOpenings: parseInt(jobs.rows[0].count),
  });
});

export const getChartData = asyncHandler(async (req: Request, res: Response) => {
  const { filter, timeframe } = req.query as { filter: string; timeframe: string };

  try {
    let query: string;
    let interval: string;
    let dateFormat: string;

    // Map timeframe to interval and date format
    switch (timeframe) {
      case 'Daily':
        interval = '1 day';
        dateFormat = 'YYYY-MM-DD';
        query = `
          SELECT TO_CHAR(created_at, '${dateFormat}') as period, COUNT(*) as count
          FROM (
            SELECT created_at FROM seeker
            UNION ALL
            SELECT created_at FROM employer
          ) users
        `;
        break;
      case 'Weekly':
        interval = '1 week';
        dateFormat = 'IYYY-IW';
        query = `
          SELECT TO_CHAR(created_at, '${dateFormat}') as period, COUNT(*) as count
          FROM (
            SELECT created_at FROM seeker
            UNION ALL
            SELECT created_at FROM employer
          ) users
        `;
        break;
      case 'Annually':
        interval = '1 month';
        dateFormat = 'YYYY-MM';
        query = `
          SELECT TO_CHAR(created_at, '${dateFormat}') as period, COUNT(*) as count
          FROM (
            SELECT created_at FROM seeker
            UNION ALL
            SELECT created_at FROM employer
          ) users
        `;
        break;
      default:
        res.status(400).json({ error: 'Invalid timeframe' });
        return;
    }

    // Adjust query based on filter
    if (filter === 'Employers') {
      query = query.replace('SELECT created_at FROM seeker UNION ALL SELECT created_at FROM employer', 'SELECT created_at FROM employer');
    } else if (filter === 'Seeker') {
      query = query.replace('SELECT created_at FROM seeker UNION ALL SELECT created_at FROM employer', 'SELECT created_at FROM seeker');
    } else if (filter !== 'All') {
      res.status(400).json({ error: 'Invalid filter' });
      return;
    }

    query += `
      WHERE created_at >= NOW() - INTERVAL '12 ${interval}'
      GROUP BY period
      ORDER BY period
    `;

    const result = await pool.query(query);

    // Initialize data array for 12 periods
    const data: number[] = new Array(12).fill(0);
    const periods: string[] = [];

    // Generate period labels for the last 12 intervals
    for (let i = 11; i >= 0; i--) {
      let period: string;
      if (timeframe === 'Daily') {
        const date = new Date();
        date.setDate(date.getDate() - i);
        period = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (timeframe === 'Weekly') {
        const date = new Date();
        date.setDate(date.getDate() - i * 7);
        const year = date.getFullYear();
        const week = Math.ceil((date.getDate() + (7 - date.getDay())) / 7);
        period = `${year}-${week.toString().padStart(2, '0')}`; // YYYY-WW
      } else {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
      }
      periods.push(period);
    }

    // Map query results to data array
    result.rows.forEach((row: { period: string; count: string }) => {
      const period = row.period;
      const index = periods.indexOf(period);
      if (index !== -1) {
        data[index] = parseInt(row.count);
      }
    });

    res.json(data);
  } catch (error) {
    console.error('Error in getChartData:', error);
    res.status(500).json({ error: 'Failed to fetch chart data', details: (error as Error).message });
  }
});
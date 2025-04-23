import * as dotenv from 'dotenv';
dotenv.config();
import { Pool, PoolConfig } from 'pg';

const requiredEnvVars: string[] = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const poolConfig: PoolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database successfully');
});

pool.on('error', (err: Error) => {
  console.error('Database pool error:', err.stack);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to RDS:', err.stack);
    return;
  }
  release();
});

export default pool;
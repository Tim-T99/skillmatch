import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config();


const pool = new Pool({
  host: 'database-1.clasacgwqr7b.eu-north-1.rds.amazonaws.com',
  port: Number(process.env['DB_PORT']), 
  user: process.env['DB_USER'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_NAME'],
  ssl: {
    rejectUnauthorized: false // For development only; use proper SSL in production
  }
});

// Test the connection (optional but recommended)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database successfully');
  release(); // Release the client back to the pool
});

export default pool;
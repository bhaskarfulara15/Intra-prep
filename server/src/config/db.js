import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_interview_prep',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * Test MySQL database connection
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ [MySQL] Connected successfully to database "${process.env.DB_NAME || 'ai_interview_prep'}" on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`⚠️  [MySQL Warning] Could not connect to MySQL server: ${error.message}`);
    console.warn(`👉  Ensure your MySQL server is running (e.g., Start MySQL80 service or XAMPP) and credentials in server/.env are correct.`);
    return false;
  }
}

export default pool;

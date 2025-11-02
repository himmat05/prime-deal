import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Add this to check for connection errors
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DATABASE CONNECTION FAILED:');
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused. Check your .env file and make sure MySQL is running.');
    }
  }
  if (connection) {
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    connection.release();
  }
});

export default pool;

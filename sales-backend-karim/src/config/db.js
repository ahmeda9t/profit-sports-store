// src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();  // Load environment variables from .env file

// Create the database connection pool using environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',   // Default to 'localhost' if not in .env
  user: process.env.DB_USER || 'root',        // Default to 'root' if not in .env
  password: process.env.DB_PASSWORD || '',    // Default to empty string if not in .env
  database: process.env.DB_NAME || 'sales_db', // Default to 'sales_db' if not in .env
});

// Test the connection to ensure the database is accessible
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();  // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Database connection failed:', err);  // Log any connection errors
  });

module.exports = db;  // Export the connection pool to use in other files

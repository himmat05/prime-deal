import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  try {
    const query = 'SELECT * FROM products';
    console.log(`Executing query: ${query}`); // Log the query

    pool.query(query, (error, results) => {
      if (error) {
        console.error('SQL Error:', error);
        // Don't send the raw error to the client for security
        return res.status(500).json({ error: 'An internal server error occurred' });
      }
      
      console.log('Products fetched successfully.');
      res.json(results);
    });
  } catch (err) {
      console.error('Unexpected error in /api/products route:', err);
      res.status(500).json({ error: 'An unexpected server error occurred' });
  }
});

// The single product route is fine, but you can update it similarly if you wish
router.get('/:id', (req, res) => {
    // ... (rest of the code)
});

export default router;

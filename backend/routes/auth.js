import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/register', (req, res) => {
  const { firebase_uid, email, name } = req.body;
  const query = 'INSERT INTO users (firebase_uid, email, name) VALUES (?, ?, ?)';
  
  pool.query(query, [firebase_uid, email, name], (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: results.insertId, firebase_uid, email, name });
  });
});

export default router;

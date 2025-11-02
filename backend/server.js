import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';

// Initialize Firebase Admin (you'll need your service account key)
// Download this from Firebase Console: Project settings > Service accounts
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

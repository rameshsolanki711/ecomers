/**
 * Simple E-Commerce Backend (Express + MongoDB)
 * Features:
 * - Product listing with search, sort, filter
 * - Cart management keyed by client-provided cartId header
 * - No authentication required (optional routes scaffolded)
 * - Well-commented, modular routes and models
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');

const app = express();

// ---------- Config ----------
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_starter';

// ---------- Middleware ----------
app.use(express.json());
app.use(morgan('dev'));

// Allow local dev from any origin. In production, restrict origin.
app.use(cors({
  origin: true,
  credentials: false, // we use header-based cartId, so cookies not required
}));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// ---------- DB Connect & Start ----------
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

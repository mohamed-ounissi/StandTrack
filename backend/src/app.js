require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const entryRoutes = require('./routes/entry.routes');
const settingsRoutes = require('./routes/settings.routes');
const errorHandler = require('./middlewares/errorHandler');
const { startCronJobs } = require('./services/cron.service');

const app = express();


const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StandTrack API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/standtrack';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 StandTrack API running on port ${PORT}`);
  
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      startCronJobs();
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      console.error('⚠️  Server is running but database connection failed. Please check your MONGO_URI and IP whitelist.');
    });
});

module.exports = app;

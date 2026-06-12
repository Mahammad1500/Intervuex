require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const cron = require('node-cron');

const connectDB = require('./src/config/database');
const { configurePassport } = require('./src/config/passport');
const logger = require('./src/utils/logger');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const interviewRoutes = require('./src/routes/interviews');
const feedbackRoutes = require('./src/routes/feedback');
const analyticsRoutes = require('./src/routes/analytics');
const notificationRoutes = require('./src/routes/notifications');
const companyRoutes = require('./src/routes/companies');
const auditRoutes = require('./src/routes/audit');
const mongoose = require('mongoose');

const { sendScheduledReminders } = require('./src/services/notificationService');

const app = express();

connectDB();
configurePassport(passport);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(passport.initialize());
app.use('/api', generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    service: 'Intervuex API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbOk ? 'connected' : 'disconnected',
  });
});

app.post('/api/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Seed disabled in production.' });
  }
  try {
    const User = require('./src/models/User');
    const Company = require('./src/models/Company');

    // 1. Create or find admin user first
    let adminUser = await User.findOne({ email: 'admin@intervuex.com' });
    if (!adminUser) {
      adminUser = new User({
        firstName: 'Admin', lastName: 'User', email: 'admin@intervuex.com',
        password: 'Admin@12345', role: 'admin', department: 'Engineering',
        jobTitle: 'Platform Admin', isActive: true, isEmailVerified: true,
      });
      await adminUser.save();
    } else {
      adminUser.password = 'Admin@12345';
      adminUser.role = 'admin';
      adminUser.isActive = true;
      adminUser.isEmailVerified = true;
      await adminUser.save();
    }

    // 2. Create or find a default company
    let company = await Company.findOne({ spaceCode: 'DEMO2026' });
    if (!company) {
      company = new Company({ name: 'Intervuex Demo Corp', createdBy: adminUser._id });
      company.spaceCode = 'DEMO2026';
      await company.save();
    }

    // 3. Create or update HR user with companyId
    let hrUser = await User.findOne({ email: 'hr@intervuex.com' });
    if (!hrUser) {
      hrUser = new User({
        firstName: 'Sarah', lastName: 'Johnson', email: 'hr@intervuex.com',
        password: 'Hr@123456', role: 'hr', department: 'Human Resources',
        jobTitle: 'HR Manager', isActive: true, isEmailVerified: true,
        companyId: company._id,
      });
      await hrUser.save();
    } else {
      hrUser.password = 'Hr@123456';
      hrUser.role = 'hr';
      hrUser.companyId = company._id;
      hrUser.isActive = true;
      hrUser.isEmailVerified = true;
      await hrUser.save();
    }

    res.json({
      success: true, message: 'Seeding complete.',
      results: [
        { email: 'admin@intervuex.com', status: 'admin ready' },
        { email: 'hr@intervuex.com', status: 'hr ready', companyId: company._id },
        { company: company.name, spaceCode: company.spaceCode },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use(errorHandler);

cron.schedule('*/15 * * * *', async () => {
  logger.info('[CRON] Running scheduled reminder job');
  try {
    await sendScheduledReminders();
  } catch (err) {
    logger.error('[CRON] Reminder job failed:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Intervuex API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;

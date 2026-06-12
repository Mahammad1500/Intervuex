const mongoose = require('mongoose');
const logger = require('../utils/logger');

let _memoryServer = null;

// Seed demo users if database is empty
const seedDemoUsers = async () => {
  try {
    const User = require('../models/User');
    const Company = require('../models/Company');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('🌱 Database empty, seeding demo users...');

      // Create admin user
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@intervuex.com',
        password: 'Admin@12345',
        role: 'admin',
        isActive: true,
      });

      // Create demo company
      const company = await Company.create({
        name: 'Intervuex Demo Company',
        spaceCode: 'DEMOCODE',
        createdBy: adminUser._id,
      });

      // Create HR user
      await User.create({
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@intervuex.com',
        password: 'Hr@123456',
        role: 'hr',
        companyId: company._id,
        isActive: true,
      });

      logger.info('✅ Demo users created successfully');
      logger.info('📋 Demo Accounts:');
      logger.info('   Admin: admin@intervuex.com / Admin@12345');
      logger.info('   HR:    hr@intervuex.com / Hr@123456');
    }
  } catch (err) {
    logger.warn(`Could not seed demo users: ${err.message}`);
  }
};

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intervuex';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.warn(`Local MongoDB unavailable (${err.message}). Starting in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      _memoryServer = await MongoMemoryServer.create();
      uri = _memoryServer.getUri();
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      logger.info(`✅ In-memory MongoDB started: ${mongoose.connection.host}`);
      logger.info('ℹ️  Data is NOT persisted between restarts in memory mode.');
    } catch (memErr) {
      logger.error(`Failed to start in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }

  // Seed demo users only in development (never auto-create demo accounts in production)
  if (process.env.NODE_ENV !== 'production') {
    await seedDemoUsers();
  } else {
    logger.info('Production mode: demo user auto-seed skipped.');
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

process.on('beforeExit', async () => {
  if (_memoryServer) await _memoryServer.stop();
});

module.exports = connectDB;

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const logger = require('./src/utils/logger');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@intervuex.com' });
    if (!adminExists) {
      // Create default admin user
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@intervuex.com',
        password: 'Admin@12345',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      });
      logger.info(`✅ Admin user created!`);
      logger.info(`Email: admin@intervuex.com`);
      logger.info(`Password: Admin@12345`);
    }

    // Create sample HR user
    const hrExists = await User.findOne({ email: 'hr@intervuex.com' });
    if (!hrExists) {
      await User.create({
        firstName: 'Sarah',
        lastName: 'HR',
        email: 'hr@intervuex.com',
        password: 'HR@12345',
        role: 'hr',
        isActive: true,
        isEmailVerified: true,
      });
      logger.info(`✅ HR user created!`);
      logger.info(`Email: hr@intervuex.com`);
      logger.info(`Password: HR@12345`);
    }

    // Create sample interviewer
    const interviewerExists = await User.findOne({ email: 'interviewer@intervuex.com' });
    if (!interviewerExists) {
      await User.create({
        firstName: 'John',
        lastName: 'Interviewer',
        email: 'interviewer@intervuex.com',
        password: 'Interviewer@12345',
        role: 'interviewer',
        isActive: true,
        isEmailVerified: true,
      });
      logger.info(`✅ Interviewer user created!`);
      logger.info(`Email: interviewer@intervuex.com`);
      logger.info(`Password: Interviewer@12345`);
    }

    // Create sample candidate
    const candidateExists = await User.findOne({ email: 'candidate@intervuex.com' });
    if (!candidateExists) {
      await User.create({
        firstName: 'Jane',
        lastName: 'Candidate',
        email: 'candidate@intervuex.com',
        password: 'Candidate@12345',
        role: 'candidate',
        isActive: true,
        isEmailVerified: true,
      });
      logger.info(`✅ Candidate user created!`);
      logger.info(`Email: candidate@intervuex.com`);
      logger.info(`Password: Candidate@12345`);
    }

    logger.info('Seeding completed!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedUsers();

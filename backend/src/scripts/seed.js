require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

async function seed() {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intervuex';
  console.log('Connecting to MongoDB:', uri);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.log('⚠️  Local MongoDB unavailable, starting in-memory MongoDB...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log('✅ Connected to in-memory MongoDB');
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  const User = require('../models/User');
  const Company = require('../models/Company');

  try {
    // Clear existing demo users
    await User.deleteMany({ email: { $in: ['admin@intervuex.com', 'hr@intervuex.com', 'interviewer@intervuex.com', 'candidate@intervuex.com'] } });
    console.log('🧹 Cleared old demo users');

    // Create or get demo company
    let company = await Company.findOne({ spaceCode: 'DEMO' });
    if (!company) {
      company = await Company.create({
        name: 'Intervuex Demo',
        spaceCode: 'DEMO',
        email: 'demo@intervuex.com',
        isActive: true,
      });
      console.log('✅ Created demo company');
    } else {
      console.log('✅ Using existing demo company');
    }

    // Hash passwords
    const hashPassword = (pwd) => bcryptjs.hashSync(pwd, 10);

    // Create demo users
    const demoUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@intervuex.com',
        password: hashPassword('Admin@12345'),
        role: 'admin',
        companyId: company._id,
        isActive: true,
      },
      {
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@intervuex.com',
        password: hashPassword('Hr@123456'),
        role: 'hr',
        companyId: company._id,
        isActive: true,
      },
      {
        firstName: 'Interviewer',
        lastName: 'User',
        email: 'interviewer@intervuex.com',
        password: hashPassword('Interview@1'),
        role: 'interviewer',
        companyId: company._id,
        isActive: true,
      },
      {
        firstName: 'Candidate',
        lastName: 'User',
        email: 'candidate@intervuex.com',
        password: hashPassword('Candidate@1'),
        role: 'candidate',
        companyId: company._id,
        isActive: true,
      },
    ];

    const createdUsers = await User.insertMany(demoUsers);
    console.log(`✅ Created ${createdUsers.length} demo users`);

    console.log('\n📋 Demo Accounts Ready:');
    console.log('┌─────────────────────────────────────────────────┐');
    demoUsers.forEach((user, i) => {
      console.log(`│ ${user.role.toUpperCase().padEnd(12)} │ ${user.email.padEnd(30)} │`);
    });
    console.log('└─────────────────────────────────────────────────┘');

    console.log('\n✨ Seeding complete! You can now login with demo accounts.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();

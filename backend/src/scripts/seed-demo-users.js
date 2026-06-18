require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Import models
const User = require(path.join(__dirname, '../models/User'));
const Company = require(path.join(__dirname, '../models/Company'));

async function seedDemoUsers() {
  // Use the in-memory MongoDB started by the backend
  // Or start our own if connecting to persistent DB
  const uri = 'mongodb://127.0.0.1:27017/intervuex';

  try {
    console.log('\n🌱 Starting demo user seeding...\n');

    // Try to connect to existing MongoDB (either persistent or in-memory)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.log('⚠️  Cannot connect to existing MongoDB, starting in-memory MongoDB...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri, { serverSelectionTimeoutMS: 10000 });
      console.log('✅ Started in-memory MongoDB');
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  try {
    // Check if demo users already exist
    const existingAdmin = await User.findOne({ email: 'admin@intervuex.com' });
    if (existingAdmin) {
      console.log('✅ Demo users already exist. Skipping seeding.\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // 1. Create admin user first (without company requirement)
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@intervuex.com',
      password: 'Admin@12345',
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Created admin user');

    // 2. Create demo company with admin as creator
    let company = await Company.findOne({ spaceCode: 'DEMOCODE' });
    if (!company) {
      company = await Company.create({
        name: 'Intervuex Demo Company',
        spaceCode: 'DEMOCODE',
        createdBy: adminUser._id,
      });
      console.log('✅ Created demo company');
    }

    // 3. Create other demo users
    const otherUsers = [
      {
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@intervuex.com',
        password: 'Hr@123456',
        role: 'hr',
        companyId: company._id,
        isActive: true,
      },
    ];

    const otherCreatedUsers = await User.create(otherUsers);
    const createdUsers = [adminUser, ...otherCreatedUsers];
    console.log(`✅ Created ${createdUsers.length} demo users\n`);

    // Display credentials table
    console.log('📋 Demo Accounts Ready:\n');
    console.log('┌────────────┬──────────────────────────────┬──────────────┐');
    console.log('│ Role       │ Email                        │ Password     │');
    console.log('├────────────┼──────────────────────────────┼──────────────┤');
    const allAccounts = [
      { role: 'admin', email: 'admin@intervuex.com', password: 'Admin@12345' },
      { role: 'hr', email: 'hr@intervuex.com', password: 'Hr@123456' },
    ];
    allAccounts.forEach(user => {
      const role = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      console.log(`│ ${role.padEnd(10)} │ ${user.email.padEnd(28)} │ ${user.password.padEnd(12)} │`);
    });
    console.log('└────────────┴──────────────────────────────┴──────────────┘');
    console.log(`\n💡 Company Space Code: DEMOCODE\n`);

    console.log('\n✨ Seeding complete! You can now login at http://localhost:3000\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    process.exit(1);
  }
}

seedDemoUsers();

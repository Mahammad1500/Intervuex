require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intervuex';
  console.log('Connecting to MongoDB:', uri);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const User = require('../models/User');
  const Interview = require('../models/Interview');

  // Optional models — may not exist yet
  let CalendarToken, Notification, Feedback;
  try { CalendarToken = require('../models/CalendarToken'); } catch (_) {}
  try { Notification = require('../models/Notification'); } catch (_) {}
  try { Feedback = require('../models/Feedback'); } catch (_) {}

  // 1. Delete interviewer and candidate users
  const deletedUsers = await User.deleteMany({ role: { $in: ['interviewer', 'candidate'] } });
  console.log(`Deleted ${deletedUsers.deletedCount} interviewer/candidate users`);

  // 2. Delete old-format interviews (those without candidateEmail field)
  const deletedInterviews = await Interview.deleteMany({ candidateEmail: { $exists: false } });
  console.log(`Deleted ${deletedInterviews.deletedCount} old-format interviews`);

  // 3. Delete orphaned CalendarTokens
  if (CalendarToken) {
    const remainingUserIds = (await User.find({}, '_id')).map(u => u._id);
    const deletedTokens = await CalendarToken.deleteMany({ user: { $nin: remainingUserIds } });
    console.log(`Deleted ${deletedTokens.deletedCount} orphaned CalendarTokens`);
  }

  // 4. Delete orphaned Notifications
  if (Notification) {
    const remainingUserIds = (await User.find({}, '_id')).map(u => u._id);
    const deletedNotifs = await Notification.deleteMany({ user: { $nin: remainingUserIds } });
    console.log(`Deleted ${deletedNotifs.deletedCount} orphaned Notifications`);
  }

  // 5. Delete all Feedback (old feedback is invalid)
  if (Feedback) {
    const deletedFeedback = await Feedback.deleteMany({});
    console.log(`Deleted ${deletedFeedback.deletedCount} Feedback documents`);
  }

  console.log('\nMigration complete.');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', default: null },
  type: {
    type: String,
    enum: ['interview_scheduled', 'interview_confirmed', 'interview_cancelled', 'interview_rescheduled', 'reminder', 'feedback_request', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ interview: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

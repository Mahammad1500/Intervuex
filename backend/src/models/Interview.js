const mongoose = require('mongoose');
const crypto = require('crypto');

const interviewSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  interviewType: {
    type: String,
    enum: ['technical', 'behavioral', 'system-design', 'hr', 'final', 'screening'],
    required: true,
  },
  candidateEmail: { type: String, required: true, lowercase: true, trim: true },
  candidateName: { type: String, trim: true, default: '' },
  interviewerEmail: { type: String, required: true, lowercase: true, trim: true },
  interviewerName: { type: String, trim: true, default: '' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true, min: 15, max: 240 },
  timezone: { type: String, default: 'UTC' },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no-show'],
    default: 'scheduled',
  },
  meetingPlatform: {
    type: String,
    enum: ['google-meet', 'manual'],
    default: 'manual',
  },
  meetingLink: { type: String, default: null },
  meetingId: { type: String, default: null },
  calendarEventId: {
    google: { type: String, default: null },
  },
  notes: { type: String, default: null, maxlength: 2000 },
  cancellationReason: { type: String, default: null },
  rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', default: null },
  rescheduledAt: { type: Date, default: null },
  confirmationToken: { type: String, default: null },
  feedbackToken: { type: String, default: null },
  reminders: [{
    type: { type: String, default: '24h' },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
  }],
  candidateConfirmed: { type: Boolean, default: false },
  candidateConfirmedAt: { type: Date, default: null },
  feedbackSubmitted: { type: Boolean, default: false },
  pipeline: {
    stage: { type: String, default: 'initial' },
    order: { type: Number, default: 1 },
  },
  tags: [{ type: String, trim: true }],
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

interviewSchema.pre('save', function (next) {
  if (!this.confirmationToken) {
    this.confirmationToken = crypto.randomBytes(32).toString('hex');
  }
  if (!this.feedbackToken) {
    this.feedbackToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

interviewSchema.virtual('isUpcoming').get(function () {
  return this.scheduledAt > new Date() && this.status !== 'cancelled';
});

interviewSchema.virtual('isPast').get(function () {
  return this.endTime < new Date();
});

interviewSchema.index({ companyId: 1, scheduledAt: -1 });
interviewSchema.index({ candidateEmail: 1, scheduledAt: -1 });
interviewSchema.index({ interviewerEmail: 1, scheduledAt: -1 });
interviewSchema.index({ scheduledBy: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ scheduledAt: 1 });
interviewSchema.index({ confirmationToken: 1 });
interviewSchema.index({ feedbackToken: 1 });

module.exports = mongoose.model('Interview', interviewSchema);

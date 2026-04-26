const mongoose = require('mongoose');

const calendarTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['google', 'microsoft'], required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, default: null },
  expiresAt: { type: Date, required: true },
  scope: { type: String, default: null },
  tokenType: { type: String, default: 'Bearer' },
  isValid: { type: Boolean, default: true },
}, {
  timestamps: true,
});

calendarTokenSchema.index({ user: 1, provider: 1 }, { unique: true });
calendarTokenSchema.index({ expiresAt: 1 });

calendarTokenSchema.methods.isExpired = function () {
  return new Date() >= this.expiresAt;
};

module.exports = mongoose.model('CalendarToken', calendarTokenSchema);

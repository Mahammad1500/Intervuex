const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    minlength: 8,
    select: false,
    required: function requiredPassword() { return !this.googleId; },
  },
  role: { type: String, enum: ['admin', 'hr'], default: 'hr', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  avatar: { type: String, default: null },
  phone: { type: String, default: null },
  department: { type: String, default: null },
  jobTitle: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  googleId: { type: String, default: null },
  microsoftId: { type: String, default: null },
  calendarConnected: {
    google: { type: Boolean, default: false },
    microsoft: { type: Boolean, default: false },
  },
  preferences: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    notifications: {
      email: { type: Boolean, default: true },
      reminderMinutes: { type: [Number], default: [60, 15] },
      /** Which automated reminder emails the workflow sends (candidate + interviewer) */
      reminder24h: { type: Boolean, default: true },
      reminder1h: { type: Boolean, default: true },
      reminder15: { type: Boolean, default: false },
      emailCopyToOrganizer: { type: Boolean, default: true },
    },
  },
  lastLogin: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
  refreshToken: { type: String, select: false },
  loginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, default: null, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockMinutes = 15;
  if (this.loginAttempts + 1 >= maxAttempts) {
    updates.$set = { lockUntil: Date.now() + lockMinutes * 60 * 1000 };
  }
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ companyId: 1 });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const crypto = require('crypto');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  spaceCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 8,
    maxlength: 8,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

companySchema.pre('save', function (next) {
  if (!this.spaceCode) {
    this.spaceCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

companySchema.index({ spaceCode: 1 }, { unique: true });
companySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Company', companySchema);

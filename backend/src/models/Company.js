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
  /** If non-empty, HR emails must match one of these domains (e.g. acme.com) */
  allowedEmailDomains: {
    type: [String],
    default: [],
    validate: {
      validator(domains) {
        return domains.every((d) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(String(d).trim()));
      },
      message: 'Each allowed domain must be a valid hostname (e.g. company.com)',
    },
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
  if (Array.isArray(this.allowedEmailDomains)) {
    this.allowedEmailDomains = [...new Set(
      this.allowedEmailDomains.map((d) => String(d).trim().toLowerCase().replace(/^@+/, '')).filter(Boolean)
    )];
  }
  next();
});

companySchema.index({ spaceCode: 1 }, { unique: true });
companySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Company', companySchema);

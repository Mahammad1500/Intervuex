const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  overallRating: { type: Number, min: 1, max: 5, required: true },
  recommendation: {
    type: String,
    enum: ['strong-hire', 'hire', 'neutral', 'no-hire', 'strong-no-hire'],
    required: true,
  },
  ratings: {
    technicalSkills: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    problemSolving: { type: Number, min: 1, max: 5 },
    cultureFit: { type: Number, min: 1, max: 5 },
    experience: { type: Number, min: 1, max: 5 },
  },
  strengths: { type: String, maxlength: 2000 },
  areasOfImprovement: { type: String, maxlength: 2000 },
  summary: { type: String, maxlength: 3000 },
  privateNotes: { type: String, maxlength: 2000, select: false },
  submittedAt: { type: Date, default: Date.now },
  editedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

feedbackSchema.index({ interview: 1 });
feedbackSchema.index({ candidate: 1 });
feedbackSchema.index({ interviewer: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);

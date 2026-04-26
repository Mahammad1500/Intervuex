const Feedback = require('../models/Feedback');
const Interview = require('../models/Interview');
const { createError } = require('../middleware/errorHandler');

const submitFeedback = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId)
      .populate('candidate', 'firstName lastName email')
      .populate('interviewer', 'firstName lastName email');

    if (!interview) return next(createError('Interview not found.', 404));
    if (interview.interviewer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(createError('Only the assigned interviewer can submit feedback.', 403));
    }
    if (interview.feedbackSubmitted) {
      return res.status(409).json({ success: false, message: 'Feedback already submitted for this interview.' });
    }

    const { overallRating, recommendation, ratings, strengths, areasOfImprovement, summary, privateNotes } = req.body;

    const feedback = await Feedback.create({
      interview: interviewId,
      interviewer: req.user._id,
      candidate: interview.candidate._id,
      overallRating,
      recommendation,
      ratings,
      strengths,
      areasOfImprovement,
      summary,
      privateNotes,
    });

    interview.feedbackSubmitted = true;
    if (interview.status === 'confirmed' || interview.status === 'scheduled') {
      interview.status = 'completed';
    }
    await interview.save();

    res.status(201).json({ success: true, message: 'Feedback submitted successfully.', data: { feedback } });
  } catch (err) { next(err); }
};

const getFeedback = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const user = req.user;

    const interview = await Interview.findById(interviewId);
    if (!interview) return next(createError('Interview not found.', 404));

    const isParticipant = interview.candidate.toString() === user._id.toString() ||
      interview.interviewer.toString() === user._id.toString() ||
      ['admin', 'hr'].includes(user.role);

    if (!isParticipant) return next(createError('Access denied.', 403));

    const query = Feedback.findOne({ interview: interviewId })
      .populate('interviewer', 'firstName lastName email avatar jobTitle');

    if (user.role !== 'admin' && user.role !== 'hr' && interview.interviewer.toString() !== user._id.toString()) {
      query.select('-privateNotes');
    }

    const feedback = await query;
    if (!feedback) return res.status(404).json({ success: false, message: 'No feedback submitted yet.' });

    res.json({ success: true, data: { feedback } });
  } catch (err) { next(err); }
};

const getMyFeedbacks = async (req, res, next) => {
  try {
    const user = req.user;
    const filter = user.role === 'interviewer'
      ? { interviewer: user._id }
      : { candidate: user._id };

    const feedbacks = await Feedback.find(filter)
      .populate({ path: 'interview', populate: { path: 'candidate interviewer', select: 'firstName lastName email avatar' } })
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: { feedbacks } });
  } catch (err) { next(err); }
};

const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return next(createError('Feedback not found.', 404));
    if (feedback.interviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(createError('Access denied.', 403));
    }

    const { overallRating, recommendation, ratings, strengths, areasOfImprovement, summary } = req.body;
    Object.assign(feedback, { overallRating, recommendation, ratings, strengths, areasOfImprovement, summary, editedAt: new Date() });
    await feedback.save();

    res.json({ success: true, message: 'Feedback updated.', data: { feedback } });
  } catch (err) { next(err); }
};

module.exports = { submitFeedback, getFeedback, getMyFeedbacks, updateFeedback };

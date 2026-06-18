const Interview = require('../models/Interview');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { subDays, startOfDay, endOfDay, eachDayOfInterval, format } = require('date-fns');

const parsePeriod = (period) => {
  const days = parseInt(period) || 30;
  const from = subDays(new Date(), days);
  return { from, to: new Date() };
};

const getDashboardStats = async (user) => {
  const filter = {};
  if (user.role === 'hr') {
    filter.companyId = user.companyId;
    filter.scheduledBy = user._id;
  }

  const now = new Date();
  const [total, scheduled, completed, cancelled, upcoming, thisMonth] = await Promise.all([
    Interview.countDocuments(filter),
    Interview.countDocuments({ ...filter, status: { $in: ['scheduled', 'confirmed'] } }),
    Interview.countDocuments({ ...filter, status: 'completed' }),
    Interview.countDocuments({ ...filter, status: 'cancelled' }),
    Interview.countDocuments({ ...filter, status: { $in: ['scheduled', 'confirmed'] }, scheduledAt: { $gte: now } }),
    Interview.countDocuments({ ...filter, createdAt: { $gte: subDays(now, 30) } }),
  ]);

  let userStats = {};
  if (['admin', 'hr'].includes(user.role)) {
    const totalHR = await User.countDocuments({ role: 'hr', isActive: true });
    userStats = { totalHR };
  }

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  const recentInterviews = await Interview.find(filter)
    .populate('scheduledBy', 'firstName lastName email')
    .sort({ scheduledAt: -1 })
    .limit(5);

  return {
    overview: { total, scheduled, completed, cancelled, upcoming, thisMonth, completionRate, cancellationRate },
    users: userStats,
    recentInterviews,
  };
};

const getInterviewTrends = async (period, groupBy, user) => {
  const { from, to } = parsePeriod(period);
  const filter = { scheduledAt: { $gte: from, $lte: to } };
  if (user.role === 'hr') {
    filter.companyId = user.companyId;
    filter.scheduledBy = user._id;
  }

  const dateFormat = groupBy === 'week' ? '%Y-W%V' : groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

  const trends = await Interview.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$scheduledAt' } },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        scheduled: { $sum: { $cond: [{ $in: ['$status', ['scheduled', 'confirmed']] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return trends.map(t => ({ date: t._id, total: t.total, completed: t.completed, cancelled: t.cancelled, scheduled: t.scheduled }));
};

const getHiringFunnel = async (from, to, user) => {
  const filter = {};
  if (from) filter.scheduledAt = { $gte: new Date(from) };
  if (to) filter.scheduledAt = { ...filter.scheduledAt, $lte: new Date(to) };
  if (user.role === 'hr') {
    filter.companyId = user.companyId;
    filter.scheduledBy = user._id;
  }

  const byType = await Interview.aggregate([
    { $match: filter },
    { $group: { _id: '$interviewType', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
    { $sort: { count: -1 } },
  ]);

  const byStatus = await Interview.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const feedbackStats = await Feedback.aggregate([
    { $group: { _id: '$recommendation', count: { $sum: 1 } } },
  ]);

  return { byType, byStatus, feedbackStats };
};

const getInterviewerPerformance = async (user) => {
  const filter = {};
  if (user.role === 'hr') {
    filter.companyId = user.companyId;
    filter.scheduledBy = user._id;
  }
  const pipeline = [
    ...(Object.keys(filter).length ? [{ $match: filter }] : []),
    { $group: {
      _id: '$interviewerEmail',
      interviewerName: { $first: '$interviewerName' },
      total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      feedbackRate: { $sum: { $cond: ['$feedbackSubmitted', 1, 0] } },
    }},
    { $project: {
      interviewerEmail: '$_id',
      interviewerName: 1,
      total: 1, completed: 1, cancelled: 1, feedbackRate: 1,
    }},
    { $sort: { total: -1 } },
    { $limit: 20 },
  ];
  return Interview.aggregate(pipeline);
};

const getFeedbackStats = async (user) => {
  const filter = {};

  const [avgRating, recommendations, ratingDistribution] = await Promise.all([
    Feedback.aggregate([{ $match: filter }, { $group: { _id: null, avg: { $avg: '$overallRating' }, count: { $sum: 1 } } }]),
    Feedback.aggregate([{ $match: filter }, { $group: { _id: '$recommendation', count: { $sum: 1 } } }]),
    Feedback.aggregate([
      { $match: filter },
      { $group: { _id: '$overallRating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    avgRating: avgRating[0]?.avg?.toFixed(1) || 0,
    totalFeedbacks: avgRating[0]?.count || 0,
    recommendations,
    ratingDistribution,
  };
};

const analyticsService = { getDashboardStats, getInterviewTrends, getHiringFunnel, getInterviewerPerformance, getFeedbackStats };

module.exports = { analyticsService };

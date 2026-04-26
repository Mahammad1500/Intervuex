const Interview = require('../models/Interview');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { analyticsService } = require('../services/analyticsService');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.user);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

const getInterviewTrends = async (req, res, next) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;
    const trends = await analyticsService.getInterviewTrends(period, groupBy, req.user);
    res.json({ success: true, data: trends });
  } catch (err) { next(err); }
};

const getHiringFunnel = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const funnel = await analyticsService.getHiringFunnel(from, to, req.user);
    res.json({ success: true, data: funnel });
  } catch (err) { next(err); }
};

const getInterviewerPerformance = async (req, res, next) => {
  try {
    const performance = await analyticsService.getInterviewerPerformance(req.user);
    res.json({ success: true, data: performance });
  } catch (err) { next(err); }
};

const getFeedbackStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getFeedbackStats(req.user);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

module.exports = { getDashboardStats, getInterviewTrends, getHiringFunnel, getInterviewerPerformance, getFeedbackStats };

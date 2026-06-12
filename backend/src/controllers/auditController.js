const AuditLog = require('../models/AuditLog');
const { buildPaginationMeta } = require('../utils/helpers');

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const filter = {};
    if (action) filter.action = action;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      AuditLog.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: { logs, pagination: buildPaginationMeta(total, page, limit) },
    });
  } catch (err) { next(err); }
};

module.exports = { getAuditLogs };

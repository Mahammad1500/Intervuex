const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const logAudit = async ({
  action,
  actor = null,
  targetType = null,
  targetId = null,
  targetLabel = null,
  metadata = {},
  req = null,
}) => {
  try {
    await AuditLog.create({
      action,
      actorId: actor?._id || actor?.id || null,
      actorEmail: actor?.email || null,
      targetType,
      targetId: targetId ? String(targetId) : null,
      targetLabel,
      metadata,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || null,
    });
  } catch (err) {
    logger.warn(`Audit log failed: ${err.message}`);
  }
};

module.exports = { logAudit };

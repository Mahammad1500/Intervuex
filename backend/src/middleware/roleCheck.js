const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

const authorizeOwnerOrRole = (userIdField, ...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const isAuthorized = roles.includes(req.user.role) ||
      req.user._id.toString() === req.params[userIdField];
    if (!isAuthorized) return res.status(403).json({ success: false, message: 'Access denied.' });
    next();
  };
};

module.exports = { authorize, authorizeOwnerOrRole };

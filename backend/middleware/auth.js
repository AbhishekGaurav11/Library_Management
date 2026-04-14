// Middleware to check if admin is authenticated
const checkAuth = (req, res, next) => {
  // Allow login and logout without authentication
  if (req.path === '/auth/login' || req.path === '/auth/logout') {
    return next();
  }

  // Check if session has admin
  if (!req.session.admin) {
    return res.status(401).json({ message: 'Not authenticated. Please login first.' });
  }

  next();
};

module.exports = checkAuth;

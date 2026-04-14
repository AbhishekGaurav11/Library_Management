const Admin = require('../models/adminModel');

// Login endpoint
const login = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  Admin.getAdminByUsername(username, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    // Check if admin exists
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = results[0];

    // Compare passwords (in production, use bcrypt!)
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.admin = {
      id: admin.admin_id,
      username: admin.username
    };

    res.json({ 
      message: 'Login successful',
      admin: { id: admin.admin_id, username: admin.username }
    });
  });
};

// Logout endpoint
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

// Get current admin
const getCurrentAdmin = (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ admin: req.session.admin });
};

module.exports = {
  login,
  logout,
  getCurrentAdmin
};

const db = require('../config/db');

// Get admin by username
const getAdminByUsername = (username, callback) => {
  const query = 'SELECT * FROM admin WHERE username = ?';
  db.query(query, [username], callback);
};

// Insert admin (for initial setup)
const createAdmin = (username, password, callback) => {
  const query = 'INSERT INTO admin (username, password) VALUES (?, ?)';
  db.query(query, [username, password], callback);
};

module.exports = {
  getAdminByUsername,
  createAdmin
};

const db = require("../config/db");

exports.getAllMembers = (callback) => {
  db.query("SELECT * FROM members", callback);
};

exports.addMember = (member, callback) => {
  const { id, name, email, joined, active } = member;

  const sql = `
    INSERT INTO members (id, name, email, joined, active)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [id, name, email, joined, active], callback);
};
const db = require("../config/db");

exports.getAllTransactions = (callback) => {
  db.query("SELECT * FROM transactions", callback);
};

exports.addTransaction = (tx, callback) => {
  const { bookId, memberId, date, dueDate } = tx;
  const receiptId = "RCP" + Date.now();

  const sql = `
    INSERT INTO transactions (book_id, member_id, date, due_date, returned, fine_amount, fine_paid, receipt_id)
    VALUES (?, ?, ?, ?, false, 0, false, ?)
  `;

  db.query(sql, [bookId, memberId, date, dueDate, receiptId], callback);
};

exports.returnBook = (id, returnDate, fineAmount, callback) => {
  const sql = `
    UPDATE transactions 
    SET returned = true, return_date = ?, fine_amount = ?
    WHERE id = ?
  `;

  db.query(sql, [returnDate, fineAmount, id], callback);
};

exports.payFine = (id, callback) => {
  const sql = `
    UPDATE transactions 
    SET fine_paid = true
    WHERE id = ?
  `;

  db.query(sql, [id], callback);
};
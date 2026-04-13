const db = require("../config/db");

exports.getAllBooks = (callback) => {
  db.query("SELECT * FROM books", callback);
};

exports.addBook = (book, callback) => {
  const { title, author, genre, year, copies, available } = book;
  db.query(
    "INSERT INTO books (title, author, genre, year, copies, available) VALUES (?, ?, ?, ?, ?, ?)",
    [title, author, genre, year, copies, available],
    callback
  );
};

exports.updateBookAvailability = (id, available, callback) => {
  db.query("UPDATE books SET available = ? WHERE id = ?", [available, id], callback);
};

exports.deleteBook = (id, callback) => {
  db.query("DELETE FROM books WHERE id = ?", [id], callback);
};

// Increase both copies and available by count
exports.addCopies = (id, count, callback) => {
  db.query(
    "UPDATE books SET copies = copies + ?, available = available + ? WHERE id = ?",
    [count, count, id],
    callback
  );
};
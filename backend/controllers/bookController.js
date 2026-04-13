const bookModel = require("../models/bookModel");

exports.getBooks = (req, res) => {
  bookModel.getAllBooks((err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.createBook = (req, res) => {
  const book = req.body;
  book.available = book.copies;
  bookModel.addBook(book, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Book added successfully" });
  });
};

exports.deleteBook = (req, res) => {
  const { id } = req.params;
  bookModel.deleteBook(id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Book deleted" });
  });
};

exports.addCopies = (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  bookModel.addCopies(id, Number(count), (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Copies added" });
  });
};
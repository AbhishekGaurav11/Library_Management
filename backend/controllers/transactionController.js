const transactionModel = require("../models/transactionModel");
const bookModel = require("../models/bookModel");

// Get all transactions
exports.getTransactions = (req, res) => {
  transactionModel.getAllTransactions((err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// Calculate late fine (₹30 per day)
function calculateFine(dueDate, returnDate) {
  const FINE_PER_DAY = 30; // ₹30 per day late
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  
  const daysLate = Math.max(0, Math.floor((returned - due) / (1000 * 60 * 60 * 24)));
  return daysLate * FINE_PER_DAY;
}

// Borrow book
exports.borrowBook = (req, res) => {
  const tx = req.body;

  transactionModel.addTransaction(tx, (err, result) => {
    if (err) {
      console.error("Error adding transaction:", err);
      return res.status(500).json({ error: err.message });
    }

    // Reduce available count
    bookModel.getAllBooks((err, books) => {
      if (err) {
        console.error("Error fetching books:", err);
        return res.status(500).json({ error: err.message });
      }
      
      const book = books.find(b => b.id == tx.bookId);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      const newAvailable = book.available - 1;

      bookModel.updateBookAvailability(tx.bookId, newAvailable, (err) => {
        if (err) {
          console.error("Error updating availability:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Book borrowed successfully" });
      });
    });
  });
};

// Return book
exports.returnBook = (req, res) => {
  const { id, bookId, dueDate } = req.body;
  const returnDate = new Date().toISOString().slice(0, 10);
  
  // Calculate fine if book is returned late
  const fineAmount = calculateFine(dueDate, returnDate);

  transactionModel.returnBook(id, returnDate, fineAmount, (err) => {
    if (err) return res.status(500).json(err);

    // Increase availability
    bookModel.getAllBooks((err, books) => {
      const book = books.find(b => b.id == bookId);
      const newAvailable = book.available + 1;

      bookModel.updateBookAvailability(bookId, newAvailable, () => {
        const message = fineAmount > 0 
          ? `Book returned. Late fine: $${fineAmount}` 
          : "Book returned on time";
        res.json({ message, fineAmount });
      });
    });
  });
};

// Pay fine
exports.payFine = (req, res) => {
  const { id, paymentMethod } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Transaction ID is required" });
  }

  if (!paymentMethod) {
    return res.status(400).json({ error: "Payment method is required" });
  }

  transactionModel.payFine(id, paymentMethod, (err) => {
    if (err) {
      console.error("Error paying fine:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Fine payment recorded successfully", paymentMethod });
  });
};
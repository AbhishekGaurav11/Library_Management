const db = require("./config/db");

// Sample Books Data
const books = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", year: 1925, copies: 5 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", year: 1960, copies: 4 },
  { title: "1984", author: "George Orwell", genre: "Dystopian", year: 1949, copies: 6 },
  { title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", year: 1813, copies: 3 },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", year: 1951, copies: 4 },
];

// Sample Members Data
const members = [
  { id: "M001", name: "John Doe", email: "john@example.com", joined: "2024-01-15", active: 1 },
  { id: "M002", name: "Jane Smith", email: "jane@example.com", joined: "2024-02-20", active: 1 },
  { id: "M003", name: "Bob Johnson", email: "bob@example.com", joined: "2024-03-10", active: 1 },
  { id: "M004", name: "Alice Williams", email: "alice@example.com", joined: "2024-03-25", active: 1 },
];

// Insert Books
const insertBooks = () => {
  books.forEach((book) => {
    const sql = "INSERT INTO books (title, author, genre, year, copies, available) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [book.title, book.author, book.genre, book.year, book.copies, book.copies], (err) => {
      if (err) console.error("Error inserting book:", err);
      else console.log(`✅ Added book: ${book.title}`);
    });
  });
};

// Insert Members
const insertMembers = () => {
  members.forEach((member) => {
    const sql = "INSERT INTO members (id, name, email, joined, active) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [member.id, member.name, member.email, member.joined, member.active], (err) => {
      if (err) console.error("Error inserting member:", err);
      else console.log(`✅ Added member: ${member.name}`);
    });
  });
};

console.log("🌱 Seeding database...\n");
insertBooks();
insertMembers();

setTimeout(() => {
  console.log("\n✅ Seeding completed!");
  process.exit(0);
}, 1000);

const db = require("./config/db");

const createMembersTable = `
  CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    joined DATE,
    active BOOLEAN DEFAULT 1
  )
`;

const createTransactionsTable = `
  CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    member_id VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    return_date DATE,
    returned BOOLEAN DEFAULT false,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT false,
    receipt_id VARCHAR(20),
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
  )
`;

console.log("📦 Creating tables...\n");

// Create Members Table
db.query(createMembersTable, (err) => {
  if (err) {
    console.error("❌ Error creating members table:", err);
  } else {
    console.log("✅ Members table created/verified");
  }
});

// Create Transactions Table
db.query(createTransactionsTable, (err) => {
  if (err) {
    console.error("❌ Error creating transactions table:", err);
  } else {
    console.log("✅ Transactions table created/verified");
  }
});

setTimeout(() => {
  console.log("\n✅ Tables setup completed!");
  process.exit(0);
}, 1000);

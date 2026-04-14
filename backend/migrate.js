const db = require("./config/db");

console.log("🔄 Migrating database... Adding payment tracking columns\n");

const alterTableSQL = `
  ALTER TABLE transactions 
  ADD COLUMN payment_method VARCHAR(50),
  ADD COLUMN payment_date TIMESTAMP NULL
`;

db.query(alterTableSQL, (err) => {
  if (err) {
    // Columns might already exist, that's okay
    if (err.message.includes("Duplicate")) {
      console.log("ℹ️  Payment columns already exist");
    } else {
      console.error("❌ Error:", err.message);
    }
  } else {
    console.log("✅ Transactions table updated successfully");
    console.log("✓ Added columns: payment_method, payment_date");
  }
  
  console.log("\n✅ Database migration completed!");
  process.exit(0);
});

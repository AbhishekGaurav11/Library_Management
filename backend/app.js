const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running ✅" });
});

// Serve index.html for all other routes (for client-side routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

module.exports = app;
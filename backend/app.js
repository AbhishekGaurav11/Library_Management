const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const app = express();

// CORS configuration
const corsOptions = {
  origin: true, // Allow any origin during development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));

// Auth routes (no middleware needed, includes login)
app.use("/api/auth", require("./routes/authRoutes"));

// Auth middleware - protect all other routes
const checkAuth = require("./middleware/auth");
app.use("/api", checkAuth);

// Protected API Routes
app.use("/api/books", require("./routes/bookRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running ✅" });
});

// Catch-all: Serve index.html for client-side routing (using RegExp instead of wildcard)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

module.exports = app;
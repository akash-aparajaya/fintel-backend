/*
==========================================
📦 Import Core & Third-Party Modules
==========================================
*/

const express = require("express"); // Express framework to build API server
const cors = require("cors");       // Allows frontend (different origin) to access backend
const morgan = require("morgan");   // HTTP request logger (auto logs requests)

/*
==========================================
📦 Import Custom Modules (Your Code)
==========================================
*/

const requestLogger = require("./middleware/logger.middleware"); 
// Custom middleware using Winston → gives structured logs (method, status, time)
const errorHandler = require("./middleware/error.middleware");

/*
==========================================
🚀 Initialize Express App
==========================================
*/

const app = express(); // Create Express application instance

/*
==========================================
⚙️ Global Middleware Setup
==========================================
*/

// Enable CORS
// Without this, browser blocks requests from frontend (React, etc.)
app.use(cors());

// Parse incoming JSON requests
// Converts JSON body → JavaScript object (req.body)
app.use(express.json());

// Morgan Middleware
// Logs basic request details automatically:
// Example: GET /api/users 200 5ms
app.use(morgan("dev"));

// Custom Request Logger (Winston)
// Logs structured + detailed info after response is sent
// Example: GET /api/users | Status: 200 | 5ms
app.use(requestLogger);

/*
==========================================
🛣️ Routes
==========================================
*/

// Health Check Route
// Used to verify server is running
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// User Routes
// All requests starting with /api/users will go to this file
// Example:
// GET    /api/users
// POST   /api/users
app.use("/api/users", require("./routes/user.routes"));

// Auth Routes
// Example:
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/otp/send
app.use("/api/auth", require("./routes/auth.routes"));

/*
==========================================
⚠️ Global Error Handling Middleware
==========================================
*/

// Centralized error handler (keeps app.js clean)
app.use(errorHandler);


// Exporting app so it can be used in server.js
module.exports = app;

"akash"
/*
==========================================
⚠️ Global Error Handler Middleware
==========================================
Central place to return errors in one JSON format.

How it works:
- In controllers/services, throw an Error (optionally set `error.status`).
- Call `next(error)` in controllers.
- Express will forward it here.
*/
const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });

  logger.error(`❌ Error: ${req.method} ${req.url} | Status: ${statusCode} - ${err.message}`);
};


// Import custom logger (Winston)
const logger = require("../utils/logger");

// Middleware to track each request
const requestLogger = (req, res, next) => {
  const start = Date.now(); // record start time

  // Run after response is sent
  res.on("finish", () => {
    const duration = Date.now() - start; // calculate response time

    // Log request details
    logger.info(
      `${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${duration}ms
------------------------------------------------------------------------------- `,
    );
  });

  next(); // move to next middleware/route
};

module.exports = requestLogger;

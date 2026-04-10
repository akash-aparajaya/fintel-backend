const { createLogger, format, transports } = require("winston");

// Extract formatting tools
const { combine, timestamp, printf, colorize } = format;

// Define how each log will look
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create logger instance
const logger = createLogger({
  level: "debug", // minimum level to log

  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // add timestamp
    colorize({ all: true }), // color output
    logFormat // apply custom format
  ),

  // Define where logs go
  transports: [
    new transports.Console(), // print logs in terminal
  ],
});

module.exports = logger;
// Load environment variables from .env file
require("dotenv").config();

// Import app (Express configuration)
const app = require("./src/app");

// Import DB connection function
const connectDB = require("./src/config/db");

// Import custom logger
const logger = require("./src/utils/logger");

// Define port (use .env or default 4000)
const PORT = process.env.PORT || 4000;

// ==========================================
// Start server only after DB connection
// ==========================================
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`❌ Server failed to start: ${error.message}`);
  });
const { Sequelize } = require("sequelize");
const logger = require("../utils/logger"); // Import logger

// Create database connection
const sequelize = new Sequelize(
  process.env.DB_NAME, // DB name
  process.env.DB_USER, // Username
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST, // DB host (localhost)
    dialect: "postgres", // DB type
    logging: false, // Disable SQL logs
  },
);

// Function to connect DB
const connectDB = async () => {
  try {
    // Check DB connection
    await sequelize.authenticate();

    // Log success message
    logger.info(
      `🗄️  Database connected successfully | DB: ${process.env.DB_NAME}`,
    );
    logger.verbose(`🗄️  DB host: ${process.env.DB_HOST}, DB Port: ${process.env.DB_PORT}`);

    /*
      ==========================================
      🧱 Development Table Sync (Optional)
      ==========================================
      If you are building from scratch and don't have migrations yet,
      Sequelize can auto-create tables based on models.

      Enable by setting:
        DB_SYNC=true

      Notes:
      - For production apps, prefer migrations instead of sync().
      - Do NOT use `alter: true` or `force: true` unless you fully understand the impact.
    */
    if (process.env.DB_SYNC === "true") {
      /*
        DB_SYNC_ALTER=true makes Sequelize update existing table structures
        to match models (useful in development while iterating quickly).
      */
      const useAlter = process.env.DB_SYNC_ALTER === "true";
      await sequelize.sync({ alter: useAlter });
      logger.warn(
        `🧱 Sequelize sync complete (DB_SYNC=true, alter=${useAlter})`,
      );
    }
  } catch (error) {
    // Log error message
    logger.error(`❌ DB connection failed: ${error.message}`);

    // Stop server if DB fails
    process.exit(1);
  }
};

// Export function + sequelize instance
module.exports = connectDB;
module.exports.sequelize = sequelize;

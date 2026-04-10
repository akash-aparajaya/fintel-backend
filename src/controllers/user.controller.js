const userService = require("../services/user.service");
const logger = require("../utils/logger");


// ==========================================
// Get Users Controller
// ==========================================
exports.getUsers = async (req, res, next) => {
  try {
    logger.info("📥 Fetching users");
const users = await userService.getUsers();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    logger.error("❌ Error in getUsers controller");
    next(error);
  }
};
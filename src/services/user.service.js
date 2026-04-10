const user = require("../models/user.model");
const logger = require("../utils/logger");

exports.getUsers = async () => {
  try {
const users = await user.findAll();
   return users
  } catch (error) {
    logger.error("❌ Error in getUsers controller");
  }
};
const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

// ==========================================
// User Routes
// ==========================================


// Get all users
router.get("/test", userController.getUsers);

module.exports = router;
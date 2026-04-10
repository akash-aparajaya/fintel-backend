const express = require("express");
const router = express.Router();

const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const authController = require("../controllers/auth.controller");

const {
  registerSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  googleLoginSchema,
  refreshTokenSchema,
} = require("../validations/auth.validation");

/*
==========================================
🔑 Auth Routes
==========================================
Base path (mounted in app.js): /api/auth

Design:
- Public routes: no token required
- Protected routes: `requireAuth` validates Bearer access token
*/

/*
==========================================
🌍 Public Routes (No Access Token Required)
==========================================
*/

// 1) Email/Password Authentication
router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);
router.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);

// 2) Refresh Access Token using Refresh Token
router.post(
  "/refresh-token",
  validate({ body: refreshTokenSchema }),
  authController.refreshToken,
);

// 3) Google Login (starter flow)
router.post(
  "/google/login",
  validate({ body: googleLoginSchema }),
  authController.googleLogin,
);

// 4) Phone OTP Authentication
router.post(
  "/otp/send",
  validate({ body: otpSendSchema }),
  authController.sendOtp,
);
router.post(
  "/otp/verify",
  validate({ body: otpVerifySchema }),
  authController.verifyOtp,
);

/*
==========================================
🔒 Protected Routes (Access Token Required)
==========================================
*/

// Validate access token and return current user profile.
router.get("/me", requireAuth, authController.me);

// Logout current session (clears stored refresh-token session).
router.post("/logout", requireAuth, authController.logout);

// 2FA endpoint is protected because only logged-in users can enable it.
router.post("/2fa/enable", requireAuth, authController.enable2FA);
router.post("/2fa/verify", requireAuth, authController.verify2FA);
router.post("/2fa/login-verify", authController.verifyLogin2FA);

module.exports = router;


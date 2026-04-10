const authService = require("../services/auth.service");
const { signAccessToken, signRefreshToken } = require("../utils/token");
const QRCode = require("qrcode");
const twoFAService = require("../services/twoFactor.service");
const logger = require("../utils/logger");
const User = require("../models/user.model");

/*
==========================================
🎮 Auth Controller (HTTP Layer)
==========================================
This layer should:
- Read input from req (already validated by Joi middleware)
- Call the service
- Return response
*/

exports.register = async (req, res, next) => {
  try {
    const user = await authService.registerWithEmail(req.body);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await authService.issueRefreshSession(user, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: {
        user: { id: user.id, fullName: user.fullName, email: user.email },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await authService.loginWithEmail(req.body);
    
    if (user.is2FAEnabled) {
      return res.json({
        success: true,
        requires2FA: true,
        userId: user.id,
      });
    }
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await authService.issueRefreshSession(user, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: { id: user.id, fullName: user.fullName, email: user.email },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken, email, fullName } = req.body;
    /*
      Starter Google login:
      - Frontend sends googleId + email + fullName after Google sign-in
      - Backend creates/fetches user and returns JWT

      Later: replace this with Google token verification on backend.
    */
    const user = await authService.loginWithGoogle({ idToken });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await authService.issueRefreshSession(user, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        user: { id: user.id, fullName: user.fullName, email: user.email },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.sendOtp = async (req, res, next) => {
  try {
    const result = await authService.sendOtp(req.body);

    return res.status(200).json({
      success: true,
      message: "OTP generated (check server logs in development)",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const user = await authService.verifyOtp(req.body);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await authService.issueRefreshSession(user, refreshToken);

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const user = await authService.refreshAccessByToken(req.body);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Rotate refresh token each time for better security.
    await authService.issueRefreshSession(user, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        authProvider: req.user.authProvider,
        is2FAEnabled: req.user.is2FAEnabled,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Placeholder endpoints for 2FA (TOTP) until we add a TOTP library like `speakeasy`.
exports.enable2FA = async (req, res, next) => {
  try {
    const user = req.user;

    const secret = twoFAService.generateSecret(user.email);
console.log(secret);
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return res.json({
      success: true,
      data: { qrCode },
    });
  } catch (err) {
    next(err);
  }
};

exports.verify2FA = async (req, res, next) => {
  try {
    const user = req.user;
    const { token } = req.body;

    const isValid = twoFAService.verifyOTP(user.twoFactorSecret, token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.is2FAEnabled = true;
    await user.save();

    return res.json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyLogin2FA = async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findByPk(userId);

    const isValid = twoFAService.verifyOTP(user.twoFactorSecret, token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return res.json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

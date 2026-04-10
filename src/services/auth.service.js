const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const { verifyRefreshToken } = require("../utils/token");
const { sendSMS } = require("../providers/twilioOtpProvider");
const { generateOTP } = require("../utils/helpers");
const { verifyGoogleToken } = require("../providers/googleProvider");

/*
==========================================
🧠 Auth Service (Business Logic)
==========================================
Rules:
- Controllers should be thin (only req/res mapping)
- Services do the real work and talk to DB (Sequelize models)
*/

const SALT_ROUNDS = 12;

const issueRefreshSession = async (user, refreshToken) => {
  const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  const refreshDays = Number(process.env.JWT_REFRESH_DAYS || 7);
  const refreshTokenExpiresAt = new Date(
    Date.now() + refreshDays * 24 * 60 * 60 * 1000,
  );

  user.refreshTokenHash = refreshTokenHash;
  user.refreshTokenExpiresAt = refreshTokenExpiresAt;
  await user.save();
};

const registerWithEmail = async ({ fullName, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    authProvider: "local",
  });

  logger.info(`✅ Registered user (local): ${user.id}`);
  return user;
};

const loginWithEmail = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.passwordHash) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  return user;
};

/*
  Google login (starter implementation):
  - Frontend sends googleId + email + fullName.
  - Backend upserts user and returns app JWT.

  Later improvement:
  - Verify Google `idToken` on backend using `google-auth-library`.
*/
const loginWithGoogle = async ({ idToken }) => {
  if (!idToken) {
    throw new Error("idToken is required");
  }

  // 🔐 Verify token with Google
  const payload = await verifyGoogleToken(idToken);

  const googleId = payload.sub;
  const email = payload.email;
  const fullName = payload.name; 

  if (!payload.email_verified) {
    throw new Error("Google email not verified");
  }

  let user = await User.findOne({ where: { googleId } });

  if (!user) {
    // Check existing email
    user = await User.findOne({ where: { email } });

    if (user) {
      user.googleId = googleId;
      user.authProvider = "google";
      if (!user.fullName) user.fullName = fullName;
      await user.save();
      return user;
    }

    // Create new user
    user = await User.create({
      fullName,
      email,
      googleId,
      authProvider: "google",
    });
  }

  return user;
};

/*
  OTP flow (starter implementation):
  - /otp/send generates an OTP and stores it with expiry.
  - /otp/verify checks it, then logs in / creates user by phone.

  Production notes:
  - Do NOT store OTP as plain text in DB.
  - Use an SMS provider (Twilio, etc.) to send OTP.
  - Consider rate limiting and OTP attempt limits.
*/

const sendOtp = async ({ phoneNumber }) => {
  // Generate OTP
  const { otp, expiresAt } = generateOTP(6, 1);

  // 🔍 Check if user exists
  const user = await User.findOne({ where: { phoneNumber } });

  // ❌ If not exist → throw error
  if (!user) {
    throw new Error("User not found. Please register first.");
  }

  // 🚫 Prevent OTP spam
  if (user.otpExpiresAt && user.otpExpiresAt > new Date()) {
    throw new Error("OTP already sent. Please wait.");
  }

  // 🔐 Hash OTP
  const hashedOtp = await bcrypt.hash(otp, 10);

  // Save OTP + expiry
  user.otpCode = hashedOtp;
  user.otpExpiresAt = expiresAt;

  await user.save();

  // 📲 Send SMS
  to: (`+91${phoneNumber}`,
    await sendSMS({
      message: `Your OTP is ${otp}. Valid for 1 minutes.`,
    }));

  return {
    phoneNumber,
    expiresAt,
  };
};

const verifyOtp = async ({ phoneNumber, otp }) => {
  const user = await User.findOne({ where: { phoneNumber } });
  if (!user || !user.otpCode || !user.otpExpiresAt) {
    const err = new Error("OTP not found. Please request a new OTP.");
    err.status = 400;
    throw err;
  }

  if (new Date() > new Date(user.otpExpiresAt)) {
    const err = new Error("OTP expired. Please request a new OTP.");
    err.status = 400;
    throw err;
  }
  // 🔐 Compare hashed OTP
  const isMatch = await bcrypt.compare(otp, user.otpCode);

  if (!isMatch) {
    const err = new Error("Invalid OTP");
    err.status = 401;
    throw err;
  }

  // Clear OTP after successful verification
  user.otpCode = null;
  user.otpExpiresAt = null;
  await user.save();

  return user;
};

const refreshAccessByToken = async ({ refreshToken }) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    const e = new Error("Invalid or expired refresh token");
    e.status = 401;
    throw e;
  }

  const user = await User.findByPk(payload.sub);
  if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
    const err = new Error("Refresh session not found");
    err.status = 401;
    throw err;
  }

  if (new Date() > new Date(user.refreshTokenExpiresAt)) {
    const err = new Error("Refresh token expired");
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isMatch) {
    const err = new Error("Refresh token does not match current session");
    err.status = 401;
    throw err;
  }

  return user;
};

const logoutUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) return;

  user.refreshTokenHash = null;
  user.refreshTokenExpiresAt = null;
  await user.save();
};

module.exports = {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  sendOtp,
  verifyOtp,
  issueRefreshSession,
  refreshAccessByToken,
  logoutUser,
};

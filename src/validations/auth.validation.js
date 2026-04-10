const Joi = require("joi");

/*
==========================================
🧾 Auth Validation Schemas (Joi)
==========================================
Keep request validation rules here so routes/controllers stay clean.
*/

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

const otpSendSchema = Joi.object({
  phoneNumber: Joi.string().min(6).max(20).required(),
});

const otpVerifySchema = Joi.object({
  phoneNumber: Joi.string().min(6).max(20).required(),
  otp: Joi.string().min(4).max(10).required(),
});

// Placeholder for Google login (v1: accept googleId + email + name from frontend)
// Later: replace with real `idToken` verification.
const googleLoginSchema = Joi.object({
  idToken: Joi.string().min(5).required(),
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).max(120).optional(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  googleLoginSchema,
  refreshTokenSchema,
};


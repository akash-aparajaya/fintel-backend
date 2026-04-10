const crypto = require("crypto");


/**
 * Generates a secure numeric OTP and expiry time.
 *
 * @param {number} [length=6] - Number of digits for OTP (default: 6)
 * @param {number} [expiryMinutes=5] - Expiry time in minutes (default: 5)
 *
 * @returns {Object} - Object containing the generated OTP and expiry time in ms since epoch
 * @property {string} otp - Secure numeric OTP
 * @property {number} expiresAt - Expiry time in ms since epoch
 *
 * @throws {Error} - If OTP length is outside the range of 4 to 10 digits
 */
const generateOTP = (length , expiryMinutes ) => {
  // Validate length
  if (length < 4 || length > 10) {
    throw new Error("OTP length should be between 4 and 10 digits");
  }

  // Generate min and max based on length
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  // Generate secure random OTP
  const otp = crypto.randomInt(min, max).toString();

  // Set expiry time
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  return { otp, expiresAt };
};

module.exports = {
  generateOTP,
};
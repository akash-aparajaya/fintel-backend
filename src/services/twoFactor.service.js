const speakeasy = require("speakeasy");

const generateSecret = (email) => {
  return speakeasy.generateSecret({
    name: `YourApp (${email})`,
  });
};

const verifyOTP = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
};

module.exports = { generateSecret, verifyOTP };
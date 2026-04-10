const jwt = require("jsonwebtoken");

/*
==========================================
🔐 JWT Utility
==========================================
Why this file exists:
- Keeps signing logic in one place
- Avoids repeating `jwt.sign` options everywhere
*/

const buildAccessPayload = (user) => ({
  sub: user.id, // "subject" (who the token is for)
  email: user.email || null,
  provider: user.authProvider,
  twoFactorSecret: user.twoFactorSecret || null,
});

const signAccessToken = (user) => {
  const secret = process.env.JWT_SECRET || "dev-secret-change-this";
  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

  return jwt.sign(buildAccessPayload(user), secret, { expiresIn });
};

// Refresh token has its own secret and longer expiry.
const signRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-this";
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  return jwt.sign(buildAccessPayload(user), secret, { expiresIn });
};

const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET || "dev-secret-change-this";
  return jwt.verify(token, secret);
};

const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-this";
  return jwt.verify(token, secret);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};


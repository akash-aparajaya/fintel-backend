const User = require("../models/user.model");
const { verifyAccessToken } = require("../utils/token");

/*
==========================================
🛡️ Access Token Validation Middleware
==========================================
How to use:
router.get("/me", requireAuth, controller.me);

Expected header:
Authorization: Bearer <access_token>
*/

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid Authorization header",
      });
    }

    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for this token",
      });
    }

    // Attach current user for downstream handlers.
    req.user = user;
    req.auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

module.exports = {
  requireAuth,
};


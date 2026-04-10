const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

/*
==========================================
👤 User Model (Sequelize)
==========================================
This is the single identity table used by all auth methods:
- Email + password
- Google login (OAuth)
- Phone + OTP
- 2FA flags (TOTP setup fields can be added later)

Notes:
- We store `passwordHash`, not the password.
- `email` and `phoneNumber` are optional because some users may sign up
  via Google or phone only.
*/

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING(120),
      // Keep nullable at DB layer for backward-safe schema evolution.
      // API validation still requires fullName during normal registration.
      allowNull: true,
    },

    userName: {
      // Optional public handle (can be used for profile URLs later).
      type: DataTypes.STRING(60),
      allowNull: true,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(160),
      allowNull: true,
      unique: true,
      validate: { isEmail: true },
    },

    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },

    authProvider: {
      // local = email/password, google = OAuth
      type: DataTypes.ENUM("local", "google"),
      allowNull: false,
      defaultValue: "local",
    },

    role: {
      // Keep authz simple for now. Expand later if needed.
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    googleId: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
    },

    is2FAEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    twoFactorSecret: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    /*
      OTP (Phone auth) - dev-friendly storage:
      - In production, OTP should be stored hashed OR in an external store (Redis).
      - For now, storing it here makes the feature easy to understand and test.
    */
    otpCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Store hashed refresh token for session validation/rotation.
    refreshTokenHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refreshTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      // Normalize values before storing.
      beforeValidate: (user) => {
        if (user.email) user.email = String(user.email).toLowerCase().trim();
        if (user.userName) user.userName = String(user.userName).toLowerCase().trim();
        if (user.phoneNumber) user.phoneNumber = String(user.phoneNumber).trim();
      },
    },
  },
);

module.exports = User;


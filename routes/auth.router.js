const express = require("express");
const router = express.Router();

const loginController = require("../controllers/auth.controller");
const { forwardAuthenticated } = require("../auth/auth");

// Login
router.get("/login", forwardAuthenticated, loginController.loginForm);
router.post("/login", loginController.authenticate);

// Forgot / reset password
router.get("/forgot-password", forwardAuthenticated, loginController.forgotPasswordForm);
router.post("/forgot-password", forwardAuthenticated, loginController.forgotPassword);
router.get("/reset-password/:token", loginController.resetPasswordForm);
router.post("/reset-password/:token", loginController.resetPassword);

// Register
router.get("/register", forwardAuthenticated, loginController.registerForm);
router.post("/register", loginController.register);

// Google OAuth
router.get("/google", loginController.googleAuth);
router.get("/google/callback", loginController.googleCallback);

// Logout
router.get("/logout", loginController.logout);

// Accept invitation
const superadminController = require("../controllers/superadmin.controller");
router.get("/invite/:token", superadminController.acceptInvitation);

module.exports = router;

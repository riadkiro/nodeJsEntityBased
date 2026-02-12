const express = require("express");
const router = express.Router();

const loginController = require("../controllers/auth.controller");
const { forwardAuthenticated } = require("../auth/auth");

// Login
router.get("/login", forwardAuthenticated, loginController.loginForm);
router.post("/login", loginController.authenticate);

// Register
router.get("/register", forwardAuthenticated, loginController.registerForm);
router.post("/register", loginController.register);

// Google OAuth
router.get("/google", loginController.googleAuth);
router.get("/google/callback", loginController.googleCallback);

// Logout
router.get("/logout", loginController.logout);

// Accept invitation
const adminController = require("../controllers/admin.controller");
router.get("/invite/:token", adminController.acceptInvitation);

module.exports = router;

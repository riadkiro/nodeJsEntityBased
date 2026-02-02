const express = require("express");
const router = express.Router();

// Profile Page
router.get("/", async (req, res) => {
    try {
        const user = req.user;

        res.render("account/account-profile", {
            account_number: req.account_number,
            user: user,
            layout: "layout-app",
        });
    } catch (error) {
        console.error("Profile page error:", error);
        res.status(500).send("Error loading profile page");
    }
});

// Profile Settings Page
router.get("/settings", async (req, res) => {
    try {
        const user = req.user;

        res.render("account/account-profile-settings", {
            account_number: req.account_number,
            user: user,
            layout: "layout-app",
        });
    } catch (error) {
        console.error("Profile settings page error:", error);
        res.status(500).send("Error loading profile settings page");
    }
});

// Update Profile
router.post("/update", async (req, res) => {
    try {
        // TODO: Implement profile update logic
        res.json({ success: true, message: "Profile updated" });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
});

// Account Settings Page
router.get("/account-settings", async (req, res) => {
    try {
        const Account = require("../models/account.model");
        const account = await Account.findOne({ account_number: req.account_number });

        res.render("account/account-settings", {
            account_number: req.account_number,
            user: req.user,
            account: account,
            layout: "layout-app",
        });
    } catch (error) {
        console.error("Account settings page error:", error);
        res.status(500).send("Error loading account settings page");
    }
});

module.exports = router;

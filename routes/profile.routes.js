const express = require("express");
const router = express.Router();
const Account = require("../models/account.model");

// Profile Page — user info + workspaces + invitations
router.get("/", async (req, res) => {
    try {
        const user = req.user;

        // Fetch current workspace account for company info
        const account = await Account.findOne({ account_number: req.account_number }).lean();

        // Find pending invitations for this user's email
        let pendingInvitations = [];
        try {
            const accountsWithInvites = await Account.find({
                'invitations.email': user.email.toLowerCase(),
                'invitations.status': 'pending',
            }).select('name icon account_number invitations').lean();

            pendingInvitations = accountsWithInvites.flatMap(acc => {
                return acc.invitations
                    .filter(i => i.email === user.email.toLowerCase() && i.status === 'pending'
                        && (!i.expiresAt || new Date() < new Date(i.expiresAt)))
                    .map(i => ({
                        token: i.token,
                        accountName: acc.name,
                        accountIcon: acc.icon || 'solar:buildings-2-bold-duotone',
                        accountNumber: acc.account_number,
                        role: i.role,
                        invitedAt: i.invitedAt,
                    }));
            });
        } catch (e) {
            console.error('[Profile] Pending invitations lookup error:', e.message);
        }

        res.render("account/account-profile", {
            account_number: req.account_number,
            account: account,
            user: user,
            pendingInvitations,
            layout: "layout-app",
        });
    } catch (error) {
        console.error("Profile page error:", error);
        res.status(500).send("Error loading profile page");
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

// Update Company Info
router.post("/company/update", async (req, res) => {
    try {
        const { name, number, address, vat, phone, email, representative } = req.body;
        
        await Account.findOneAndUpdate(
            { account_number: req.account_number },
            {
                $set: {
                    'company.name': name || '',
                    'company.number': number || '',
                    'company.address': address || '',
                    'company.vat': vat || '',
                    'company.phone': phone || '',
                    'company.email': email || '',
                    'company.representative': representative || ''
                }
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: "Informations d'entreprise mises à jour avec succès" });
    } catch (error) {
        console.error("Company update error:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la mise à jour des informations" });
    }
});

// Legacy redirects — old pages now consolidated
router.get("/settings", (req, res) => {
    res.redirect(`/account/${req.account_number}/profile`);
});
router.get("/account-settings", (req, res) => {
    res.redirect(`/account/${req.account_number}/settings`);
});

module.exports = router;

/**
 * Tenant Admin Routes - Workspace-Level Administration
 * ─────────────────────────────────────────────────────
 * Accessible to workspace owner/admin
 * Mounted at /account/:account_id/admin
 */
const express = require("express");
const router = express.Router();
const Account = require("../models/account.model");
const adminController = require("../controllers/admin.controller");

// Middleware: Require owner or admin role IN THIS workspace
const ensureTenantAdmin = async (req, res, next) => {
    if (!req.user) return res.redirect('/auth/login');

    try {
        const account = await Account.findOne({ account_number: req.account_number });
        if (!account) {
            return res.status(404).render("admin/admin-403", {
                layout: "layout-app",
                user: req.user,
                account_number: req.account_number,
                message: "Workspace introuvable",
            });
        }

        const memberEntry = account.users.find(
            u => String(u.userId) === String(req.user._id) && u.status === 'active'
        );

        // Allow superadmin to access any workspace admin
        const isSuperAdmin = req.user.role === 'superadmin';
        const isWorkspaceAdmin = memberEntry && (memberEntry.role === 'owner' || memberEntry.role === 'admin');

        if (!isSuperAdmin && !isWorkspaceAdmin) {
            return res.status(403).render("admin/admin-403", {
                layout: "layout-app",
                user: req.user,
                account_number: req.account_number,
                message: "Vous devez être administrateur de ce workspace",
            });
        }

        // Attach role info for views
        req.workspaceRole = memberEntry?.role || (isSuperAdmin ? 'superadmin' : null);
        next();
    } catch (error) {
        console.error("[TenantAdmin] Auth check error:", error);
        res.status(500).send("Server Error");
    }
};

// Apply to all routes
router.use(ensureTenantAdmin);

// ── Pages → Redirect to unified settings ─────────────────────
router.get("/", (req, res) => res.redirect(`/account/${req.account_number}/settings`));
router.get("/members", (req, res) => res.redirect(`/account/${req.account_number}/settings?tab=members`));
router.get("/settings", (req, res) => res.redirect(`/account/${req.account_number}/settings`));

// ── API ──────────────────────────────────────────────────────
router.post("/api/members/invite", adminController.inviteMember);
router.post("/api/members/role", adminController.changeMemberRole);
router.post("/api/members/remove", adminController.removeMember);
router.post("/api/invites/cancel", adminController.cancelInvite);
router.post("/api/settings", adminController.updateSettings);

module.exports = router;

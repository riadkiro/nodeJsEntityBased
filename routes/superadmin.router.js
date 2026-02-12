/**
 * SuperAdmin Routes - SaaS Platform Owner
 * ────────────────────────────────────────
 * ALL routes here require user.role === 'superadmin'
 * These are mounted at /superadmin in routes-inc.js
 */
const express = require("express");
const router = express.Router();
const superadminController = require("../controllers/superadmin.controller");

// Middleware: Require superadmin role (platform owner)
const ensureSuperAdmin = (req, res, next) => {
    if (!req.user) return res.redirect('/auth/login');
    if (req.user.role !== 'superadmin') {
        return res.status(403).render("superadmin/sa-403", {
            layout: "layout-superadmin",
            user: req.user,
        });
    }
    next();
};

// Apply to all routes
router.use(ensureSuperAdmin);

// ── Pages ────────────────────────────────────────────────────
router.get("/", superadminController.dashboard);
router.get("/users", superadminController.usersList);
router.get("/users/:userId", superadminController.userDetail);
router.get("/accounts", superadminController.accountsList);

// ── API ──────────────────────────────────────────────────────
router.post("/api/users/create", superadminController.createUser);
router.post("/api/users/status", superadminController.updateUserStatus);
router.post("/api/users/role", superadminController.updateUserRole);
router.post("/api/users/membership", superadminController.updateMembership);
router.post("/api/users/delete", superadminController.deleteUser);
router.post("/api/accounts/status", superadminController.updateAccountStatus);
router.post("/api/accounts/invite", superadminController.inviteToAccount);

// JSON APIs
router.get("/api/users", superadminController.usersApi);
router.get("/api/accounts", superadminController.accountsApi);
router.get("/api/stats", superadminController.statsApi);

module.exports = router;

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// Middleware: Check admin role
const ensureAdmin = (req, res, next) => {
    if (!req.user) return res.redirect('/auth/login');
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).render("admin/admin-403", {
            layout: "layout-app",
            user: req.user,
            account_number: req.account_number,
        });
    }
    next();
};

// ── Pages ────────────────────────────────────────────────────
router.get("/", ensureAdmin, adminController.dashboard);
router.get("/users", ensureAdmin, adminController.usersList);
router.get("/users/:userId", ensureAdmin, adminController.userDetail);
router.get("/accounts", ensureAdmin, adminController.accountsList);

// ── API ──────────────────────────────────────────────────────
router.post("/api/users/create", ensureAdmin, adminController.createUser);
router.post("/api/users/status", ensureAdmin, adminController.updateUserStatus);
router.post("/api/users/role", ensureAdmin, adminController.updateUserRole);
router.post("/api/users/membership", ensureAdmin, adminController.updateMembership);
router.post("/api/users/delete", ensureAdmin, adminController.deleteUser);
router.post("/api/accounts/status", ensureAdmin, adminController.updateAccountStatus);
router.post("/api/accounts/invite", ensureAdmin, adminController.inviteToAccount);
router.post("/api/accounts/share", ensureAdmin, adminController.shareSpace);

// JSON APIs
router.get("/api/users", ensureAdmin, adminController.usersApi);
router.get("/api/accounts", ensureAdmin, adminController.accountsApi);
router.get("/api/stats", ensureAdmin, adminController.statsApi);

module.exports = router;

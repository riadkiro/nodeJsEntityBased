const express = require("express");
const router = express.Router();
const superadminController = require("../controllers/superadmin.controller");
const entityTemplateController = require("../controllers/entity-template.controller");
const spaceTemplateController = require("../controllers/space-template.controller");

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
router.get("/entity-templates", entityTemplateController.listPage);
router.get("/space-templates", spaceTemplateController.listPage);

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

// ── Entity Templates API ─────────────────────────────────────
router.get("/api/entity-templates", entityTemplateController.listApi);
router.get("/api/entity-templates/:id", entityTemplateController.getApi);
router.post("/api/entity-templates", entityTemplateController.createApi);
router.post("/api/entity-templates/:id", entityTemplateController.updateApi);
router.post("/api/entity-templates/:id/duplicate", entityTemplateController.duplicateApi);
router.delete("/api/entity-templates/:id", entityTemplateController.deleteApi);

// ── Space Templates API ──────────────────────────────────
router.get("/api/space-templates", spaceTemplateController.listApi);
router.get("/api/space-templates/:id", spaceTemplateController.getApi);
router.post("/api/space-templates", spaceTemplateController.createApi);
router.post("/api/space-templates/:id", spaceTemplateController.updateApi);
router.post("/api/space-templates/:id/duplicate", spaceTemplateController.duplicateApi);
router.delete("/api/space-templates/:id", spaceTemplateController.deleteApi);

module.exports = router;

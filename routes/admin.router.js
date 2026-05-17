/**
 * Tenant Admin Routes - Workspace-Level Administration
 * ─────────────────────────────────────────────────────
 * Mounted at /account/:account_id/admin
 * 
 * Permission enforcement via requirePerm() middleware.
 * The tenant middleware already hydrates req.workspaceRole.
 */
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { requirePerm } = require('../middleware/permissions');

// ── Pages → Redirect to unified settings ─────────────────────
router.get("/", (req, res) => res.redirect(`/account/${req.account_number}/settings`));
router.get("/members", (req, res) => res.redirect(`/account/${req.account_number}/settings?tab=members`));
router.get("/settings", (req, res) => res.redirect(`/account/${req.account_number}/settings`));

// ── API (protected by requirePerm) ───────────────────────────
router.post("/api/members/invite",  requirePerm('members.invite'),     adminController.inviteMember);
router.post("/api/members/role",    requirePerm('members.changeRole'),  adminController.changeMemberRole);
router.post("/api/members/remove",  requirePerm('members.remove'),      adminController.removeMember);
router.post("/api/invites/cancel",  requirePerm('invites.cancel'),      adminController.cancelInvite);
router.post("/api/settings",        requirePerm('settings.update'),     adminController.updateSettings);
router.delete("/api/account",        requirePerm('account.delete'),      adminController.deleteAccount);

module.exports = router;

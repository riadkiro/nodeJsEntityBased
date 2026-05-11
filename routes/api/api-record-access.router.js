const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Account = require('../../models/account.model');
const { requirePerm } = require('../../middleware/permissions');
const { tenantCollection } = require('../../middleware/tenant');

// ── GET /api/record-access/:recordId ──────────────────
// Get access grants for a specific record
router.get('/:recordId', async (req, res) => {
    try {
        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.json({ success: true, access: null });

        let access = await RecordAccess.findOne({ recordId: req.params.recordId }).lean();
        if (access) {
            // Clean expired grants
            const now = new Date();
            access.grants = (access.grants || []).filter(g => !g.expiresAt || g.expiresAt > now);
        }
        res.json({ success: true, access });
    } catch (error) {
        console.error('[RecordAccess API] get error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/record-access/:recordId/grant ───────────
// Grant access to a user or team for a record
router.post('/:recordId/grant', requirePerm('records.share'), async (req, res) => {
    try {
        const { granteeType, granteeId, permissions, expiresAt, note } = req.body;
        if (!granteeType || !granteeId) {
            return res.status(400).json({ error: 'granteeType and granteeId required' });
        }
        if (!['user', 'team', 'role'].includes(granteeType)) {
            return res.status(400).json({ error: 'Invalid granteeType' });
        }

        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.status(500).json({ error: 'DB not ready' });

        const entityId = req.body.entityId || req.query.entityId || '';

        let access = await RecordAccess.findOne({ recordId: req.params.recordId });
        if (!access) {
            access = new RecordAccess({
                recordId: req.params.recordId,
                entityId,
            });
        }

        // Check if grant already exists for this grantee
        const existingIdx = access.grants.findIndex(
            g => g.granteeType === granteeType && g.granteeId === granteeId
        );

        const grant = {
            granteeType,
            granteeId,
            permissions: {
                read: permissions?.read !== false,
                update: permissions?.update || false,
                delete: permissions?.delete || false,
                share: permissions?.share || false,
            },
            grantedBy: req.user._id,
            grantedAt: new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            note: note || '',
        };

        if (existingIdx >= 0) {
            access.grants[existingIdx] = grant; // Update existing
        } else {
            access.grants.push(grant); // Add new
        }

        await access.save();
        res.json({ success: true, access });
    } catch (error) {
        console.error('[RecordAccess API] grant error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/record-access/:recordId/revoke ──────────
// Revoke access for a user or team
router.post('/:recordId/revoke', requirePerm('records.share'), async (req, res) => {
    try {
        const { granteeType, granteeId } = req.body;
        if (!granteeType || !granteeId) {
            return res.status(400).json({ error: 'granteeType and granteeId required' });
        }

        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.status(500).json({ error: 'DB not ready' });

        const result = await RecordAccess.updateOne(
            { recordId: req.params.recordId },
            { $pull: { grants: { granteeType, granteeId } } }
        );

        res.json({ success: true, modified: result.modifiedCount });
    } catch (error) {
        console.error('[RecordAccess API] revoke error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/record-access/:recordId/public-link ─────
// Generate or toggle public sharing link
router.post('/:recordId/public-link', requirePerm('records.share'), async (req, res) => {
    try {
        const { enabled, permissions, expiresAt } = req.body;

        const RecordAccess = await tenantCollection(req, 'RecordAccess');
        if (!RecordAccess) return res.status(500).json({ error: 'DB not ready' });

        let access = await RecordAccess.findOne({ recordId: req.params.recordId });
        if (!access) {
            access = new RecordAccess({
                recordId: req.params.recordId,
                entityId: req.body.entityId || '',
            });
        }

        if (enabled) {
            if (!access.publicLink) {
                access.publicLink = crypto.randomBytes(24).toString('hex');
            }
            access.isPublic = true;
            access.publicPermissions = {
                read: permissions?.read !== false,
                update: permissions?.update || false,
            };
            access.publicExpiresAt = expiresAt ? new Date(expiresAt) : null;
        } else {
            access.isPublic = false;
            access.publicLink = null;
            access.publicExpiresAt = null;
        }

        await access.save();
        res.json({
            success: true,
            isPublic: access.isPublic,
            publicLink: access.isPublic ? access.publicLink : null,
        });
    } catch (error) {
        console.error('[RecordAccess API] public-link error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

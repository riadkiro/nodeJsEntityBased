const express = require('express');
const router = express.Router();
let bcrypt;
try { bcrypt = require('bcryptjs'); } catch (e) { bcrypt = require('bcrypt'); }

const userController = require('../../controllers/user.controller');

//Do not delete the comments
//Auto generated routers 
//Auto generated routers end

//Generated from template
//list
router.get('/list', userController.list_Api);
//On post create new product
router.post('/add', userController.save_Api);
// (moved /:id down)

// Save Preferences
router.post('/preferences', userController.savePreferences);

// ══════════════════════════════════════════════════════════
// PIN Security Endpoints
// ══════════════════════════════════════════════════════════

/**
 * POST /api/user/set-pin
 * Set or update the user's personal PIN (4 digits, bcrypt hashed)
 */
router.post('/set-pin', async (req, res) => {
    try {
        const User = require('../../models/user.model');
        const { pin, currentPin } = req.body;

        if (!req.user) return res.status(401).json({ success: false, error: 'Non authentifié' });
        if (!pin || !/^\d{4}$/.test(String(pin))) {
            return res.status(400).json({ success: false, error: 'Le PIN doit contenir exactement 4 chiffres' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });

        // If PIN already exists, require current PIN for change
        if (user.pinEnabled && user.pinHash) {
            if (!currentPin) {
                return res.status(400).json({ success: false, error: 'PIN actuel requis pour modifier' });
            }
            const match = await bcrypt.compare(String(currentPin), user.pinHash);
            if (!match) {
                return res.status(403).json({ success: false, error: 'PIN actuel incorrect' });
            }
        }

        const pinHash = await bcrypt.hash(String(pin), 10);
        user.pinHash = pinHash;
        user.pinEnabled = true;
        user.pinAttempts = 0;
        user.pinLockedUntil = null;
        await user.save();

        res.json({ success: true, message: 'Code PIN défini avec succès', pinEnabled: true });
    } catch (err) {
        console.error('[UserPIN] Set error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/user/verify-pin
 * Verify the user's PIN (for unlocking secured notes/records)
 * Rate limited: max 5 attempts, then 15min lockout
 */
router.post('/verify-pin', async (req, res) => {
    try {
        const User = require('../../models/user.model');
        const { pin } = req.body;

        if (!req.user) return res.status(401).json({ success: false, error: 'Non authentifié' });
        if (!pin) return res.status(400).json({ success: false, error: 'PIN requis' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
        if (!user.pinEnabled || !user.pinHash) {
            return res.status(400).json({ success: false, error: 'Aucun PIN configuré' });
        }

        // Check lockout
        if (user.pinLockedUntil && new Date() < user.pinLockedUntil) {
            const remaining = Math.ceil((user.pinLockedUntil - new Date()) / 60000);
            return res.status(429).json({
                success: false,
                error: `Trop de tentatives. Réessayez dans ${remaining} minute(s).`,
                locked: true
            });
        }

        const match = await bcrypt.compare(String(pin), user.pinHash);

        if (!match) {
            user.pinAttempts = (user.pinAttempts || 0) + 1;
            if (user.pinAttempts >= 5) {
                user.pinLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15min lockout
                user.pinAttempts = 0;
            }
            await user.save();
            const remaining = 5 - (user.pinAttempts || 0);
            return res.status(403).json({
                success: false,
                error: remaining > 0 ? `PIN incorrect. ${remaining} tentative(s) restante(s)` : 'PIN incorrect. Compte temporairement bloqué.',
                valid: false
            });
        }

        // PIN correct — reset attempts
        user.pinAttempts = 0;
        user.pinLockedUntil = null;
        await user.save();

        res.json({ success: true, valid: true });
    } catch (err) {
        console.error('[UserPIN] Verify error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * DELETE /api/user/pin
 * Remove the user's PIN (requires current PIN confirmation)
 */
router.delete('/pin', async (req, res) => {
    try {
        const User = require('../../models/user.model');
        const { pin } = req.body;

        if (!req.user) return res.status(401).json({ success: false, error: 'Non authentifié' });
        if (!pin) return res.status(400).json({ success: false, error: 'PIN actuel requis' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
        if (!user.pinEnabled || !user.pinHash) {
            return res.status(400).json({ success: false, error: 'Aucun PIN configuré' });
        }

        const match = await bcrypt.compare(String(pin), user.pinHash);
        if (!match) return res.status(403).json({ success: false, error: 'PIN incorrect' });

        user.pinHash = null;
        user.pinEnabled = false;
        user.pinAttempts = 0;
        user.pinLockedUntil = null;
        await user.save();

        res.json({ success: true, message: 'Code PIN supprimé' });
    } catch (err) {
        console.error('[UserPIN] Remove error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/user/security-status
 * Returns current security settings (no sensitive data)
 */
router.get('/security-status', async (req, res) => {
    try {
        const User = require('../../models/user.model');
        if (!req.user) return res.status(401).json({ success: false, error: 'Non authentifié' });

        const user = await User.findById(req.user._id).select('pinEnabled pinLockedUntil');
        if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });

        res.json({
            success: true,
            pinEnabled: user.pinEnabled || false,
            pinLocked: !!(user.pinLockedUntil && new Date() < user.pinLockedUntil)
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

//Single page
router.get('/:id', userController.singlePage_Api);
//Delete
router.delete('/:id', userController.delete_Api);

//Generated from template

module.exports = router;

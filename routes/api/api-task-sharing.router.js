const express = require('express');
const crypto = require('crypto');

const Account = require('../../models/account.model');
const User = require('../../models/user.model');
const TaskContact = require('../../models/task-contact.model');
const TaskListShare = require('../../models/task-list-share.model');
const { taskTenantModels } = require('../../services/task-tenant-models.service');

const router = express.Router();

function cleanText(value, fallback = '') {
    const text = String(value ?? '').trim();
    return text || fallback;
}

function normalizeEmail(value) {
    return cleanText(value).toLowerCase();
}

function normalizePhone(value) {
    return cleanText(value).replace(/[^\d+]/g, '');
}

function stringId(value) {
    return value ? String(value._id || value) : '';
}

function contactMatchesUser(req, contact) {
    const userId = stringId(req.user?._id);
    const email = normalizeEmail(req.user?.email);
    return stringId(contact.requesterUserId) === userId
        || stringId(contact.targetUserId) === userId
        || (email && normalizeEmail(contact.targetEmail) === email);
}

function otherContactSide(req, contact) {
    const requesterIsMe = stringId(contact.requesterUserId) === stringId(req.user?._id);
    if (requesterIsMe) {
        return {
            userId: contact.targetUserId || null,
            email: contact.targetEmail || '',
            phone: contact.targetPhone || '',
            name: contact.targetName || contact.targetEmail || contact.targetPhone || 'Contact',
        };
    }
    return {
        userId: contact.requesterUserId || null,
        email: contact.requesterEmail || '',
        phone: '',
        name: contact.requesterName || contact.requesterEmail || 'Contact',
    };
}

function serializeContact(req, contact) {
    const requesterIsMe = stringId(contact.requesterUserId) === stringId(req.user?._id);
    const other = otherContactSide(req, contact);
    return {
        _id: stringId(contact._id),
        id: stringId(contact._id),
        status: contact.status || 'pending',
        direction: requesterIsMe ? 'outgoing' : 'incoming',
        requesterIsMe,
        name: other.name,
        email: other.email,
        phone: other.phone,
        userId: stringId(other.userId),
        requestedAt: contact.requestedAt || contact.createdAt,
        acceptedAt: contact.acceptedAt || null,
    };
}

function serializeShare(share) {
    return {
        _id: stringId(share._id),
        id: stringId(share._id),
        listId: share.listId,
        targetType: share.targetType,
        targetUserId: stringId(share.targetUserId),
        targetEmail: share.targetEmail || '',
        targetPhone: share.targetPhone || '',
        targetName: share.targetName || '',
        contactId: stringId(share.contactId),
        teamId: share.teamId || '',
        role: share.role || 'editor',
        status: share.status || 'active',
        createdAt: share.createdAt,
    };
}

async function loadList(req, listId) {
    if (!/^[a-f\d]{24}$/i.test(String(listId || ''))) return null;
    const { TaskList } = await taskTenantModels(req);
    return TaskList.findById(listId).lean();
}

router.get('/contacts', async (req, res) => {
    try {
        const email = normalizeEmail(req.user?.email);
        const userId = req.user?._id;
        const contacts = await TaskContact.find({
            $or: [
                { requesterUserId: userId },
                { targetUserId: userId },
                ...(email ? [{ targetEmail: email }] : []),
            ],
        }).sort({ updatedAt: -1 }).lean();

        res.json({ success: true, contacts: contacts.map(contact => serializeContact(req, contact)) });
    } catch (error) {
        console.error('[TaskSharing] contacts error:', error);
        res.status(500).json({ success: false, error: error.message || 'Contacts indisponibles' });
    }
});

router.post('/contacts', async (req, res) => {
    try {
        const targetEmail = normalizeEmail(req.body?.email);
        const targetPhone = normalizePhone(req.body?.phone);
        const targetName = cleanText(req.body?.name);
        if (!targetEmail && !targetPhone) {
            return res.status(400).json({ success: false, error: 'Email ou téléphone requis' });
        }
        if (targetEmail && targetEmail === normalizeEmail(req.user?.email)) {
            return res.status(400).json({ success: false, error: 'Impossible de vous ajouter vous-même' });
        }

        const targetUser = targetEmail
            ? await User.findOne({ email: targetEmail }).select('_id name email').lean()
            : null;

        const existing = await TaskContact.findOne({
            requesterUserId: req.user._id,
            $or: [
                ...(targetEmail ? [{ targetEmail }] : []),
                ...(targetPhone ? [{ targetPhone }] : []),
            ],
            status: { $in: ['pending', 'accepted'] },
        });
        if (existing) {
            return res.json({ success: true, contact: serializeContact(req, existing), existed: true });
        }

        const contact = await TaskContact.create({
            requesterUserId: req.user._id,
            requesterAccountNumber: req.account_number,
            requesterEmail: normalizeEmail(req.user.email),
            requesterName: cleanText(req.user.name, req.user.email),
            targetUserId: targetUser?._id || null,
            targetEmail,
            targetPhone,
            targetName: targetName || targetUser?.name || targetEmail || targetPhone,
            status: 'pending',
            token: crypto.randomBytes(24).toString('hex'),
        });

        res.status(201).json({ success: true, contact: serializeContact(req, contact) });
    } catch (error) {
        console.error('[TaskSharing] create contact error:', error);
        res.status(500).json({ success: false, error: error.message || 'Contact impossible' });
    }
});

router.post('/contacts/:contactId/accept', async (req, res) => {
    try {
        const contact = await TaskContact.findById(req.params.contactId);
        if (!contact) return res.status(404).json({ success: false, error: 'Contact introuvable' });
        const email = normalizeEmail(req.user?.email);
        const canAccept = stringId(contact.targetUserId) === stringId(req.user?._id)
            || (email && normalizeEmail(contact.targetEmail) === email);
        if (!canAccept) return res.status(403).json({ success: false, error: 'Demande non autorisée' });

        contact.targetUserId = req.user._id;
        contact.status = 'accepted';
        contact.acceptedAt = new Date();
        await contact.save();

        res.json({ success: true, contact: serializeContact(req, contact) });
    } catch (error) {
        console.error('[TaskSharing] accept contact error:', error);
        res.status(500).json({ success: false, error: error.message || 'Acceptation impossible' });
    }
});

router.post('/contacts/:contactId/decline', async (req, res) => {
    try {
        const contact = await TaskContact.findById(req.params.contactId);
        if (!contact) return res.status(404).json({ success: false, error: 'Contact introuvable' });
        if (!contactMatchesUser(req, contact)) return res.status(403).json({ success: false, error: 'Demande non autorisée' });
        contact.status = 'declined';
        contact.declinedAt = new Date();
        await contact.save();
        res.json({ success: true, contact: serializeContact(req, contact) });
    } catch (error) {
        console.error('[TaskSharing] decline contact error:', error);
        res.status(500).json({ success: false, error: error.message || 'Refus impossible' });
    }
});

router.get('/lists/:listId/shares', async (req, res) => {
    try {
        const list = await loadList(req, req.params.listId);
        if (!list) return res.status(404).json({ success: false, error: 'Liste introuvable' });

        const shares = await TaskListShare.find({
            ownerAccountNumber: req.account_number,
            listId: String(req.params.listId),
            status: { $ne: 'revoked' },
        }).sort({ createdAt: -1 }).lean();

        res.json({ success: true, shares: shares.map(serializeShare) });
    } catch (error) {
        console.error('[TaskSharing] list shares error:', error);
        res.status(500).json({ success: false, error: error.message || 'Partages indisponibles' });
    }
});

router.post('/lists/:listId/shares', async (req, res) => {
    try {
        const list = await loadList(req, req.params.listId);
        if (!list) return res.status(404).json({ success: false, error: 'Liste introuvable' });

        const targetType = ['contact', 'team', 'user'].includes(req.body?.targetType) ? req.body.targetType : 'contact';
        const role = ['viewer', 'editor', 'admin'].includes(req.body?.role) ? req.body.role : 'editor';
        const sharePayload = {
            ownerAccountNumber: req.account_number,
            listId: stringId(list._id),
            recordId: stringId(list.recordId),
            ownerUserId: req.user._id,
            targetType,
            role,
            status: 'active',
            createdBy: req.user._id,
        };

        if (targetType === 'team') {
            const account = await Account.findOne({ account_number: req.account_number }).select('teams').lean();
            const team = (account?.teams || []).find(item => stringId(item._id) === String(req.body?.teamId || ''));
            if (!team) return res.status(404).json({ success: false, error: 'Équipe introuvable' });
            sharePayload.teamId = stringId(team._id);
            sharePayload.targetName = team.name || 'Équipe';
        } else if (targetType === 'contact') {
            const contact = await TaskContact.findById(req.body?.contactId);
            if (!contact || contact.status !== 'accepted' || !contactMatchesUser(req, contact)) {
                return res.status(400).json({ success: false, error: 'Contact accepté requis' });
            }
            const other = otherContactSide(req, contact);
            sharePayload.contactId = contact._id;
            sharePayload.targetUserId = other.userId || null;
            sharePayload.targetEmail = other.email || '';
            sharePayload.targetPhone = other.phone || '';
            sharePayload.targetName = other.name || 'Contact';
        } else {
            const targetEmail = normalizeEmail(req.body?.email);
            const targetUser = targetEmail
                ? await User.findOne({ email: targetEmail }).select('_id name email').lean()
                : null;
            if (!targetUser && !targetEmail) return res.status(400).json({ success: false, error: 'Utilisateur requis' });
            sharePayload.targetUserId = targetUser?._id || null;
            sharePayload.targetEmail = targetUser?.email || targetEmail;
            sharePayload.targetName = targetUser?.name || targetEmail;
        }

        const share = await TaskListShare.findOneAndUpdate(
            {
                ownerAccountNumber: sharePayload.ownerAccountNumber,
                listId: sharePayload.listId,
                targetType: sharePayload.targetType,
                targetUserId: sharePayload.targetUserId || null,
                targetEmail: sharePayload.targetEmail || '',
                targetPhone: sharePayload.targetPhone || '',
                teamId: sharePayload.teamId || '',
                status: { $ne: 'revoked' },
            },
            { $set: sharePayload },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        res.status(201).json({ success: true, share: serializeShare(share) });
    } catch (error) {
        console.error('[TaskSharing] create share error:', error);
        res.status(500).json({ success: false, error: error.message || 'Partage impossible' });
    }
});

router.delete('/shares/:shareId', async (req, res) => {
    try {
        const share = await TaskListShare.findOneAndUpdate(
            { _id: req.params.shareId, ownerAccountNumber: req.account_number },
            { $set: { status: 'revoked', revokedAt: new Date() } },
            { new: true },
        );
        if (!share) return res.status(404).json({ success: false, error: 'Partage introuvable' });
        res.json({ success: true });
    } catch (error) {
        console.error('[TaskSharing] revoke share error:', error);
        res.status(500).json({ success: false, error: error.message || 'Retrait impossible' });
    }
});

module.exports = router;

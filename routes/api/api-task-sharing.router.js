const express = require('express');
const crypto = require('crypto');

const Account = require('../../models/account.model');
const User = require('../../models/user.model');
const TaskContact = require('../../models/task-contact.model');
const ContactMessage = require('../../models/contact-message.model');
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
    const phone = normalizePhone(req.user?.phone);
    return stringId(contact.requesterUserId) === userId
        || stringId(contact.targetUserId) === userId
        || (email && normalizeEmail(contact.targetEmail) === email)
        || (phone && normalizePhone(contact.targetPhone) === phone);
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

function serializeMessage(req, message) {
    const senderUserId = stringId(message.senderUserId);
    return {
        _id: stringId(message._id),
        id: stringId(message._id),
        contactId: stringId(message.contactId),
        senderUserId,
        senderName: message.senderName || '',
        text: message.text || '',
        isMine: senderUserId === stringId(req.user?._id),
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
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
        const phone = normalizePhone(req.user?.phone);
        const userId = req.user?._id;
        const contacts = await TaskContact.find({
            $or: [
                { requesterUserId: userId },
                { targetUserId: userId },
                ...(email ? [{ targetEmail: email }] : []),
                ...(phone ? [{ targetPhone: phone }] : []),
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

        if (targetPhone && targetPhone === normalizePhone(req.user?.phone)) {
            return res.status(400).json({ success: false, error: 'Impossible de vous ajouter vous-meme' });
        }

        const targetUser = targetEmail || targetPhone
            ? await User.findOne({
                $or: [
                    ...(targetEmail ? [{ email: targetEmail }] : []),
                    ...(targetPhone ? [{ phone: targetPhone }] : []),
                ],
            }).select('_id name email phone').lean()
            : null;

        const requesterEmail = normalizeEmail(req.user?.email);
        const existingOr = [
            ...(targetUser ? [
                { requesterUserId: req.user._id, targetUserId: targetUser._id },
                { requesterUserId: targetUser._id, targetUserId: req.user._id },
            ] : []),
            ...(targetEmail ? [
                { requesterUserId: req.user._id, targetEmail },
                { requesterEmail: targetEmail, targetEmail: requesterEmail },
            ] : []),
            ...(targetPhone ? [
                { requesterUserId: req.user._id, targetPhone },
            ] : []),
        ];

        const existing = existingOr.length
            ? await TaskContact.findOne({
                $or: existingOr,
                status: { $in: ['pending', 'accepted'] },
            })
            : null;
        if (existing) {
            return res.json({ success: true, contact: serializeContact(req, existing), existed: true });
        }

        const contact = await TaskContact.create({
            requesterUserId: req.user._id,
            requesterAccountNumber: req.account_number,
            requesterEmail,
            requesterName: cleanText(req.user.name, req.user.email),
            targetUserId: targetUser?._id || null,
            targetEmail: targetUser?.email || targetEmail,
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
        const phone = normalizePhone(req.user?.phone);
        const canAccept = stringId(contact.targetUserId) === stringId(req.user?._id)
            || (email && normalizeEmail(contact.targetEmail) === email)
            || (phone && normalizePhone(contact.targetPhone) === phone);
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

router.get('/contacts/:contactId/messages', async (req, res) => {
    try {
        const contact = await TaskContact.findById(req.params.contactId).lean();
        if (!contact) return res.status(404).json({ success: false, error: 'Contact introuvable' });
        if (contact.status !== 'accepted' || !contactMatchesUser(req, contact)) {
            return res.status(403).json({ success: false, error: 'Contact accepte requis' });
        }

        const limit = Math.min(Math.max(Number(req.query?.limit) || 80, 1), 150);
        const messages = await ContactMessage.find({ contactId: contact._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({
            success: true,
            messages: messages.reverse().map(message => serializeMessage(req, message)),
        });
    } catch (error) {
        console.error('[TaskSharing] contact messages error:', error);
        res.status(500).json({ success: false, error: error.message || 'Messages indisponibles' });
    }
});

router.post('/contacts/:contactId/messages', async (req, res) => {
    try {
        const contact = await TaskContact.findById(req.params.contactId);
        if (!contact) return res.status(404).json({ success: false, error: 'Contact introuvable' });
        if (contact.status !== 'accepted' || !contactMatchesUser(req, contact)) {
            return res.status(403).json({ success: false, error: 'Contact accepte requis' });
        }

        const text = cleanText(req.body?.text);
        if (!text) return res.status(400).json({ success: false, error: 'Message requis' });
        if (text.length > 2000) {
            return res.status(400).json({ success: false, error: 'Message trop long' });
        }

        const message = await ContactMessage.create({
            contactId: contact._id,
            senderUserId: req.user._id,
            senderName: cleanText(req.user.name, req.user.email),
            text,
            readBy: [req.user._id],
        });

        res.status(201).json({ success: true, message: serializeMessage(req, message) });
    } catch (error) {
        console.error('[TaskSharing] send contact message error:', error);
        res.status(500).json({ success: false, error: error.message || 'Message impossible' });
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
        const email = normalizeEmail(req.user?.email);
        const phone = normalizePhone(req.user?.phone);
        const recipientClauses = [
            ...(req.user?._id ? [{ targetUserId: req.user._id }] : []),
            ...(email ? [{ targetEmail: email }] : []),
            ...(phone ? [{ targetPhone: phone }] : []),
        ];
        const share = await TaskListShare.findOneAndUpdate(
            {
                _id: req.params.shareId,
                status: { $ne: 'revoked' },
                $or: [
                    { ownerAccountNumber: req.account_number },
                    ...recipientClauses,
                ],
            },
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

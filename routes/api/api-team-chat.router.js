const express = require('express');
const router = express.Router();
const { tenantCollection } = require('../../middleware/tenant');
const User = require('../../models/user.model');
const Account = require('../../models/account.model');

// ── GET /api/team-chat/conversations ──────────────────────
// List all team conversations (channels + DMs) for the current user
router.get('/conversations', async (req, res) => {
    try {
        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const userId = req.user._id.toString();

        // Get all conversations where user is a participant and not record-scoped
        const conversations = await Conversation.find({
            'participants.userId': userId,
            recordId: null,
            archived: { $ne: true },
        }).sort({ 'lastMessage.sentAt': -1, updatedAt: -1 }).lean();

        // Separate channels (group) and DMs (direct)
        const channels = conversations.filter(c => c.type === 'group');
        const dms = conversations.filter(c => c.type === 'direct');

        // For DMs, figure out the "other" user
        const dmsFormatted = dms.map(dm => {
            const other = dm.participants.find(p => p.userId !== userId) || dm.participants[0];
            const me = dm.participants.find(p => p.userId === userId);
            return {
                ...dm,
                otherUser: other,
                myUnread: me?.unreadCount || 0,
            };
        });

        const channelsFormatted = channels.map(ch => {
            const me = ch.participants.find(p => p.userId === userId);
            return {
                ...ch,
                myUnread: me?.unreadCount || 0,
            };
        });

        // ── Record-scoped conversations (all, not just user's) ──
        const EntityModel = await tenantCollection(req, 'Entity');
        const recordConvs = await Conversation.find({
            recordId: { $ne: null },
            archived: { $ne: true },
        }).sort({ updatedAt: -1 }).lean();

        // Enrich with entity details for icon/color
        // First, resolve entityId from Records for conversations missing it
        const RecordModel = await tenantCollection(req, 'Entity') ? await tenantCollection(req, 'Record') : null;
        const convsWithoutEntity = recordConvs.filter(c => !c.entityId && c.recordId);
        if (RecordModel && convsWithoutEntity.length > 0) {
            const recordIds = convsWithoutEntity.map(c => c.recordId);
            const records = await RecordModel.find({ _id: { $in: recordIds } }).select('entityId title').lean();
            const recordLookup = {};
            records.forEach(r => { recordLookup[r._id.toString()] = r; });
            convsWithoutEntity.forEach(c => {
                const rec = recordLookup[c.recordId.toString()];
                if (rec) {
                    c.entityId = rec.entityId;
                    if (!c.recordTitle) c.recordTitle = rec.title;
                }
            });
        }

        const entityIds = [...new Set(recordConvs.map(c => c.entityId?.toString()).filter(Boolean))];
        const entitiesDb = entityIds.length > 0
            ? await EntityModel.find({ _id: { $in: entityIds } }).select('name slug icon color').lean()
            : [];
        const entityLookup = {};
        entitiesDb.forEach(e => { entityLookup[e._id.toString()] = e; });

        const recordConversations = recordConvs.map(conv => {
            const eId = conv.entityId?.toString();
            const entityInfo = entityLookup[eId] || {};
            return {
                ...conv,
                entityDisplayName: entityInfo.name || conv.entityName || '',
                entitySlug: entityInfo.slug || '',
                entityIcon: entityInfo.icon || 'solar:folder-bold-duotone',
                entityColor: entityInfo.color || '#f97316',
                recordDisplayTitle: conv.recordTitle || 'Sans titre',
                myUnread: 0,
            };
        });

        res.json({ success: true, channels: channelsFormatted, dms: dmsFormatted, recordConversations });
    } catch (error) {
        console.error('[TeamChat API] conversations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team-chat/ensure-channels ───────────────────
// Ensure default channels exist for this account, create if missing
router.post('/ensure-channels', async (req, res) => {
    try {
        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const account = await Account.findOne({ account_number: req.account_number }).lean();
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Build participants from account.users
        const participants = [];
        for (const member of (account.users || [])) {
            const user = member.userId
                ? await User.findById(member.userId).select('name email avatar').lean()
                : null;
            participants.push({
                userId: member.userId || 'unknown',
                name: user?.name || member.email?.split('@')[0] || 'User',
                email: member.email || user?.email || '',
                avatar: user?.avatar || '',
                role: 'member',
            });
        }

        const defaultChannels = [
            { name: '# général', icon: 'solar:chat-round-dots-bold-duotone' },
            { name: '# annonces', icon: 'solar:megaphone-bold-duotone' },
        ];

        const created = [];
        for (const ch of defaultChannels) {
            const exists = await Conversation.findOne({
                type: 'group',
                name: ch.name,
                recordId: null,
            });
            if (!exists) {
                const conv = await Conversation.create({
                    type: 'group',
                    name: ch.name,
                    avatar: ch.icon,
                    participants,
                    recordId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                created.push(conv.name);
            }
        }

        res.json({ success: true, created });
    } catch (error) {
        console.error('[TeamChat API] ensure-channels error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team-chat/create-channel ────────────────────
// Create a new channel conversation
router.post('/create-channel', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'name required' });

        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const account = await Account.findOne({ account_number: req.account_number }).lean();
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const participants = [];
        for (const member of (account.users || [])) {
            const user = member.userId ? await User.findById(member.userId).select('name email avatar').lean() : null;
            participants.push({
                userId: member.userId || 'unknown',
                name: user?.name || member.email?.split('@')[0] || 'User',
                email: member.email || user?.email || '',
                avatar: user?.avatar || '',
                role: 'member',
            });
        }

        const conv = await Conversation.create({
            type: 'group', name, participants, recordId: null,
            createdAt: new Date(), updatedAt: new Date(),
        });

        res.json({ success: true, conversation: conv });
    } catch (error) {
        console.error('[TeamChat API] create-channel error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team-chat/create-dm ─────────────────────────
// Create or find a DM conversation with another user
router.post('/create-dm', async (req, res) => {
    try {
        const { targetUserId } = req.body;
        if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });

        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const userId = req.user._id.toString();

        // Check if DM already exists between these two users
        const existing = await Conversation.findOne({
            type: 'direct',
            recordId: null,
            'participants.userId': { $all: [userId, targetUserId] },
            'participants': { $size: 2 },
        });

        if (existing) return res.json({ success: true, conversation: existing, existed: true });

        // Create new DM
        const me = req.user;
        const other = await User.findById(targetUserId).select('name email avatar').lean();
        if (!other) return res.status(404).json({ error: 'User not found' });

        const conv = await Conversation.create({
            type: 'direct',
            recordId: null,
            participants: [
                { userId, name: me.name || me.email, email: me.email, avatar: me.avatar || '' },
                { userId: targetUserId, name: other.name || other.email, email: other.email, avatar: other.avatar || '' },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.json({ success: true, conversation: conv, existed: false });
    } catch (error) {
        console.error('[TeamChat API] create-dm error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/team-chat/members ────────────────────────────
// Get all account members for the DM list
router.get('/members', async (req, res) => {
    try {
        const account = await Account.findOne({ account_number: req.account_number }).lean();
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const members = [];
        for (const m of (account.users || [])) {
            if (!m.userId) continue;
            const user = await User.findById(m.userId).select('name email avatar status').lean();
            if (user) {
                members.push({
                    _id: user._id.toString(),
                    name: user.name || user.email,
                    email: user.email,
                    avatar: user.avatar || null,
                    status: user.status || 'active',
                });
            }
        }
        res.json({ success: true, members });
    } catch (error) {
        console.error('[TeamChat API] members error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE /api/team-chat/conversations/:id ───────────────
// Delete (archive) a conversation
router.delete('/conversations/:id', async (req, res) => {
    try {
        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const conv = await Conversation.findById(req.params.id);
        if (!conv) return res.status(404).json({ error: 'Conversation not found' });

        // Soft delete: mark as archived
        conv.archived = true;
        conv.archivedAt = new Date();
        await conv.save();

        res.json({ success: true });
    } catch (error) {
        console.error('[TeamChat API] delete conversation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET /api/team-chat/search-records ─────────────────────
// Search records across all entities for the "new record conversation" picker
router.get('/search-records', async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q || q.length < 2) return res.json({ success: true, results: [] });

        const EntityModel = await tenantCollection(req, 'Entity');
        const RecordModel = await tenantCollection(req, 'Record');
        if (!EntityModel || !RecordModel) return res.status(500).json({ error: 'DB not ready' });

        const entities = await EntityModel.find({}).select('name slug icon color').lean();
        const regex = new RegExp(q, 'i');

        // Search records by title across all entities
        const records = await RecordModel.find({
            title: regex,
        }).select('title entityId').limit(15).lean();

        const entityLookup = {};
        entities.forEach(e => { entityLookup[e._id.toString()] = e; });

        const results = records.map(r => {
            const entityInfo = entityLookup[r.entityId?.toString()] || {};
            return {
                recordId: r._id.toString(),
                recordTitle: r.title || 'Sans titre',
                entityId: r.entityId?.toString(),
                entityName: entityInfo.name || '',
                entitySlug: entityInfo.slug || '',
                entityIcon: entityInfo.icon || 'solar:folder-bold-duotone',
                entityColor: entityInfo.color || '#f97316',
            };
        });

        res.json({ success: true, results });
    } catch (error) {
        console.error('[TeamChat API] search-records error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// ═══════════════════════════════════════════════════
// PARTICIPANT MANAGEMENT
// ═══════════════════════════════════════════════════

// ── GET /api/team-chat/conversations/:id/participants ─────
// Get participants of a conversation
router.get('/conversations/:id/participants', async (req, res) => {
    try {
        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const conv = await Conversation.findById(req.params.id).lean();
        if (!conv) return res.status(404).json({ error: 'Conversation not found' });

        // Enrich with latest user info
        const participants = [];
        for (const p of (conv.participants || [])) {
            const user = p.userId ? await User.findById(p.userId).select('name email avatar status').lean() : null;
            participants.push({
                userId: p.userId,
                name: user?.name || p.name || 'Inconnu',
                email: user?.email || p.email || '',
                avatar: user?.avatar || p.avatar || null,
                status: user?.status || 'inactive',
                role: p.role || 'member',
            });
        }

        res.json({ success: true, participants, conversationType: conv.type });
    } catch (error) {
        console.error('[TeamChat API] get participants error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team-chat/conversations/:id/add-participant ─
router.post('/conversations/:id/add-participant', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const conv = await Conversation.findById(req.params.id);
        if (!conv) return res.status(404).json({ error: 'Conversation not found' });
        if (conv.type !== 'group') return res.status(400).json({ error: 'Seuls les channels supportent l\'ajout de participants' });

        // Check if already in
        const already = conv.participants.some(p => p.userId === userId);
        if (already) return res.status(400).json({ error: 'Déjà participant' });

        const user = await User.findById(userId).select('name email avatar').lean();
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        conv.participants.push({
            userId,
            name: user.name || user.email,
            email: user.email,
            avatar: user.avatar || '',
            role: 'member',
            unreadCount: 0,
        });
        await conv.save();

        res.json({ success: true, message: `${user.name || user.email} ajouté au channel` });
    } catch (error) {
        console.error('[TeamChat API] add participant error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team-chat/conversations/:id/add-team ────
// Bulk-add all members of a team to a channel
router.post('/conversations/:id/add-team', async (req, res) => {
    try {
        const { teamId } = req.body;
        if (!teamId) return res.status(400).json({ error: 'teamId required' });

        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const conv = await Conversation.findById(req.params.id);
        if (!conv) return res.status(404).json({ error: 'Conversation not found' });
        if (conv.type !== 'group') return res.status(400).json({ error: 'Seuls les channels supportent l\'ajout de participants' });

        // Load team from account
        const account = await Account.findOne({ account_number: req.account_number }).lean();
        if (!account) return res.status(404).json({ error: 'Account not found' });

        const team = (account.teams || []).find(t => t._id.toString() === teamId);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        const existingIds = conv.participants.map(p => p.userId);
        let addedCount = 0;

        for (const memberId of (team.memberIds || [])) {
            if (existingIds.includes(memberId)) continue;

            const user = await User.findById(memberId).select('name email avatar').lean();
            if (!user) continue;

            conv.participants.push({
                userId: memberId,
                name: user.name || user.email,
                email: user.email,
                avatar: user.avatar || '',
                role: 'member',
                unreadCount: 0,
            });
            addedCount++;
        }

        if (addedCount > 0) await conv.save();

        res.json({
            success: true,
            message: `${addedCount} membre(s) de "${team.name}" ajouté(s)`,
            addedCount
        });
    } catch (error) {
        console.error('[TeamChat API] add team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── POST /api/team-chat/conversations/:id/remove-participant
router.post('/conversations/:id/remove-participant', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const Conversation = await tenantCollection(req, 'Conversation');
        if (!Conversation) return res.status(500).json({ error: 'DB not ready' });

        const conv = await Conversation.findById(req.params.id);
        if (!conv) return res.status(404).json({ error: 'Conversation not found' });
        if (conv.type !== 'group') return res.status(400).json({ error: 'Seuls les channels supportent le retrait de participants' });

        conv.participants = conv.participants.filter(p => p.userId !== userId);
        await conv.save();

        res.json({ success: true, message: 'Participant retiré' });
    } catch (error) {
        console.error('[TeamChat API] remove participant error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

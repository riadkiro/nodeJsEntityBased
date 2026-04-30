/**
 * Record Chat API Router
 * 
 * REST API for record-scoped conversations and messages.
 * Mounted at /account/:account_number via api.routes.js
 * 
 * Endpoints:
 *   GET    /api/record/:recordId/conversations         — List conversations for a record
 *   POST   /api/record/:recordId/conversations         — Create a new conversation
 *   GET    /api/record/:recordId/conversations/:convId — Get conversation + messages
 *   POST   /api/record/:recordId/conversations/:convId/messages — Send a message (REST)
 *   DELETE /api/record/:recordId/conversations/:convId — Delete a conversation
 */

const { tenantCollection } = require('../../middleware/tenant');

module.exports = (router) => {

    // ═══════════════════════════════════════════
    // GET /api/record/:recordId/conversations
    // ═══════════════════════════════════════════
    router.get('/api/record/:recordId/conversations', async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, 'Conversation');
            const conversations = await Conversation.find({
                recordId: req.params.recordId,
                archived: { $ne: true }
            })
            .sort({ updatedAt: -1 })
            .lean();

            res.json({ success: true, conversations });
        } catch (err) {
            console.error('[RecordChat] List error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // POST /api/record/:recordId/conversations
    // ═══════════════════════════════════════════
    router.post('/api/record/:recordId/conversations', async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, 'Conversation');
            const RecordModel = await tenantCollection(req, 'Record');
            const EntityModel = await tenantCollection(req, 'Entity');
            const User = require('../../models/user.model');

            const { name } = req.body;
            const userId = String(req.user._id);

            // Load record + entity for context
            const record = await RecordModel.findById(req.params.recordId).select('title entityId').lean();
            if (!record) return res.status(404).json({ success: false, error: 'Record not found' });

            const entity = await EntityModel.findById(record.entityId).select('name slug icon color').lean();

            // Auto-add all account users as participants
            const accountNumber = req.account_number;
            const allUsers = await User.find({ 'accounts.account_number': accountNumber })
                .select('_id name email avatar')
                .lean();

            const participants = allUsers.map(u => ({
                userId: String(u._id),
                name: u.name || u.email || 'Unknown',
                email: u.email || '',
                avatar: u.avatar || '',
                role: String(u._id) === userId ? 'admin' : 'member',
                joinedAt: new Date(),
                lastReadAt: String(u._id) === userId ? new Date() : null,
                unreadCount: 0
            }));

            const conversation = await Conversation.create({
                type: 'group',
                name: name || 'Conversation',
                recordId: req.params.recordId,
                entityId: record.entityId,
                entityName: entity?.name || '',
                recordTitle: record.title || 'Sans titre',
                participants
            });

            res.json({ success: true, conversation });
        } catch (err) {
            console.error('[RecordChat] Create error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // GET /api/record/:recordId/conversations/:convId
    // ═══════════════════════════════════════════
    router.get('/api/record/:recordId/conversations/:convId', async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, 'Conversation');
            const Message = await tenantCollection(req, 'Message');

            const conversation = await Conversation.findOne({
                _id: req.params.convId,
                recordId: req.params.recordId
            }).lean();

            if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });

            const limit = parseInt(req.query.limit) || 50;
            const before = req.query.before;
            const query = { conversationId: req.params.convId, deleted: { $ne: true } };
            if (before) query.createdAt = { $lt: new Date(before) };

            const messages = await Message.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            res.json({
                success: true,
                conversation,
                messages: messages.reverse()
            });
        } catch (err) {
            console.error('[RecordChat] Get error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // POST /api/record/:recordId/conversations/:convId/messages
    // ═══════════════════════════════════════════
    router.post('/api/record/:recordId/conversations/:convId/messages', async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, 'Conversation');
            const Message = await tenantCollection(req, 'Message');

            const userId = String(req.user._id);
            const { text, type = 'text' } = req.body;

            if (!text || !text.trim()) return res.status(400).json({ success: false, error: 'Message text required' });

            const conversation = await Conversation.findOne({
                _id: req.params.convId,
                recordId: req.params.recordId
            });
            if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });

            // Get sender info
            const sender = conversation.participants.find(p => p.userId === userId);

            const message = await Message.create({
                conversationId: req.params.convId,
                senderId: userId,
                senderName: sender?.name || req.user.name || 'Unknown',
                senderAvatar: sender?.avatar || req.user.avatar || '',
                type,
                text: text.trim(),
                readBy: [{ userId, readAt: new Date() }]
            });

            // Update conversation's lastMessage + increment unread for others
            const incFields = {};
            conversation.participants.forEach((p, i) => {
                if (p.userId !== userId) {
                    incFields[`participants.${i}.unreadCount`] = 1;
                }
            });

            await Conversation.findByIdAndUpdate(req.params.convId, {
                lastMessage: {
                    text: text.trim(),
                    senderId: userId,
                    senderName: sender?.name || req.user.name || 'Unknown',
                    sentAt: message.createdAt,
                    type
                },
                updatedAt: new Date(),
                ...(Object.keys(incFields).length > 0 ? { $inc: incFields } : {})
            });

            res.json({ success: true, message });
        } catch (err) {
            console.error('[RecordChat] Send error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // DELETE /api/record/:recordId/conversations/:convId
    // ═══════════════════════════════════════════
    router.delete('/api/record/:recordId/conversations/:convId', async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, 'Conversation');
            const Message = await tenantCollection(req, 'Message');

            const conv = await Conversation.findOneAndDelete({
                _id: req.params.convId,
                recordId: req.params.recordId
            });
            if (!conv) return res.status(404).json({ success: false, error: 'Not found' });

            await Message.deleteMany({ conversationId: req.params.convId });

            res.json({ success: true });
        } catch (err) {
            console.error('[RecordChat] Delete error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // GET /api/chat-hub
    // Aggregated view: all record-scoped conversations grouped by entity → record
    // ═══════════════════════════════════════════
    router.get('/api/chat-hub', async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, 'Conversation');
            const EntityModel = await tenantCollection(req, 'Entity');

            const conversations = await Conversation.find({
                recordId: { $ne: null },
                archived: { $ne: true }
            })
            .sort({ updatedAt: -1 })
            .lean();

            // Load entity details for icon/color
            const entityIds = [...new Set(conversations.map(c => c.entityId?.toString()).filter(Boolean))];
            const entitiesDb = await EntityModel.find({ _id: { $in: entityIds } }).select('name icon color').lean();
            const entityLookup = {};
            entitiesDb.forEach(e => { entityLookup[e._id.toString()] = e; });

            // Group by entityId → recordId
            const entityMap = {};
            conversations.forEach(conv => {
                const eId = conv.entityId?.toString() || 'unknown';
                const entityInfo = entityLookup[eId] || {};
                if (!entityMap[eId]) {
                    entityMap[eId] = {
                        entityId: eId,
                        entityName: entityInfo.name || conv.entityName || 'Unknown',
                        entityIcon: entityInfo.icon || 'solar:folder-bold-duotone',
                        entityColor: entityInfo.color || '#f97316',
                        records: {}
                    };
                }
                const rId = conv.recordId?.toString() || 'unknown';
                if (!entityMap[eId].records[rId]) {
                    entityMap[eId].records[rId] = {
                        recordId: rId,
                        recordTitle: conv.recordTitle || 'Sans titre',
                        conversations: []
                    };
                }
                entityMap[eId].records[rId].conversations.push(conv);
            });

            // Convert to array
            const entities = Object.values(entityMap).map(e => ({
                ...e,
                records: Object.values(e.records),
                totalConversations: Object.values(e.records).reduce((sum, r) => sum + r.conversations.length, 0)
            }));

            res.json({ success: true, entities });
        } catch (err) {
            console.error('[ChatHub] Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });
};

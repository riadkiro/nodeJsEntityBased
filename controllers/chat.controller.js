/**
 * Chat Controller
 * 
 * REST API endpoints for the chat system.
 * Handles conversation management (list, create, get).
 * WebSocket handles real-time messaging (see src/chat/socketServer.js).
 * 
 * All endpoints are multi-tenant aware via tenantCollection(req, "Model").
 */

const { tenantCollection } = require("../middleware/tenant");

module.exports = {
    /**
     * GET /api/chat/conversations
     * List all conversations for the current user, sorted by last message.
     */
    listConversations: async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, "Conversation");
            if (!Conversation) return res.status(500).json({ error: "DB not ready" });

            const userId = String(req.user._id);

            const conversations = await Conversation.find({
                "participants.userId": userId,
                archived: { $ne: true },
            })
                .sort({ "lastMessage.sentAt": -1, updatedAt: -1 })
                .lean();

            // Enrich with current user's unread count
            const enriched = conversations.map((conv) => {
                const me = conv.participants.find((p) => p.userId === userId);
                const other = conv.participants.find((p) => p.userId !== userId);
                return {
                    ...conv,
                    unreadCount: me?.unreadCount || 0,
                    // For direct convos, expose the other participant for display
                    otherParticipant: conv.type === "direct" ? other : null,
                };
            });

            res.json(enriched);
        } catch (err) {
            console.error("[Chat API] Error listing conversations:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * POST /api/chat/conversations
     * Create a new conversation (1-on-1 or group).
     * Body: { type: "direct"|"group", participantIds: [...], name?: string }
     */
    createConversation: async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, "Conversation");
            if (!Conversation) return res.status(500).json({ error: "DB not ready" });

            const { type = "direct", participantIds = [], name = "" } = req.body;
            const userId = String(req.user._id);

            if (!participantIds.length) {
                return res.status(400).json({ error: "At least one participant required" });
            }

            // For direct conversations, check if one already exists
            if (type === "direct" && participantIds.length === 1) {
                const targetId = participantIds[0];
                const existing = await Conversation.findOne({
                    type: "direct",
                    "participants.userId": { $all: [userId, targetId] },
                    $expr: { $eq: [{ $size: "$participants" }, 2] },
                });

                if (existing) {
                    return res.json(existing);
                }
            }

            // Get user details for participants (from central User model)
            const User = require("../models/user.model");
            const allIds = [...new Set([userId, ...participantIds])];
            const users = await User.find({ _id: { $in: allIds } }).lean();

            const participants = allIds.map((id) => {
                const user = users.find((u) => String(u._id) === id);
                return {
                    userId: id,
                    name: user?.name || user?.email || "Unknown",
                    email: user?.email || "",
                    avatar: user?.avatar || "",
                    role: id === userId ? "admin" : "member",
                    joinedAt: new Date(),
                    lastReadAt: new Date(),
                    unreadCount: 0,
                };
            });

            const conversation = await Conversation.create({
                type,
                name: type === "group" ? name : "",
                participants,
            });

            console.log(`[Chat API] Conversation created: ${conversation._id} (${type})`);
            res.json(conversation);
        } catch (err) {
            console.error("[Chat API] Error creating conversation:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * GET /api/chat/conversations/:id
     * Get a single conversation with its messages.
     */
    getConversation: async (req, res) => {
        try {
            const Conversation = await tenantCollection(req, "Conversation");
            const Message = await tenantCollection(req, "Message");
            if (!Conversation || !Message) return res.status(500).json({ error: "DB not ready" });

            const userId = String(req.user._id);
            const convId = req.params.id;

            const conversation = await Conversation.findOne({
                _id: convId,
                "participants.userId": userId,
            }).lean();

            if (!conversation) {
                return res.status(404).json({ error: "Conversation not found" });
            }

            // Get last 50 messages
            const messages = await Message.find({
                conversationId: convId,
                deleted: { $ne: true },
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            res.json({
                conversation,
                messages: messages.reverse(), // Oldest first
            });
        } catch (err) {
            console.error("[Chat API] Error getting conversation:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * GET /api/chat/users
     * List all users in the same account (for starting new conversations).
     */
    listUsers: async (req, res) => {
        try {
            const User = require("../models/user.model");
            const currentUserId = String(req.user._id);
            const accountNumber = req.account_number;

            // Find users who have this account
            const users = await User.find({
                "accounts.account_number": accountNumber,
                _id: { $ne: currentUserId },
            })
                .select("_id name email avatar")
                .lean();

            res.json(users);
        } catch (err) {
            console.error("[Chat API] Error listing users:", err);
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * GET /chat
     * Render the full-page chat view.
     */
    chatPage: async (req, res) => {
        try {
            res.render("account/account-chat-hub", {
                layout: "layout-app",
                account_number: req.account_number,
                user: req.user,
                currentUser: {
                    id: String(req.user._id),
                    name: req.user.name || req.user.email,
                    email: req.user.email,
                    avatar: req.user.avatar || "",
                },
            });
        } catch (err) {
            console.error("[Chat API] Error rendering chat hub:", err);
            res.status(500).send("Error loading chat");
        }
    },
};

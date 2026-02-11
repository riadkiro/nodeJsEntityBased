/**
 * Socket.IO Chat Server
 * 
 * Handles real-time WebSocket connections for the chat system.
 * Integrates with Express session/passport for authentication.
 * Multi-tenant aware: uses tenant DB connections.
 * 
 * Events (Client → Server):
 *   - chat:join           → Join user's conversations rooms
 *   - chat:sendMessage    → Send a text message
 *   - chat:sendFile       → Send a file/image message
 *   - chat:typing         → Notify typing status
 *   - chat:markRead       → Mark messages as read
 *   - chat:loadMessages   → Load message history for a conversation
 * 
 * Events (Server → Client):
 *   - chat:newMessage     → New message received
 *   - chat:userTyping     → Someone is typing
 *   - chat:messageSeen    → Message was read
 *   - chat:userStatus     → User online/offline status
 *   - chat:error          → Error notification
 */

const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dbConfig = require("../../config/db");

// Cache tenant connections (reuse from tenant middleware)
const cachedConnections = {};

/**
 * Get or create tenant DB connection
 */
async function getTenantConnection(accountNumber) {
    if (cachedConnections[accountNumber]) {
        return cachedConnections[accountNumber];
    }
    const dbUrl = `${dbConfig.uri}saas_app_rb_${accountNumber}`;
    console.log(`[Socket.IO] Connecting to tenant DB: ${dbUrl}`);
    const conn = await mongoose.createConnection(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 5,
    });
    await new Promise((resolve, reject) => {
        conn.once("open", resolve);
        conn.once("error", reject);
    });
    cachedConnections[accountNumber] = conn;
    return conn;
}

/**
 * Get tenant model from connection
 */
function getTenantModel(conn, modelName) {
    try {
        return conn.model(modelName);
    } catch (e) {
        // Model not registered on this connection, register it
        const globalModel = mongoose.model(modelName);
        return conn.model(modelName, globalModel.schema);
    }
}

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

/**
 * Initialize Socket.IO on the HTTP server
 * @param {http.Server} server - The HTTP server instance
 * @param {Function} sessionMiddleware - Express session middleware
 */
function initSocketIO(server, sessionMiddleware) {
    const io = new Server(server, {
        cors: { origin: "*" },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Share session with Socket.IO
    io.engine.use(sessionMiddleware);

    // Authentication middleware
    io.use((socket, next) => {
        const req = socket.request;
        if (req.session && req.session.passport && req.session.passport.user) {
            socket.userId = req.session.passport.user;
            console.log(`[Socket.IO] Authenticated user: ${socket.userId}`);
            next();
        } else {
            console.log("[Socket.IO] Authentication failed - no session");
            next(new Error("Authentication required"));
        }
    });

    io.on("connection", async (socket) => {
        const userId = socket.userId;
        console.log(`[Socket.IO] User connected: ${userId} (socket: ${socket.id})`);

        // Track online status
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        // Broadcast online status to all connected users
        io.emit("chat:userStatus", { userId, online: true });

        /**
         * JOIN - Join conversation rooms for real-time updates
         */
        socket.on("chat:join", async (data) => {
            try {
                const { accountNumber } = data;
                if (!accountNumber) return socket.emit("chat:error", { message: "Account number required" });

                socket.accountNumber = accountNumber;
                const conn = await getTenantConnection(accountNumber);
                const Conversation = getTenantModel(conn, "Conversation");

                // Find all conversations for this user
                const conversations = await Conversation.find({
                    "participants.userId": userId,
                }).select("_id");

                // Join rooms for each conversation
                conversations.forEach((conv) => {
                    socket.join(`conv:${conv._id}`);
                });

                console.log(`[Socket.IO] User ${userId} joined ${conversations.length} conversation rooms`);

                // Send online users list
                const onlineList = [];
                onlineUsers.forEach((sockets, uid) => {
                    if (sockets.size > 0) onlineList.push(uid);
                });
                socket.emit("chat:onlineUsers", onlineList);
            } catch (err) {
                console.error("[Socket.IO] Error joining rooms:", err);
                socket.emit("chat:error", { message: "Failed to join conversations" });
            }
        });

        /**
         * SEND MESSAGE - Send a text message to a conversation
         */
        socket.on("chat:sendMessage", async (data) => {
            try {
                const { conversationId, text, type = "text", attachment } = data;
                const accountNumber = socket.accountNumber;

                if (!accountNumber) return socket.emit("chat:error", { message: "Not joined yet" });
                if (!conversationId) return socket.emit("chat:error", { message: "Conversation ID required" });
                if (!text || !text.trim()) return socket.emit("chat:error", { message: "Message text required" });

                const conn = await getTenantConnection(accountNumber);
                const Message = getTenantModel(conn, "Message");
                const Conversation = getTenantModel(conn, "Conversation");

                // Verify user is participant
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    "participants.userId": userId,
                });

                if (!conversation) {
                    return socket.emit("chat:error", { message: "Conversation not found or access denied" });
                }

                // Get sender info from conversation participant data
                const sender = conversation.participants.find((p) => p.userId === userId);

                // Create message with optional attachment
                const messageData = {
                    conversationId,
                    senderId: userId,
                    senderName: sender?.name || "Unknown",
                    senderAvatar: sender?.avatar || "",
                    type,
                    text: text.trim(),
                    readBy: [{ userId, readAt: new Date() }],
                };

                // Add attachment if present (file/image)
                if (attachment) {
                    messageData.attachment = {
                        filename: attachment.filename,
                        url: attachment.url,
                        mimetype: attachment.mimetype,
                        size: attachment.size,
                    };
                }

                const message = await Message.create(messageData);

                // Update conversation's last message
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: {
                        text: text.trim(),
                        senderId: userId,
                        senderName: sender?.name || "Unknown",
                        sentAt: message.createdAt,
                        type,
                    },
                    updatedAt: new Date(),
                    // Increment unread count for all other participants
                    $inc: Object.fromEntries(
                        conversation.participants
                            .filter((p) => p.userId !== userId)
                            .map((p, i) => {
                                const idx = conversation.participants.findIndex((pp) => pp.userId === p.userId);
                                return [`participants.${idx}.unreadCount`, 1];
                            })
                    ),
                });

                // Broadcast to all participants in the conversation room
                io.to(`conv:${conversationId}`).emit("chat:newMessage", {
                    _id: message._id,
                    conversationId,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    senderAvatar: message.senderAvatar,
                    type: message.type,
                    text: message.text,
                    attachment: message.attachment,
                    createdAt: message.createdAt,
                    readBy: message.readBy,
                });

                console.log(`[Socket.IO] Message sent in conv ${conversationId} by ${userId}`);
            } catch (err) {
                console.error("[Socket.IO] Error sending message:", err);
                socket.emit("chat:error", { message: "Failed to send message" });
            }
        });

        /**
         * LOAD MESSAGES - Fetch message history for a conversation
         */
        socket.on("chat:loadMessages", async (data) => {
            try {
                const { conversationId, before, limit = 50 } = data;
                const accountNumber = socket.accountNumber;

                if (!accountNumber) return socket.emit("chat:error", { message: "Not joined yet" });

                const conn = await getTenantConnection(accountNumber);
                const Message = getTenantModel(conn, "Message");
                const Conversation = getTenantModel(conn, "Conversation");

                // Verify access
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    "participants.userId": userId,
                });
                if (!conversation) return socket.emit("chat:error", { message: "Access denied" });

                // Build query
                const query = { conversationId, deleted: { $ne: true } };
                if (before) query.createdAt = { $lt: new Date(before) };

                const messages = await Message.find(query)
                    .sort({ createdAt: -1 })
                    .limit(Math.min(limit, 100))
                    .lean();

                socket.emit("chat:messages", {
                    conversationId,
                    messages: messages.reverse(), // Oldest first
                    hasMore: messages.length === Math.min(limit, 100),
                });
            } catch (err) {
                console.error("[Socket.IO] Error loading messages:", err);
                socket.emit("chat:error", { message: "Failed to load messages" });
            }
        });

        /**
         * TYPING - Broadcast typing indicator
         */
        socket.on("chat:typing", (data) => {
            const { conversationId, isTyping } = data;
            if (!conversationId) return;

            socket.to(`conv:${conversationId}`).emit("chat:userTyping", {
                conversationId,
                userId,
                isTyping,
            });
        });

        /**
         * MARK READ - Mark messages as read in a conversation
         */
        socket.on("chat:markRead", async (data) => {
            try {
                const { conversationId } = data;
                const accountNumber = socket.accountNumber;
                if (!accountNumber || !conversationId) return;

                const conn = await getTenantConnection(accountNumber);
                const Message = getTenantModel(conn, "Message");
                const Conversation = getTenantModel(conn, "Conversation");

                // Mark all unread messages in this conversation as read
                await Message.updateMany(
                    {
                        conversationId,
                        "readBy.userId": { $ne: userId },
                    },
                    {
                        $addToSet: { readBy: { userId, readAt: new Date() } },
                    }
                );

                // Reset unread count for this participant
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    const idx = conversation.participants.findIndex((p) => p.userId === userId);
                    if (idx !== -1) {
                        conversation.participants[idx].unreadCount = 0;
                        conversation.participants[idx].lastReadAt = new Date();
                        await conversation.save();
                    }
                }

                // Notify other participants
                socket.to(`conv:${conversationId}`).emit("chat:messageSeen", {
                    conversationId,
                    userId,
                    readAt: new Date(),
                });

                console.log(`[Socket.IO] User ${userId} marked conv ${conversationId} as read`);
            } catch (err) {
                console.error("[Socket.IO] Error marking read:", err);
            }
        });

        /**
         * DISCONNECT
         */
        socket.on("disconnect", () => {
            console.log(`[Socket.IO] User disconnected: ${userId} (socket: ${socket.id})`);

            // Remove socket from tracking
            if (onlineUsers.has(userId)) {
                onlineUsers.get(userId).delete(socket.id);
                if (onlineUsers.get(userId).size === 0) {
                    onlineUsers.delete(userId);
                    // Broadcast offline status
                    io.emit("chat:userStatus", { userId, online: false });
                }
            }
        });
    });

    console.log("[Socket.IO] Chat server initialized");
    return io;
}

module.exports = { initSocketIO };

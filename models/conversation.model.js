const mongoose = require("mongoose");

/**
 * Conversation Model
 * Represents a chat conversation between two or more users.
 * Multi-tenant: stored in tenant DB (saas_app_rb_XXXX).
 * 
 * Types:
 *  - "direct" : 1-on-1 conversation between two users
 *  - "group"  : group conversation with multiple participants
 */
const ConversationSchema = new mongoose.Schema({
    // Type of conversation
    type: {
        type: String,
        enum: ["direct", "group"],
        default: "direct",
    },

    // Group name (only for group conversations)
    name: { type: String, default: "" },

    // Group avatar/icon (only for group)
    avatar: { type: String, default: "" },

    // Participants in this conversation
    // Uses global user IDs (from central User collection)
    participants: [
        {
            userId: { type: String, required: true },       // Global user _id
            name: { type: String, default: "" },             // Cached display name
            email: { type: String, default: "" },            // Cached email
            avatar: { type: String, default: "" },           // Cached avatar path
            role: { type: String, enum: ["admin", "member"], default: "member" },
            joinedAt: { type: Date, default: Date.now },
            lastReadAt: { type: Date, default: null },       // Last time user read this convo
            unreadCount: { type: Number, default: 0 },       // Unread messages count
        },
    ],

    // Last message preview (denormalized for list display)
    lastMessage: {
        text: { type: String, default: "" },
        senderId: { type: String, default: "" },
        senderName: { type: String, default: "" },
        sentAt: { type: Date, default: null },
        type: { type: String, default: "text" },           // text, image, file, system
    },

    // Is the conversation archived
    archived: { type: Boolean, default: false },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Index for fast lookup by participant
ConversationSchema.index({ "participants.userId": 1 });
// Index for sorting by latest message
ConversationSchema.index({ "lastMessage.sentAt": -1 });

const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;

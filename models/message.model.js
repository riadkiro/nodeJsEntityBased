const mongoose = require("mongoose");

/**
 * Message Model
 * Represents a single message in a conversation.
 * Multi-tenant: stored in tenant DB (saas_app_rb_XXXX).
 * 
 * Types:
 *  - "text"   : plain text message
 *  - "image"  : image attachment
 *  - "file"   : file attachment (PDF, docs, etc.)
 *  - "system" : system notification (user joined, left, etc.)
 */
const MessageSchema = new mongoose.Schema({
    // Reference to the parent conversation
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true,
    },

    // Sender info
    senderId: { type: String, required: true },        // Global user _id
    senderName: { type: String, default: "" },          // Cached display name
    senderAvatar: { type: String, default: "" },        // Cached avatar path

    // Message content
    type: {
        type: String,
        enum: ["text", "image", "file", "system"],
        default: "text",
    },
    text: { type: String, default: "" },                // Text content

    // File/Image attachment
    attachment: {
        filename: { type: String },                        // Original filename
        url: { type: String },                             // Path to uploaded file
        mimetype: { type: String },                        // MIME type
        size: { type: Number },                            // File size in bytes
    },

    // Read by which participants
    readBy: [
        {
            userId: { type: String },
            readAt: { type: Date, default: Date.now },
        },
    ],

    // Edit/delete tracking
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    deleted: { type: Boolean, default: false },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
});

// Compound index for fetching messages of a conversation sorted by date
MessageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;

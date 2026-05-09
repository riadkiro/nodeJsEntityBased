const mongoose = require("mongoose");

/**
 * Record Note Model
 * Rich-text notes scoped to a specific record.
 * Multi-tenant: stored in tenant DB (saas_app_rb_XXXX).
 */
const RecordNoteSchema = new mongoose.Schema({
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', default: null },

    title: { type: String, default: 'Sans titre' },
    content: { type: String, default: '' },           // HTML content from rich editor
    color: { type: String, default: '#8b5cf6' },      // Note accent color
    icon: { type: String, default: 'solar:notebook-bold-duotone' },

    createdBy: { type: String, default: '' },          // userId
    createdByName: { type: String, default: '' },

    pinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },

    // PIN protection
    pinHash: { type: String, default: null },        // bcrypt hash of 4-6 digit PIN
    isProtected: { type: Boolean, default: false },  // quick flag for UI

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

RecordNoteSchema.index({ recordId: 1, updatedAt: -1 });
RecordNoteSchema.index({ recordId: 1, pinned: -1, updatedAt: -1 });

const RecordNote = mongoose.model("RecordNote", RecordNoteSchema);
module.exports = RecordNote;

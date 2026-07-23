const mongoose = require('mongoose');

/**
 * TaskComment — Comments & activity log entries for per-record tasks
 * 
 * Two types:
 *  - "comment"  : User-written comment on a task
 *  - "activity" : Auto-logged system event (status change, priority change, etc.)
 */
const TaskCommentSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecordTask', required: true, index: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true, index: true },

    // Type of entry
    type: { type: String, enum: ['comment', 'activity'], default: 'comment' },

    // Content
    text: { type: String, default: '' },
    attachments: [{
        filename: { type: String, required: true },
        originalName: { type: String, default: '' },
        mimeType: { type: String, default: '' },
        size: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    // Author
    userId: { type: String, default: '' },
    userName: { type: String, default: '' },
    userAvatar: { type: String, default: '' },
    authorType: {
        type: String,
        enum: ['user', 'ai', 'system'],
        default: function () {
            return this.type === 'activity' ? 'system' : 'user';
        }
    },
    audience: {
        type: String,
        enum: ['team', 'ai'],
        default: 'team'
    },

    // Activity metadata (for type=activity)
    metadata: {
        field: { type: String, default: '' },       // e.g. 'status', 'priority'
        oldValue: { type: String, default: '' },
        newValue: { type: String, default: '' },
    },

    // Summary of the linked Record AI Agent run.
    agent: {
        status: {
            type: String,
            enum: ['', 'completed', 'error'],
            default: ''
        },
        action: {
            type: String,
            enum: ['', 'none', 'create_subtasks'],
            default: ''
        },
        createdSubtasks: [{
            title: { type: String, default: '' },
            subtaskId: { type: String, default: '' }
        }],
        model: { type: String, default: '' },
        errorCode: { type: String, default: '' },
        recordAgentConversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RecordAgentConversation',
            default: null
        },
        recordAgentRunId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RecordAgentRun',
            default: null
        }
    },

    // Chat integration
    publishedToChat: { type: Boolean, default: false },
}, { timestamps: true });

TaskCommentSchema.index({ taskId: 1, createdAt: 1 });

module.exports = mongoose.model('TaskComment', TaskCommentSchema);

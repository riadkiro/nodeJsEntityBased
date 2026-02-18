const mongoose = require("mongoose");

const ClassificationOptionSchema = new mongoose.Schema({
    label: { type: String, required: true },
    color: { type: String, default: "#3b82f6" },
    icon: { type: String, default: "solar:info-circle-bold" },
    badgeStyle: { type: String, default: "dot" }, // dot, pill, outline
    type: { type: String, default: "normal" }, // start, active, completed (for status logical flow)
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    order: { type: Number, default: 0 }
});

const ClassificationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        key: { type: String, required: true, unique: true }, // ex: "project_status", "client_type"
        description: String,
        isShared: { type: Boolean, default: true },
        type: { type: String, enum: ['simple', 'hierarchical'], default: 'simple' },
        allowMultiple: { type: Boolean, default: false },
        // Entity scope: empty = global (visible to all entities), populated = only visible to listed entities
        entities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entity" }],
        options: [ClassificationOptionSchema],
        defaultOptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Classification", ClassificationSchema);

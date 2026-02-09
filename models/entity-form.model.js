const mongoose = require("mongoose");

const EntityFormSchema = new mongoose.Schema(
    {
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Entity",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            default: "Formulaire par défaut"
        },
        description: String,
        icon: {
            type: String,
            default: "solar:document-text-bold-duotone"
        },
        color: String,
        layout: {
            type: mongoose.Schema.Types.Mixed,
            default: { version: 1, rows: [] }
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Ensure only one default form per entity
EntityFormSchema.pre("save", async function (next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { entityId: this.entityId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

module.exports = mongoose.model("EntityForm", EntityFormSchema);

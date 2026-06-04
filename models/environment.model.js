const mongoose = require('mongoose');

// Logical name after sidebar refactor: Space (rail item).
// Collection/model name stays Environment for backward compatibility.
const EnvironmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    icon: { type: String, default: 'solar:planet-3-bold-duotone' },
    color: { type: String, default: '#6366f1' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Environment', EnvironmentSchema);

const mongoose = require('mongoose');

// Define Schema inline to avoid middleware issues in this standalone script
const SpaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, required: true }, // Dummy ID
}, { timestamps: true });

async function seedData() {
    try {
        // Connect to the correct Tenant DB
        await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_5001');
        console.log("Connected to Tenant DB: saas_app_rb_5001");

        // Create Model on this connection
        const Space = mongoose.model('Space', SpaceSchema);

        // Check if exists
        const count = await Space.countDocuments({});
        if (count === 0) {
            console.log("Seeding 'General' Space...");
            await Space.create({
                name: "General",
                slug: "general",
                description: "Default space",
                owner: new mongoose.Types.ObjectId(), // Random dummy ID
                menu_order: 1
            });
            console.log("Seeded successfully.");
        } else {
            console.log("Spaces already exist.");
        }

    } catch (error) {
        console.error("Seed error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seedData();

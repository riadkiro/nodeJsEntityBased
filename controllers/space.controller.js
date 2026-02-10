const tenantCollection = require("../middleware/tenant").tenantCollection;
const mongoose = require("mongoose");

// Generate a unique slug for a given model
async function uniqueSlug(Model, name) {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await Model.findOne({ slug: base });
    if (!existing) return base;
    let counter = 2;
    while (await Model.findOne({ slug: `${base}-${counter}` })) {
        counter++;
    }
    return `${base}-${counter}`;
}

module.exports = {
    list: async (req, res) => {
        try {
            const Space = await tenantCollection(req, "Space");
            const spaces = await Space.find({});
            res.render("space/space-list", {
                spaces,
                account_number: req.account_number,
                layout: "layout-app",
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    addForm: async (req, res) => {
        res.render("space/space-add", {
            account_number: req.account_number,
            layout: "layout-app",
        });
    },

    save: async (req, res) => {
        try {
            const Space = await tenantCollection(req, "Space");
            const { name, description, color } = req.body;
            console.log("Saving new Space:", req.body);

            // Auto-generate unique slug
            const slug = await uniqueSlug(Space, name);
            const owner = new mongoose.Types.ObjectId(); // Placeholder owner

            const spaceData = {
                name,
                slug,
                description,
                owner,
                settings: { theme: color } // Map color to settings or add color field to schema if needed
            };

            if (req.file) {
                spaceData.icon = `/uploads/${req.account_number}/${req.file.filename}`;
            }

            const newSpace = new Space(spaceData);
            await newSpace.save();
            res.redirect(`/account/${req.account_number}/dashboard/`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    editForm: async (req, res) => {
        try {
            const Space = await tenantCollection(req, "Space");
            const space = await Space.findById(req.params.id);
            if (!space) return res.status(404).send("Space not found");

            res.render("space/space-edit", {
                space,
                account_number: req.account_number,
                layout: "layout-app",
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    update: async (req, res) => {
        try {
            const Space = await tenantCollection(req, "Space");
            const spaceData = req.body;

            if (req.file) {
                spaceData.icon = `/uploads/${req.account_number}/${req.file.filename}`;
            }

            await Space.findByIdAndUpdate(req.params.id, spaceData);
            res.redirect(`/account/${req.account_number}/space/list`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    delete: async (req, res) => {
        try {
            const Space = await tenantCollection(req, "Space");
            await Space.findByIdAndDelete(req.params.id);
            res.redirect(`/account/${req.account_number}/space/list`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
};

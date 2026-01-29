/**
 * Database Controller
 * Manages "Base de données" (database-type folders) and collections (entities)
 */

const tenantCollection = require("../middleware/tenant").tenantCollection;

// Simple slugify function
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with dash
        .replace(/^-+|-+$/g, '')         // Trim dashes
        .substring(0, 100);              // Limit length
}

module.exports = {
    /**
     * Render database list page
     * GET /account/:account_id/db/list
     */
    list: async (req, res) => {
        try {
            res.render("db/db-list", {
                layout: "layout-app",
                pageTitle: "Base de données",
                account_number: req.account_number
            });
        } catch (error) {
            console.error("Error loading database list:", error);
            res.status(500).render("error", {
                message: "Erreur lors du chargement des bases de données",
                error: error
            });
        }
    },

    /**
     * Get database tree structure
     * GET /account/:account_id/db/api/tree
     */
    getDatabaseTree: async (req, res) => {
        try {
            const FolderModel = await tenantCollection(req, "Folder");
            const EntityModel = await tenantCollection(req, "Entity");

            // Get all database folders
            const databases = await FolderModel.find({ type: "database" }).sort({ order: 1, name: 1 }).lean();

            // Get all entities
            const entities = await EntityModel.find({}).sort({ order: 1, name: 1 }).lean();

            // Get database folder IDs
            const databaseIds = databases.map(db => db._id.toString());

            // Separate entities: those in databases vs Global
            const globalCollections = [];
            const databaseCollections = {};

            // Initialize database collections
            databases.forEach(db => {
                databaseCollections[db._id.toString()] = [];
            });

            entities.forEach(entity => {
                // Check if entity belongs to any database folder
                const entityFolders = (entity.folders || []).map(f => f.toString());
                const parentDatabase = entityFolders.find(fId => databaseIds.includes(fId));

                if (parentDatabase) {
                    databaseCollections[parentDatabase].push({
                        id: entity._id.toString(),
                        name: entity.name,
                        slug: entity.slug,
                        icon: entity.icon || "solar:database-broken",
                        color: entity.color
                    });
                } else {
                    globalCollections.push({
                        id: entity._id.toString(),
                        name: entity.name,
                        slug: entity.slug,
                        icon: entity.icon || "solar:database-broken",
                        color: entity.color
                    });
                }
            });

            // Build tree structure
            const tree = {
                global: {
                    id: "global",
                    name: "Global",
                    icon: "solar:globe-bold-duotone",
                    isDefault: true,
                    collections: globalCollections
                },
                databases: databases.map(db => ({
                    id: db._id.toString(),
                    name: db.name,
                    icon: db.icon || "solar:server-2-broken",
                    color: db.color,
                    collections: databaseCollections[db._id.toString()] || []
                }))
            };

            res.json({ success: true, tree });
        } catch (error) {
            console.error("Error fetching database tree:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Move collection to a database
     * POST /account/:account_id/db/api/move-collection
     * Body: { collectionId, targetDatabaseId } - targetDatabaseId can be "global" or database ID
     */
    moveCollection: async (req, res) => {
        try {
            const { collectionId, targetDatabaseId } = req.body;
            const FolderModel = await tenantCollection(req, "Folder");
            const EntityModel = await tenantCollection(req, "Entity");

            // Get all database folder IDs
            const databases = await FolderModel.find({ type: "database" }).lean();
            const databaseIds = databases.map(db => db._id.toString());

            // Get the entity
            const entity = await EntityModel.findById(collectionId);
            if (!entity) {
                return res.status(404).json({ success: false, message: "Collection not found" });
            }

            // Remove entity from all database folders
            entity.folders = (entity.folders || []).filter(
                fId => !databaseIds.includes(fId.toString())
            );

            // If not moving to global, add to target database
            if (targetDatabaseId !== "global") {
                const targetDb = await FolderModel.findById(targetDatabaseId);
                if (!targetDb || targetDb.type !== "database") {
                    return res.status(404).json({ success: false, message: "Target database not found" });
                }
                entity.folders.push(targetDb._id);
            }

            await entity.save();

            res.json({ success: true, message: "Collection moved successfully" });
        } catch (error) {
            console.error("Error moving collection:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Create new database
     * POST /account/:account_id/db/api/create
     */
    createDatabase: async (req, res) => {
        try {
            const { name, icon, color } = req.body;
            const FolderModel = await tenantCollection(req, "Folder");

            const slug = slugify(name);

            // Check if slug exists
            const existing = await FolderModel.findOne({ slug, type: "database" });
            if (existing) {
                return res.status(400).json({ success: false, message: "Une base de données avec ce nom existe déjà" });
            }

            const database = await FolderModel.create({
                name,
                slug,
                type: "database",
                icon: icon || "solar:server-2-broken",
                color: color || null,
                createdBy: req.session?.user?._id
            });

            res.json({
                success: true,
                database: {
                    id: database._id.toString(),
                    name: database.name,
                    icon: database.icon,
                    color: database.color,
                    collections: []
                }
            });
        } catch (error) {
            console.error("Error creating database:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Update database
     * PUT /account/:account_id/db/api/:id
     */
    updateDatabase: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, icon, color } = req.body;
            const FolderModel = await tenantCollection(req, "Folder");

            const database = await FolderModel.findOne({ _id: id, type: "database" });
            if (!database) {
                return res.status(404).json({ success: false, message: "Database not found" });
            }

            if (name) {
                database.name = name;
                database.slug = slugify(name);
            }
            if (icon !== undefined) database.icon = icon;
            if (color !== undefined) database.color = color;

            await database.save();

            res.json({ success: true, database });
        } catch (error) {
            console.error("Error updating database:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Delete database (moves collections to Global)
     * DELETE /account/:account_id/db/api/:id
     */
    deleteDatabase: async (req, res) => {
        try {
            const { id } = req.params;
            const FolderModel = await tenantCollection(req, "Folder");
            const EntityModel = await tenantCollection(req, "Entity");

            const database = await FolderModel.findOne({ _id: id, type: "database" });
            if (!database) {
                return res.status(404).json({ success: false, message: "Database not found" });
            }

            // Remove this folder from all entities (they go back to Global)
            await EntityModel.updateMany(
                { folders: database._id },
                { $pull: { folders: database._id } }
            );

            await FolderModel.deleteOne({ _id: id });

            res.json({ success: true, message: "Database deleted" });
        } catch (error) {
            console.error("Error deleting database:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

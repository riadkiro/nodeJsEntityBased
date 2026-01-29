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
            const RecordModel = await tenantCollection(req, "Record");

            // Get all database folders
            const databases = await FolderModel.find({ type: "database" }).sort({ order: 1, name: 1 }).lean();

            // Get all entities
            const entities = await EntityModel.find({}).sort({ order: 1, name: 1 }).lean();

            // Get record counts per entity
            const recordCounts = await RecordModel.aggregate([
                { $group: { _id: "$entityId", count: { $sum: 1 } } }
            ]);
            const countMap = {};
            recordCounts.forEach(r => {
                if (r._id) {
                    countMap[r._id.toString()] = r.count;
                }
            });

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
                const entityId = entity._id.toString();
                const collectionData = {
                    id: entityId,
                    name: entity.name,
                    slug: entity.slug,
                    icon: entity.icon || "solar:database-broken",
                    color: entity.color,
                    recordCount: countMap[entityId] || 0
                };

                // Check if entity belongs to any database folder
                const entityFolders = (entity.folders || []).map(f => f.toString());
                const parentDatabase = entityFolders.find(fId => databaseIds.includes(fId));

                if (parentDatabase) {
                    databaseCollections[parentDatabase].push(collectionData);
                } else {
                    globalCollections.push(collectionData);
                }
            });

            // Get user preferences for database order
            const User = require("../models/user.model");
            const userId = req.session?.user?._id;
            let databaseOrder = [];
            let collectionOrder = {};
            if (userId) {
                const user = await User.findById(userId).lean();
                databaseOrder = user?.preferences?.databaseOrder || [];
                collectionOrder = user?.preferences?.collectionOrder || {};
            }

            // Helper function to sort collections by saved order
            function sortCollections(collections, order) {
                if (!order || order.length === 0) return collections;
                return collections.sort((a, b) => {
                    const indexA = order.indexOf(a.id);
                    const indexB = order.indexOf(b.id);
                    if (indexA === -1 && indexB === -1) return 0;
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
            }

            // Sort global collections
            sortCollections(globalCollections, collectionOrder['global']);

            // Build databases list with sorted collections
            let databasesList = databases.map(db => {
                const dbId = db._id.toString();
                const collections = databaseCollections[dbId] || [];
                sortCollections(collections, collectionOrder[dbId]);
                return {
                    id: dbId,
                    name: db.name,
                    icon: db.icon || "solar:server-2-broken",
                    color: db.color,
                    collections
                };
            });

            // Sort databases by user preference order
            if (databaseOrder.length > 0) {
                databasesList.sort((a, b) => {
                    const indexA = databaseOrder.indexOf(a.id);
                    const indexB = databaseOrder.indexOf(b.id);
                    // Items not in order list go to the end
                    if (indexA === -1 && indexB === -1) return 0;
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
            }

            // Build tree structure
            const tree = {
                global: {
                    id: "global",
                    name: "Global",
                    icon: "solar:globe-bold-duotone",
                    isDefault: true,
                    collections: globalCollections
                },
                databases: databasesList
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
            const { name, slug: providedSlug, description, icon, color } = req.body;
            const FolderModel = await tenantCollection(req, "Folder");

            const slug = providedSlug || slugify(name);

            // Check if slug exists
            const existing = await FolderModel.findOne({ slug, type: "database" });
            if (existing) {
                return res.status(400).json({ success: false, message: "Une base de données avec ce nom existe déjà" });
            }

            const database = await FolderModel.create({
                name,
                slug,
                description,
                type: "database",
                icon: icon || "solar:database-broken",
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
    },

    /**
     * Reorder databases (save order in user preferences)
     * POST /account/:account_id/db/api/reorder
     * Body: { databaseIds: ["id1", "id2", ...] }
     */
    reorderDatabases: async (req, res) => {
        try {
            const { databaseIds } = req.body;
            const User = require("../models/user.model");

            // Get current user from session
            const userId = req.session?.user?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            // Update user preferences with database order
            await User.findByIdAndUpdate(userId, {
                $set: { "preferences.databaseOrder": databaseIds }
            });

            res.json({ success: true });
        } catch (error) {
            console.error("Error reordering databases:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Create a new collection (Entity) in a specific database
     * POST /account/:account_id/db/api/:dbId/collections/create
     * Body: { name, slug, description, icon, color, standardFields }
     */
    createCollection: async (req, res) => {
        try {
            const EntityModel = await tenantCollection(req, "Entity");
            const { dbId } = req.params;
            const { name, slug: providedSlug, description, icon, color, standardFields } = req.body;

            if (!name) {
                return res.status(400).json({ success: false, error: "Name is required" });
            }

            // Generate slug from name if not provided
            const slug = providedSlug || name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_|_$/g, '');

            // Check for duplicate slug
            const existing = await EntityModel.findOne({ slug });
            if (existing) {
                return res.status(400).json({ success: false, error: "A collection with this slug already exists" });
            }

            // Convert standardFields object to enabledStandardFields array
            const enabledStandardFields = [];
            if (standardFields) {
                if (standardFields.title) enabledStandardFields.push('title');
                if (standardFields.slug) enabledStandardFields.push('slug');
                if (standardFields.date) enabledStandardFields.push('date');
            }

            // Create Entity document
            // If dbId is 'global', don't add any folder (global collections have empty folders array)
            const folders = (dbId && dbId !== 'global') ? [dbId] : [];

            const entity = new EntityModel({
                name,
                slug,
                description: description || '',
                icon: icon || 'solar:inbox-line-broken',
                color: color || '',
                enabledStandardFields,
                folders // Link to the database (empty for global)
            });

            await entity.save();

            console.log("[DB] Collection created:", entity._id, entity.name);

            res.json({
                success: true,
                collection: {
                    id: entity._id.toString(),
                    name: entity.name,
                    slug: entity.slug,
                    icon: entity.icon,
                    color: entity.color,
                    recordCount: 0
                }
            });
        } catch (error) {
            console.error("Error creating collection:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Reorder collections within a database
     * POST /account/:account_id/db/api/:dbId/collections/reorder
     * Body: { collectionIds: ["id1", "id2", ...] }
     */
    reorderCollections: async (req, res) => {
        try {
            const EntityModel = await tenantCollection(req, "Entity");
            const { collectionIds } = req.body;

            // Update order field for each collection
            const updates = collectionIds.map((id, index) =>
                EntityModel.updateOne({ _id: id }, { $set: { order: index } })
            );
            await Promise.all(updates);

            res.json({ success: true });
        } catch (error) {
            console.error("Error reordering collections:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

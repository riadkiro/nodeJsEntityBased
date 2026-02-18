const tenantCollection = require("../middleware/tenant").tenantCollection;
const fs = require('fs');
const path = require('path');

// Cache for loaded icon libraries
const iconLibrariesCache = {};

// Generate a unique slug for a given model
async function uniqueSlug(Model, name) {
    const base = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const existing = await Model.findOne({ slug: base });
    if (!existing) return base;
    let counter = 2;
    while (await Model.findOne({ slug: `${base}-${counter}` })) {
        counter++;
    }
    return `${base}-${counter}`;
}

module.exports = {
    getIconLibraries: async (req, res) => {
        try {
            const dataDir = path.join(__dirname, '../public/data');
            if (!fs.existsSync(dataDir)) return res.json({ libraries: [] });

            const files = fs.readdirSync(dataDir);
            const libraries = files
                .filter(file => file.endsWith('-icons.json'))
                .map(file => {
                    const name = file.replace('-icons.json', '');
                    // Capitalize first letter for display
                    return {
                        id: name,
                        name: name.charAt(0).toUpperCase() + name.slice(1)
                    };
                });

            res.json({ success: true, libraries });
        } catch (e) {
            console.error("[Hierarchy] getIconLibraries Error:", e);
            res.status(500).json({ error: "Failed to list libraries" });
        }
    },

    getIcons: async (req, res) => {
        try {
            const { search, page = 1, limit = 60, library = 'solar' } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            // Security check for library name (prevent directory traversal)
            const sanitizedLibrary = library.replace(/[^a-zA-Z0-9-]/g, '');

            // Check cache
            if (!iconLibrariesCache[sanitizedLibrary]) {
                const filePath = path.join(__dirname, `../public/data/${sanitizedLibrary}-icons.json`);
                if (fs.existsSync(filePath)) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        iconLibrariesCache[sanitizedLibrary] = JSON.parse(content);
                        console.log(`[Hierarchy] Loaded ${sanitizedLibrary} icons into memory cache.`);
                    } catch (e) {
                        console.error(`[Hierarchy] Failed to load ${sanitizedLibrary} icons:`, e);
                        return res.status(404).json({ error: "Library not found or invalid" });
                    }
                } else {
                    return res.status(404).json({ error: "Library not found" });
                }
            }

            const allIcons = iconLibrariesCache[sanitizedLibrary] || [];

            // Filter
            let filteredIcons = allIcons;
            if (search) {
                const searchLower = search.toLowerCase();
                filteredIcons = allIcons.filter(icon => icon.toLowerCase().includes(searchLower));
            }

            // Pagination
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedIcons = filteredIcons.slice(startIndex, endIndex);

            res.json({
                success: true,
                icons: paginatedIcons,
                total: filteredIcons.length,
                page: pageNum,
                hasMore: endIndex < filteredIcons.length
            });

        } catch (e) {
            console.error("[Hierarchy] getIcons Error:", e);
            res.status(500).json({ error: "Internal Error" });
        }
    },
    // ═══════════════════════════════════════════
    // ENVIRONMENTS
    // ═══════════════════════════════════════════
    listEnvironments: async (req, res) => {
        try {
            const EnvironmentModel = await tenantCollection(req, "Environment");
            const envs = await EnvironmentModel.find({}).sort({ order: 1 }).lean();

            // If no environments exist, create a default one
            if (envs.length === 0) {
                const SpaceModel = await tenantCollection(req, "Space");
                const defaultEnv = new EnvironmentModel({
                    name: 'Mon espace',
                    slug: 'mon-espace',
                    icon: 'solar:planet-3-bold-duotone',
                    color: '#6366f1',
                    order: 0,
                    isDefault: true,
                    createdBy: req.user._id
                });
                await defaultEnv.save();

                // Assign all existing spaces to this default environment
                await SpaceModel.updateMany(
                    { environmentId: { $exists: false } },
                    { $set: { environmentId: defaultEnv._id } }
                );
                await SpaceModel.updateMany(
                    { environmentId: null },
                    { $set: { environmentId: defaultEnv._id } }
                );

                return res.json({
                    success: true,
                    environments: [{
                        id: defaultEnv._id.toString(),
                        name: defaultEnv.name,
                        slug: defaultEnv.slug,
                        icon: defaultEnv.icon,
                        color: defaultEnv.color,
                        order: defaultEnv.order,
                        isDefault: true
                    }]
                });
            }

            res.json({
                success: true,
                environments: envs.map(e => ({
                    id: e._id.toString(),
                    name: e.name,
                    slug: e.slug,
                    icon: e.icon,
                    color: e.color,
                    order: e.order,
                    isDefault: e.isDefault || false
                }))
            });
        } catch (error) {
            console.error("[Hierarchy] listEnvironments Error:", error);
            res.status(500).json({ error: "Internal error" });
        }
    },

    createEnvironment: async (req, res) => {
        try {
            const EnvironmentModel = await tenantCollection(req, "Environment");
            const { name, icon, color } = req.body;
            const count = await EnvironmentModel.countDocuments();
            const slug = await uniqueSlug(EnvironmentModel, name);
            const newEnv = new EnvironmentModel({
                name,
                slug,
                icon: icon || 'solar:planet-3-bold-duotone',
                color: color || '#6366f1',
                order: count,
                createdBy: req.user._id
            });
            await newEnv.save();
            res.json({
                success: true,
                environment: {
                    id: newEnv._id.toString(),
                    name: newEnv.name,
                    slug: newEnv.slug,
                    icon: newEnv.icon,
                    color: newEnv.color,
                    order: newEnv.order
                }
            });
        } catch (error) {
            console.error("[Hierarchy] createEnvironment Error:", error);
            res.status(500).json({ error: "Failed to create environment" });
        }
    },

    updateEnvironment: async (req, res) => {
        try {
            const EnvironmentModel = await tenantCollection(req, "Environment");
            const { id, name, icon, color } = req.body;
            const update = {};
            if (name !== undefined) update.name = name;
            if (icon !== undefined) update.icon = icon;
            if (color !== undefined) update.color = color;
            await EnvironmentModel.findByIdAndUpdate(id, update);
            res.json({ success: true });
        } catch (error) {
            console.error("[Hierarchy] updateEnvironment Error:", error);
            res.status(500).json({ error: "Failed to update environment" });
        }
    },

    deleteEnvironment: async (req, res) => {
        try {
            const EnvironmentModel = await tenantCollection(req, "Environment");
            const SpaceModel = await tenantCollection(req, "Space");
            const { id } = req.body;
            // Don't delete if it's the last environment
            const count = await EnvironmentModel.countDocuments();
            if (count <= 1) {
                return res.status(400).json({ error: "Cannot delete the last environment" });
            }
            // Find the first remaining environment to reassign orphaned spaces
            const remainingEnv = await EnvironmentModel.findOne({ _id: { $ne: id } }).sort({ order: 1 }).lean();
            if (remainingEnv) {
                // Reassign spaces from the deleted env to the first remaining env
                await SpaceModel.updateMany(
                    { environmentId: id },
                    { $set: { environmentId: remainingEnv._id } }
                );
            }
            await EnvironmentModel.findByIdAndDelete(id);
            res.json({ success: true, reassignedTo: remainingEnv ? remainingEnv._id.toString() : null });
        } catch (error) {
            console.error("[Hierarchy] deleteEnvironment Error:", error);
            res.status(500).json({ error: "Failed to delete environment" });
        }
    },

    reorderEnvironments: async (req, res) => {
        try {
            const EnvironmentModel = await tenantCollection(req, "Environment");
            const { items } = req.body; // [{ id, order }]
            if (!Array.isArray(items)) return res.status(400).json({ error: "Invalid format" });
            await Promise.all(items.map(item =>
                EnvironmentModel.findByIdAndUpdate(item.id, { order: item.order })
            ));
            res.json({ success: true });
        } catch (error) {
            console.error("[Hierarchy] reorderEnvironments Error:", error);
            res.status(500).json({ error: "Reorder failed" });
        }
    },

    // ═══════════════════════════════════════════
    // HIERARCHY (scoped to environment)
    // ═══════════════════════════════════════════
    getHierarchy: async (req, res) => {
        try {
            const SpaceModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const EntityModel = await tenantCollection(req, "Entity");
            const ViewModel = await tenantCollection(req, "View");

            if (!SpaceModel || !FolderModel || !EntityModel || !ViewModel) {
                return res.status(500).json({ error: "Models not ready" });
            }

            // Optional: filter by environmentId
            const envId = req.query.environmentId;
            const spaceQuery = envId ? { environmentId: envId } : {};

            const [rawSpaces, rawFolders, rawEntities, rawViews] = await Promise.all([
                SpaceModel.find(spaceQuery).sort({ order: 1 }).lean(),
                FolderModel.find({}).sort({ order: 1 }).lean(),
                EntityModel.find({}).sort({ order: 1 }).lean(),
                ViewModel.find({}).sort({ order: 1 }).lean()
            ]);

            const spaces = rawSpaces.map(s => ({ ...s, id: s._id.toString() }));
            const folders = rawFolders.map(f => ({
                ...f,
                id: f._id.toString(),
                spaces: (f.spaces || []).map(id => id.toString()),
                parentFolders: (f.parentFolders || []).map(id => id.toString())
            }));
            const entities = rawEntities.map(e => ({ ...e, id: e._id.toString() }));
            const views = rawViews.map(v => ({
                ...v,
                id: v._id.toString(),
                spaces: (v.spaces || []).map(id => id.toString()),
                folders: (v.folders || []).map(id => id.toString())
            }));

            const buildTree = (parentId, parentType) => {
                const results = [];

                // Folders
                folders.forEach(f => {
                    let isChild = false;
                    if (parentType === 'space' && f.spaces.includes(parentId) && f.parentFolders.length === 0) isChild = true;
                    else if ((parentType === 'folder' || parentType === 'environment') && f.parentFolders.includes(parentId)) isChild = true;

                    if (isChild) {
                        const itemType = f.type || 'folder';
                        results.push({
                            type: itemType,
                            id: f.id,
                            name: f.name,
                            icon: f.icon || (itemType === 'environment' ? 'solar:layers-minimalistic-line-duotone' : 'solar:folder-2-line-duotone'),
                            color: f.color,
                            order: f.order,
                            children: buildTree(f.id, itemType),
                            link: '#'
                        });
                    }
                });

                // Views (New "View" approach)
                views.forEach(v => {
                    let isChild = false;
                    if (parentType === 'space' && v.spaces.includes(parentId) && v.folders.length === 0) isChild = true;
                    else if ((parentType === 'folder' || parentType === 'environment') && v.folders.includes(parentId)) isChild = true;

                    if (isChild) {
                        // Cockpit view
                        if (v.viewType === 'cockpit') {
                            results.push({
                                type: 'cockpit',
                                id: v.id,
                                name: v.name,
                                icon: v.icon || 'solar:monitor-smartphone-bold-duotone',
                                color: v.color,
                                order: v.order,
                                link: `/account/${req.account_number}/cockpit/${v.cockpitId}`,
                                cockpitId: v.cockpitId,
                                viewType: 'cockpit'
                            });
                        } else {
                            // Regular entity view
                            const entity = entities.find(e => e.id === v.entity.toString());
                            const entitySlug = entity ? entity.slug : v.slug;
                            results.push({
                                type: 'entity',
                                id: v.id,
                                name: v.name,
                                icon: v.icon || (entity ? entity.icon : 'solar:database-bold'),
                                color: v.color,
                                order: v.order,
                                link: `/account/${req.account_number}/record/${entitySlug}/list`,
                                entityId: v.entity,
                                entitySlug: entitySlug,
                                viewType: v.viewType || 'list',
                                filters: v.filters || []
                            });
                        }
                    }
                });

                // Sort children by order
                return results.sort((a, b) => (a.order || 0) - (b.order || 0));
            };

            const hierarchy = spaces.map(s => ({
                type: 'space',
                id: s.id,
                name: s.name,
                icon: s.icon,
                color: s.color,
                order: s.order,
                children: buildTree(s.id, 'space'),
                link: '#'
            })).sort((a, b) => (a.order || 0) - (b.order || 0));

            res.json({
                success: true,
                dbName: SpaceModel.db.name,
                account: req.account_number,
                realSpacesCount: spaces.length,
                hierarchy
            });

        } catch (error) {
            console.error("[Hierarchy] Build Error:", error);
            res.status(500).json({ error: "Internal error" });
        }
    },

    reorder: async (req, res) => {
        try {
            const { items } = req.body; // Expects [{ id, type, order }]
            if (!Array.isArray(items)) return res.status(400).json({ error: "Invalid format" });

            const SpaceModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const ViewModel = await tenantCollection(req, "View");
            const EntityModel = await tenantCollection(req, "Entity");

            const ops = items.map(async (item) => {
                let Model;
                if (item.type === 'space') Model = SpaceModel;
                else if (['folder', 'environment'].includes(item.type)) Model = FolderModel;
                else if (item.type === 'entity' || item.type === 'cockpit') Model = ViewModel;

                if (Model) {
                    await Model.findByIdAndUpdate(item.id, { order: item.order });
                }
            });

            await Promise.all(ops);
            res.json({ success: true });
        } catch (error) {
            console.error("[Hierarchy] Reorder Error:", error);
            res.status(500).json({ error: "Reorder failed" });
        }
    },

    move: async (req, res) => {
        try {
            const { itemId, itemType, newParentId, newParentType, oldParentId } = req.body;
            const SpaceModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const ViewModel = await tenantCollection(req, "View");
            const EntityModel = await tenantCollection(req, "Entity");

            if (itemType === 'entity' || itemType === 'cockpit') {
                // Determine if we are moving a View or a Legacy Entity
                let targetModel = ViewModel;
                let item = await ViewModel.findById(itemId);

                if (!item) {
                    // It's a legacy entity - convert to View on move or just update entity
                    targetModel = EntityModel;
                }

                if (oldParentId) {
                    await targetModel.updateOne({ _id: itemId }, { $pull: { folders: oldParentId, spaces: oldParentId } });
                }
                if (newParentId) {
                    const update = newParentType === 'folder' ? { $addToSet: { folders: newParentId } } : { $addToSet: { spaces: newParentId } };
                    await targetModel.updateOne({ _id: itemId }, update);
                }
            } else if (itemType === 'folder' || itemType === 'environment') {
                if (oldParentId) {
                    await FolderModel.updateOne({ _id: itemId }, { $pull: { parentFolders: oldParentId, spaces: oldParentId } });
                }
                if (newParentId) {
                    const update = (newParentType === 'folder' || newParentType === 'environment') ? { $addToSet: { parentFolders: newParentId } } : { $addToSet: { spaces: newParentId } };
                    await FolderModel.updateOne({ _id: itemId }, update);
                }
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Move failed" });
        }
    },

    createSpace: async (req, res) => {
        const SpaceModel = await tenantCollection(req, "Space");
        const { name, color, icon, environmentId } = req.body;
        // Default order to end
        const count = await SpaceModel.countDocuments();
        const spaceData = {
            name,
            slug: await uniqueSlug(SpaceModel, name),
            owner: req.user._id,
            color,
            icon,
            order: count
        };
        if (environmentId) spaceData.environmentId = environmentId;
        const newSpace = new SpaceModel(spaceData);
        await newSpace.save();
        res.json(newSpace);
    },

    createFolder: async (req, res) => {
        const FolderModel = await tenantCollection(req, "Folder");
        const { name, parentId, parentType, type, icon, color } = req.body;
        // Basic order strategy: 0 (or count if scoped query, but 0 is fine for now as user can drag)
        const slug = await uniqueSlug(FolderModel, name);
        const folderData = { name, slug, createdBy: req.user._id, order: 0 };
        if (type) folderData.type = type;
        if (icon) folderData.icon = icon;
        if (color) folderData.color = color;
        if (parentType === 'space') folderData.spaces = [parentId];
        if (parentType === 'folder' || parentType === 'environment') folderData.parentFolders = [parentId];
        const newFolder = new FolderModel(folderData);
        await newFolder.save();
        res.json(newFolder);
    },

    createEntity: async (req, res) => {
        const EntityModel = await tenantCollection(req, "Entity");
        const ViewModel = await tenantCollection(req, "View");
        const { name, parentId, parentType, viewType, icon, color } = req.body;
        const slug = await uniqueSlug(EntityModel, name);

        const newEntity = new EntityModel({ name, slug, createdBy: req.user._id });
        await newEntity.save();

        const newView = new ViewModel({
            name,
            slug,
            entity: newEntity._id,
            icon,
            color,
            viewType: viewType || 'list',
            createdBy: req.user._id,
            order: 0,
            spaces: parentType === 'space' ? [parentId] : [],
            folders: (parentType === 'folder' || parentType === 'environment' || parentType === 'workstation') ? [parentId] : []
        });
        await newView.save();
        res.json(newView);
    },

    renameItem: async (req, res) => {
        const { id, type, newName } = req.body;
        let Model;
        if (type === 'space') Model = await tenantCollection(req, "Space");
        if (type === 'folder' || type === 'environment' || type === 'workstation') Model = await tenantCollection(req, "Folder");
        if (type === 'entity' || type === 'cockpit') {
            const ViewModel = await tenantCollection(req, "View");
            const view = await ViewModel.findById(id);
            Model = view ? ViewModel : await tenantCollection(req, "Entity");
        }
        if (Model) await Model.findByIdAndUpdate(id, { name: newName });
        res.json({ success: true });
    },

    updateIcon: async (req, res) => {
        const { id, type, icon, color } = req.body;
        let Model;
        if (type === 'space') Model = await tenantCollection(req, "Space");
        if (type === 'folder' || type === 'environment' || type === 'workstation') Model = await tenantCollection(req, "Folder");
        if (type === 'entity' || type === 'cockpit') {
            const ViewModel = await tenantCollection(req, "View");
            const view = await ViewModel.findById(id);
            Model = view ? ViewModel : await tenantCollection(req, "Entity");
        }

        const update = {};
        if (icon !== undefined) update.icon = icon;
        if (color !== undefined) update.color = color;

        if (Model) await Model.findByIdAndUpdate(id, update);
        res.json({ success: true });
    },

    deleteItem: async (req, res) => {
        const { id, type } = req.body;
        let Model;
        if (type === 'space') Model = await tenantCollection(req, "Space");
        if (type === 'folder' || type === 'environment' || type === 'workstation') Model = await tenantCollection(req, "Folder");
        if (type === 'entity' || type === 'cockpit') {
            const ViewModel = await tenantCollection(req, "View");
            const view = await ViewModel.findById(id);
            Model = view ? ViewModel : await tenantCollection(req, "Entity");
        }
        if (!Model) return res.status(400).json({ error: "Invalid type or model not found" });
        await Model.findByIdAndDelete(id);
        res.json({ success: true });
    },

    listAllEntities: async (req, res) => {
        const EntityModel = await tenantCollection(req, "Entity");
        const entities = await EntityModel.find({}).lean();
        res.json({
            success: true,
            entities: entities.map(e => ({
                id: e._id.toString(),
                name: e.name,
                slug: e.slug,
                icon: e.icon,
                fieldsCount: (e.customFields || []).length
            }))
        });
    },

    getEntityFields: async (req, res) => {
        try {
            const { entityId } = req.params;
            const EntityModel = await tenantCollection(req, "Entity");
            const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");

            const entity = await EntityModel.findById(entityId).lean();

            if (!entity) {
                return res.status(404).json({ success: false, message: "Entity not found" });
            }

            // Populate customFields with FieldTemplate data
            const fields = [];
            if (entity.customFields && entity.customFields.length > 0) {
                const fieldTemplates = await FieldTemplateModel.find({
                    _id: { $in: entity.customFields }
                }).lean();

                fields.push(...fieldTemplates.map(ft => ({
                    id: ft._id.toString(),
                    name: ft.name,
                    type: ft.fieldType || 'text',
                    icon: ft.icon || 'tabler:text'
                })));
            }

            res.json({
                success: true,
                entity: {
                    id: entity._id.toString(),
                    name: entity.name,
                    icon: entity.icon || 'solar:database-broken',
                    fields
                }
            });
        } catch (error) {
            console.error('Error fetching entity fields:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    linkEntity: async (req, res) => {
        const EntityModel = await tenantCollection(req, "Entity");
        const ViewModel = await tenantCollection(req, "View");
        const { entityId, parentId, parentType, viewType } = req.body;
        const entity = await EntityModel.findById(entityId);
        const newView = new ViewModel({
            name: entity.name,
            slug: await uniqueSlug(ViewModel, entity.name),
            entity: entity._id,
            viewType: viewType || 'list',
            createdBy: req.user._id,
            order: 0,
            spaces: parentType === 'space' ? [parentId] : [],
            folders: (parentType === 'folder' || parentType === 'environment' || parentType === 'workstation') ? [parentId] : []
        });
        await newView.save();
        res.json({ success: true, view: newView });
    },

    linkCockpit: async (req, res) => {
        const ViewModel = await tenantCollection(req, "View");
        const { cockpitId, cockpitName, parentId, parentType } = req.body;
        const newView = new ViewModel({
            name: cockpitName || 'Cockpit',
            slug: await uniqueSlug(ViewModel, cockpitName || 'cockpit'),
            viewType: 'cockpit',
            cockpitId: cockpitId,
            createdBy: req.user._id,
            order: 0,
            spaces: parentType === 'space' ? [parentId] : [],
            folders: (parentType === 'folder' || parentType === 'environment') ? [parentId] : []
        });
        await newView.save();
        res.json({ success: true, view: newView });
    },

    getSidebarPrefs: async (req, res) => {
        try {
            const User = require('../models/user.model');
            const user = await User.findById(req.user._id).select('sidebarPreferences');
            const expandedIds = user?.sidebarPreferences?.expandedIds || [];
            res.json({ success: true, expandedIds });
        } catch (error) {
            console.error("[Hierarchy] getSidebarPrefs Error:", error);
            res.status(500).json({ error: "Failed to get sidebar preferences" });
        }
    },

    saveSidebarPrefs: async (req, res) => {
        try {
            const { expandedIds } = req.body;
            const User = require('../models/user.model');

            await User.findByIdAndUpdate(
                req.user._id,
                { 'sidebarPreferences.expandedIds': expandedIds || [] },
                { new: true }
            );

            res.json({ success: true });
        } catch (error) {
            console.error("[Hierarchy] saveSidebarPrefs Error:", error);
            res.status(500).json({ error: "Failed to save sidebar preferences" });
        }
    }
};

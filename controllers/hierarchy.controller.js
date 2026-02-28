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
                        image: defaultEnv.image || '',
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
                    image: e.image || '',
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
            const { name, icon, color, image } = req.body;
            const count = await EnvironmentModel.countDocuments();
            const slug = await uniqueSlug(EnvironmentModel, name);
            const newEnv = new EnvironmentModel({
                name,
                slug,
                icon: icon || 'solar:planet-3-bold-duotone',
                color: color || '#6366f1',
                image: image || '',
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
                    image: newEnv.image || '',
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
            const { id, name, icon, color, image } = req.body;
            const update = {};
            if (name !== undefined) update.name = name;
            if (icon !== undefined) update.icon = icon;
            if (color !== undefined) update.color = color;
            if (image !== undefined) update.image = image;
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
            const quickFormOnly = req.query.quickForm === '1';
            const EntityModel = await tenantCollection(req, "Entity");
            const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
            const ClassificationModel = await tenantCollection(req, "Classification");

            const entity = await EntityModel.findById(entityId).lean();

            if (!entity) {
                return res.status(404).json({ success: false, message: "Entity not found" });
            }

            const fieldOverrides = entity.fieldOverrides || {};

            // Populate customFields with FieldTemplate data
            const fields = [];
            if (entity.customFields && entity.customFields.length > 0) {
                const fieldTemplates = await FieldTemplateModel.find({
                    _id: { $in: entity.customFields }
                }).lean();

                for (const ft of fieldTemplates) {
                    const ftId = ft._id.toString();
                    const override = fieldOverrides[ftId] || (fieldOverrides instanceof Map ? fieldOverrides.get(ftId) : null) || {};
                    const showOnQF = override.showOnQuickForm ?? ft.showOnQuickForm ?? false;

                    if (quickFormOnly && !showOnQF) continue;

                    fields.push({
                        id: ftId,
                        name: ft.name,
                        label: override.label || ft.label || ft.name,
                        type: ft.fieldType || ft.type || 'text',
                        icon: ft.ui?.icon || ft.icon || 'tabler:text',
                        showOnQuickForm: showOnQF
                    });
                }
            }

            // Classifications
            const classifications = [];
            const allClassifIds = [
                ...(entity.classifications || []),
                ...(entity.statusClassification ? [entity.statusClassification] : [])
            ].filter(Boolean);

            if (allClassifIds.length > 0) {
                const classifDocs = await ClassificationModel.find({
                    _id: { $in: allClassifIds }
                }).lean();

                for (const c of classifDocs) {
                    if (quickFormOnly && !c.showOnQuickForm) continue;

                    classifications.push({
                        id: c._id.toString(),
                        name: c.name,
                        key: c.key,
                        allowMultiple: c.allowMultiple || false,
                        showOnQuickForm: c.showOnQuickForm || false,
                        isStatus: entity.statusClassification?.toString() === c._id.toString(),
                        options: (c.options || []).map(o => ({
                            id: o._id.toString(),
                            label: o.label,
                            color: o.color || '#3b82f6',
                            icon: o.icon || 'solar:info-circle-bold'
                        }))
                    });
                }
            }

            // Relations info (useful for auto-linking with cardinality)
            const relations = (entity.relations || []).map(r => ({
                key: r.key,
                label: r.label,
                targetEntity: r.targetEntity?.toString(),
                cardinality: r.cardinality || 'one-to-many'
            }));

            res.json({
                success: true,
                entity: {
                    id: entity._id.toString(),
                    name: entity.name,
                    slug: entity.slug,
                    icon: entity.icon || 'solar:database-broken',
                    fields,
                    classifications,
                    relations,
                    referenceTitleTokens: entity.referenceTitleTokens || [{ t: 'field', id: 'title' }]
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
    },

    /**
     * Find which environment contains a given entity slug.
     * Used by the sidebar to auto-select the correct environment on page load.
     * GET /api/hierarchy/find-environment?entitySlug=factures
     */
    findEnvironmentByEntitySlug: async (req, res) => {
        try {
            const { entitySlug } = req.query;
            if (!entitySlug) return res.json({ success: false, environmentId: null });

            const EntityModel = await tenantCollection(req, "Entity");
            const ViewModel = await tenantCollection(req, "View");
            const SpaceModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");

            // 1. Find the entity by slug
            const entity = await EntityModel.findOne({ slug: entitySlug }).lean();
            if (!entity) return res.json({ success: false, environmentId: null });

            // 2. Find views that reference this entity
            const views = await ViewModel.find({ entity: entity._id }).lean();
            if (!views.length) return res.json({ success: false, environmentId: null });

            // 3. For each view, trace up to find the space → environment
            for (const view of views) {
                // Check if the view is directly in a space
                if (view.spaces && view.spaces.length > 0) {
                    const space = await SpaceModel.findById(view.spaces[0]).lean();
                    if (space && space.environmentId) {
                        return res.json({ success: true, environmentId: space.environmentId.toString() });
                    }
                }

                // Check if the view is in a folder → trace up to space
                if (view.folders && view.folders.length > 0) {
                    let folderId = view.folders[0];
                    const visited = new Set();
                    // Walk up the folder chain
                    while (folderId && !visited.has(folderId.toString())) {
                        visited.add(folderId.toString());
                        const folder = await FolderModel.findById(folderId).lean();
                        if (!folder) break;

                        // If this folder is in a space, find the environment
                        if (folder.spaces && folder.spaces.length > 0) {
                            const space = await SpaceModel.findById(folder.spaces[0]).lean();
                            if (space && space.environmentId) {
                                return res.json({ success: true, environmentId: space.environmentId.toString() });
                            }
                        }

                        // Go up to parent folder
                        if (folder.parentFolders && folder.parentFolders.length > 0) {
                            folderId = folder.parentFolders[0];
                        } else {
                            break;
                        }
                    }
                }
            }

            return res.json({ success: false, environmentId: null });
        } catch (error) {
            console.error("[Hierarchy] findEnvironmentByEntitySlug Error:", error);
            res.status(500).json({ error: "Internal error" });
        }
    },

    /**
     * Check if applying a SpaceTemplate would create entity slug conflicts.
     * POST /api/space-templates/:id/check-conflicts
     * Body: { envName }
     * Returns: { success, hasConflicts, conflicts: [{ templateSlug, entityName, existingSlug, existingEntityId, existingEntityName }] }
     */
    checkTemplateConflicts: async (req, res) => {
        try {
            const SpaceTemplate = require('../models/space-template.model');
            const EntityTemplate = require('../models/entity-template.model');

            const template = await SpaceTemplate.findById(req.params.id);
            if (!template) return res.status(404).json({ error: 'Template not found' });

            const EntityModel = await tenantCollection(req, "Entity");
            const entityTemplates = template.entities || [];
            const conflicts = [];

            for (const etRef of entityTemplates) {
                const et = await EntityTemplate.findOne({ slug: etRef.templateSlug, active: { $ne: false } }).lean();
                if (!et) continue;

                const entityName = etRef.name || et.name;
                // Generate the slug that would be created
                const baseSlug = entityName.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');

                // Check if this slug already exists
                const existing = await EntityModel.findOne({ slug: baseSlug }).lean();
                if (existing) {
                    conflicts.push({
                        templateSlug: etRef.templateSlug,
                        entityName: entityName,
                        existingSlug: baseSlug,
                        existingEntityId: existing._id.toString(),
                        existingEntityName: existing.name,
                        icon: etRef.icon || et.icon || 'solar:database-bold-duotone',
                        color: etRef.color || et.color || '#4361ee'
                    });
                }
            }

            res.json({
                success: true,
                hasConflicts: conflicts.length > 0,
                conflicts,
                templateName: template.name,
                totalEntities: entityTemplates.length
            });
        } catch (error) {
            console.error("[Hierarchy] checkTemplateConflicts Error:", error);
            res.status(500).json({ error: "Failed to check conflicts" });
        }
    },

    /**
     * Apply a SpaceTemplate: creates environment + space + entities from template definitions.
     * POST /api/space-templates/:id/apply
     * Body: { envName, envIcon, envColor, envImage, overrides: { templateSlug: 'override' | 'rename' } }
     */
    applySpaceTemplate: async (req, res) => {
        try {
            const SpaceTemplate = require('../models/space-template.model');
            const EntityTemplate = require('../models/entity-template.model');

            const template = await SpaceTemplate.findById(req.params.id);
            if (!template) return res.status(404).json({ error: 'Template not found' });

            const { envName, envIcon, envColor, envImage, overrides } = req.body;

            const EnvironmentModel = await tenantCollection(req, "Environment");
            const SpaceModel = await tenantCollection(req, "Space");
            const EntityModel = await tenantCollection(req, "Entity");
            const ViewModel = await tenantCollection(req, "View");
            const ClassificationModel = await tenantCollection(req, "Classification");

            // 1. Create Environment
            const envCount = await EnvironmentModel.countDocuments();
            const envSlug = await uniqueSlug(EnvironmentModel, envName || template.name);
            const newEnv = new EnvironmentModel({
                name: envName || template.name,
                slug: envSlug,
                icon: envIcon || template.icon,
                color: envColor || template.color,
                image: envImage || '',
                order: envCount,
                createdBy: req.user._id
            });
            await newEnv.save();

            // 2. Create Space inside the environment
            const spaceCount = await SpaceModel.countDocuments();
            const spaceSlug = await uniqueSlug(SpaceModel, template.name);
            const newSpace = new SpaceModel({
                name: template.name,
                slug: spaceSlug,
                owner: req.user._id,
                icon: template.icon,
                color: template.color,
                order: spaceCount,
                environmentId: newEnv._id
            });
            await newSpace.save();

            // 3. Create entities from template entity references
            const entityTemplates = template.entities || [];
            const createdEntities = [];
            // Track for cross-entity relations: templateSlug → { entityId, entitySlug, records: [{ _id, title }] }
            const slugToEntityInfo = {};

            for (let i = 0; i < entityTemplates.length; i++) {
                const etRef = entityTemplates[i];
                // Fetch the EntityTemplate by slug (active: { $ne: false } to include undefined/true)
                const et = await EntityTemplate.findOne({ slug: etRef.templateSlug, active: { $ne: false } }).lean();
                if (!et) {
                    console.warn(`[Template] EntityTemplate not found for slug: ${etRef.templateSlug} — skipping`);
                    continue;
                }

                const entityName = etRef.name || et.name;
                const entityIcon = etRef.icon || et.icon;
                const entityColor = etRef.color || et.color;

                // Check for override directive
                const overrideAction = overrides && overrides[etRef.templateSlug];
                let entitySlug;

                if (overrideAction === 'override') {
                    // Delete the existing entity and all its data, then use the base slug
                    const baseSlug = entityName.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                    const existingEntity = await EntityModel.findOne({ slug: baseSlug }).lean();
                    if (existingEntity) {
                        console.log(`[Template] Override: deleting existing entity "${existingEntity.name}" (${baseSlug})`);
                        const RecordModel = await tenantCollection(req, "Record");
                        const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
                        // Delete records
                        await RecordModel.deleteMany({ entityId: existingEntity._id });
                        // Delete views
                        await ViewModel.deleteMany({ entity: existingEntity._id });
                        // Delete classifications
                        if (existingEntity.classifications && existingEntity.classifications.length > 0) {
                            await ClassificationModel.deleteMany({ _id: { $in: existingEntity.classifications } });
                        }
                        // Delete custom fields
                        if (existingEntity.customFields && existingEntity.customFields.length > 0) {
                            await FieldTemplateModel.deleteMany({ _id: { $in: existingEntity.customFields } });
                        }
                        // Delete the entity itself
                        await EntityModel.findByIdAndDelete(existingEntity._id);
                    }
                    entitySlug = baseSlug;
                } else {
                    // Default behavior: auto-generate unique slug (appends -2, -3, etc. if exists)
                    entitySlug = await uniqueSlug(EntityModel, entityName);
                }

                // Normalize referenceTitleTokens: old templates use {type, value}, new use {t, id}
                let refTokens = [{ t: 'field', id: 'title' }]; // default
                if (et.referenceTitleTokens && et.referenceTitleTokens.length > 0) {
                    refTokens = et.referenceTitleTokens.map(tok => {
                        if (tok.t) return tok; // already in new format
                        return { t: tok.type || 'field', id: tok.value || tok.id || 'title' };
                    });
                }

                // Create the Entity
                const newEntity = new EntityModel({
                    name: entityName,
                    slug: entitySlug,
                    icon: entityIcon,
                    color: entityColor,
                    spaces: [newSpace._id],
                    createdBy: req.user._id,
                    enabledStandardFields: et.enabledStandardFields || ['title'],
                    referenceTitleTokens: refTokens
                });

                // Create custom fields from template
                if (et.fields && et.fields.length > 0) {
                    const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
                    const fieldIds = [];
                    for (const rawFieldDef of et.fields) {
                        // Normalize: old templates use plain strings, new ones use objects
                        let fieldDef;
                        if (typeof rawFieldDef === 'string') {
                            const label = rawFieldDef.charAt(0).toUpperCase() + rawFieldDef.slice(1).replace(/_/g, ' ');
                            fieldDef = { name: rawFieldDef, label, type: 'string' };
                        } else {
                            fieldDef = rawFieldDef;
                        }

                        if (!fieldDef.name || !fieldDef.label) {
                            console.warn(`[Template] Skipping field with missing name/label:`, fieldDef);
                            continue;
                        }

                        const newField = new FieldTemplateModel({
                            name: fieldDef.name,
                            label: fieldDef.label,
                            description: fieldDef.description || '',
                            type: fieldDef.type || 'string',
                            subtype: fieldDef.subtype || '',
                            category: fieldDef.category || 'text',
                            icon: fieldDef.icon || 'solar:widget-bold',
                            required: fieldDef.required || false,
                            type_config: fieldDef.type_config || fieldDef.typeConfig || {},
                            ui: fieldDef.ui || {},
                            createdBy: req.user._id
                        });
                        await newField.save();
                        fieldIds.push(newField._id);
                    }
                    newEntity.customFields = fieldIds;
                }

                await newEntity.save();

                // Create classifications from template — track for demo records
                const classifMap = {}; // { slug: { _id, options: { value: optionDoc } } }
                if (et.classifications && et.classifications.length > 0) {
                    for (const classifDef of et.classifications) {
                        const classifSlug = classifDef.slug || classifDef.name.toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '');
                        const newClassif = new ClassificationModel({
                            name: classifDef.name,
                            key: `${newEntity._id}_${classifSlug}`,
                            description: '',
                            type: classifDef.type === 'status' ? 'simple' : 'simple',
                            allowMultiple: false,
                            entities: [newEntity._id],
                            options: (classifDef.options || []).map((opt, idx) => ({
                                label: opt.label,
                                color: opt.color || '#4361ee',
                                icon: opt.icon || 'solar:info-circle-bold',
                                type: idx === 0 ? 'start' : (idx === (classifDef.options.length - 1) ? 'completed' : 'active'),
                                order: opt.order ?? idx
                            })),
                            createdBy: req.user._id
                        });
                        await newClassif.save();

                        // Map for demo records: slug -> { _id, optionsMap }
                        const optionsMap = {};
                        newClassif.options.forEach((savedOpt, idx) => {
                            const origOpt = classifDef.options[idx];
                            if (origOpt && origOpt.value) {
                                optionsMap[origOpt.value] = { _id: savedOpt._id, label: savedOpt.label, color: savedOpt.color };
                            }
                        });
                        classifMap[classifSlug] = { _id: newClassif._id, optionsMap };

                        // Set as status classification if applicable
                        if (classifDef.isStatus) {
                            newEntity.statusClassification = newClassif._id;
                            if (!newEntity.classifications) newEntity.classifications = [];
                            newEntity.classifications.push(newClassif._id);
                            await newEntity.save();
                        } else {
                            if (!newEntity.classifications) newEntity.classifications = [];
                            newEntity.classifications.push(newClassif._id);
                            await newEntity.save();
                        }
                    }
                }

                // Create View linking entity to space
                const viewSlug = await uniqueSlug(ViewModel, entityName);
                const viewTypeDef = (template.defaultViews || []).find(dv => dv.entitySlug === et.slug);
                const newView = new ViewModel({
                    name: entityName,
                    slug: viewSlug,
                    entity: newEntity._id,
                    icon: entityIcon,
                    color: entityColor,
                    viewType: viewTypeDef?.viewType || 'table',
                    createdBy: req.user._id,
                    order: etRef.order || i,
                    spaces: [newSpace._id],
                    folders: []
                });
                await newView.save();

                // Track created records for this entity (for cross-entity relation linking)
                const createdRecords = [];

                // Create demo records from template
                if (et.demoRecords && et.demoRecords.length > 0) {
                    const RecordModel = await tenantCollection(req, "Record");

                    // Build field name → _id map
                    const fieldNameToId = {};
                    if (et.fields && newEntity.customFields) {
                        const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
                        const savedFields = await FieldTemplateModel.find({ _id: { $in: newEntity.customFields } }).lean();
                        savedFields.forEach(f => { fieldNameToId[f.name] = f._id; });
                    }

                    for (let r = 0; r < et.demoRecords.length; r++) {
                        const demo = et.demoRecords[r];
                        const customFields = [];
                        const classificationValues = [];

                        // Map custom field values
                        if (demo.customFieldValues) {
                            for (const [fieldName, value] of Object.entries(demo.customFieldValues)) {
                                if (fieldNameToId[fieldName]) {
                                    customFields.push({ field_id: fieldNameToId[fieldName], value });
                                }
                            }
                        }

                        // Map classification values
                        if (demo.classificationValues) {
                            for (const [classifSlug, optionValue] of Object.entries(demo.classificationValues)) {
                                const classifInfo = classifMap[classifSlug];
                                if (classifInfo && classifInfo.optionsMap[optionValue]) {
                                    const opt = classifInfo.optionsMap[optionValue];
                                    classificationValues.push({
                                        classificationId: classifInfo._id,
                                        optionId: opt._id,
                                        label: opt.label,
                                        color: opt.color
                                    });
                                }
                            }
                        }

                        const newRecord = new RecordModel({
                            entityId: newEntity._id,
                            spaces: [newSpace._id],
                            title: demo.title,
                            computedTitle: demo.title,
                            customFields,
                            classificationValues,
                            order: r,
                            createdBy: req.user._id
                        });
                        await newRecord.save();
                        createdRecords.push({ _id: newRecord._id, title: demo.title });
                    }
                    console.log(`[Template] Created ${et.demoRecords.length} demo records for ${entityName}`);
                }

                // Save tracking info for relation linking
                slugToEntityInfo[etRef.templateSlug] = {
                    entityId: newEntity._id,
                    entitySlug: entitySlug,
                    records: createdRecords
                };

                createdEntities.push({
                    entityId: newEntity._id.toString(),
                    viewId: newView._id.toString(),
                    name: entityName
                });
            }

            // ═══════════════════════════════════════════════════════
            // 4. Create cross-entity RELATIONS from template
            // ═══════════════════════════════════════════════════════
            if (template.relations && template.relations.length > 0) {
                const crypto = require('crypto');
                const RecordModel = await tenantCollection(req, "Record");
                let demoRelLinks = {};
                try { demoRelLinks = require('../scripts/data/demo-relation-links'); } catch (e) { /* no links file */ }

                for (const rel of template.relations) {
                    const fromInfo = slugToEntityInfo[rel.from];
                    const toInfo = slugToEntityInfo[rel.to];
                    if (!fromInfo || !toInfo) {
                        console.warn(`[Template] Skipping relation ${rel.from} → ${rel.to}: entity not found`);
                        continue;
                    }

                    // Create a relation key (UUID) on the "from" entity
                    const relationKey = crypto.randomUUID();
                    const cardinality = rel.type === 'many-to-many' ? 'many-to-many'
                        : rel.type === 'one-to-one' ? 'one-to-one'
                            : 'one-to-many';

                    // Push the relation definition onto the "from" entity
                    await EntityModel.findByIdAndUpdate(fromInfo.entityId, {
                        $push: {
                            relations: {
                                key: relationKey,
                                targetEntity: toInfo.entityId,
                                label: rel.label || '',
                                inverseLabel: rel.inverseLabel || '',
                                cardinality: cardinality,
                                inputMode: 'autocomplete',
                                storage: 'on-source',
                                bidirectional: true,
                                required: false
                            }
                        }
                    });
                    console.log(`[Template] Created relation: ${rel.from} —[${rel.fieldName}]→ ${rel.to} (key: ${relationKey})`);

                    // Link demo records using demo-relation-links.js
                    const linkDefs = demoRelLinks[rel.from] || [];
                    if (linkDefs.length > 0 && fromInfo.records.length > 0 && toInfo.records.length > 0) {
                        // Build a title → _id lookup for the target entity
                        const targetTitleToId = {};
                        toInfo.records.forEach(r => { targetTitleToId[r.title] = r._id; });

                        for (const linkDef of linkDefs) {
                            const fromRecord = fromInfo.records.find(r => r.title === linkDef.title);
                            if (!fromRecord) continue;

                            const targetRef = linkDef.links[rel.fieldName];
                            if (!targetRef) continue;

                            // Resolve target record IDs
                            let targetIds;
                            if (Array.isArray(targetRef)) {
                                targetIds = targetRef.map(t => targetTitleToId[t]).filter(Boolean);
                            } else {
                                const tid = targetTitleToId[targetRef];
                                targetIds = tid ? [tid] : [];
                            }

                            if (targetIds.length === 0) continue;

                            // Build denormalized data
                            const denormRecords = targetIds.map(tid => {
                                const tr = toInfo.records.find(r => r._id.equals(tid));
                                return { _id: tid, title: tr ? tr.title : '', entitySlug: toInfo.entitySlug };
                            });

                            const relationValue = cardinality === 'many-to-many' ? targetIds : targetIds[0];

                            await RecordModel.findByIdAndUpdate(fromRecord._id, {
                                $push: {
                                    relations: { relationKey: relationKey, value: relationValue },
                                    '_denorm.relations': { relationKey: relationKey, records: denormRecords }
                                }
                            });
                        }
                        console.log(`[Template] Linked ${linkDefs.length} records for relation ${rel.fieldName}`);
                    }
                }
            }

            // Increment usage count
            await SpaceTemplate.findByIdAndUpdate(template._id, { $inc: { usageCount: 1 } });

            res.json({
                success: true,
                environment: {
                    id: newEnv._id.toString(),
                    name: newEnv.name,
                    slug: newEnv.slug,
                    icon: newEnv.icon,
                    color: newEnv.color,
                    image: newEnv.image || '',
                    order: newEnv.order
                },
                space: {
                    id: newSpace._id.toString(),
                    name: newSpace.name
                },
                entities: createdEntities
            });
        } catch (error) {
            console.error("[Hierarchy] applySpaceTemplate Error:", error.message);
            if (error.errors) {
                Object.keys(error.errors).forEach(key => {
                    console.error(`  [VALIDATION] ${key}: ${error.errors[key].message}`);
                });
            }
            res.status(500).json({ error: "Failed to apply template" });
        }
    }
};

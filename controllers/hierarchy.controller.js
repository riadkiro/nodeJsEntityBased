const tenantCollection = require("../middleware/tenant").tenantCollection;

module.exports = {
    getHierarchy: async (req, res) => {
        try {
            const SpaceModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const EntityModel = await tenantCollection(req, "Entity");
            const ViewModel = await tenantCollection(req, "View");

            if (!SpaceModel || !FolderModel || !EntityModel || !ViewModel) {
                return res.status(500).json({ error: "Models not ready" });
            }

            const [rawSpaces, rawFolders, rawEntities, rawViews] = await Promise.all([
                SpaceModel.find({}).lean(),
                FolderModel.find({}).lean(),
                EntityModel.find({}).lean(),
                ViewModel.find({}).lean()
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
                        const entity = entities.find(e => e.id === v.entity.toString());
                        results.push({
                            type: 'entity',
                            id: v.id,
                            name: v.name,
                            icon: v.icon || (entity ? entity.icon : 'solar:database-bold'),
                            link: `/account/${req.account_number}/view/${v.id}`,
                            entityId: v.entity,
                            viewType: v.viewType || 'list',
                            filters: v.filters || []
                        });
                    }
                });

                // Legacy Entities (Directly on hierarchy) - Keep for compatibility
                rawEntities.forEach(e => {
                    const eId = e._id.toString();
                    let isChild = false;
                    const eSpaces = (e.spaces || []).map(id => id.toString());
                    const eFolders = (e.folders || []).map(id => id.toString());

                    if (parentType === 'space' && eSpaces.includes(parentId) && eFolders.length === 0) isChild = true;
                    else if ((parentType === 'folder' || parentType === 'environment') && eFolders.includes(parentId)) isChild = true;

                    if (isChild) {
                        // Check if a View already represents this entity at this location to avoid duplicates
                        const hasView = views.find(v => v.entity.toString() === eId &&
                            ((parentType === 'space' && v.spaces.includes(parentId)) ||
                                ((parentType === 'folder' || parentType === 'environment') && v.folders.includes(parentId))));

                        if (!hasView) {
                            results.push({
                                type: 'entity',
                                id: eId,
                                name: e.name,
                                icon: e.icon || 'solar:database-bold',
                                link: `/account/${req.account_number}/record/${e.slug}/list`,
                                isLegacy: true
                            });
                        }
                    }
                });

                return results;
            };

            const hierarchy = spaces.map(s => ({
                type: 'space',
                id: s.id,
                name: s.name,
                icon: s.icon,
                children: buildTree(s.id, 'space'),
                link: '#'
            }));

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

    move: async (req, res) => {
        try {
            const { itemId, itemType, newParentId, newParentType, oldParentId } = req.body;
            const SpaceModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const ViewModel = await tenantCollection(req, "View");
            const EntityModel = await tenantCollection(req, "Entity");

            if (itemType === 'entity') {
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
        const { name } = req.body;
        const newSpace = new SpaceModel({ name, slug: name.toLowerCase().replace(/ /g, '-') + '-' + Date.now(), owner: req.user._id });
        await newSpace.save();
        res.json(newSpace);
    },

    createFolder: async (req, res) => {
        const FolderModel = await tenantCollection(req, "Folder");
        const { name, parentId, parentType, type, icon } = req.body;
        const folderData = { name, slug: name.toLowerCase().replace(/ /g, '-') + '-' + Date.now(), createdBy: req.user._id };
        if (type) folderData.type = type;
        if (icon) folderData.icon = icon;
        if (parentType === 'space') folderData.spaces = [parentId];
        if (parentType === 'folder' || parentType === 'environment') folderData.parentFolders = [parentId];
        const newFolder = new FolderModel(folderData);
        await newFolder.save();
        res.json(newFolder);
    },

    createEntity: async (req, res) => {
        const EntityModel = await tenantCollection(req, "Entity");
        const ViewModel = await tenantCollection(req, "View");
        const { name, parentId, parentType, viewType, icon } = req.body;
        const slug = name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

        const newEntity = new EntityModel({ name, slug, createdBy: req.user._id });
        await newEntity.save();

        const newView = new ViewModel({
            name,
            slug,
            entity: newEntity._id,
            icon,
            viewType: viewType || 'list',
            createdBy: req.user._id,
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
        if (type === 'entity') {
            const ViewModel = await tenantCollection(req, "View");
            const view = await ViewModel.findById(id);
            Model = view ? ViewModel : await tenantCollection(req, "Entity");
        }
        if (Model) await Model.findByIdAndUpdate(id, { name: newName });
        res.json({ success: true });
    },

    updateIcon: async (req, res) => {
        const { id, type, icon } = req.body;
        let Model;
        if (type === 'space') Model = await tenantCollection(req, "Space");
        if (type === 'folder' || type === 'environment' || type === 'workstation') Model = await tenantCollection(req, "Folder");
        if (type === 'entity') {
            const ViewModel = await tenantCollection(req, "View");
            const view = await ViewModel.findById(id);
            Model = view ? ViewModel : await tenantCollection(req, "Entity");
        }
        if (Model) await Model.findByIdAndUpdate(id, { icon });
        res.json({ success: true });
    },

    deleteItem: async (req, res) => {
        const { id, type } = req.body;
        let Model;
        if (type === 'space') Model = await tenantCollection(req, "Space");
        if (type === 'folder' || type === 'environment' || type === 'workstation') Model = await tenantCollection(req, "Folder");
        if (type === 'entity') {
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
        res.json({ success: true, entities: entities.map(e => ({ id: e._id.toString(), name: e.name, slug: e.slug })) });
    },

    linkEntity: async (req, res) => {
        const EntityModel = await tenantCollection(req, "Entity");
        const ViewModel = await tenantCollection(req, "View");
        const { entityId, parentId, parentType, viewType } = req.body;
        const entity = await EntityModel.findById(entityId);
        const newView = new ViewModel({
            name: entity.name,
            slug: entity.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
            entity: entity._id,
            viewType: viewType || 'list',
            createdBy: req.user._id,
            spaces: parentType === 'space' ? [parentId] : [],
            folders: (parentType === 'folder' || parentType === 'environment' || parentType === 'workstation') ? [parentId] : []
        });
        await newView.save();
        res.json({ success: true, view: newView });
    }
};

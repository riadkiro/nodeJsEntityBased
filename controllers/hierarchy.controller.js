const tenantCollection = require("../middleware/tenant").tenantCollection;
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { sanitizeViewFilters } = require('../services/record-filter-query');

// Cache for loaded icon libraries
const iconLibrariesCache = {};
const RECORD_MODULE_KEYS = ['overview', 'fiche', 'docs', 'drive', 'data-room', 'tasks', 'agenda', 'sheet', 'chat', 'emails', 'notes', 'ai', 'team'];
const FOLDER_CONTAINER_TYPES = ['folder', 'environment', 'workstation'];
const SECTION_TYPES = ['space', 'section'];
const ROOT_PARENT_TYPES = ['environment-root', 'space-root'];
const MAX_FOLDER_CONTAINER_DEPTH = 2;

function normalizeId(value) {
    return value ? String(value) : '';
}

function isRootParentType(type) {
    return ROOT_PARENT_TYPES.includes(type);
}

function isSectionType(type) {
    return SECTION_TYPES.includes(type);
}

function isFolderContainerType(type) {
    return FOLDER_CONTAINER_TYPES.includes(type);
}

function usesNewHierarchyNames(req) {
    return Boolean(
        req.query.naming === 'new' ||
        req.query.spaceId !== undefined ||
        req.body?.spaceId !== undefined ||
        req.body?.itemType === 'section' ||
        req.body?.newParentType === 'space-root' ||
        req.body?.parentType === 'space-root'
    );
}

function serializeRailSpace(space) {
    if (!space) return null;
    return {
        id: space._id.toString(),
        name: space.name,
        slug: space.slug,
        icon: space.icon,
        color: space.color,
        image: space.image || '',
        order: space.order,
        isDefault: space.isDefault || false,
        type: 'space'
    };
}

function serializeSection(section) {
    if (!section) return null;
    const raw = typeof section.toObject === 'function' ? section.toObject() : section;
    return {
        ...raw,
        id: raw._id ? raw._id.toString() : raw.id,
        type: 'section',
        spaceId: raw.environmentId ? raw.environmentId.toString() : null,
        environmentId: raw.environmentId ? raw.environmentId.toString() : null
    };
}

async function ensureDefaultRailSpace(req, RailSpaceModel, SectionModel) {
    const defaultSpace = new RailSpaceModel({
        name: 'Mon espace',
        slug: 'mon-espace',
        icon: 'solar:planet-3-bold-duotone',
        color: '#6366f1',
        order: 0,
        isDefault: true,
        createdBy: req.user._id
    });
    await defaultSpace.save();

    await SectionModel.updateMany(
        { environmentId: { $exists: false } },
        { $set: { environmentId: defaultSpace._id } }
    );
    await SectionModel.updateMany(
        { environmentId: null },
        { $set: { environmentId: defaultSpace._id } }
    );

    return defaultSpace;
}

async function listRailSpaces(req, res) {
    try {
        const RailSpaceModel = await tenantCollection(req, "Environment");
        const SectionModel = await tenantCollection(req, "Space");
        let spaces = await RailSpaceModel.find({}).sort({ order: 1 }).lean();

        if (spaces.length === 0) {
            const defaultSpace = await ensureDefaultRailSpace(req, RailSpaceModel, SectionModel);
            spaces = [defaultSpace.toObject()];
        }

        const serialized = spaces.map(serializeRailSpace);
        res.json({
            success: true,
            spaces: serialized,
            environments: serialized
        });
    } catch (error) {
        console.error("[Hierarchy] listRailSpaces Error:", error);
        res.status(500).json({ error: "Internal error" });
    }
}

async function createRailSpace(req, res) {
    try {
        const RailSpaceModel = await tenantCollection(req, "Environment");
        const { icon, color, image } = req.body;
        const name = String(req.body.name || '').trim();
        if (!name) {
            return res.status(400).json({ error: "Le nom de l'espace est requis" });
        }
        const count = await RailSpaceModel.countDocuments();
        const slug = await uniqueSlug(RailSpaceModel, name);
        const newSpace = new RailSpaceModel({
            name,
            slug,
            icon: icon || 'solar:planet-3-bold-duotone',
            color: color || '#6366f1',
            image: image || '',
            order: count,
            createdBy: req.user._id
        });
        await newSpace.save();
        const serialized = serializeRailSpace(newSpace);
        res.json({
            success: true,
            space: serialized,
            environment: serialized
        });
    } catch (error) {
        console.error("[Hierarchy] createRailSpace Error:", error);
        res.status(500).json({ error: "Failed to create space" });
    }
}

async function updateRailSpace(req, res) {
    try {
        const RailSpaceModel = await tenantCollection(req, "Environment");
        const { id, name, icon, color, image } = req.body;
        const update = {};
        if (name !== undefined) {
            const cleanName = String(name || '').trim();
            if (!cleanName) {
                return res.status(400).json({ error: "Le nom de l'espace est requis" });
            }
            update.name = cleanName;
        }
        if (icon !== undefined) update.icon = icon;
        if (color !== undefined) update.color = color;
        if (image !== undefined) update.image = image;
        const updated = await RailSpaceModel.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return res.status(404).json({ error: "Espace introuvable" });
        const serialized = serializeRailSpace(updated);
        res.json({ success: true, space: serialized, environment: serialized });
    } catch (error) {
        console.error("[Hierarchy] updateRailSpace Error:", error);
        res.status(500).json({ error: "Failed to update space" });
    }
}

async function collectFolderSubtreeIds(FolderModel, rootFolderIds) {
    const collected = new Set((rootFolderIds || []).map(normalizeId).filter(Boolean));
    let frontier = [...collected];

    while (frontier.length > 0) {
        const children = await FolderModel.find({ parentFolders: { $in: frontier } })
            .select('_id')
            .lean();
        frontier = [];

        for (const child of children) {
            const childId = normalizeId(child._id);
            if (childId && !collected.has(childId)) {
                collected.add(childId);
                frontier.push(childId);
            }
        }
    }

    return [...collected];
}

async function deleteRailSpaceHierarchy(SectionModel, FolderModel, ViewModel, railSpaceId) {
    const sections = await SectionModel.find({ environmentId: railSpaceId }).select('_id').lean();
    const sectionIds = sections.map(section => normalizeId(section._id)).filter(Boolean);

    const rootFolderConditions = [
        { environmentId: railSpaceId }
    ];
    if (sectionIds.length > 0) {
        rootFolderConditions.push({ spaces: { $in: sectionIds } });
    }

    const rootFolders = await FolderModel.find({ $or: rootFolderConditions }).select('_id').lean();
    const rootFolderIds = rootFolders.map(folder => normalizeId(folder._id)).filter(Boolean);
    const folderIds = await collectFolderSubtreeIds(FolderModel, rootFolderIds);

    const viewConditions = [
        { environmentId: railSpaceId }
    ];
    if (sectionIds.length > 0) {
        viewConditions.push({ spaces: { $in: sectionIds } });
    }
    if (folderIds.length > 0) {
        viewConditions.push({ folders: { $in: folderIds } });
    }

    const viewDelete = await ViewModel.deleteMany({ $or: viewConditions });
    const folderDelete = folderIds.length > 0
        ? await FolderModel.deleteMany({ _id: { $in: folderIds } })
        : { deletedCount: 0 };
    const sectionDelete = sectionIds.length > 0
        ? await SectionModel.deleteMany({ _id: { $in: sectionIds } })
        : { deletedCount: 0 };

    return {
        sections: sectionDelete.deletedCount || 0,
        folders: folderDelete.deletedCount || 0,
        views: viewDelete.deletedCount || 0
    };
}

async function deleteRailSpace(req, res) {
    try {
        const RailSpaceModel = await tenantCollection(req, "Environment");
        const SectionModel = await tenantCollection(req, "Space");
        const FolderModel = await tenantCollection(req, "Folder");
        const ViewModel = await tenantCollection(req, "View");
        const { id } = req.body;
        const count = await RailSpaceModel.countDocuments();
        if (count <= 1) {
            return res.status(400).json({ error: "Impossible de supprimer le dernier space" });
        }
        const railSpace = await RailSpaceModel.findById(id).lean();
        if (!railSpace) return res.status(404).json({ error: "Space introuvable" });

        const nextSpace = await RailSpaceModel.findOne({ _id: { $ne: id } }).sort({ order: 1 }).lean();
        const deleted = await deleteRailSpaceHierarchy(SectionModel, FolderModel, ViewModel, id);
        await RailSpaceModel.findByIdAndDelete(id);
        await normalizeRailSpaceOrders(RailSpaceModel);

        const nextSpaceId = nextSpace ? nextSpace._id.toString() : null;
        res.json({
            success: true,
            deletedSpaceId: id,
            deletedEnvironmentId: id,
            nextSpaceId,
            nextEnvironmentId: nextSpaceId,
            deleted
        });
    } catch (error) {
        console.error("[Hierarchy] deleteRailSpace Error:", error);
        res.status(500).json({ error: "Failed to delete space" });
    }
}

async function reorderRailSpaces(req, res) {
    try {
        const RailSpaceModel = await tenantCollection(req, "Environment");
        const { items } = req.body;
        if (!Array.isArray(items)) return res.status(400).json({ error: "Invalid format" });
        await Promise.all(items.map(item =>
            RailSpaceModel.findByIdAndUpdate(item.id, { order: item.order })
        ));
        res.json({ success: true });
    } catch (error) {
        console.error("[Hierarchy] reorderRailSpaces Error:", error);
        res.status(500).json({ error: "Reorder failed" });
    }
}

function folderDepth(folderId, folders, visited = new Set()) {
    const targetId = normalizeId(folderId);
    if (!targetId || visited.has(targetId)) return -1;
    visited.add(targetId);

    const folder = folders.find(f => normalizeId(f._id) === targetId);
    if (!folder) return -1;

    const parents = (folder.parentFolders || []).map(normalizeId).filter(Boolean);
    if (parents.length === 0) return 0;

    const parentDepths = parents.map(parentId => folderDepth(parentId, folders, new Set(visited)));
    const deepestParent = Math.max(...parentDepths);
    return deepestParent < 0 ? 0 : deepestParent + 1;
}

function maxFolderSubtreeOffset(folderId, folders, offset = 0, visited = new Set()) {
    const targetId = normalizeId(folderId);
    if (!targetId || visited.has(targetId)) return offset;
    visited.add(targetId);

    const childFolders = folders.filter(folder =>
        (folder.parentFolders || []).map(normalizeId).includes(targetId)
    );

    return childFolders.reduce((maxDepth, child) => {
        return Math.max(maxDepth, maxFolderSubtreeOffset(child._id, folders, offset + 1, new Set(visited)));
    }, offset);
}

async function canPlaceFolderContainer(FolderModel, itemId, itemType, parentId, parentType) {
    if (itemType === 'environment' && !isRootParentType(parentType)) return false;
    if (!isFolderContainerType(itemType || 'folder')) return true;

    const folders = await FolderModel.find({})
        .select('_id parentFolders spaces environmentId type')
        .lean();
    const parentDepth = isRootParentType(parentType)
        ? -1
        : isSectionType(parentType)
            ? 0
            : folderDepth(parentId, folders);
    const subtreeOffset = itemId ? maxFolderSubtreeOffset(itemId, folders) : 0;

    return parentDepth + 1 + subtreeOffset <= MAX_FOLDER_CONTAINER_DEPTH;
}

function emptyArrayCondition(field) {
    return {
        $or: [
            { [field]: { $exists: false } },
            { [field]: { $size: 0 } }
        ]
    };
}

function withAnd(base, ...conditions) {
    const cleanConditions = conditions.filter(Boolean);
    if (cleanConditions.length === 0) return base;
    return {
        ...base,
        $and: [
            ...(Array.isArray(base.$and) ? base.$and : []),
            ...cleanConditions
        ]
    };
}

function siblingFiltersForParent(parentId, parentType) {
    if (!parentId || !parentType) return {};

    if (isRootParentType(parentType)) {
        return {
            sections: { environmentId: parentId },
            folders: withAnd(
                { environmentId: parentId },
                emptyArrayCondition('spaces'),
                emptyArrayCondition('parentFolders')
            ),
            views: withAnd(
                { environmentId: parentId },
                emptyArrayCondition('spaces'),
                emptyArrayCondition('folders')
            )
        };
    }

    if (isSectionType(parentType)) {
        return {
            folders: withAnd({ spaces: parentId }, emptyArrayCondition('parentFolders')),
            views: withAnd({ spaces: parentId }, emptyArrayCondition('folders'))
        };
    }

    if (isFolderContainerType(parentType)) {
        return {
            folders: { parentFolders: parentId },
            views: { folders: parentId }
        };
    }

    return {};
}

function withOrderFrom(filter, order) {
    if (!filter || !Number.isInteger(order)) return filter;
    return { ...filter, order: { $gte: order } };
}

function parseInsertIndex(value) {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    return Math.max(0, Math.floor(parsed));
}

async function countSiblingsForParent(SectionModel, FolderModel, ViewModel, parentId, parentType) {
    const filters = siblingFiltersForParent(parentId, parentType);
    const counts = await Promise.all([
        filters.sections ? SectionModel.countDocuments(filters.sections) : Promise.resolve(0),
        filters.folders ? FolderModel.countDocuments(filters.folders) : Promise.resolve(0),
        filters.views ? ViewModel.countDocuments(filters.views) : Promise.resolve(0)
    ]);
    return counts.reduce((sum, count) => sum + count, 0);
}

async function bumpSiblingOrders(SectionModel, FolderModel, ViewModel, parentId, parentType, order) {
    if (!Number.isInteger(order)) return;

    const filters = siblingFiltersForParent(parentId, parentType);
    await Promise.all([
        filters.sections
            ? SectionModel.updateMany(withOrderFrom(filters.sections, order), { $inc: { order: 1 } })
            : Promise.resolve(),
        filters.folders
            ? FolderModel.updateMany(withOrderFrom(filters.folders, order), { $inc: { order: 1 } })
            : Promise.resolve(),
        filters.views
            ? ViewModel.updateMany(withOrderFrom(filters.views, order), { $inc: { order: 1 } })
            : Promise.resolve()
    ]);
}

async function normalizeRailSpaceOrders(RailSpaceModel) {
    const spaces = await RailSpaceModel.find({}).sort({ order: 1, _id: 1 }).select('_id').lean();
    await Promise.all(spaces.map((space, index) =>
        RailSpaceModel.updateOne({ _id: space._id }, { $set: { order: index } })
    ));
}

async function resolveRailSpaceIdForParent(SectionModel, FolderModel, parentId, parentType, visited = new Set()) {
    const targetId = normalizeId(parentId);
    if (!targetId) return null;

    if (isRootParentType(parentType)) return targetId;

    if (isSectionType(parentType)) {
        const section = await SectionModel.findById(targetId).select('environmentId').lean();
        return normalizeId(section?.environmentId) || null;
    }

    if (isFolderContainerType(parentType)) {
        if (visited.has(targetId)) return null;
        visited.add(targetId);

        const folder = await FolderModel.findById(targetId)
            .select('environmentId spaces parentFolders')
            .lean();
        if (!folder) return null;

        if (folder.environmentId) return normalizeId(folder.environmentId);

        const sectionId = normalizeId((folder.spaces || [])[0]);
        if (sectionId) {
            return resolveRailSpaceIdForParent(SectionModel, FolderModel, sectionId, 'section', visited);
        }

        const parentFolderId = normalizeId((folder.parentFolders || [])[0]);
        if (parentFolderId) {
            return resolveRailSpaceIdForParent(SectionModel, FolderModel, parentFolderId, 'folder', visited);
        }
    }

    return null;
}

async function moveDirectRailSpaceChildrenToParent(FolderModel, ViewModel, sourceSpaceId, targetParentId, targetParentType) {
    const directFoldersFilter = siblingFiltersForParent(sourceSpaceId, 'space-root').folders;
    const directViewsFilter = siblingFiltersForParent(sourceSpaceId, 'space-root').views;

    if (isSectionType(targetParentType)) {
        await Promise.all([
            FolderModel.updateMany(directFoldersFilter, {
                $set: { spaces: [targetParentId], parentFolders: [] },
                $unset: { environmentId: "" }
            }),
            ViewModel.updateMany(directViewsFilter, {
                $set: { spaces: [targetParentId], folders: [] },
                $unset: { environmentId: "" }
            })
        ]);
        return;
    }

    if (isFolderContainerType(targetParentType)) {
        await Promise.all([
            FolderModel.updateMany(directFoldersFilter, {
                $set: { parentFolders: [targetParentId], spaces: [] },
                $unset: { environmentId: "" }
            }),
            ViewModel.updateMany(directViewsFilter, {
                $set: { folders: [targetParentId], spaces: [] },
                $unset: { environmentId: "" }
            })
        ]);
    }
}

function serializeFolderItem(folder) {
    if (!folder) return null;
    const raw = typeof folder.toObject === 'function' ? folder.toObject() : folder;
    return {
        ...raw,
        id: raw._id ? raw._id.toString() : raw.id,
        type: raw.type || 'folder'
    };
}

function slugBase(name) {
    return String(name || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'item';
}

function recordListViewLink(req, entitySlug, view) {
    const safeEntitySlug = String(entitySlug || '').trim();
    const safeViewSlug = String(view?.slug || '').trim();
    if (!safeEntitySlug) return '#';
    if (safeViewSlug && !['undefined', 'null'].includes(safeViewSlug.toLowerCase())) {
        return `/account/${req.account_number}/record/${safeEntitySlug}/${safeViewSlug}`;
    }
    const viewId = view?._id || view?.id;
    const params = new URLSearchParams();
    if (viewId) params.set('viewId', String(viewId));
    if (view?.viewType === 'doc-listing') params.set('viewType', 'doc-listing');
    const query = params.toString();
    return `/account/${req.account_number}/record/${safeEntitySlug}/list${query ? `?${query}` : ''}`;
}

function validObjectIdString(value) {
    const id = String(value || '').trim();
    return /^[a-f0-9]{24}$/i.test(id) ? id : '';
}

// Generate a unique slug for a given model
async function uniqueSlug(Model, name) {
    const base = slugBase(name);
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
    listSpaces: listRailSpaces,
    listEnvironments: listRailSpaces,
    createRailSpace,
    createEnvironment: createRailSpace,
    updateRailSpace,
    updateEnvironment: updateRailSpace,
    deleteRailSpace,
    deleteEnvironment: deleteRailSpace,
    reorderRailSpaces,
    reorderEnvironments: reorderRailSpaces,

    // ═══════════════════════════════════════════
    // HIERARCHY (scoped to environment)
    // ═══════════════════════════════════════════
    getHierarchy: async (req, res) => {
        try {
            const SectionModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const EntityModel = await tenantCollection(req, "Entity");
            const ViewModel = await tenantCollection(req, "View");

            if (!SectionModel || !FolderModel || !EntityModel || !ViewModel) {
                return res.status(500).json({ error: "Models not ready" });
            }

            // New naming: rail item = Space, sidebar top item = Section.
            // Legacy storage still uses Environment for rail spaces and Space for sections.
            const railSpaceId = req.query.spaceId || req.query.environmentId;
            const newNames = usesNewHierarchyNames(req);
            const rootParentType = newNames ? 'space-root' : 'environment-root';
            const sectionItemType = newNames ? 'section' : 'space';
            const sectionQuery = railSpaceId ? { environmentId: railSpaceId } : {};

            const [rawSections, rawFolders, rawEntities, rawViews] = await Promise.all([
                SectionModel.find(sectionQuery).sort({ order: 1 }).lean(),
                FolderModel.find({}).sort({ order: 1 }).lean(),
                EntityModel.find({}).sort({ order: 1 }).lean(),
                ViewModel.find({}).sort({ order: 1 }).lean()
            ]);

            const sections = rawSections.map(s => ({
                ...s,
                id: s._id.toString(),
                environmentId: s.environmentId ? s.environmentId.toString() : null,
                spaceId: s.environmentId ? s.environmentId.toString() : null
            }));
            const folders = rawFolders.map(f => ({
                ...f,
                id: f._id.toString(),
                spaces: (f.spaces || []).map(id => id.toString()),
                environmentId: f.environmentId ? f.environmentId.toString() : null,
                spaceId: f.environmentId ? f.environmentId.toString() : null,
                parentFolders: (f.parentFolders || []).map(id => id.toString())
            }));
            const entities = rawEntities.map(e => ({ ...e, id: e._id.toString() }));
            const views = rawViews.map(v => ({
                ...v,
                id: v._id.toString(),
                spaces: (v.spaces || []).map(id => id.toString()),
                environmentId: v.environmentId ? v.environmentId.toString() : null,
                spaceId: v.environmentId ? v.environmentId.toString() : null,
                folders: (v.folders || []).map(id => id.toString())
            }));

            const buildTree = (parentId, parentType) => {
                const results = [];

                // Folders
                folders.forEach(f => {
                    let isChild = false;
                    if (isRootParentType(parentType) && f.environmentId === parentId && f.spaces.length === 0 && f.parentFolders.length === 0) isChild = true;
                    else if (isSectionType(parentType) && f.spaces.includes(parentId) && f.parentFolders.length === 0) isChild = true;
                    else if (isFolderContainerType(parentType) && f.parentFolders.includes(parentId)) isChild = true;

                    if (isChild) {
                        const storedType = f.type || 'folder';
                        const itemType = newNames && storedType === 'environment' ? 'folder' : storedType;
                        results.push({
                            type: itemType,
                            id: f.id,
                            name: f.name,
                            icon: f.icon || (storedType === 'environment' && !newNames ? 'solar:layers-minimalistic-line-duotone' : 'solar:folder-2-line-duotone'),
                            color: f.color,
                            order: f.order,
                            spaceId: f.spaceId || f.environmentId,
                            children: buildTree(f.id, itemType),
                            link: '#'
                        });
                    }
                });

                // Views (New "View" approach)
                views.forEach(v => {
                    let isChild = false;
                    if (isRootParentType(parentType) && v.environmentId === parentId && v.spaces.length === 0 && v.folders.length === 0) isChild = true;
                    else if (isSectionType(parentType) && v.spaces.includes(parentId) && v.folders.length === 0) isChild = true;
                    else if (isFolderContainerType(parentType) && v.folders.includes(parentId)) isChild = true;

                    if (isChild) {
                        if (v.viewType === 'hub') {
                            const entity = v.entity ? entities.find(e => e.id === v.entity.toString()) : null;
                            const entitySlug = entity ? entity.slug : v.slug;
                            const recordId = validObjectIdString(v.hubRecord);
                            results.push({
                                type: 'hub',
                                id: v.id,
                                name: v.name,
                                icon: v.icon || 'solar:widget-5-bold-duotone',
                                color: v.color,
                                order: v.order,
                                spaceId: v.spaceId || v.environmentId,
                                link: recordId ? `/account/${req.account_number}/record/${entitySlug}/${recordId}/overview` : '#',
                                entityId: v.entity,
                                entitySlug,
                                recordId,
                                viewType: 'hub'
                            });
                        } else if (v.viewType === 'cockpit') {
                            results.push({
                                type: 'cockpit',
                                id: v.id,
                                name: v.name,
                                icon: v.icon || 'solar:monitor-smartphone-bold-duotone',
                                color: v.color,
                                order: v.order,
                                spaceId: v.spaceId || v.environmentId,
                                link: `/account/${req.account_number}/cockpit/${v.cockpitId}`,
                                cockpitId: v.cockpitId,
                                viewType: 'cockpit'
                            });
                        } else {
                            // Regular entity view
                            const entity = entities.find(e => e.id === v.entity.toString());
                            const entitySlug = entity ? entity.slug : v.slug;
                            const viewLink = recordListViewLink(req, entitySlug, v);
                            results.push({
                                type: 'entity',
                                id: v.id,
                                name: v.name,
                                slug: v.slug,
                                icon: v.icon || (entity ? entity.icon : 'solar:database-bold'),
                                color: v.color,
                                order: v.order,
                                spaceId: v.spaceId || v.environmentId,
                                link: viewLink,
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

            const sectionItems = sections.map(s => ({
                type: sectionItemType,
                id: s.id,
                name: s.name,
                icon: s.icon,
                color: s.color,
                order: s.order,
                spaceId: s.spaceId || s.environmentId,
                environmentId: s.environmentId,
                children: buildTree(s.id, sectionItemType),
                link: '#'
            }));
            const directEnvironmentItems = railSpaceId ? buildTree(railSpaceId, rootParentType) : [];
            const hierarchy = [...sectionItems, ...directEnvironmentItems]
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            res.json({
                success: true,
                dbName: SectionModel.db.name,
                account: req.account_number,
                realSpacesCount: hierarchy.length,
                realSectionsCount: hierarchy.length,
                spaceId: railSpaceId || null,
                environmentId: railSpaceId || null,
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

            const SectionModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const ViewModel = await tenantCollection(req, "View");
            const EntityModel = await tenantCollection(req, "Entity");

            const ops = items.map(async (item) => {
                let Model;
                if (isSectionType(item.type)) Model = SectionModel;
                else if (isFolderContainerType(item.type)) Model = FolderModel;
                else if (['entity', 'cockpit', 'hub'].includes(item.type)) Model = ViewModel;

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
            const SectionModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const ViewModel = await tenantCollection(req, "View");
            const EntityModel = await tenantCollection(req, "Entity");

            if (isSectionType(itemType)) {
                if (!newParentId || !isRootParentType(newParentType)) {
                    return res.status(400).json({ error: "Les sections doivent rester au niveau racine" });
                }
                await SectionModel.updateOne(
                    { _id: itemId },
                    { $set: { environmentId: newParentId } }
                );
            } else if (['entity', 'cockpit', 'hub'].includes(itemType)) {
                // Determine if we are moving a View or a Legacy Entity
                let targetModel = ViewModel;
                let item = await ViewModel.findById(itemId);

                if (!item) {
                    // It's a legacy entity - convert to View on move or just update entity
                    targetModel = EntityModel;
                }

                if (oldParentId) {
                    await targetModel.updateOne(
                        { _id: itemId },
                        { $pull: { folders: oldParentId, spaces: oldParentId }, $unset: { environmentId: "" } }
                    );
                }
                if (newParentId) {
                    let update;
                    if (isRootParentType(newParentType)) {
                        update = { $set: { environmentId: newParentId } };
                    } else if (isFolderContainerType(newParentType)) {
                        update = { $addToSet: { folders: newParentId }, $unset: { environmentId: "" } };
                    } else {
                        update = { $addToSet: { spaces: newParentId }, $unset: { environmentId: "" } };
                    }
                    await targetModel.updateOne({ _id: itemId }, update);
                }
            } else if (isFolderContainerType(itemType)) {
                if (newParentId) {
                    const canPlace = await canPlaceFolderContainer(FolderModel, itemId, itemType, newParentId, newParentType);
                    if (!canPlace) {
                        return res.status(400).json({ error: "Impossible de placer un dossier à ce niveau" });
                    }
                }

                if (oldParentId) {
                    await FolderModel.updateOne(
                        { _id: itemId },
                        { $pull: { parentFolders: oldParentId, spaces: oldParentId }, $unset: { environmentId: "" } }
                    );
                }
                if (newParentId) {
                    let update;
                    if (isRootParentType(newParentType)) {
                        update = { $set: { environmentId: newParentId } };
                    } else if (isFolderContainerType(newParentType)) {
                        update = { $addToSet: { parentFolders: newParentId }, $unset: { environmentId: "" } };
                    } else {
                        update = { $addToSet: { spaces: newParentId }, $unset: { environmentId: "" } };
                    }
                    await FolderModel.updateOne({ _id: itemId }, update);
                }
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Move failed" });
        }
    },

    createSpace: async (req, res) => {
        const wantsSection = Boolean(
            req.body?.environmentId ||
            req.body?.spaceId ||
            req.body?.parentSpaceId ||
            req.body?.type === 'section' ||
            req.query?.kind === 'section'
        );
        return wantsSection ? module.exports.createSection(req, res) : createRailSpace(req, res);
    },

    createSection: async (req, res) => {
        try {
            const SectionModel = await tenantCollection(req, "Space");
            const { color, icon } = req.body;
            const spaceId = normalizeId(req.body.spaceId || req.body.parentSpaceId || req.body.environmentId);
            const name = String(req.body.name || '').trim();
            if (!name) {
                return res.status(400).json({ error: "Le nom de la section est requis" });
            }

            const countQuery = spaceId ? { environmentId: spaceId } : {};
            const count = await SectionModel.countDocuments(countQuery);
            const sectionData = {
                name,
                slug: await uniqueSlug(SectionModel, name),
                owner: req.user._id,
                color,
                icon,
                order: count
            };
            if (spaceId) sectionData.environmentId = spaceId;
            const newSection = new SectionModel(sectionData);
            await newSection.save();
            const section = serializeSection(newSection);
            res.json({
                ...section,
                success: true,
                section
            });
        } catch (error) {
            console.error("[Hierarchy] Create section failed:", error);
            res.status(500).json({ error: error.message || "Erreur lors de la creation de la section" });
        }
    },

    updateSpaceCompat: async (req, res) => {
        try {
            if (req.body?.type === 'section' || req.query?.kind === 'section') {
                return module.exports.updateSection(req, res);
            }
            const RailSpaceModel = await tenantCollection(req, "Environment");
            const railSpace = req.body?.id && mongoose.Types.ObjectId.isValid(req.body.id)
                ? await RailSpaceModel.findById(req.body.id).select('_id').lean()
                : null;
            return railSpace ? updateRailSpace(req, res) : module.exports.updateSection(req, res);
        } catch (error) {
            console.error("[Hierarchy] updateSpaceCompat Error:", error);
            res.status(500).json({ error: "Failed to update space or section" });
        }
    },

    updateSection: async (req, res) => {
        try {
            const SectionModel = await tenantCollection(req, "Space");
            const { id, name, icon, color } = req.body;
            const update = {};
            if (name !== undefined) {
                const cleanName = String(name || '').trim();
                if (!cleanName) {
                    return res.status(400).json({ error: "Le nom de la section est requis" });
                }
                update.name = cleanName;
            }
            if (icon !== undefined) update.icon = icon;
            if (color !== undefined) update.color = color;
            const updated = await SectionModel.findByIdAndUpdate(id, update, { new: true });
            if (!updated) return res.status(404).json({ error: "Section introuvable" });
            res.json({ success: true, section: serializeSection(updated) });
        } catch (error) {
            console.error("[Hierarchy] updateSection Error:", error);
            res.status(500).json({ error: "Failed to update section" });
        }
    },

    createFolder: async (req, res) => {
        const FolderModel = await tenantCollection(req, "Folder");
        const { name, parentId, parentType, type, icon, color } = req.body;
        const folderType = type || 'folder';
        const canPlace = await canPlaceFolderContainer(FolderModel, null, folderType, parentId, parentType);
        if (!canPlace) {
            return res.status(400).json({ error: "Impossible de créer un sous-dossier à ce niveau" });
        }
        // Basic order strategy: 0 (or count if scoped query, but 0 is fine for now as user can drag)
        const slug = await uniqueSlug(FolderModel, name);
        const folderData = { name, slug, createdBy: req.user._id, order: 0 };
        if (type) folderData.type = type;
        if (icon) folderData.icon = icon;
        if (color) folderData.color = color;
        if (isRootParentType(parentType)) folderData.environmentId = parentId;
        if (isSectionType(parentType)) folderData.spaces = [parentId];
        if (isFolderContainerType(parentType)) folderData.parentFolders = [parentId];
        const newFolder = new FolderModel(folderData);
        await newFolder.save();
        res.json(newFolder);
    },

    createEntity: async (req, res) => {
        try {
        const EntityModel = await tenantCollection(req, "Entity");
        const ViewModel = await tenantCollection(req, "View");
        const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
        
        const { name, nameSingular, namePlural, fields, parentId, parentType, viewType, icon, color, viewName, settings } = req.body;
        const entityName = String(name || '').trim();
        if (!entityName) {
            return res.status(400).json({ error: "Le nom de la collection est requis" });
        }

        const resolvedNameSingular = String(nameSingular || '').trim() || entityName;
        const resolvedNamePlural = String(namePlural || '').trim() || `${entityName}s`;
        const resolvedViewName = String(viewName || '').trim() || resolvedNamePlural || entityName;
        const slug = await uniqueSlug(EntityModel, entityName);
        const viewSlug = await uniqueSlug(ViewModel, resolvedViewName);
        const normalizedViewType = ['list', 'table', 'kanban', 'calendar'].includes(viewType) ? viewType : 'list';
        const settingsViewMode = normalizedViewType === 'kanban'
            ? 'kanban'
            : normalizedViewType === 'calendar'
                ? 'calendar'
                : 'table';
        const viewSettings = {
            ...(settings && typeof settings === 'object' ? settings : {}),
            viewMode: settings?.viewMode || settingsViewMode
        };

        // 1. Create suggested custom fields if provided
        const customFieldIds = [];
        if (Array.isArray(fields) && fields.length > 0) {
            for (const f of fields) {
                const fName = f.name;
                const fType = f.type || 'text';
                const fLabel = f.name;
                
                // Tech slug name for the field template
                const fSlug = fName.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '');

                const newFT = new FieldTemplateModel({
                    name: `${slug}_${fSlug}`,
                    label: fLabel,
                    type: fType,
                    required: false,
                    isCustom: true,
                    showOnQuickForm: true,
                    ui: {
                        placeholder: `Saisir ${fLabel.toLowerCase()}...`,
                        visible: true,
                        width: 'full',
                        order: customFieldIds.length
                    }
                });
                await newFT.save();
                customFieldIds.push(newFT._id);
            }
        }

        // 2. Create the Entity
        const newEntity = new EntityModel({
            name: entityName,
            nameSingular: resolvedNameSingular,
            namePlural: resolvedNamePlural,
            slug,
            icon,
            color,
            customFields: customFieldIds,
            createdBy: req.user._id
        });
        await newEntity.save();

        // If custom fields were created, update their entity references
        if (customFieldIds.length > 0) {
            await FieldTemplateModel.updateMany(
                { _id: { $in: customFieldIds } },
                { $push: { entities: newEntity._id } }
            );
        }

        // 3. Create the View
        const newView = new ViewModel({
            name: resolvedViewName,
            slug: viewSlug,
            entity: newEntity._id,
            icon,
            color,
            viewType: normalizedViewType,
            settings: viewSettings,
            createdBy: req.user._id,
            order: 0,
            spaces: isSectionType(parentType) && parentId ? [parentId] : [],
            environmentId: isRootParentType(parentType) && parentId ? parentId : null,
            folders: isFolderContainerType(parentType) && parentId ? [parentId] : []
        });
        await newView.save();
        res.json({
            ...newView.toObject(),
            id: newView._id.toString(),
            type: 'entity',
            entityId: newEntity._id.toString(),
            entitySlug: newEntity.slug,
            link: recordListViewLink(req, newEntity.slug, newView)
        });
        } catch (error) {
            console.error("[Hierarchy] Create entity failed:", error);
            res.status(500).json({ error: error.message || "Erreur lors de la creation de la collection" });
        }
    },

    renameItem: async (req, res) => {
        const { id, type, newName } = req.body;
        let Model;
        if (isSectionType(type)) Model = await tenantCollection(req, "Space");
        if (isFolderContainerType(type)) Model = await tenantCollection(req, "Folder");
        if (['entity', 'cockpit', 'hub'].includes(type)) {
            const ViewModel = await tenantCollection(req, "View");
            const view = await ViewModel.findById(id);
            Model = view ? ViewModel : await tenantCollection(req, "Entity");
        }
        if (Model) await Model.findByIdAndUpdate(id, { name: newName });
        if (type === 'hub' && Model) {
            const ViewModel = await tenantCollection(req, "View");
            const RecordModel = await tenantCollection(req, "Record");
            const view = await ViewModel.findById(id).lean();
            if (view?.hubRecord) {
                await RecordModel.findByIdAndUpdate(view.hubRecord, {
                    title: newName,
                    computedTitle: newName
                });
            }
        }
        res.json({ success: true });
    },

    updateIcon: async (req, res) => {
        const { id, type, icon, color } = req.body;
        let Model;
        if (isSectionType(type)) Model = await tenantCollection(req, "Space");
        if (isFolderContainerType(type)) Model = await tenantCollection(req, "Folder");
        if (['entity', 'cockpit', 'hub'].includes(type)) {
            const ViewModel = await tenantCollection(req, "View");
            const view = await ViewModel.findById(id);
            Model = view ? ViewModel : await tenantCollection(req, "Entity");
        }

        const update = {};
        if (icon !== undefined) update.icon = icon;
        if (color !== undefined) update.color = color;

        if (Model) await Model.findByIdAndUpdate(id, update);
        if (type === 'hub' && Model) {
            const ViewModel = await tenantCollection(req, "View");
            const RecordModel = await tenantCollection(req, "Record");
            const view = await ViewModel.findById(id).lean();
            if (view?.hubRecord) await RecordModel.findByIdAndUpdate(view.hubRecord, update);
        }
        res.json({ success: true });
    },

    deleteItem: async (req, res) => {
        const { id, type } = req.body;
        let Model;
        if (isSectionType(type)) Model = await tenantCollection(req, "Space");
        if (isFolderContainerType(type)) Model = await tenantCollection(req, "Folder");
        if (['entity', 'cockpit', 'hub'].includes(type)) {
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
                nameSingular: e.nameSingular,
                namePlural: e.namePlural,
                slug: e.slug,
                icon: e.icon,
                color: e.color,
                image: e.image || '',
                fieldsCount: (e.customFields || []).length
            }))
        });
    },

    searchRecords: async (req, res) => {
        try {
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");

            const entityId = String(req.query.entityId || '').trim();
            const q = String(req.query.q || '').trim();
            const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

            if (!entityId || !mongoose.Types.ObjectId.isValid(entityId)) {
                return res.status(400).json({ error: "Entité invalide" });
            }

            const entity = await EntityModel.findById(entityId).select('name slug icon color').lean();
            if (!entity) return res.status(404).json({ error: "Entité introuvable" });

            const query = { entityId };
            if (q) {
                const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escaped, 'i');
                query.$or = [
                    { title: regex },
                    { computedTitle: regex },
                    { 'customFields.value': regex }
                ];
            }

            const records = await RecordModel.find(query)
                .select('_id title computedTitle image icon color updatedAt createdAt')
                .sort({ updatedAt: -1, createdAt: -1 })
                .limit(limit)
                .lean();

            res.json({
                success: true,
                entity: {
                    id: entity._id.toString(),
                    name: entity.name,
                    slug: entity.slug,
                    icon: entity.icon,
                    color: entity.color
                },
                records: records.map(record => ({
                    id: record._id.toString(),
                    title: record.computedTitle || record.title || 'Sans titre',
                    image: record.image || '',
                    icon: record.icon || '',
                    color: record.color || '',
                    updatedAt: record.updatedAt,
                    createdAt: record.createdAt
                }))
            });
        } catch (error) {
            console.error("[Hierarchy] Search records failed:", error);
            res.status(500).json({ error: error.message || "Erreur lors de la recherche des records" });
        }
    },

    getEntityFields: async (req, res) => {
        try {
            const { entityId } = req.params;
            const quickFormOnly = req.query.quickForm === '1';
            const EntityModel = await tenantCollection(req, "Entity");
            const FieldTemplateModel = await tenantCollection(req, "FieldTemplate");
            const ClassificationModel = await tenantCollection(req, "Classification");
            const RecordModel = await tenantCollection(req, "Record");

            const entity = await EntityModel.findById(entityId).lean();

            if (!entity) {
                return res.status(404).json({ success: false, message: "Entity not found" });
            }

            const normalizeOptions = (options) => {
                if (!Array.isArray(options)) return [];
                return options.map(opt => {
                    if (typeof opt === 'string') return { id: opt, label: opt, value: opt };
                    return {
                        id: String(opt.id || opt._id || opt.value || opt.label || ''),
                        label: opt.label || opt.name || opt.value || '',
                        value: opt.value || opt.id || opt._id || opt.label || ''
                    };
                }).filter(opt => opt.id || opt.label);
            };
            const normalizeDistinctOptions = (values) => {
                const flattened = [];
                (values || []).forEach(value => {
                    if (Array.isArray(value)) flattened.push(...value);
                    else flattened.push(value);
                });
                const seen = new Set();
                return flattened
                    .map(value => {
                        if (value === undefined || value === null || value === '') return null;
                        if (typeof value === 'object') {
                            if (value.label || value.name || value.value) {
                                return String(value.label || value.name || value.value).trim();
                            }
                            return null;
                        }
                        return String(value).trim();
                    })
                    .filter(Boolean)
                    .filter(value => {
                        const key = value.toLowerCase();
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    })
                    .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
                    .slice(0, 80)
                    .map(value => ({ id: value, label: value, value }));
            };

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
                        options: normalizeOptions(ft.type_config?.options || ft.ui?.options || ft.options),
                        showOnQuickForm: showOnQF
                    });
                }
            }

            const distinctCustomOptions = {};
            if (fields.length > 0) {
                const fieldObjectIds = fields
                    .map(f => f.id)
                    .filter(id => mongoose.Types.ObjectId.isValid(id))
                    .map(id => new mongoose.Types.ObjectId(id));
                if (fieldObjectIds.length > 0) {
                    const distinctRows = await RecordModel.aggregate([
                        { $match: { entityId: entity._id } },
                        { $unwind: '$customFields' },
                        { $match: { 'customFields.field_id': { $in: fieldObjectIds } } },
                        { $group: { _id: '$customFields.field_id', values: { $addToSet: '$customFields.value' } } }
                    ]);
                    distinctRows.forEach(row => {
                        distinctCustomOptions[row._id.toString()] = normalizeDistinctOptions(row.values);
                    });
                }
            }
            const distinctStandardOptions = {};
            for (const standardField of ['status', 'published', 'isDraft']) {
                try {
                    distinctStandardOptions[standardField] = normalizeDistinctOptions(
                        await RecordModel.distinct(standardField, { entityId: entity._id })
                    );
                } catch (_) {
                    distinctStandardOptions[standardField] = [];
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

            const standardFilterFields = [
                { id: 'title', label: 'Titre', type: 'title', source: 'standard', icon: 'solar:text-bold' },
                { id: 'status', label: 'Statut technique', type: 'text', source: 'standard', icon: 'solar:tag-bold-duotone', options: distinctStandardOptions.status || [] },
                { id: 'description', label: 'Description', type: 'textarea', source: 'standard', icon: 'solar:document-text-bold-duotone' },
                { id: 'date', label: 'Date', type: 'date', source: 'standard', icon: 'solar:calendar-bold-duotone' },
                { id: 'createdAt', label: 'Date de création', type: 'date', source: 'standard', icon: 'solar:calendar-add-bold-duotone' },
                { id: 'updatedAt', label: 'Date de modification', type: 'date', source: 'standard', icon: 'solar:history-bold-duotone' }
            ];
            const customFilterFields = fields.map(f => ({
                id: f.id,
                label: f.label || f.name,
                type: f.type || 'text',
                source: 'custom',
                icon: f.icon,
                options: (f.options && f.options.length > 0) ? f.options : (distinctCustomOptions[f.id] || [])
            }));
            const classificationFilterFields = classifications.map(c => ({
                id: `classif:${c.id}`,
                label: c.name,
                type: 'classification',
                source: 'classification',
                icon: c.isStatus ? 'solar:flag-bold-duotone' : 'solar:tag-bold-duotone',
                options: c.options || []
            }));
            const relationFilterFields = relations.map(r => ({
                id: `rel:${r.key}`,
                label: r.label || 'Relation',
                type: 'relation',
                source: 'relation',
                icon: 'solar:link-bold-duotone'
            }));
            const filterFields = [
                ...standardFilterFields,
                ...customFilterFields,
                ...classificationFilterFields,
                ...relationFilterFields
            ];

            res.json({
                success: true,
                entity: {
                    id: entity._id.toString(),
                    name: entity.name,
                    slug: entity.slug,
                    icon: entity.icon || 'solar:database-broken',
                    fields,
                    filterFields,
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
        const { entityId, parentId, parentType, viewType, name, icon, color, filters, settings } = req.body;
        const entity = await EntityModel.findById(entityId);
        if (!entity) return res.status(404).json({ error: "Entity not found" });
        const viewName = String(name || '').trim() || entity.name;
        const newView = new ViewModel({
            name: viewName,
            slug: await uniqueSlug(ViewModel, viewName),
            entity: entity._id,
            icon: icon || entity.icon,
            color: color || entity.color,
            viewType: viewType || 'list',
            filters: sanitizeViewFilters(filters),
            settings: settings || {},
            createdBy: req.user._id,
            order: 0,
            spaces: isSectionType(parentType) && parentId ? [parentId] : [],
            environmentId: isRootParentType(parentType) && parentId ? parentId : null,
            folders: isFolderContainerType(parentType) && parentId ? [parentId] : []
        });
        await newView.save();
        res.json({
            success: true,
            view: {
                ...newView.toObject(),
                id: newView._id.toString(),
                type: 'entity',
                entityId: entity._id.toString(),
                entitySlug: entity.slug,
                link: recordListViewLink(req, entity.slug, newView)
            }
        });
    },

    createHub: async (req, res) => {
        try {
            const EntityModel = await tenantCollection(req, "Entity");
            const RecordModel = await tenantCollection(req, "Record");
            const ViewModel = await tenantCollection(req, "View");
            const FolderModel = await tenantCollection(req, "Folder");
            const SectionModel = await tenantCollection(req, "Space");
            const RailSpaceModel = await tenantCollection(req, "Environment");

            const hubName = String(req.body.name || '').trim();
            const parentId = String(req.body.parentId || '').trim();
            const parentType = String(req.body.parentType || '').trim();

            if (!hubName) return res.status(400).json({ error: "Le nom du hub est requis" });
            if (!parentId || ![...ROOT_PARENT_TYPES, ...SECTION_TYPES, ...FOLDER_CONTAINER_TYPES].includes(parentType)) {
                return res.status(400).json({ error: "Parent de hub invalide" });
            }
            if (!mongoose.Types.ObjectId.isValid(parentId)) {
                return res.status(400).json({ error: "Parent de hub invalide" });
            }

            let parent = null;
            let resolvedParentType = parentType;
            if (isRootParentType(parentType)) {
                parent = await RailSpaceModel.findById(parentId).lean();
                resolvedParentType = parentType;
            } else if (isSectionType(parentType)) {
                parent = await SectionModel.findById(parentId).lean();
                if (!parent) {
                    parent = await FolderModel.findById(parentId).lean();
                    if (parent) resolvedParentType = parent.type || 'folder';
                }
            } else {
                parent = await FolderModel.findById(parentId).lean();
                if (!parent) {
                    parent = await SectionModel.findById(parentId).lean();
                    if (parent) resolvedParentType = parentType === 'section' ? 'section' : 'space';
                }
            }
            if (!parent) return res.status(400).json({ error: "Dossier, section ou espace introuvable pour créer ce hub" });

            let entity = null;
            let record = null;
            const requestedEntityId = String(req.body.entityId || '').trim();
            const requestedRecordId = String(req.body.recordId || '').trim();
            if (req.body.entityMode === 'record' && !requestedRecordId) {
                return res.status(400).json({ error: "Record existant requis" });
            }

            if (requestedRecordId) {
                if (!mongoose.Types.ObjectId.isValid(requestedRecordId)) {
                    return res.status(400).json({ error: "Record existant invalide" });
                }
                record = await RecordModel.findById(requestedRecordId);
                if (!record) {
                    return res.status(404).json({ error: "Record existant introuvable" });
                }
                const recordEntityId = normalizeId(record.entityId);
                if (requestedEntityId && requestedEntityId !== recordEntityId) {
                    return res.status(400).json({ error: "Le record ne correspond pas à l'entité sélectionnée" });
                }
                entity = await EntityModel.findById(record.entityId);
                if (!entity) {
                    return res.status(404).json({ error: "Entité du record introuvable" });
                }
            } else if (requestedEntityId) {
                if (!mongoose.Types.ObjectId.isValid(requestedEntityId)) {
                    return res.status(400).json({ error: "Entité existante invalide" });
                }
                entity = await EntityModel.findById(requestedEntityId);
                if (!entity) {
                    return res.status(404).json({ error: "Entité existante introuvable" });
                }
            }

            if (!entity) {
                const requestedEntityName = String(req.body.entityName || '').trim();
                const createNewEntity = req.body.createNewEntity === true || req.body.entityMode === 'new';
                const parentEntityHint = parent?.name ? `Ma ${String(parent.name).toLowerCase()}` : '';
                const entityNameCandidates = (requestedEntityName
                    ? [requestedEntityName]
                    : [parent?.name || '', parentEntityHint, 'Hubs'])
                    .map(name => String(name || '').trim())
                    .filter(Boolean);
                const entityName = entityNameCandidates[0];

                if (!createNewEntity) {
                    for (const candidateName of entityNameCandidates) {
                        const candidateSlug = slugBase(candidateName);
                        const escapedName = candidateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        entity = await EntityModel.findOne({ slug: candidateSlug });
                        if (!entity) {
                            entity = await EntityModel.findOne({ name: new RegExp(`^${escapedName}$`, 'i') });
                        }
                        if (entity) break;
                    }
                }

                if (!entity) {
                    entity = new EntityModel({
                        name: entityName,
                        nameSingular: entityName,
                        namePlural: entityName,
                        slug: await uniqueSlug(EntityModel, entityName),
                        icon: req.body.entityIcon || 'solar:users-group-rounded-bold-duotone',
                        color: req.body.entityColor || '#8b5cf6',
                        image: req.body.entityImage || '',
                        enabledStandardFields: ['title', 'description'],
                        referenceTitleTokens: [{ t: 'field', id: 'title' }],
                        createdBy: req.user._id
                    });
                    await entity.save();
                }
            }

            const hubIcon = req.body.icon || record?.icon || entity.icon || 'solar:widget-5-bold-duotone';
            const hubColor = req.body.color || record?.color || entity.color || '#8b5cf6';
            const visibleModules = Array.isArray(req.body.visibleModules)
                ? req.body.visibleModules.map(key => String(key)).filter(key => RECORD_MODULE_KEYS.includes(key))
                : [];
            const hiddenRecordModules = visibleModules.length > 0
                ? RECORD_MODULE_KEYS.filter(key => key !== 'overview' && !visibleModules.includes(key))
                : [];
            if (!record) {
                const recordData = {
                    entityId: entity._id,
                    title: hubName,
                    computedTitle: hubName,
                    image: req.body.entityImage || entity.image || '',
                    icon: hubIcon,
                    color: hubColor,
                    published: true,
                    status: 'published',
                    createdBy: req.user._id
                };

                try {
                    const denormService = require('../services/record-denorm.service');
                    const denorm = await denormService.computeDenorm(recordData, entity.toObject ? entity.toObject() : entity, RecordModel, EntityModel);
                    Object.assign(recordData, denorm);
                } catch (denormErr) {
                    recordData.computedTitle = recordData.computedTitle || hubName;
                }

                record = new RecordModel(recordData);
                await record.save();
            }

            const view = new ViewModel({
                name: hubName,
                slug: await uniqueSlug(ViewModel, hubName),
                entity: entity._id,
                hubRecord: record._id,
                icon: hubIcon,
                color: hubColor,
                viewType: 'hub',
                settings: { hiddenRecordModules },
                createdBy: req.user._id,
                order: 0,
                spaces: isSectionType(resolvedParentType) ? [parentId] : [],
                environmentId: isRootParentType(resolvedParentType) ? parentId : null,
                folders: isFolderContainerType(resolvedParentType) ? [parentId] : []
            });
            await view.save();

            res.json({
                success: true,
                hub: {
                    id: view._id.toString(),
                    name: view.name,
                    entityId: entity._id.toString(),
                    entitySlug: entity.slug,
                    recordId: record._id.toString(),
                    link: `/account/${req.account_number}/record/${entity.slug}/${record._id}/overview`
                }
            });
        } catch (error) {
            console.error("[Hierarchy] Create hub failed:", error);
            res.status(500).json({ error: error.message || "Erreur lors de la creation du hub" });
        }
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
            spaces: isSectionType(parentType) ? [parentId] : [],
            environmentId: isRootParentType(parentType) ? parentId : null,
            folders: isFolderContainerType(parentType) ? [parentId] : []
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
            const emptyResult = { success: false, environmentId: null, spaceId: null };
            const foundResult = (id) => ({ success: true, environmentId: id.toString(), spaceId: id.toString() });
            if (!entitySlug) return res.json(emptyResult);

            const EntityModel = await tenantCollection(req, "Entity");
            const ViewModel = await tenantCollection(req, "View");
            const SpaceModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");

            // 1. Find the entity by slug
            const entity = await EntityModel.findOne({ slug: entitySlug }).lean();
            if (!entity) return res.json(emptyResult);

            // 2. Find views that reference this entity
            const views = await ViewModel.find({ entity: entity._id }).lean();
            if (!views.length) return res.json(emptyResult);

            // 3. For each view, trace up to find the space → environment
            for (const view of views) {
                // Check if the view is directly in an environment (shown as Espace in the UI)
                if (view.environmentId) {
                    return res.json(foundResult(view.environmentId));
                }

                // Check if the view is directly in a space
                if (view.spaces && view.spaces.length > 0) {
                    const space = await SpaceModel.findById(view.spaces[0]).lean();
                    if (space && space.environmentId) {
                        return res.json(foundResult(space.environmentId));
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

                        // Direct folder under an environment
                        if (folder.environmentId) {
                            return res.json(foundResult(folder.environmentId));
                        }

                        // If this folder is in a space, find the environment
                        if (folder.spaces && folder.spaces.length > 0) {
                            const space = await SpaceModel.findById(folder.spaces[0]).lean();
                            if (space && space.environmentId) {
                                return res.json(foundResult(space.environmentId));
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

            return res.json(emptyResult);
        } catch (error) {
            console.error("[Hierarchy] findEnvironmentByEntitySlug Error:", error);
            res.status(500).json({ error: "Internal error" });
        }
    },

    findSpaceByEntitySlug: async (req, res) => module.exports.findEnvironmentByEntitySlug(req, res),

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

            const RailSpaceModel = await tenantCollection(req, "Environment");
            const SectionModel = await tenantCollection(req, "Space");
            const EntityModel = await tenantCollection(req, "Entity");
            const ViewModel = await tenantCollection(req, "View");
            const ClassificationModel = await tenantCollection(req, "Classification");

            // 1. Create rail Space (legacy collection: Environment)
            const envCount = await RailSpaceModel.countDocuments();
            const envSlug = await uniqueSlug(RailSpaceModel, envName || template.name);
            const newEnv = new RailSpaceModel({
                name: envName || template.name,
                slug: envSlug,
                icon: envIcon || template.icon,
                color: envColor || template.color,
                image: envImage || '',
                order: envCount,
                createdBy: req.user._id
            });
            await newEnv.save();

            // 2. Create Section inside the rail Space (legacy collection: Space)
            const spaceCount = await SectionModel.countDocuments({ environmentId: newEnv._id });
            const spaceSlug = await uniqueSlug(SectionModel, template.name);
            const newSpace = new SectionModel({
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

            const railSpace = serializeRailSpace(newEnv);
            const section = serializeSection(newSpace);
            res.json({
                success: true,
                space: railSpace,
                environment: railSpace,
                section,
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
    },

    /**
     * Move a rail Space into the sidebar hierarchy.
     * Root drop => Section inside the target rail Space.
     * Section/folder drop => Folder inside that container.
     */
    demoteSpaceToHierarchy: async (req, res) => {
        try {
            const sourceSpaceId = normalizeId(req.body.spaceId || req.body.environmentId || req.body.id);
            let parentId = normalizeId(req.body.parentId || req.body.newParentId || req.body.targetParentId);
            let parentType = req.body.parentType || req.body.newParentType || req.body.targetParentType;
            const targetSpaceHint = normalizeId(
                req.body.targetSpaceId ||
                req.body.targetEnvironmentId ||
                req.body.activeSpaceId ||
                req.body.activeEnvironmentId
            );

            if (!sourceSpaceId) {
                return res.status(400).json({ error: "spaceId is required" });
            }

            if ((!parentId || !parentType) && targetSpaceHint) {
                parentId = targetSpaceHint;
                parentType = 'space-root';
            }

            if (parentType === 'root') parentType = 'space-root';
            if (parentType === 'section') parentType = 'space';

            const RailSpaceModel = await tenantCollection(req, "Environment");
            const SectionModel = await tenantCollection(req, "Space");
            const FolderModel = await tenantCollection(req, "Folder");
            const ViewModel = await tenantCollection(req, "View");

            const [sourceSpace, railSpaceCount] = await Promise.all([
                RailSpaceModel.findById(sourceSpaceId),
                RailSpaceModel.countDocuments()
            ]);
            if (!sourceSpace) return res.status(404).json({ error: "Space not found" });
            if (railSpaceCount <= 1) {
                return res.status(400).json({ error: "Impossible de déplacer le dernier espace" });
            }

            const resolvedTargetSpaceId = await resolveRailSpaceIdForParent(
                SectionModel,
                FolderModel,
                parentId,
                parentType
            );
            const targetSpaceId = resolvedTargetSpaceId || targetSpaceHint;
            if (!targetSpaceId) {
                return res.status(400).json({ error: "Target space not found" });
            }
            if (normalizeId(targetSpaceId) === sourceSpaceId) {
                return res.status(400).json({ error: "Impossible de déplacer un espace dans lui-même" });
            }
            if (targetSpaceHint && resolvedTargetSpaceId && normalizeId(targetSpaceHint) !== normalizeId(resolvedTargetSpaceId)) {
                return res.status(400).json({ error: "La cible ne correspond pas à l'espace actif" });
            }

            const targetSpace = await RailSpaceModel.findById(targetSpaceId).select('_id').lean();
            if (!targetSpace) return res.status(404).json({ error: "Target space not found" });

            const createAsSection = isRootParentType(parentType);
            if (createAsSection) {
                parentId = normalizeId(targetSpace._id);
                parentType = 'space-root';
            } else if (!isSectionType(parentType) && !isFolderContainerType(parentType)) {
                return res.status(400).json({ error: "Invalid target parent" });
            } else if (!resolvedTargetSpaceId) {
                return res.status(404).json({ error: "Target parent not found" });
            }

            if (!createAsSection) {
                const canPlace = await canPlaceFolderContainer(FolderModel, null, 'folder', parentId, parentType);
                if (!canPlace) {
                    return res.status(400).json({ error: "Impossible de placer un dossier à ce niveau" });
                }
            }

            const insertIndex = parseInsertIndex(req.body.insertIndex ?? req.body.order);
            const siblingParentId = createAsSection ? normalizeId(targetSpace._id) : parentId;
            const siblingParentType = createAsSection ? 'space-root' : parentType;
            const siblingCount = await countSiblingsForParent(
                SectionModel,
                FolderModel,
                ViewModel,
                siblingParentId,
                siblingParentType
            );
            const order = insertIndex === null
                ? siblingCount
                : Math.max(0, Math.min(insertIndex, siblingCount));
            await bumpSiblingOrders(
                SectionModel,
                FolderModel,
                ViewModel,
                siblingParentId,
                siblingParentType,
                order
            );

            let createdItem;
            let targetContainerId;
            let targetContainerType;
            let sourceSections = await SectionModel.find({ environmentId: sourceSpace._id }).sort({ order: 1 });
            let shouldConvertSourceSections = true;

            const reusableSourceSection = createAsSection && sourceSections.length === 1
                && String(sourceSections[0].name || '').trim() === String(sourceSpace.name || '').trim()
                ? sourceSections[0]
                : null;

            if (reusableSourceSection) {
                reusableSourceSection.environmentId = targetSpace._id;
                reusableSourceSection.order = order;
                reusableSourceSection.icon = reusableSourceSection.icon || sourceSpace.icon;
                reusableSourceSection.color = reusableSourceSection.color || sourceSpace.color;
                await reusableSourceSection.save();

                targetContainerId = reusableSourceSection._id;
                targetContainerType = 'section';
                createdItem = {
                    ...serializeSection(reusableSourceSection),
                    type: 'space'
                };
                shouldConvertSourceSections = false;
            } else if (createAsSection) {
                const section = new SectionModel({
                    name: sourceSpace.name,
                    slug: await uniqueSlug(SectionModel, sourceSpace.name),
                    owner: req.user._id,
                    icon: sourceSpace.icon,
                    color: sourceSpace.color,
                    order,
                    environmentId: targetSpace._id
                });
                await section.save();

                targetContainerId = section._id;
                targetContainerType = 'section';
                createdItem = {
                    ...serializeSection(section),
                    type: 'space'
                };
            } else {
                const folderData = {
                    name: sourceSpace.name,
                    slug: await uniqueSlug(FolderModel, sourceSpace.name),
                    type: 'folder',
                    createdBy: req.user._id,
                    icon: sourceSpace.icon || 'solar:folder-2-line-duotone',
                    color: sourceSpace.color,
                    order
                };
                if (isSectionType(parentType)) folderData.spaces = [parentId];
                if (isFolderContainerType(parentType)) folderData.parentFolders = [parentId];

                const folder = new FolderModel(folderData);
                await folder.save();

                targetContainerId = folder._id;
                targetContainerType = 'folder';
                createdItem = serializeFolderItem(folder);
            }

            await moveDirectRailSpaceChildrenToParent(
                FolderModel,
                ViewModel,
                sourceSpace._id,
                targetContainerId,
                targetContainerType
            );

            if (shouldConvertSourceSections) for (const section of sourceSections) {
                const convertedFolder = new FolderModel({
                    name: section.name,
                    slug: await uniqueSlug(FolderModel, section.name),
                    type: 'folder',
                    createdBy: req.user._id,
                    icon: section.icon || 'solar:folder-2-line-duotone',
                    color: section.color,
                    order: section.order || 0,
                    spaces: targetContainerType === 'section' ? [targetContainerId] : [],
                    parentFolders: targetContainerType === 'folder' ? [targetContainerId] : []
                });
                await convertedFolder.save();

                await Promise.all([
                    FolderModel.updateMany(
                        { spaces: section._id },
                        {
                            $pull: { spaces: section._id },
                            $addToSet: { parentFolders: convertedFolder._id },
                            $unset: { environmentId: "" }
                        }
                    ),
                    ViewModel.updateMany(
                        { spaces: section._id },
                        {
                            $pull: { spaces: section._id },
                            $addToSet: { folders: convertedFolder._id },
                            $unset: { environmentId: "" }
                        }
                    )
                ]);
                await SectionModel.deleteOne({ _id: section._id });
            }

            await RailSpaceModel.deleteOne({ _id: sourceSpace._id });
            await normalizeRailSpaceOrders(RailSpaceModel);

            res.json({
                success: true,
                item: createdItem,
                section: createAsSection ? createdItem : null,
                folder: createAsSection ? null : createdItem,
                removedSpaceId: sourceSpaceId,
                removedEnvironmentId: sourceSpaceId,
                targetSpaceId: normalizeId(targetSpace._id),
                targetEnvironmentId: normalizeId(targetSpace._id)
            });
        } catch (error) {
            console.error("[Hierarchy] demoteSpaceToHierarchy Error:", error);
            res.status(500).json({ error: "Failed to move space into sidebar" });
        }
    },

    demoteEnvironmentToHierarchy: async (req, res) => module.exports.demoteSpaceToHierarchy(req, res),

    /**
     * Promote a Section to a rail Space.
     * Legacy storage: creates an Environment and attaches the existing Space document to it.
     */
    promoteSectionToSpace: async (req, res) => {
        try {
            const sectionId = req.body.sectionId || req.body.spaceId;
            if (!sectionId) return res.status(400).json({ error: "sectionId is required" });

            const RailSpaceModel = await tenantCollection(req, "Environment");
            const SectionModel = await tenantCollection(req, "Space");

            const originalSection = await SectionModel.findById(sectionId);
            if (!originalSection) return res.status(404).json({ error: "Section not found" });

            const spaceCount = await RailSpaceModel.countDocuments();
            const spaceSlug = await uniqueSlug(RailSpaceModel, originalSection.name);
            const newSpace = new RailSpaceModel({
                name: originalSection.name,
                slug: spaceSlug,
                icon: originalSection.icon || 'solar:planet-3-bold-duotone',
                color: originalSection.color || '#6366f1',
                order: spaceCount,
                createdBy: req.user._id
            });
            await newSpace.save();

            originalSection.environmentId = newSpace._id;
            await originalSection.save();

            const railSpace = serializeRailSpace(newSpace);
            console.log(`[Hierarchy] Promoted section "${originalSection.name}" to space "${newSpace.name}"`);

            res.json({
                success: true,
                space: railSpace,
                environment: railSpace,
                section: serializeSection(originalSection)
            });
        } catch (error) {
            console.error("[Hierarchy] promoteSectionToSpace Error:", error);
            res.status(500).json({ error: "Failed to promote section to space" });
        }
    },

    promoteSpaceToEnvironment: async (req, res) => module.exports.promoteSectionToSpace(req, res),

    /**
     * Promote a Folder to a rail Space.
     * Legacy storage: creates an Environment, moves the folder children to it, then deletes the folder.
     */
    promoteFolderToSpace: async (req, res) => {
        try {
            const { folderId } = req.body;
            if (!folderId) return res.status(400).json({ error: "folderId is required" });

            const RailSpaceModel = await tenantCollection(req, "Environment");
            const FolderModel = await tenantCollection(req, "Folder");
            const ViewModel = await tenantCollection(req, "View");

            const originalFolder = await FolderModel.findById(folderId);
            if (!originalFolder) return res.status(404).json({ error: "Folder not found" });

            const spaceCount = await RailSpaceModel.countDocuments();
            const spaceSlug = await uniqueSlug(RailSpaceModel, originalFolder.name);
            const newSpace = new RailSpaceModel({
                name: originalFolder.name,
                slug: spaceSlug,
                icon: originalFolder.icon || 'solar:planet-3-bold-duotone',
                color: originalFolder.color || '#6366f1',
                order: spaceCount,
                createdBy: req.user._id
            });
            await newSpace.save();

            await FolderModel.updateMany(
                { parentFolders: folderId },
                { $pull: { parentFolders: folderId }, $set: { environmentId: newSpace._id } }
            );
            await ViewModel.updateMany(
                { folders: folderId },
                { $pull: { folders: folderId }, $set: { environmentId: newSpace._id } }
            );
            await FolderModel.findByIdAndDelete(folderId);

            const railSpace = serializeRailSpace(newSpace);
            console.log(`[Hierarchy] Promoted folder "${originalFolder.name}" to space "${newSpace.name}"`);

            res.json({
                success: true,
                space: railSpace,
                environment: railSpace
            });
        } catch (error) {
            console.error("[Hierarchy] promoteFolderToSpace Error:", error);
            res.status(500).json({ error: "Failed to promote folder to space" });
        }
    },

    promoteFolderToEnvironment: async (req, res) => module.exports.promoteFolderToSpace(req, res)
};

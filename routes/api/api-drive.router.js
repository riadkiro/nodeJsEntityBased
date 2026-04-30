/**
 * Global Drive API Router
 * 
 * Aggregates all attachments across all records in the tenant,
 * grouped by Entity > Record > Folder.
 * 
 * Routes:
 *   GET /api/drive          - Get all attachments grouped by entity/record
 *   GET /api/drive/stats    - Get storage stats
 */

const express = require('express');
const router = express.Router();
const { tenantCollection } = require('../../middleware/tenant');

/**
 * Format file size for display
 */
function formatSize(bytes) {
    if (!bytes) return '0 o';
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
}

/**
 * GET /api/drive
 * Returns all attachments grouped by entity > record
 * Query params:
 *   ?search=     - Filter by filename
 *   ?category=   - Filter by category (image, pdf, word, excel, video, audio, other)
 *   ?entityId=   - Filter by entity
 *   ?generated=  - Filter generated docs (true/false)
 */
router.get('/drive', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');

        const { search, category, entityId, generated } = req.query;

        // Build record query
        const recordQuery = { 'attachments.0': { $exists: true } }; // Only records with attachments
        if (entityId) {
            const mongoose = require('mongoose');
            recordQuery.entityId = new mongoose.Types.ObjectId(entityId);
        }

        // Fetch all records with attachments
        const records = await Record.find(recordQuery)
            .select('title computedTitle entityId attachments driveFolders')
            .lean();

        // Fetch all entities for labeling
        const entityIds = [...new Set(records.map(r => String(r.entityId)))];
        const entities = await Entity.find({ _id: { $in: entityIds } })
            .select('name nameSingular slug icon color')
            .lean();
        const entityMap = {};
        entities.forEach(e => { entityMap[String(e._id)] = e; });

        // Build grouped structure
        const grouped = {};
        let totalFiles = 0;
        let totalSize = 0;
        const categoryCounts = {};

        records.forEach(record => {
            const eId = String(record.entityId);
            const entity = entityMap[eId];
            if (!entity) return;

            const recordTitle = record.computedTitle || record.title || 'Sans titre';

            // Filter attachments
            let attachments = record.attachments || [];
            if (search) {
                const q = search.toLowerCase();
                attachments = attachments.filter(a =>
                    (a.originalName || '').toLowerCase().includes(q) ||
                    (a.folder || '').toLowerCase().includes(q)
                );
            }
            if (category) {
                attachments = attachments.filter(a => a.category === category);
            }
            if (generated === 'true') {
                attachments = attachments.filter(a => a.isGenerated);
            } else if (generated === 'false') {
                attachments = attachments.filter(a => !a.isGenerated);
            }

            if (attachments.length === 0) return;

            // Group by entity
            if (!grouped[eId]) {
                grouped[eId] = {
                    entityId: eId,
                    entityName: entity.name,
                    entitySlug: entity.slug,
                    entityIcon: entity.icon || 'solar:database-bold-duotone',
                    entityColor: entity.color || '#4361ee',
                    records: [],
                    fileCount: 0,
                    totalSize: 0
                };
            }

            // Build record entry with folders
            const folders = {};
            const rootFiles = [];

            attachments.forEach(att => {
                const file = {
                    _id: att._id,
                    filename: att.filename,
                    originalName: att.originalName,
                    mimeType: att.mimeType,
                    size: att.size,
                    sizeFormatted: formatSize(att.size),
                    category: att.category || 'other',
                    folder: att.folder || '',
                    isGenerated: att.isGenerated || false,
                    generatedFromName: att.generatedFromName,
                    url: `/account/${req.account_number}/uploads/attachments/${att.filename}`,
                    uploadedAt: att.uploadedAt,
                    recordId: record._id,
                    recordTitle: recordTitle,
                    entityName: entity.name,
                    entitySlug: entity.slug
                };

                totalFiles++;
                totalSize += att.size || 0;
                categoryCounts[file.category] = (categoryCounts[file.category] || 0) + 1;

                if (att.folder) {
                    if (!folders[att.folder]) folders[att.folder] = [];
                    folders[att.folder].push(file);
                } else {
                    rootFiles.push(file);
                }
            });

            // Include empty custom drive folders
            (record.driveFolders || []).forEach(f => {
                if (!folders[f]) folders[f] = [];
            });

            const recordEntry = {
                recordId: record._id,
                recordTitle: recordTitle,
                folders: Object.entries(folders).map(([name, files]) => ({
                    name,
                    files,
                    fileCount: files.length
                })),
                rootFiles: rootFiles,
                fileCount: attachments.length,
                totalSize: attachments.reduce((sum, a) => sum + (a.size || 0), 0)
            };

            grouped[eId].records.push(recordEntry);
            grouped[eId].fileCount += attachments.length;
            grouped[eId].totalSize += recordEntry.totalSize;
        });

        // Sort entities by name
        const result = Object.values(grouped).sort((a, b) => a.entityName.localeCompare(b.entityName));

        // Sort records within each entity
        result.forEach(entity => {
            entity.records.sort((a, b) => a.recordTitle.localeCompare(b.recordTitle));
            entity.totalSizeFormatted = formatSize(entity.totalSize);
        });

        res.json({
            success: true,
            entities: result,
            stats: {
                totalFiles,
                totalSize,
                totalSizeFormatted: formatSize(totalSize),
                categoryCounts,
                entityCount: result.length,
                recordCount: result.reduce((sum, e) => sum + e.records.length, 0)
            }
        });
    } catch (error) {
        console.error('[Global Drive] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

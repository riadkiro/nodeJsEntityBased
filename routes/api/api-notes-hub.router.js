/**
 * Notes Hub API Router
 * 
 * Aggregates all notes across all entities/records for the global Notes Hub.
 * Pattern identical to Chat Hub and Agenda Hub.
 * 
 * Endpoints:
 *   GET /api/notes-hub — List all notes grouped by entity → record
 */

const express = require('express');
const router = express.Router();
const { tenantCollection } = require('../../middleware/tenant');

// ═══════════════════════════════════════════
// GET /api/notes-hub
// ═══════════════════════════════════════════
router.get('/', async (req, res) => {
    try {
        const RecordNote = await tenantCollection(req, 'RecordNote');
        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');

        if (!RecordNote) return res.json({ success: true, entities: [], totalNotes: 0 });

        // Fetch all non-archived notes
        const allNotes = await RecordNote.find({ archived: { $ne: true } })
            .sort({ pinned: -1, updatedAt: -1 })
            .lean();

        if (allNotes.length === 0) {
            return res.json({ success: true, entities: [], totalNotes: 0 });
        }

        // Collect unique recordIds and entityIds
        const recordIds = [...new Set(allNotes.map(n => n.recordId?.toString()).filter(Boolean))];
        const entityIds = [...new Set(allNotes.map(n => n.entityId?.toString()).filter(Boolean))];

        // Fetch parent records
        const records = recordIds.length > 0
            ? await Record.find({ _id: { $in: recordIds } })
                .select('title computedTitle entityId')
                .lean()
            : [];

        // Fetch entities
        const entities = entityIds.length > 0
            ? await Entity.find({ _id: { $in: entityIds } })
                .select('name slug icon color')
                .lean()
            : [];

        // Also get entities from records that might not be in note.entityId
        const recordEntityIds = [...new Set(records.map(r => r.entityId?.toString()).filter(Boolean))];
        const missingEntityIds = recordEntityIds.filter(id => !entityIds.includes(id));
        const extraEntities = missingEntityIds.length > 0
            ? await Entity.find({ _id: { $in: missingEntityIds } })
                .select('name slug icon color')
                .lean()
            : [];

        // Build lookups
        const entityLookup = {};
        [...entities, ...extraEntities].forEach(e => {
            entityLookup[e._id.toString()] = e;
        });

        const recordLookup = {};
        records.forEach(r => {
            recordLookup[r._id.toString()] = r;
        });

        // Group notes by entity → record
        const entityMap = {};

        allNotes.forEach(note => {
            const recordId = note.recordId?.toString();
            if (!recordId) return;

            const record = recordLookup[recordId];
            const entityId = note.entityId?.toString() || record?.entityId?.toString() || 'unknown';
            const entityInfo = entityLookup[entityId] || {};

            if (!entityMap[entityId]) {
                entityMap[entityId] = {
                    entityId,
                    entityName: entityInfo.name || 'Inconnu',
                    entitySlug: entityInfo.slug || '',
                    entityIcon: entityInfo.icon || 'solar:folder-bold-duotone',
                    entityColor: entityInfo.color || '#8b5cf6',
                    records: {}
                };
            }

            if (!entityMap[entityId].records[recordId]) {
                entityMap[entityId].records[recordId] = {
                    recordId,
                    recordTitle: record?.computedTitle || record?.title || 'Sans titre',
                    notes: []
                };
            }

            // Don't send content of protected notes, and strip pinHash
            const { pinHash, ...safeNote } = note;
            if (safeNote.isProtected) safeNote.content = null;

            entityMap[entityId].records[recordId].notes.push(safeNote);
        });

        // Convert to array format
        const result = Object.values(entityMap).map(e => ({
            ...e,
            records: Object.values(e.records).sort((a, b) =>
                a.recordTitle.localeCompare(b.recordTitle)
            ),
            totalNotes: Object.values(e.records).reduce((sum, r) => sum + r.notes.length, 0)
        }));

        res.json({
            success: true,
            entities: result,
            totalNotes: allNotes.length
        });

    } catch (err) {
        console.error('[NotesHub] Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;

const { tenantCollection } = require('../middleware/tenant');

module.exports = {
    // ─── Create a snapshot ──────────────────────────────────────────────
    create: async (req, res) => {
        try {
            const GridSnapshot = await tenantCollection(req, 'GridSnapshot');
            const DocumentLine = await tenantCollection(req, 'DocumentLine');
            if (!GridSnapshot || !DocumentLine) return res.status(500).json({ error: 'Model not available' });

            const { schemaId, recordId, targetRecordId, targetEntityId, date, note, columnWidths } = req.body;

            // Fetch current lines for this record + schema
            const allLines = await DocumentLine.find({
                documentId: recordId,
                schemaId: schemaId
            }).sort({ order: 1 }).lean();

            // Filter out empty lines (no meaningful values)
            const lines = allLines.filter(l => {
                if (!l.values) return false;
                return Object.values(l.values).some(v => 
                    v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
                );
            });

            if (lines.length === 0) {
                return res.status(400).json({ error: 'Aucune ligne avec des données à enregistrer' });
            }

            // Create snapshot with copies of lines
            const snapshot = new GridSnapshot({
                schemaId,
                recordId,
                targetRecordId: targetRecordId || recordId,
                targetEntityId: targetEntityId || null,
                date: date || new Date(),
                note: note || '',
                columnWidths: columnWidths || null,
                lines: lines.map(l => ({
                    lineType: l.lineType,
                    values: l.values,
                    computed: l.computed,
                    order: l.order
                })),
                createdBy: req.user?._id
            });

            await snapshot.save();
            res.status(201).json({ data: snapshot });
        } catch (error) {
            console.error('[GridSnapshot] Create error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── List snapshots by schema + target record ───────────────────────
    list: async (req, res) => {
        try {
            const GridSnapshot = await tenantCollection(req, 'GridSnapshot');
            if (!GridSnapshot) return res.status(500).json({ error: 'Model not available' });

            const { schemaId, targetRecordId } = req.params;

            const snapshots = await GridSnapshot.find({
                schemaId,
                targetRecordId
            }).sort({ date: -1 }).lean();

            res.json({ data: snapshots });
        } catch (error) {
            console.error('[GridSnapshot] List error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ─── Delete a snapshot ──────────────────────────────────────────────
    delete: async (req, res) => {
        try {
            const GridSnapshot = await tenantCollection(req, 'GridSnapshot');
            if (!GridSnapshot) return res.status(500).json({ error: 'Model not available' });

            const snapshot = await GridSnapshot.findByIdAndDelete(req.params.id);
            if (!snapshot) return res.status(404).json({ error: 'Snapshot not found' });

            res.json({ success: true });
        } catch (error) {
            console.error('[GridSnapshot] Delete error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

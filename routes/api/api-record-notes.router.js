/**
 * Record Notes API Router
 * 
 * REST API for record-scoped notes with rich text content.
 * Mounted via routes-inc-account.js
 * 
 * Endpoints:
 *   GET    /api/record/:recordId/notes         — List notes for a record
 *   POST   /api/record/:recordId/notes         — Create a new note
 *   GET    /api/record/:recordId/notes/:noteId — Get a single note
 *   PUT    /api/record/:recordId/notes/:noteId — Update note (autosave)
 *   DELETE /api/record/:recordId/notes/:noteId — Delete a note
 *   PATCH  /api/record/:recordId/notes/:noteId/pin — Toggle pin
 */

const { tenantCollection } = require('../../middleware/tenant');

module.exports = (router) => {

    // ═══════════════════════════════════════════
    // GET /api/record/:recordId/notes
    // ═══════════════════════════════════════════
    router.get('/api/record/:recordId/notes', async (req, res) => {
        try {
            const RecordNote = await tenantCollection(req, 'RecordNote');
            if (!RecordNote) return res.status(500).json({ success: false, error: 'DB not ready' });

            const notes = await RecordNote.find({
                recordId: req.params.recordId,
                archived: { $ne: true }
            })
            .sort({ pinned: -1, updatedAt: -1 })
            .lean();

            res.json({ success: true, notes });
        } catch (err) {
            console.error('[RecordNotes] List error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // POST /api/record/:recordId/notes
    // ═══════════════════════════════════════════
    router.post('/api/record/:recordId/notes', async (req, res) => {
        try {
            const RecordNote = await tenantCollection(req, 'RecordNote');
            const RecordModel = await tenantCollection(req, 'Record');
            if (!RecordNote) return res.status(500).json({ success: false, error: 'DB not ready' });

            const { title, color, icon } = req.body;
            const userId = String(req.user._id);

            const record = await RecordModel.findById(req.params.recordId).select('entityId').lean();

            const note = await RecordNote.create({
                recordId: req.params.recordId,
                entityId: record?.entityId || null,
                title: title || 'Sans titre',
                content: '',
                color: color || '#8b5cf6',
                icon: icon || 'solar:notebook-bold-duotone',
                createdBy: userId,
                createdByName: req.user.name || req.user.email || 'Unknown'
            });

            res.json({ success: true, note });
        } catch (err) {
            console.error('[RecordNotes] Create error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // GET /api/record/:recordId/notes/:noteId
    // ═══════════════════════════════════════════
    router.get('/api/record/:recordId/notes/:noteId', async (req, res) => {
        try {
            const RecordNote = await tenantCollection(req, 'RecordNote');
            if (!RecordNote) return res.status(500).json({ success: false, error: 'DB not ready' });

            const note = await RecordNote.findOne({
                _id: req.params.noteId,
                recordId: req.params.recordId
            }).lean();

            if (!note) return res.status(404).json({ success: false, error: 'Note not found' });

            res.json({ success: true, note });
        } catch (err) {
            console.error('[RecordNotes] Get error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // PUT /api/record/:recordId/notes/:noteId  (autosave)
    // ═══════════════════════════════════════════
    router.put('/api/record/:recordId/notes/:noteId', async (req, res) => {
        try {
            const RecordNote = await tenantCollection(req, 'RecordNote');
            if (!RecordNote) return res.status(500).json({ success: false, error: 'DB not ready' });

            const { title, content, color, icon } = req.body;

            const updateFields = { updatedAt: new Date() };
            if (title !== undefined) updateFields.title = title;
            if (content !== undefined) updateFields.content = content;
            if (color !== undefined) updateFields.color = color;
            if (icon !== undefined) updateFields.icon = icon;

            const note = await RecordNote.findOneAndUpdate(
                { _id: req.params.noteId, recordId: req.params.recordId },
                { $set: updateFields },
                { new: true, lean: true }
            );

            if (!note) return res.status(404).json({ success: false, error: 'Note not found' });

            res.json({ success: true, note });
        } catch (err) {
            console.error('[RecordNotes] Update error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // DELETE /api/record/:recordId/notes/:noteId
    // ═══════════════════════════════════════════
    router.delete('/api/record/:recordId/notes/:noteId', async (req, res) => {
        try {
            const RecordNote = await tenantCollection(req, 'RecordNote');
            if (!RecordNote) return res.status(500).json({ success: false, error: 'DB not ready' });

            const note = await RecordNote.findOneAndDelete({
                _id: req.params.noteId,
                recordId: req.params.recordId
            });

            if (!note) return res.status(404).json({ success: false, error: 'Note not found' });

            res.json({ success: true });
        } catch (err) {
            console.error('[RecordNotes] Delete error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // ═══════════════════════════════════════════
    // PATCH /api/record/:recordId/notes/:noteId/pin
    // ═══════════════════════════════════════════
    router.patch('/api/record/:recordId/notes/:noteId/pin', async (req, res) => {
        try {
            const RecordNote = await tenantCollection(req, 'RecordNote');
            if (!RecordNote) return res.status(500).json({ success: false, error: 'DB not ready' });

            const note = await RecordNote.findOne({
                _id: req.params.noteId,
                recordId: req.params.recordId
            });

            if (!note) return res.status(404).json({ success: false, error: 'Note not found' });

            note.pinned = !note.pinned;
            note.updatedAt = new Date();
            await note.save();

            res.json({ success: true, pinned: note.pinned });
        } catch (err) {
            console.error('[RecordNotes] Pin error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });
};

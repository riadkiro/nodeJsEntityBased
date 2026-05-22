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
let bcrypt;
try { bcrypt = require('bcryptjs'); } catch (e) { bcrypt = require('bcrypt'); }

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

            // Redact content for protected notes
            const safeNotes = notes.map(n => {
                if (n.isProtected) {
                    return { ...n, content: null, pinHash: undefined };
                }
                const { pinHash, ...rest } = n;
                return rest;
            });

            res.json({ success: true, notes: safeNotes });
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

            const { title, color, icon, pinCode } = req.body;
            const userId = String(req.user._id);

            const record = await RecordModel.findById(req.params.recordId).select('entityId').lean();

            // Hash PIN if provided
            let pinHash = null;
            let isProtected = false;
            if (pinCode && pinCode.length >= 4) {
                pinHash = await bcrypt.hash(pinCode, 10);
                isProtected = true;
            }

            const note = await RecordNote.create({
                recordId: req.params.recordId,
                entityId: record?.entityId || null,
                title: title || 'Sans titre',
                content: '',
                color: color || '#8b5cf6',
                icon: icon || 'solar:notebook-bold-duotone',
                createdBy: userId,
                createdByName: req.user.name || req.user.email || 'Unknown',
                pinHash,
                isProtected
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

            const { title, content, color, icon, isProtected } = req.body;

            const updateFields = { updatedAt: new Date() };
            if (title !== undefined) updateFields.title = title;
            if (content !== undefined) updateFields.content = content;
            if (color !== undefined) updateFields.color = color;
            if (icon !== undefined) updateFields.icon = icon;
            if (isProtected !== undefined) updateFields.isProtected = isProtected;

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
    // PATCH /api/record/:recordId/notes/:noteId/protect
    // Toggle note protection (requires user PIN to be set)
    // ═══════════════════════════════════════════
    router.patch('/api/record/:recordId/notes/:noteId/protect', async (req, res) => {
        try {
            const RecordNote = await tenantCollection(req, 'RecordNote');
            if (!RecordNote) return res.status(500).json({ success: false, error: 'DB not ready' });

            const { protect } = req.body; // true = lock, false = unlock

            const note = await RecordNote.findOne({
                _id: req.params.noteId,
                recordId: req.params.recordId
            });

            if (!note) return res.status(404).json({ success: false, error: 'Note not found' });

            note.isProtected = protect === true || protect === 'true';
            note.updatedAt = new Date();
            await note.save();

            res.json({ success: true, isProtected: note.isProtected });
        } catch (err) {
            console.error('[RecordNotes] Protect error:', err);
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

    // ═══════════════════════════════════════════
    // POST /api/record/:recordId/notes/:noteId/verify-pin
    // ═══════════════════════════════════════════
    router.post('/api/record/:recordId/notes/:noteId/verify-pin', async (req, res) => {
        try {
            const RecordNote = await tenantCollection(req, 'RecordNote');
            if (!RecordNote) return res.status(500).json({ success: false, error: 'DB not ready' });

            const note = await RecordNote.findOne({
                _id: req.params.noteId,
                recordId: req.params.recordId
            }).lean();

            if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
            if (!note.isProtected) return res.json({ success: true, content: note.content });

            const { pin } = req.body;
            if (!pin) return res.status(400).json({ success: false, error: 'PIN requis' });

            const User = require('../../models/user.model');
            const user = await User.findById(req.user._id);
            if (!user || !user.pinHash) {
                return res.status(403).json({ success: false, error: 'Aucun code PIN configuré sur votre compte' });
            }

            const match = await bcrypt.compare(String(pin), user.pinHash);
            if (!match) return res.status(403).json({ success: false, error: 'PIN incorrect' });

            // PIN correct — return full content
            const { pinHash, ...safeNote } = note;
            res.json({ success: true, note: safeNote, content: note.content });
        } catch (err) {
            console.error('[RecordNotes] Verify PIN error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });
};

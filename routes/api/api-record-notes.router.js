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
const crypto = require('crypto');

function noteIdKey(noteId) {
    return String(noteId || '');
}

function isNoteUnlocked(req, noteId) {
    const key = noteIdKey(noteId);
    return !!(key && req.session && req.session.unlockedRecordNotes && req.session.unlockedRecordNotes[key]);
}

function markNoteUnlocked(req, noteId) {
    const key = noteIdKey(noteId);
    if (!key || !req.session) return;
    getNoteEditToken(req, key);
}

function forgetNoteUnlock(req, noteId) {
    const key = noteIdKey(noteId);
    if (!key || !req.session || !req.session.unlockedRecordNotes) return;
    delete req.session.unlockedRecordNotes[key];
    if (req.session.recordNoteEditTokens) delete req.session.recordNoteEditTokens[key];
}

function contentHash(content) {
    return crypto.createHash('sha256').update(String(content || '')).digest('hex');
}

function getNoteEditToken(req, noteId) {
    const key = noteIdKey(noteId);
    if (!key || !req.session) return '';
    req.session.recordNoteEditTokens = req.session.recordNoteEditTokens || {};
    if (!req.session.recordNoteEditTokens[key]) {
        req.session.recordNoteEditTokens[key] = crypto.randomBytes(24).toString('hex');
    }
    return req.session.recordNoteEditTokens[key];
}

function peekNoteEditToken(req, noteId) {
    const key = noteIdKey(noteId);
    return (key && req.session && req.session.recordNoteEditTokens && req.session.recordNoteEditTokens[key]) || '';
}

function isMeaningfullyEmptyHtml(content) {
    const html = String(content || '');
    const hasEmbeddedContent = /<(img|iframe|video|audio|table|ul|ol|li|input|canvas)\b/i.test(html);
    const text = html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return !hasEmbeddedContent && !text;
}

function redactNote(note, unlocked = false, req = null) {
    const safeNote = note && typeof note.toObject === 'function'
        ? note.toObject()
        : { ...(note || {}) };

    delete safeNote.pinHash;

    if (safeNote.isProtected && !unlocked) {
        safeNote.content = null;
        safeNote.contentLocked = true;
    } else {
        safeNote.contentLocked = false;
        safeNote._contentHash = contentHash(safeNote.content);
        if (safeNote.isProtected && req) {
            safeNote._contentEditToken = getNoteEditToken(req, safeNote._id);
        }
    }

    return safeNote;
}

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

            const safeNotes = notes.map(n => redactNote(n, false, null));

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

            res.json({ success: true, note: redactNote(note, false, req) });
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

            res.json({ success: true, note: redactNote(note, false, null) });
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

            const { title, content, color, icon, contentEditToken, contentBaseHash, confirmEmptyProtectedContent } = req.body;

            const existingNote = await RecordNote.findOne({
                _id: req.params.noteId,
                recordId: req.params.recordId
            }).select('_id isProtected content').lean();

            if (!existingNote) return res.status(404).json({ success: false, error: 'Note not found' });

            const updateFields = { updatedAt: new Date() };
            if (title !== undefined) updateFields.title = title;
            let contentIgnored = false;
            if (content !== undefined) {
                if (!existingNote.isProtected) {
                    updateFields.content = content;
                } else {
                    const expectedToken = peekNoteEditToken(req, existingNote._id);
                    const canEditProtectedContent =
                        contentEditToken &&
                        contentEditToken === expectedToken &&
                        contentBaseHash &&
                        contentBaseHash === contentHash(existingNote.content);
                    const dangerousEmptyOverwrite =
                        isMeaningfullyEmptyHtml(content) &&
                        !isMeaningfullyEmptyHtml(existingNote.content) &&
                        confirmEmptyProtectedContent !== true;

                    if (canEditProtectedContent && !dangerousEmptyOverwrite) {
                        updateFields.content = content;
                    } else {
                        contentIgnored = true;
                        console.warn('[RecordNotes] Ignored protected note content update', {
                            noteId: String(existingNote._id),
                            tokenValid: !!contentEditToken && contentEditToken === expectedToken,
                            baseHashValid: !!contentBaseHash && contentBaseHash === contentHash(existingNote.content),
                            dangerousEmptyOverwrite
                        });
                    }
                }
            }
            if (color !== undefined) updateFields.color = color;
            if (icon !== undefined) updateFields.icon = icon;

            const note = await RecordNote.findOneAndUpdate(
                { _id: req.params.noteId, recordId: req.params.recordId },
                { $set: updateFields },
                { new: true, lean: true }
            );

            const returnUnlocked = !!(existingNote.isProtected && updateFields.content !== undefined);
            res.json({ success: true, note: redactNote(note, returnUnlocked, returnUnlocked ? req : null), contentIgnored });
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

            if (note.isProtected) {
                markNoteUnlocked(req, note._id);
            } else {
                forgetNoteUnlock(req, note._id);
            }

            res.json({ success: true, isProtected: note.isProtected, note: redactNote(note, note.isProtected, note.isProtected ? req : null) });
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

            forgetNoteUnlock(req, note._id);

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
            if (!note.isProtected) {
                forgetNoteUnlock(req, note._id);
                return res.json({ success: true, note: redactNote(note, true, req), content: note.content });
            }

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
            markNoteUnlocked(req, note._id);

            const safeNote = redactNote(note, true, req);
            res.json({ success: true, note: safeNote, content: note.content });
        } catch (err) {
            console.error('[RecordNotes] Verify PIN error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });
};

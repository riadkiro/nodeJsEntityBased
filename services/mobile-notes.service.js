const mongoose = require('mongoose');
const { tenantCollection } = require('../middleware/tenant');

class MobileNoteError extends Error {
    constructor(message, statusCode = 400, code = 'MOBILE_NOTE_ERROR') {
        super(message);
        this.name = 'MobileNoteError';
        this.statusCode = statusCode;
        this.code = code;
    }
}

function cleanText(value, fallback = '') {
    const text = String(value ?? '').trim();
    return text || fallback;
}

function validId(value) {
    return mongoose.isValidObjectId(String(value || ''));
}

function serializeMobileNote(note = {}, metadata = {}, includeProtectedContent = false) {
    const source = note?.toObject ? note.toObject() : note;
    const isProtected = Boolean(source.isProtected);
    const canExposeContent = !isProtected || includeProtectedContent;
    return {
        id: source._id?.toString?.() || String(source.id || ''),
        recordId: source.recordId?.toString?.() || String(source.recordId || ''),
        entityId: source.entityId?.toString?.() || String(source.entityId || ''),
        title: cleanText(source.title, 'Sans titre'),
        content: canExposeContent ? String(source.content || '') : '',
        contentLocked: isProtected && !includeProtectedContent,
        color: cleanText(source.color, '#8b5cf6'),
        icon: cleanText(source.icon, 'solar:notebook-bold-duotone'),
        pinned: Boolean(source.pinned),
        isProtected,
        createdByName: cleanText(source.createdByName),
        recordTitle: cleanText(metadata.recordTitle, 'Sans titre'),
        entityName: cleanText(metadata.entityName, 'Inconnu'),
        entitySlug: cleanText(metadata.entitySlug),
        entityIcon: cleanText(metadata.entityIcon, 'solar:folder-bold-duotone'),
        entityColor: cleanText(metadata.entityColor, '#8b5cf6'),
        createdAt: source.createdAt || null,
        updatedAt: source.updatedAt || null,
    };
}

async function noteModels(req) {
    const [RecordNote, Record, Entity] = await Promise.all([
        tenantCollection(req, 'RecordNote'),
        tenantCollection(req, 'Record'),
        tenantCollection(req, 'Entity'),
    ]);
    if (!RecordNote || !Record || !Entity) {
        throw new MobileNoteError('Base Notes indisponible.', 503, 'NOTES_DB_UNAVAILABLE');
    }
    return { RecordNote, Record, Entity };
}

async function metadataMaps(Record, Entity, notes) {
    const recordIds = [...new Set(
        notes.map(note => note.recordId?.toString()).filter(Boolean)
    )];
    const records = recordIds.length
        ? await Record.find({ _id: { $in: recordIds } })
            .select('title computedTitle entityId')
            .lean()
        : [];
    const entityIds = [...new Set([
        ...notes.map(note => note.entityId?.toString()).filter(Boolean),
        ...records.map(record => record.entityId?.toString()).filter(Boolean),
    ])];
    const entities = entityIds.length
        ? await Entity.find({ _id: { $in: entityIds } })
            .select('name slug icon color')
            .lean()
        : [];
    return {
        recordById: new Map(records.map(record => [record._id.toString(), record])),
        entityById: new Map(entities.map(entity => [entity._id.toString(), entity])),
    };
}

function metadataFor(note, maps) {
    const record = maps.recordById.get(note.recordId?.toString() || '');
    const entityId = note.entityId?.toString()
        || record?.entityId?.toString()
        || '';
    const entity = maps.entityById.get(entityId);
    return {
        recordTitle: record?.computedTitle || record?.title,
        entityName: entity?.name,
        entitySlug: entity?.slug,
        entityIcon: entity?.icon,
        entityColor: entity?.color,
    };
}

async function listNotes(req, query = {}) {
    const { RecordNote, Record, Entity } = await noteModels(req);
    const notes = await RecordNote.find({ archived: { $ne: true } })
        .sort({ pinned: -1, updatedAt: -1 })
        .limit(500)
        .lean();
    const maps = await metadataMaps(Record, Entity, notes);
    const search = cleanText(query.search).toLowerCase();
    const serialized = notes.map(note =>
        serializeMobileNote(note, metadataFor(note, maps), false)
    );
    return search
        ? serialized.filter(note =>
            `${note.title} ${note.recordTitle} ${note.entityName}`
                .toLowerCase()
                .includes(search)
        )
        : serialized;
}

async function listNoteTargets(req, query = {}) {
    const { Record, Entity } = await noteModels(req);
    const limit = Math.min(Math.max(Number(query.limit) || 200, 1), 500);
    const records = await Record.find({ isDraft: { $ne: true } })
        .select('title computedTitle entityId')
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(limit)
        .lean();
    const entityIds = [...new Set(
        records.map(record => record.entityId?.toString()).filter(Boolean)
    )];
    const entities = entityIds.length
        ? await Entity.find({ _id: { $in: entityIds } })
            .select('name slug icon color')
            .lean()
        : [];
    const entityById = new Map(
        entities.map(entity => [entity._id.toString(), entity])
    );
    return records.map(record => {
        const entity = entityById.get(record.entityId?.toString() || '');
        return {
            recordId: record._id.toString(),
            recordTitle: cleanText(record.computedTitle || record.title, 'Sans titre'),
            entityId: record.entityId?.toString() || '',
            entityName: cleanText(entity?.name, 'Inconnu'),
            entityIcon: cleanText(entity?.icon, 'solar:folder-bold-duotone'),
            entityColor: cleanText(entity?.color, '#8b5cf6'),
        };
    });
}

async function createNote(req, input = {}) {
    const { RecordNote, Record, Entity } = await noteModels(req);
    if (!validId(input.recordId)) {
        throw new MobileNoteError('Choisis une fiche pour cette note.', 400, 'NOTE_RECORD_REQUIRED');
    }
    const record = await Record.findById(input.recordId)
        .select('title computedTitle entityId')
        .lean();
    if (!record) {
        throw new MobileNoteError('Fiche introuvable.', 404, 'NOTE_RECORD_NOT_FOUND');
    }
    const note = await RecordNote.create({
        recordId: record._id,
        entityId: record.entityId || null,
        title: cleanText(input.title, 'Sans titre').slice(0, 240),
        content: String(input.content || '').slice(0, 200000),
        color: cleanText(input.color, '#8b5cf6').slice(0, 32),
        icon: cleanText(input.icon, 'solar:notebook-bold-duotone').slice(0, 120),
        createdBy: String(req.user?._id || ''),
        createdByName: cleanText(req.user?.name || req.user?.email, 'Membre'),
        pinned: Boolean(input.pinned),
        isProtected: Boolean(input.isProtected),
        updatedAt: new Date(),
    });
    const entity = record.entityId
        ? await Entity.findById(record.entityId).select('name slug icon color').lean()
        : null;
    return serializeMobileNote(note, {
        recordTitle: record.computedTitle || record.title,
        entityName: entity?.name,
        entitySlug: entity?.slug,
        entityIcon: entity?.icon,
        entityColor: entity?.color,
    }, true);
}

async function loadNoteWithMetadata(req, noteId) {
    if (!validId(noteId)) {
        throw new MobileNoteError('Note introuvable.', 404, 'NOTE_NOT_FOUND');
    }
    const { RecordNote, Record, Entity } = await noteModels(req);
    const note = await RecordNote.findOne({
        _id: noteId,
        archived: { $ne: true },
    });
    if (!note) {
        throw new MobileNoteError('Note introuvable.', 404, 'NOTE_NOT_FOUND');
    }
    const maps = await metadataMaps(Record, Entity, [note]);
    return { note, metadata: metadataFor(note, maps) };
}

async function unlockNoteWithBiometrics(req, noteId) {
    const { note, metadata } = await loadNoteWithMetadata(req, noteId);
    return serializeMobileNote(note, metadata, true);
}

async function updateNote(req, noteId, input = {}) {
    const { note, metadata } = await loadNoteWithMetadata(req, noteId);
    if (note.isProtected && input.biometricUnlocked !== true) {
        throw new MobileNoteError(
            'Authentification biométrique requise.',
            403,
            'NOTE_BIOMETRIC_REQUIRED',
        );
    }
    if (input.title !== undefined) {
        note.title = cleanText(input.title, 'Sans titre').slice(0, 240);
    }
    if (input.content !== undefined) {
        note.content = String(input.content || '').slice(0, 200000);
    }
    if (input.color !== undefined) {
        note.color = cleanText(input.color, '#8b5cf6').slice(0, 32);
    }
    if (input.icon !== undefined) {
        note.icon = cleanText(input.icon, 'solar:notebook-bold-duotone').slice(0, 120);
    }
    if (input.pinned !== undefined) note.pinned = Boolean(input.pinned);
    if (input.isProtected !== undefined) note.isProtected = Boolean(input.isProtected);
    note.updatedAt = new Date();
    await note.save();
    return serializeMobileNote(note, metadata, true);
}

async function deleteNote(req, noteId, input = {}) {
    const { note } = await loadNoteWithMetadata(req, noteId);
    if (note.isProtected && input.biometricUnlocked !== true) {
        throw new MobileNoteError(
            'Authentification biométrique requise.',
            403,
            'NOTE_BIOMETRIC_REQUIRED',
        );
    }
    await note.deleteOne();
}

module.exports = {
    MobileNoteError,
    serializeMobileNote,
    listNotes,
    listNoteTargets,
    createNote,
    unlockNoteWithBiometrics,
    updateNote,
    deleteNote,
};

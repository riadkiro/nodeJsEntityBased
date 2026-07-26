const { tenantCollection } = require('../middleware/tenant');
const { ensureEventsEntity } = require('./events-entity.service');

class AgendaValidationError extends Error {
    constructor(message, code = 'AGENDA_VALIDATION_ERROR', status = 400) {
        super(message);
        this.name = 'AgendaValidationError';
        this.code = code;
        this.status = status;
    }
}

function cleanText(value, fallback = '') {
    const text = String(value ?? '').trim();
    return text || fallback;
}

function normalizeBoolean(value, fallback = false) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    const token = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'oui', 'on'].includes(token)) return true;
    if (['false', '0', 'no', 'non', 'off'].includes(token)) return false;
    return fallback;
}

function normalizeTags(value) {
    const source = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(',')
            : [];
    const result = [];
    const seen = new Set();
    for (const item of source) {
        const label = cleanText(item);
        const key = label.toLocaleLowerCase('fr');
        if (!key || seen.has(key)) continue;
        seen.add(key);
        result.push(label.slice(0, 80));
    }
    return result.slice(0, 12);
}

function validDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeDateKey(value) {
    const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return '';
    const date = new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return '';
    return `${match[1]}-${match[2]}-${match[3]}`;
}

function dateKeyFor(date) {
    const value = validDate(date);
    if (!value) return '';
    return value.toISOString().slice(0, 10);
}

function normalizeAgendaInput(input = {}, options = {}) {
    const partial = options.partial === true;
    const normalized = {};

    if (!partial || input.title !== undefined) {
        const title = cleanText(input.title);
        if (!title) throw new AgendaValidationError('Le titre est requis.');
        normalized.title = title.slice(0, 180);
    }

    if (!partial || input.allDay !== undefined || input.isAllDay !== undefined) {
        normalized.allDay = normalizeBoolean(
            input.allDay !== undefined ? input.allDay : input.isAllDay,
            false,
        );
    }

    const hasStart = input.startAt !== undefined
        || input.start !== undefined
        || input.date !== undefined
        || input.dateKey !== undefined;
    if (!partial || hasStart) {
        const allDay = normalized.allDay
            ?? normalizeBoolean(input.allDay ?? input.isAllDay, false);
        const explicitDateKey = normalizeDateKey(input.dateKey);
        const start = allDay && explicitDateKey
            ? new Date(`${explicitDateKey}T12:00:00.000Z`)
            : validDate(input.startAt ?? input.start ?? input.date);
        if (!start) throw new AgendaValidationError('La date de debut est invalide.');
        normalized.startAt = start;
        normalized.dateKey = explicitDateKey || dateKeyFor(start);
    }

    if (!partial || input.endAt !== undefined || input.end !== undefined) {
        const rawEnd = input.endAt ?? input.end;
        normalized.endAt = rawEnd === null || rawEnd === ''
            ? null
            : validDate(rawEnd);
        if (rawEnd && !normalized.endAt) {
            throw new AgendaValidationError('La date de fin est invalide.');
        }
    }

    if (normalized.startAt && normalized.endAt
        && normalized.endAt.getTime() < normalized.startAt.getTime()) {
        throw new AgendaValidationError(
            'La fin doit etre posterieure au debut.',
            'AGENDA_END_BEFORE_START',
        );
    }

    if (!partial || input.isImportant !== undefined || input.important !== undefined) {
        normalized.isImportant = normalizeBoolean(
            input.isImportant !== undefined ? input.isImportant : input.important,
            false,
        );
    }
    if (!partial || input.showInUpcoming !== undefined) {
        normalized.showInUpcoming = normalizeBoolean(input.showInUpcoming, true);
    }
    if (!partial || input.type !== undefined) {
        normalized.type = cleanText(input.type, 'autre').slice(0, 80);
    }
    if (!partial || input.location !== undefined || input.lieu !== undefined) {
        normalized.location = cleanText(input.location ?? input.lieu).slice(0, 240);
    }
    if (!partial || input.notes !== undefined || input.description !== undefined) {
        normalized.notes = cleanText(input.notes ?? input.description).slice(0, 5000);
    }
    if (!partial || input.tags !== undefined) {
        normalized.tags = normalizeTags(input.tags);
    }

    return normalized;
}

function eventFieldMaps(eventsEntity = {}) {
    const idByName = new Map();
    const nameById = new Map();
    for (const field of eventsEntity.customFields || []) {
        const id = field?._id?.toString?.() || String(field?._id || '');
        const name = cleanText(field?.name);
        if (!id || !name) continue;
        idByName.set(name, field._id);
        nameById.set(id, name);
    }
    return { idByName, nameById };
}

function customValuesFor(event = {}, eventsEntity = {}) {
    const { nameById } = eventFieldMaps(eventsEntity);
    const values = {};
    for (const field of event.customFields || []) {
        const id = field?.field_id?._id?.toString?.()
            || field?.field_id?.toString?.()
            || String(field?.field_id || '');
        const name = field?.field_id?.name || nameById.get(id);
        if (name) values[name] = field.value;
    }
    return values;
}

function classificationStatus(event = {}, eventsEntity = {}) {
    const statusId = eventsEntity.statusClassification?._id?.toString?.()
        || eventsEntity.statusClassification?.toString?.()
        || '';
    const status = (event.classificationValues || []).find(item =>
        !statusId
        || (item.classificationId?.toString?.() || '') === statusId
    );
    return {
        label: status?.label || 'Planifie',
        color: status?.color || '#3b82f6',
    };
}

function serializeAgendaEvent(event = {}, eventsEntity = {}) {
    const values = customValuesFor(event, eventsEntity);
    const allDay = normalizeBoolean(values.toute_la_journee, false);
    const status = classificationStatus(event, eventsEntity);
    return {
        id: event._id?.toString?.() || String(event.id || ''),
        title: cleanText(event.title, 'Evenement'),
        startAt: event.date || null,
        endAt: event.end_date || values.heure_fin || null,
        dateKey: allDay ? dateKeyFor(event.date) : '',
        allDay,
        isImportant: normalizeBoolean(values.widget_date_importante, false),
        showInUpcoming: normalizeBoolean(values.widget_prochains_evenements, true),
        type: cleanText(values.type_evenement, 'autre'),
        location: cleanText(values.lieu_evenement),
        notes: cleanText(values.notes_evenement, event.description || ''),
        tags: normalizeTags(values.tags_evenement),
        status: status.label,
        statusColor: status.color,
        createdAt: event.createdAt || null,
        updatedAt: event.updatedAt || null,
    };
}

function setCustomField(event, idByName, name, value) {
    const fieldId = idByName.get(name);
    if (!fieldId) return;
    if (!Array.isArray(event.customFields)) event.customFields = [];
    const index = event.customFields.findIndex(field =>
        (field.field_id?._id?.toString?.()
            || field.field_id?.toString?.()
            || String(field.field_id || '')) === fieldId.toString()
    );
    if (index >= 0) {
        event.customFields[index].value = value;
    } else {
        event.customFields.push({ field_id: fieldId, value });
    }
}

function applyAgendaFields(event, normalized, eventsEntity) {
    const { idByName } = eventFieldMaps(eventsEntity);
    if (normalized.title !== undefined) event.title = normalized.title;
    if (normalized.startAt !== undefined) event.date = normalized.startAt;
    if (normalized.endAt !== undefined) event.end_date = normalized.endAt;
    if (normalized.notes !== undefined) event.description = normalized.notes;

    const mappings = [
        ['toute_la_journee', normalized.allDay],
        ['heure_debut', normalized.startAt],
        ['heure_fin', normalized.endAt],
        ['widget_date_importante', normalized.isImportant],
        ['widget_prochains_evenements', normalized.showInUpcoming],
        ['type_evenement', normalized.type],
        ['lieu_evenement', normalized.location],
        ['notes_evenement', normalized.notes],
        ['tags_evenement', normalized.tags],
    ];
    for (const [name, value] of mappings) {
        if (value !== undefined) setCustomField(event, idByName, name, value);
    }
    if (event.markModified) event.markModified('customFields');
    return event;
}

function defaultClassificationValues(eventsEntity) {
    const classification = eventsEntity.statusClassification;
    const option = classification?.options?.find(item =>
        item?._id?.toString?.() === classification.defaultOptionId?.toString?.()
    ) || classification?.options?.[0];
    if (!classification?._id || !option?._id) return [];
    return [{
        classificationId: classification._id,
        optionId: option._id,
        label: option.label || 'Planifie',
        color: option.color || '#3b82f6',
    }];
}

async function agendaContext(req) {
    const Record = await tenantCollection(req, 'Record');
    const eventsEntity = await ensureEventsEntity(req);
    return { Record, eventsEntity };
}

async function listAgendaEvents(req, query = {}) {
    const { Record, eventsEntity } = await agendaContext(req);
    const filter = { entityId: eventsEntity._id };
    const from = validDate(query.from);
    const to = validDate(query.to);
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = from;
        if (to) filter.date.$lte = to;
    }
    const events = await Record.find(filter).sort({ date: 1, createdAt: 1 }).lean();
    return events.map(event => serializeAgendaEvent(event, eventsEntity));
}

async function createAgendaEvent(req, input = {}) {
    const normalized = normalizeAgendaInput(input);
    const { Record, eventsEntity } = await agendaContext(req);
    const event = new Record({
        entityId: eventsEntity._id,
        title: normalized.title,
        date: normalized.startAt,
        end_date: normalized.endAt,
        description: normalized.notes,
        published: true,
        status: 'published',
        classificationValues: defaultClassificationValues(eventsEntity),
        customFields: [],
        createdBy: req.user?._id,
        updatedBy: req.user?._id,
    });
    applyAgendaFields(event, normalized, eventsEntity);
    await event.save();
    return serializeAgendaEvent(event.toObject ? event.toObject() : event, eventsEntity);
}

async function updateAgendaEvent(req, eventId, input = {}) {
    const normalized = normalizeAgendaInput(input, { partial: true });
    const { Record, eventsEntity } = await agendaContext(req);
    const event = await Record.findOne({ _id: eventId, entityId: eventsEntity._id });
    if (!event) {
        throw new AgendaValidationError('Date introuvable.', 'AGENDA_NOT_FOUND', 404);
    }
    applyAgendaFields(event, normalized, eventsEntity);
    event.updatedBy = req.user?._id;
    await event.save();
    return serializeAgendaEvent(event.toObject ? event.toObject() : event, eventsEntity);
}

async function deleteAgendaEvent(req, eventId) {
    const { Record, eventsEntity } = await agendaContext(req);
    const deleted = await Record.findOneAndDelete({
        _id: eventId,
        entityId: eventsEntity._id,
    });
    if (!deleted) {
        throw new AgendaValidationError('Date introuvable.', 'AGENDA_NOT_FOUND', 404);
    }
    return true;
}

module.exports = {
    AgendaValidationError,
    normalizeBoolean,
    normalizeTags,
    normalizeAgendaInput,
    serializeAgendaEvent,
    applyAgendaFields,
    listAgendaEvents,
    createAgendaEvent,
    updateAgendaEvent,
    deleteAgendaEvent,
};

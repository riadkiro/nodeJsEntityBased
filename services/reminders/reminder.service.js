const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');

const Reminder = require('../../models/reminder.model');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const DEFAULT_TIME_ZONE = process.env.DEFAULT_TIME_ZONE || 'Africa/Casablanca';
const FUTURE_GRACE_MS = Number(process.env.REMINDER_FUTURE_GRACE_MS || 0);

class ReminderValidationError extends Error {
    constructor(message, code = 'VALIDATION_ERROR') {
        super(message);
        this.name = 'ReminderValidationError';
        this.code = code;
        this.status = 400;
    }
}

function cleanText(value, fallback = '') {
    const text = String(value ?? '').trim();
    return text || fallback;
}

function isPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeTargetType(value) {
    const targetType = cleanText(value, '').toLowerCase();
    if (!/^[a-z][a-z0-9_-]{1,40}$/.test(targetType)) {
        throw new ReminderValidationError('Type de rappel invalide');
    }
    return targetType;
}

function normalizeChannel(value) {
    const channel = cleanText(value, 'local').toLowerCase();
    if (['local', 'push', 'in_app'].includes(channel)) return channel;
    return 'local';
}

function normalizeSlotKey(value) {
    const slotKey = cleanText(value, 'default').toLowerCase();
    if (!/^[a-z0-9_.:-]{1,60}$/.test(slotKey)) {
        throw new ReminderValidationError('Cle de rappel invalide');
    }
    return slotKey;
}

function toObjectId(value, label = 'targetId') {
    const raw = String(value || '').trim();
    if (!/^[a-f\d]{24}$/i.test(raw)) {
        throw new ReminderValidationError(`${label} invalide`);
    }
    return new mongoose.Types.ObjectId(raw);
}

function resolveTimeZone(value) {
    const zone = cleanText(value, DEFAULT_TIME_ZONE);
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date());
        return zone;
    } catch (_) {
        return DEFAULT_TIME_ZONE;
    }
}

function normalizeTime(value) {
    const raw = cleanText(value, '');
    const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) throw new ReminderValidationError('Heure de rappel invalide');

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new ReminderValidationError('Heure de rappel invalide');
    }

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function resolveScheduledAt(input) {
    const timeZone = resolveTimeZone(input?.timeZone || input?.tz);
    const direct = input?.scheduledAt || input?.reminderAt || input?.at;

    if (direct) {
        if (typeof direct === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(direct.trim())) {
            throw new ReminderValidationError('Date et heure de rappel requises');
        }
        const date = direct instanceof Date ? direct : new Date(direct);
        if (Number.isNaN(date.getTime())) {
            throw new ReminderValidationError('Date de rappel invalide');
        }
        return { scheduledAt: date, timeZone };
    }

    const date = cleanText(input?.date || input?.reminderDate, '');
    const time = cleanText(input?.time || input?.reminderTime, '');
    if (!date || !time) {
        throw new ReminderValidationError('Date et heure de rappel requises');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ReminderValidationError('Date de rappel invalide');
    }

    const local = dayjs.tz(`${date} ${normalizeTime(time)}`, 'YYYY-MM-DD HH:mm', timeZone);
    if (!local.isValid()) throw new ReminderValidationError('Date de rappel invalide');

    return { scheduledAt: local.toDate(), timeZone };
}

function ensureFuture(scheduledAt) {
    if (!(scheduledAt instanceof Date) || Number.isNaN(scheduledAt.getTime())) {
        throw new ReminderValidationError('Date de rappel invalide');
    }
    if (scheduledAt.getTime() <= Date.now() - FUTURE_GRACE_MS) {
        throw new ReminderValidationError("L'heure du rappel doit etre dans le futur");
    }
}

function reminderPayloadFromBody(body) {
    if (!isPlainObject(body)) return null;
    if (body.reminder === null) return { enabled: false };

    const source = isPlainObject(body.reminder) ? body.reminder : body;
    const hasReminderField = body.reminder !== undefined
        || source.reminderAt !== undefined
        || source.scheduledAt !== undefined
        || source.at !== undefined
        || source.reminderDate !== undefined
        || source.date !== undefined
        || source.reminderTime !== undefined
        || source.time !== undefined
        || source.enabled !== undefined
        || source.clear !== undefined;

    if (!hasReminderField) return null;
    if (source.enabled === false || source.clear === true || source.cancel === true) {
        return { enabled: false };
    }

    const resolved = resolveScheduledAt(source);
    ensureFuture(resolved.scheduledAt);

    return {
        enabled: true,
        scheduledAt: resolved.scheduledAt,
        timeZone: resolved.timeZone,
        channel: normalizeChannel(source.channel),
        slotKey: normalizeSlotKey(source.slotKey),
        title: cleanText(source.title, ''),
        message: cleanText(source.message || source.body, ''),
        metadata: isPlainObject(source.metadata) ? source.metadata : {},
    };
}

async function upsertReminder({
    accountNumber,
    userId,
    targetType,
    targetModel = '',
    targetId,
    slotKey = 'default',
    title = '',
    message = '',
    scheduledAt,
    timeZone,
    channel = 'local',
    metadata = {},
}) {
    const normalizedTargetType = normalizeTargetType(targetType);
    const normalizedTargetId = toObjectId(targetId);
    const normalizedSlotKey = normalizeSlotKey(slotKey);
    const normalizedTimeZone = resolveTimeZone(timeZone);
    ensureFuture(scheduledAt);

    const query = {
        accountNumber: cleanText(accountNumber, ''),
        userId: toObjectId(userId, 'userId'),
        targetType: normalizedTargetType,
        targetId: normalizedTargetId,
        slotKey: normalizedSlotKey,
        status: 'scheduled',
    };

    if (!query.accountNumber) {
        throw new ReminderValidationError('Compte requis');
    }

    return Reminder.findOneAndUpdate(
        query,
        {
            $set: {
                targetModel: cleanText(targetModel, ''),
                title: cleanText(title, ''),
                message: cleanText(message, ''),
                scheduledAt,
                timeZone: normalizedTimeZone,
                channel: normalizeChannel(channel),
                metadata: isPlainObject(metadata) ? metadata : {},
                updatedBy: query.userId,
                deliveredAt: null,
                cancelledAt: null,
                cancelledBy: null,
            },
            $setOnInsert: {
                createdBy: query.userId,
            },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
}

async function cancelReminderForTarget({
    accountNumber,
    userId,
    targetType,
    targetId,
    slotKey = 'default',
}) {
    const query = {
        accountNumber: cleanText(accountNumber, ''),
        userId: toObjectId(userId, 'userId'),
        targetType: normalizeTargetType(targetType),
        targetId: toObjectId(targetId),
        slotKey: normalizeSlotKey(slotKey),
        status: 'scheduled',
    };

    const result = await Reminder.updateMany(query, {
        $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelledBy: query.userId,
            updatedBy: query.userId,
        },
    });

    return result.modifiedCount || result.nModified || 0;
}

async function findReminderForTarget({
    accountNumber,
    userId,
    targetType,
    targetId,
    slotKey = 'default',
}) {
    return Reminder.findOne({
        accountNumber: cleanText(accountNumber, ''),
        userId: toObjectId(userId, 'userId'),
        targetType: normalizeTargetType(targetType),
        targetId: toObjectId(targetId),
        slotKey: normalizeSlotKey(slotKey),
        status: 'scheduled',
    }).sort({ scheduledAt: 1, createdAt: -1 });
}

async function listReminders({
    accountNumber,
    userId,
    targetType,
    status = 'scheduled',
    dueBefore,
} = {}) {
    const query = {
        accountNumber: cleanText(accountNumber, ''),
        userId: toObjectId(userId, 'userId'),
        status: cleanText(status, 'scheduled'),
    };
    if (targetType) query.targetType = normalizeTargetType(targetType);
    if (dueBefore) {
        const date = dueBefore instanceof Date ? dueBefore : new Date(dueBefore);
        if (!Number.isNaN(date.getTime())) query.scheduledAt = { $lte: date };
    }
    return Reminder.find(query).sort({ scheduledAt: 1, createdAt: -1 }).lean();
}

async function scheduledReminderMap({
    accountNumber,
    userId,
    targetType,
    targetIds,
}) {
    const ids = [...new Set((targetIds || []).map(id => String(id || '').trim()).filter(Boolean))]
        .filter(id => /^[a-f\d]{24}$/i.test(id))
        .map(id => new mongoose.Types.ObjectId(id));

    if (!ids.length) return new Map();

    const reminders = await Reminder.find({
        accountNumber: cleanText(accountNumber, ''),
        userId: toObjectId(userId, 'userId'),
        targetType: normalizeTargetType(targetType),
        targetId: { $in: ids },
        status: 'scheduled',
    }).sort({ scheduledAt: 1, createdAt: -1 }).lean();

    const map = new Map();
    reminders.forEach((reminder) => {
        const key = reminder.targetId?.toString?.() || '';
        if (key && !map.has(key)) map.set(key, reminder);
    });
    return map;
}

function serializeReminder(reminder) {
    if (!reminder) return null;
    const row = reminder.toObject ? reminder.toObject() : reminder;
    const id = row._id?.toString?.() || String(row._id || '');
    const targetId = row.targetId?.toString?.() || String(row.targetId || '');

    return {
        id,
        _id: id,
        accountNumber: row.accountNumber || '',
        targetType: row.targetType || '',
        targetId,
        slotKey: row.slotKey || 'default',
        title: row.title || '',
        message: row.message || '',
        scheduledAt: row.scheduledAt instanceof Date
            ? row.scheduledAt.toISOString()
            : (row.scheduledAt || null),
        timeZone: row.timeZone || DEFAULT_TIME_ZONE,
        channel: row.channel || 'local',
        status: row.status || 'scheduled',
        metadata: isPlainObject(row.metadata) ? row.metadata : {},
        createdAt: row.createdAt || null,
        updatedAt: row.updatedAt || null,
    };
}

module.exports = {
    ReminderValidationError,
    reminderPayloadFromBody,
    upsertReminder,
    cancelReminderForTarget,
    findReminderForTarget,
    listReminders,
    scheduledReminderMap,
    serializeReminder,
};

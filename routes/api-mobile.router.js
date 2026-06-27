const express = require('express');
const crypto = require('crypto');

const User = require('../models/user.model');
const Account = require('../models/account.model');
const mailer = require('../services/mailer');
const ReminderService = require('../services/reminders/reminder.service');
const { convertPendingInvitesToGrants } = require('../services/record-access-invitations');
const { ensureTenantDatabase } = require('../services/tenant-provisioning');
const { connectToTenantDb, tenantCollection } = require('../middleware/tenant');
const { taskTenantModels } = require('../services/task-tenant-models.service');

const router = express.Router();

const STATUS_TODO = '\u00c0 faire';
const STATUS_DONE = 'Termin\u00e9';
const TOKEN_TTL_SECONDS = Number(process.env.MOBILE_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 30);
const EMAIL_VERIFICATION_TTL_HOURS = 24;
const EMAIL_VERIFICATION_TTL_MS = EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MINUTES = 60;
const PASSWORD_RESET_TTL_MS = PASSWORD_RESET_TTL_MINUTES * 60 * 1000;
const PASSWORD_RESET_SENT_MESSAGE = "Si un compte existe avec cet email, un lien de reinitialisation vient d'etre envoye.";

const defaultStatuses = [
    { label: STATUS_TODO, color: '#9ca3af', order: 0 },
    { label: 'En cours', color: '#3b82f6', order: 1 },
    { label: 'En revue', color: '#f59e0b', order: 2 },
    { label: STATUS_DONE, color: '#22c55e', order: 3 },
    { label: 'Bloque', color: '#ef4444', order: 4 },
];

const defaultPriorities = [
    { label: 'Aucune', color: '#cbd5e1', order: 0 },
    { label: 'Basse', color: '#22c55e', order: 1 },
    { label: 'Moyenne', color: '#f59e0b', order: 2 },
    { label: 'Haute', color: '#ef4444', order: 3 },
    { label: 'Urgente', color: '#dc2626', order: 4 },
];

router.use((req, res, next) => {
    const origin = req.get('origin') || '';
    const allowedOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
        || origin === 'https://dexapp.actirama.com';

    if (allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

function sendError(res, status, error, code) {
    return res.status(status).json({
        success: false,
        error,
        ...(code ? { code } : {}),
    });
}

function sendCaughtError(res, error, fallback = 'Erreur serveur') {
    if (error instanceof ReminderService.ReminderValidationError) {
        return sendError(res, error.status || 400, error.message, error.code);
    }
    return sendError(res, 500, error.message || fallback);
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function hashToken(token) {
    return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function getAppUrl(req) {
    const configuredUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    return configuredUrl.replace(/\/+$/, '');
}

function buildVerificationUrl(req, rawToken) {
    return `${getAppUrl(req)}/auth/verify-email/${rawToken}`;
}

function buildResetUrl(req, rawToken) {
    return `${getAppUrl(req)}/auth/reset-password/${rawToken}`;
}

async function issueVerificationEmail(req, user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = hashToken(rawToken);
    user.verificationTokenExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
    user.emailVerified = false;
    user.status = 'pending';
    await user.save({ validateBeforeSave: false });

    try {
        await mailer.sendEmailVerification({
            to: user.email,
            name: user.name || user.email,
            verifyUrl: buildVerificationUrl(req, rawToken),
            expiresInHours: EMAIL_VERIFICATION_TTL_HOURS,
        });
    } catch (mailError) {
        console.error('[MobileAPI] Email verification send error:', mailError.message);
    }
}

function base64UrlEncode(value) {
    const source = Buffer.isBuffer(value) ? value : Buffer.from(String(value));
    return source
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(value) {
    const padded = String(value || '')
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(String(value || '').length / 4) * 4, '=');
    return Buffer.from(padded, 'base64').toString('utf8');
}

function tokenSecret() {
    return process.env.MOBILE_TOKEN_SECRET
        || process.env.SESSION_SECRET
        || process.env.JWT_SECRET
        || 'dexapp-mobile-dev-secret';
}

function signTokenPart(input) {
    return base64UrlEncode(crypto.createHmac('sha256', tokenSecret()).update(input).digest());
}

function createMobileToken(user) {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64UrlEncode(JSON.stringify({
        sub: user._id.toString(),
        email: user.email,
        iat: now,
        exp: now + TOKEN_TTL_SECONDS,
    }));
    const body = `${header}.${payload}`;
    return `${body}.${signTokenPart(body)}`;
}

function verifyMobileToken(token) {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) throw new Error('INVALID_TOKEN');

    const body = `${parts[0]}.${parts[1]}`;
    const expected = signTokenPart(body);
    const given = parts[2];
    if (expected.length !== given.length) throw new Error('INVALID_TOKEN');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))) {
        throw new Error('INVALID_TOKEN');
    }

    const payload = JSON.parse(base64UrlDecode(parts[1]));
    if (!payload.sub || !payload.exp || Number(payload.exp) < Math.floor(Date.now() / 1000)) {
        throw new Error('TOKEN_EXPIRED');
    }
    return payload;
}

function userPayload(user) {
    return {
        id: user._id.toString(),
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
        status: user.status || 'active',
        emailVerified: !!user.emailVerified,
    };
}

async function accountPayloads(user) {
    const localAccounts = Array.isArray(user.accounts) ? user.accounts : [];
    const numbers = localAccounts.map(account => String(account.account_number || '')).filter(Boolean);
    const accountDocs = numbers.length
        ? await Account.find({ account_number: { $in: numbers } }).select('name icon logo status account_number').lean()
        : [];
    const accountByNumber = new Map(accountDocs.map(account => [String(account.account_number), account]));

    return localAccounts.map(account => {
        const number = String(account.account_number || '');
        const doc = accountByNumber.get(number) || {};
        return {
            accountNumber: number,
            account_number: number,
            name: doc.name || account.name || `Workspace ${number}`,
            icon: doc.icon || account.icon || 'solar:home-2-bold-duotone',
            logo: doc.logo || '',
            role: account.role || 'member',
            status: doc.status || 'active',
        };
    }).filter(account => account.accountNumber);
}

async function authResponse(user) {
    const accounts = await accountPayloads(user);
    const activeAccount = accounts.find(account => account.status === 'active') || accounts[0] || null;
    return {
        success: true,
        token: createMobileToken(user),
        tokenType: 'Bearer',
        expiresIn: TOKEN_TTL_SECONDS,
        user: userPayload(user),
        accounts,
        defaultAccountNumber: activeAccount?.accountNumber || null,
    };
}

async function mobileAuth(req, res, next) {
    try {
        const header = req.get('authorization') || '';
        const match = header.match(/^Bearer\s+(.+)$/i);
        if (!match) return sendError(res, 401, 'Token manquant', 'AUTH_REQUIRED');

        const payload = verifyMobileToken(match[1]);
        const user = await User.findById(payload.sub);
        if (!user) return sendError(res, 401, 'Utilisateur introuvable', 'AUTH_REQUIRED');
        if (['inactive', 'suspended'].includes(user.status)) {
            return sendError(res, 403, 'Compte inactif ou suspendu', 'ACCOUNT_DISABLED');
        }

        req.user = user;
        req.isAuthenticated = () => true;
        next();
    } catch (error) {
        const code = error.message === 'TOKEN_EXPIRED' ? 'TOKEN_EXPIRED' : 'AUTH_REQUIRED';
        return sendError(res, 401, 'Session mobile invalide', code);
    }
}

async function mobileAccount(req, res, next) {
    const accountNumber = String(req.params.accountNumber || '').trim();
    if (!accountNumber) return sendError(res, 400, 'Espace manquant', 'ACCOUNT_REQUIRED');

    const isMember = (req.user.accounts || []).some(account => String(account.account_number) === accountNumber);
    if (!isMember) return sendError(res, 403, 'Acces refuse a cet espace', 'ACCOUNT_FORBIDDEN');

    req.account_number = accountNumber;
    res.locals.account_number = accountNumber;
    res.locals.path = req.originalUrl;
    return connectToTenantDb(req, res, next);
}

function cleanText(value, fallback = '') {
    const text = String(value ?? '').trim();
    return text || fallback;
}

function normalizeOptions(options, fallback) {
    const source = Array.isArray(options) && options.length ? options : fallback;
    return source
        .map((item, index) => ({
            label: cleanText(item?.label, ''),
            color: typeof item?.color === 'string' ? item.color : '',
            order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
        }))
        .filter(item => item.label)
        .sort((a, b) => a.order - b.order);
}

function optionColor(options, label, fallback = '#9ca3af') {
    const found = (options || []).find(item => item.label === label);
    return found?.color || fallback;
}

function normalizeStatus(value) {
    const text = cleanText(value, STATUS_TODO).toLowerCase();
    if (text.includes('termin') || text === 'done' || text === 'completed') return STATUS_DONE;
    return STATUS_TODO;
}

function normalizePriority(value) {
    const raw = cleanText(value, 'Aucune');
    const text = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    if (text.includes('urgent')) return 'Urgente';
    if (text.includes('important') || text.includes('haute') || text.includes('high')) return 'Haute';
    if (text.includes('normal') || text.includes('moyenne') || text.includes('medium')) return 'Moyenne';
    if (text.includes('basse') || text.includes('low')) return 'Basse';
    return 'Aucune';
}

function cleanListLabel(label) {
    const text = cleanText(label, 'Taches du jour');
    const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (normalized === 'general' || /^taches?\s+du\s+jour$/.test(normalized)) return 'T\u00e2ches du jour';
    return text;
}

function isTodayList(list) {
    const normalized = cleanText(list?.label, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    return normalized === 'general' || /^taches?\s+du\s+jour$/.test(normalized);
}

function parseColorInt(color, fallback = 0xFF6F55DC) {
    const hex = cleanText(color, '').replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return fallback;
    return Number.parseInt(`FF${hex}`, 16);
}

function formatReminderTime(date, timeZone) {
    try {
        return new Intl.DateTimeFormat('fr-FR', {
            timeZone: resolveTimeZone(timeZone),
            hour: '2-digit',
            minute: '2-digit',
        }).format(date instanceof Date ? date : new Date(date));
    } catch (_) {
        return '';
    }
}

function taskReminderMessage(task, scheduledAt, timeZone) {
    const time = formatReminderTime(scheduledAt, timeZone);
    return time ? `Rappel a ${time}` : `Rappel pour ${cleanText(task?.title, 'cette tache')}`;
}

async function upsertTaskReminder(req, task, reminderInput) {
    if (!reminderInput) return null;
    if (reminderInput.enabled === false) {
        await ReminderService.cancelReminderForTarget({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: 'task',
            targetId: task._id,
            slotKey: reminderInput.slotKey || 'default',
        });
        return null;
    }

    return ReminderService.upsertReminder({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetModel: 'RecordTask',
        targetId: task._id,
        slotKey: reminderInput.slotKey || 'default',
        title: reminderInput.title || task.title,
        message: reminderInput.message || taskReminderMessage(task, reminderInput.scheduledAt, reminderInput.timeZone),
        scheduledAt: reminderInput.scheduledAt,
        timeZone: reminderInput.timeZone,
        channel: reminderInput.channel || 'local',
        metadata: {
            ...(reminderInput.metadata || {}),
            taskTitle: task.title,
            source: 'mobile',
        },
    });
}

async function cancelTaskReminder(req, task, slotKey = 'default') {
    return ReminderService.cancelReminderForTarget({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetId: task._id,
        slotKey,
    });
}

function resolveTimeZone(value) {
    const fallback = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const zone = cleanText(value, '');
    if (!zone) return fallback;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date());
        return zone;
    } catch (_) {
        return fallback;
    }
}

function dayTools(req) {
    const timeZone = resolveTimeZone(req.query?.tz || 'Africa/Casablanca');
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const formatKey = value => {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
        return `${parts.year}-${parts.month}-${parts.day}`;
    };
    const addDays = days => {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + days);
        return formatKey(date);
    };
    const requestedDate = cleanText(req.query?.date, '');
    const day = cleanText(req.query?.day, 'today').toLowerCase();
    const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
        ? requestedDate
        : day === 'tomorrow'
            ? addDays(1)
            : formatKey(new Date());

    return { timeZone, dateKey, day };
}

function taskDateKey(task, tools) {
    const value = task.startDate || task.dueDate || null;
    return value ? tools.formatKey?.(value) || '' : '';
}

function taskOverdueDateKey(task, tools) {
    const value = task.dueDate || task.startDate || null;
    return value ? tools.formatKey?.(value) || '' : '';
}

function taskMatchesDate(task, targetKey, tools) {
    const value = task.startDate || task.dueDate || null;
    if (!value) return false;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    return tools.formatKey(date) === targetKey;
}

async function ensurePersonalTaskRecord(req) {
    const Entity = await tenantCollection(req, 'Entity');
    const Record = await tenantCollection(req, 'Record');
    const slug = 'dexapp-personal-space';

    let entity = await Entity.findOne({ slug });
    if (!entity) {
        entity = await Entity.create({
            name: 'Espace perso',
            nameSingular: 'Espace perso',
            namePlural: 'Espace perso',
            slug,
            icon: 'solar:user-rounded-bold-duotone',
            color: '#7c3aed',
            isSystem: true,
            enabledStandardFields: ['title', 'description'],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
            createdBy: req.user?._id,
        });
    }

    let record = await Record.findOne({ entityId: entity._id, slug });
    if (!record) {
        record = await Record.create({
            entityId: entity._id,
            title: 'Espace perso',
            computedTitle: 'Espace perso',
            slug,
            icon: 'solar:user-rounded-bold-duotone',
            color: '#7c3aed',
            published: true,
            status: 'published',
            createdBy: req.user?._id,
        });
    }

    return { entity, record };
}

async function ensurePersonalTaskList(req) {
    const { entity, record } = await ensurePersonalTaskRecord(req);
    const { TaskList } = await taskTenantModels(req);
    const lists = await TaskList.find({ recordId: record._id }).sort({ order: 1, createdAt: 1 });
    let list = lists.find(item => cleanListLabel(item.label).toLowerCase() === 't\u00e2ches du jour'.toLowerCase());

    if (!list) {
        list = await TaskList.create({
            recordId: record._id,
            label: 'T\u00e2ches du jour',
            color: '#6366f1',
            icon: 'solar:checklist-bold-duotone',
            order: lists.length,
            statuses: defaultStatuses,
            priorities: defaultPriorities,
        });
    }

    return { entity, record, list };
}

async function tenantRecordIds(req) {
    const Record = await tenantCollection(req, 'Record');
    return Record.find({}).distinct('_id');
}

async function loadTenantTask(req, taskId) {
    if (!/^[a-f\d]{24}$/i.test(String(taskId || ''))) return null;
    const ids = await tenantRecordIds(req);
    if (!ids.length) return null;
    const { RecordTask } = await taskTenantModels(req);
    return RecordTask.findOne({ _id: taskId, recordId: { $in: ids } });
}

async function serializeSingleTask(req, task) {
    const Record = await tenantCollection(req, 'Record');
    const Entity = await tenantCollection(req, 'Entity');
    const { TaskList } = await taskTenantModels(req);
    const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null;
    const record = task.recordId ? await Record.findById(task.recordId).select('title computedTitle referenceTitle entityId icon color').lean() : null;
    const entity = record?.entityId ? await Entity.findById(record.entityId).select('name slug icon color').lean() : null;
    const reminder = await ReminderService.findReminderForTarget({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetId: task._id,
    });
    return serializeTaskRow(req, task.toObject ? task.toObject() : task, list, record, entity, reminder);
}

function serializeTaskRow(req, task, list, record, entity, reminder = null) {
    const statuses = normalizeOptions(list?.statuses, defaultStatuses);
    const priorities = normalizeOptions(list?.priorities, defaultPriorities);
    const status = cleanText(task.status, STATUS_TODO);
    const priority = cleanText(task.priority, 'Aucune');
    const done = status === STATUS_DONE;
    const recordTitle = record?.computedTitle || record?.referenceTitle || record?.title || 'Sans titre';
    const listId = list?._id?.toString?.() || task.taskListId?.toString?.() || '';
    const recordId = record?._id?.toString?.() || task.recordId?.toString?.() || '';
    const entitySlug = entity?.slug || '';
    const taskId = task._id?.toString?.() || String(task._id || '');

    return {
        id: taskId,
        _id: taskId,
        title: cleanText(task.title, 'Sans titre'),
        description: task.description || '',
        status,
        statusColor: task.statusColor || optionColor(statuses, status, '#9ca3af'),
        priority,
        priorityColor: task.priorityColor || optionColor(priorities, priority, ''),
        done,
        isDayPriority: !!task.isDayPriority,
        dueDate: task.dueDate || null,
        startDate: task.startDate || null,
        createdAt: task.createdAt || null,
        updatedAt: task.updatedAt || null,
        completedAt: task.completedAt || null,
        assignedTo: task.assignedTo || '',
        order: Number.isFinite(Number(task.order)) ? Number(task.order) : 0,
        attachments: Array.isArray(task.attachments) ? task.attachments.map(att => ({
            _id: att._id?.toString?.() || String(att._id || ''),
            filename: att.filename || '',
            originalName: att.originalName || att.filename || 'Fichier',
            mimeType: att.mimeType || '',
            size: Number(att.size || 0),
        })) : [],
        hasAttachment: Array.isArray(task.attachments) && task.attachments.length > 0,
        listId,
        taskListId: listId,
        listLabel: cleanListLabel(list?.label),
        listColor: list?.color || '#6366f1',
        listIcon: list?.icon || 'solar:checklist-bold-duotone',
        listIsToday: isTodayList(list),
        recordId,
        recordTitle,
        recordIcon: record?.icon || entity?.icon || 'solar:folder-bold-duotone',
        recordColor: record?.color || entity?.color || '#4361ee',
        recordColorInt: parseColorInt(record?.color || entity?.color || '#4361ee'),
        entityName: entity?.name || 'Sans entite',
        entitySlug,
        entityIcon: entity?.icon || 'solar:folder-bold-duotone',
        entityColor: entity?.color || '#4361ee',
        reminder: ReminderService.serializeReminder(reminder),
        link: recordId && entitySlug
            ? `/account/${req.account_number}/record/${entitySlug}/${recordId}/tasks?openTask=${taskId}`
            : `/account/${req.account_number}/tasks`,
    };
}

async function taskBoard(req) {
    const Entity = await tenantCollection(req, 'Entity');
    const Record = await tenantCollection(req, 'Record');
    const toolsBase = dayTools(req);
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: toolsBase.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const formatKey = value => {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
        return `${parts.year}-${parts.month}-${parts.day}`;
    };
    const tools = { ...toolsBase, formatKey };

    const recordIds = await Record.find({}).distinct('_id');
    if (!recordIds.length) {
        return {
            success: true,
            schedule: tools.day,
            dateKey: tools.dateKey,
            todayTasks: [],
            tasks: [],
            completedToday: [],
            taskLists: [],
            stats: { totalTasks: 0, doneTasks: 0, openTasks: 0, todayTasks: 0, overdueCount: 0, listsCount: 0 },
            overdueTasks: [],
        };
    }

    const { TaskList, RecordTask } = await taskTenantModels(req);
    const [allLists, allTasks] = await Promise.all([
        TaskList.find({ recordId: { $in: recordIds } }).sort({ order: 1, createdAt: 1 }).lean(),
        RecordTask.find({ recordId: { $in: recordIds } }).sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    const recordIdSet = new Set();
    allLists.forEach(list => { if (list?.recordId) recordIdSet.add(list.recordId.toString()); });
    allTasks.forEach(task => { if (task?.recordId) recordIdSet.add(task.recordId.toString()); });

    const records = recordIdSet.size
        ? await Record.find({ _id: { $in: [...recordIdSet] } })
            .select('title computedTitle referenceTitle entityId icon color updatedAt createdAt')
            .lean()
        : [];
    const recordMap = new Map(records.map(record => [record._id.toString(), record]));
    const entityIds = [...new Set(records.map(record => record.entityId?.toString()).filter(Boolean))];
    const entities = entityIds.length
        ? await Entity.find({ _id: { $in: entityIds } }).select('name slug icon color').lean()
        : [];
    const entityMap = new Map(entities.map(entity => [entity._id.toString(), entity]));
    const listMap = new Map(allLists.map(list => [list._id.toString(), list]));
    const reminderMap = await ReminderService.scheduledReminderMap({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetIds: allTasks.map(task => task._id),
    });

    const rows = allTasks
        .filter(task => recordMap.has(task.recordId?.toString?.() || ''))
        .map(task => {
            const record = recordMap.get(task.recordId?.toString?.() || '');
            const entity = record?.entityId ? entityMap.get(record.entityId.toString()) : null;
            return serializeTaskRow(
                req,
                task,
                listMap.get(task.taskListId?.toString?.() || ''),
                record,
                entity,
                reminderMap.get(task._id?.toString?.() || '')
            );
        });

    const isDone = task => task.status === STATUS_DONE || task.done;
    const isBeforeTarget = task => {
        const key = taskOverdueDateKey(task, tools);
        return !!key && key < tools.dateKey;
    };
    const isOverdue = task => !isDone(task) && isBeforeTarget(task);
    const compareBoardTasks = (a, b) => {
        const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
        const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
        if (ao !== bo) return ao - bo;
        const ad = new Date(a.startDate || a.dueDate || 8640000000000000).getTime();
        const bd = new Date(b.startDate || b.dueDate || 8640000000000000).getTime();
        if (ad !== bd) return ad - bd;
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    };
    const taskTimestamp = value => {
        const time = new Date(value || 0).getTime();
        return Number.isNaN(time) ? 0 : time;
    };
    const compareCompletedTasks = (a, b) => {
        const at = taskTimestamp(a.completedAt || a.updatedAt);
        const bt = taskTimestamp(b.completedAt || b.updatedAt);
        if (at !== bt) return bt - at;
        const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
        const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
        if (ao !== bo) return ao - bo;
        return taskTimestamp(b.createdAt) - taskTimestamp(a.createdAt);
    };

    const overdueTasks = rows
        .filter(isOverdue)
        .sort(compareBoardTasks);

    const selected = rows
        .filter(task => {
            if (tools.day === 'overdue') {
                return isOverdue(task);
            }
            if (tools.day === 'tomorrow' || req.query?.date) {
                return taskMatchesDate(task, tools.dateKey, tools);
            }
            const key = taskDateKey(task, tools);
            if (isOverdue(task)) return false;
            if (key) return key === tools.dateKey;
            return task.isDayPriority || task.listIsToday;
        })
        .sort(compareBoardTasks);

    const completedToday = rows.filter(task => {
        if (!isDone(task)) return false;
        const checkDate = task.completedAt || task.updatedAt;
        return checkDate && formatKey(checkDate) === tools.dateKey;
    }).sort(compareCompletedTasks);

    const tasksByList = {};
    rows.forEach(task => {
        if (!task.listId) return;
        if (!tasksByList[task.listId]) tasksByList[task.listId] = [];
        tasksByList[task.listId].push(task);
    });

    const taskLists = allLists.map(list => {
        const record = recordMap.get(list.recordId?.toString?.() || '');
        const entity = record?.entityId ? entityMap.get(record.entityId.toString()) : null;
        const tasks = (tasksByList[list._id.toString()] || []).slice().sort((a, b) => a.order - b.order);
        return {
            id: list._id.toString(),
            _id: list._id.toString(),
            label: cleanListLabel(list.label),
            rawLabel: list.label || '',
            color: list.color || '#6366f1',
            icon: list.icon || 'solar:checklist-bold-duotone',
            statuses: normalizeOptions(list.statuses, defaultStatuses),
            priorities: normalizeOptions(list.priorities, defaultPriorities),
            recordId: record?._id?.toString?.() || '',
            recordTitle: record?.computedTitle || record?.referenceTitle || record?.title || 'Sans titre',
            entityName: entity?.name || 'Sans entite',
            count: tasks.length,
            doneCount: tasks.filter(isDone).length,
            tasks,
        };
    });

    const doneTasks = rows.filter(isDone).length;
    const overdueCount = rows.filter(isOverdue).length;

    return {
        success: true,
        schedule: tools.day,
        dateKey: tools.dateKey,
        todayTasks: selected,
        tasks: selected.filter(task => !isDone(task)),
        overdueTasks,
        completedToday,
        taskLists,
        stats: {
            totalTasks: rows.length,
            doneTasks,
            openTasks: rows.length - doneTasks,
            todayTasks: selected.length,
            overdueCount,
            listsCount: allLists.length,
        },
    };
}

router.post('/auth/login', async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const password = String(req.body?.password || '');

        if (!email || !password) return sendError(res, 400, 'Email et mot de passe requis', 'VALIDATION_ERROR');

        const user = await User.findOne({ email });
        if (!user) return sendError(res, 401, "Cet email n'est pas enregistre", 'INVALID_CREDENTIALS');
        if (user.status === 'suspended') return sendError(res, 403, 'Votre compte est suspendu', 'ACCOUNT_SUSPENDED');
        if (user.status === 'inactive') return sendError(res, 403, 'Votre compte est desactive', 'ACCOUNT_INACTIVE');
        if (user.status === 'pending' || (user.emailVerified === false && user.verificationToken)) {
            return sendError(res, 403, 'Compte non confirme. Verifiez votre email.', 'EMAIL_NOT_VERIFIED');
        }
        if (!user.password) return sendError(res, 400, 'Ce compte utilise Google', 'GOOGLE_ACCOUNT');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return sendError(res, 401, 'Mot de passe incorrect', 'INVALID_CREDENTIALS');

        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        res.json(await authResponse(user));
    } catch (error) {
        console.error('[MobileAPI] Login error:', error);
        sendError(res, 500, 'Erreur serveur');
    }
});

router.post('/auth/register', async (req, res) => {
    try {
        const name = cleanText(req.body?.name, '');
        const email = normalizeEmail(req.body?.email);
        const password = String(req.body?.password || '');
        const confirmPassword = String(req.body?.confirmPassword || req.body?.password || '');
        const errors = [];

        if (!name) errors.push('Le nom est requis');
        if (!email) errors.push("L'email est requis");
        if (!password || password.length < 6) errors.push('Le mot de passe doit contenir au moins 6 caracteres');
        if (password !== confirmPassword) errors.push('Les mots de passe ne correspondent pas');
        if (errors.length) return sendError(res, 400, errors.join('. '), 'VALIDATION_ERROR');

        const existing = await User.findOne({ email });
        if (existing) return sendError(res, 409, 'Cet email est deja utilise', 'EMAIL_EXISTS');

        const newUser = new User({
            name,
            email,
            password,
            authProvider: 'local',
            status: 'pending',
            emailVerified: false,
            role: 'user',
            membership: {
                plan: 'free',
                startDate: new Date(),
                maxAccounts: 1,
                maxUsersPerAccount: 3,
                storageLimit: 500,
            },
            loginCount: 0,
        });

        let accountNumber;
        let attempts = 0;
        do {
            accountNumber = String(5000 + Math.floor(Math.random() * 5000));
            // eslint-disable-next-line no-await-in-loop
            const duplicate = await Account.findOne({ account_number: accountNumber });
            if (!duplicate) break;
            attempts += 1;
        } while (attempts < 100);

        if (attempts >= 100) {
            return sendError(res, 500, "Impossible de generer un numero d'espace unique");
        }

        await ensureTenantDatabase(accountNumber);
        await newUser.save();

        const newAccount = new Account({
            name: `${name}'s Workspace`,
            icon: 'solar:home-2-bold-duotone',
            ownerId: newUser._id,
            users: [{
                userId: newUser._id.toString(),
                email: newUser.email,
                role: 'owner',
                status: 'active',
            }],
            account_number: accountNumber,
            status: 'active',
        });
        await newAccount.save();

        newUser.accounts.push({
            account_number: accountNumber,
            name: newAccount.name,
            icon: 'solar:home-2-bold-duotone',
            role: 'owner',
        });
        await newUser.save();

        const inviteToken = cleanText(req.body?.inviteToken, '');
        if (inviteToken) {
            try {
                const invitedAccount = await Account.findOne({
                    'invitations.token': inviteToken,
                    'invitations.status': 'pending',
                });
                const invite = invitedAccount?.invitations?.find(item => item.token === inviteToken && item.status === 'pending');
                if (invitedAccount && invite && (!invite.expiresAt || new Date() < new Date(invite.expiresAt))) {
                    invitedAccount.users.push({
                        userId: newUser._id.toString(),
                        email: newUser.email,
                        role: invite.role,
                        status: 'active',
                        invitedBy: invite.invitedBy,
                        joinedAt: new Date(),
                    });
                    invite.status = 'accepted';
                    await invitedAccount.save();

                    newUser.accounts.push({
                        account_number: invitedAccount.account_number,
                        name: invitedAccount.name,
                        icon: invitedAccount.icon || 'solar:home-2-bold-duotone',
                        role: invite.role,
                        joinedAt: new Date(),
                    });
                    await newUser.save();
                    await convertPendingInvitesToGrants(invitedAccount.account_number, newUser.email, newUser._id);
                }
            } catch (inviteError) {
                console.error('[MobileAPI] Auto-accept invite error:', inviteError.message);
            }
        }

        await issueVerificationEmail(req, newUser);

        res.status(201).json({
            success: true,
            verificationRequired: true,
            message: 'Compte cree. Verifiez votre email pour confirmer votre compte avant connexion.',
            user: userPayload(newUser),
        });
    } catch (error) {
        console.error('[MobileAPI] Register error:', error);
        sendError(res, 500, 'Erreur serveur');
    }
});

router.post('/auth/forgot-password', async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        if (!email) return sendError(res, 400, "L'email est requis", 'VALIDATION_ERROR');

        const user = await User.findOne({ email });
        if (user && !['inactive', 'suspended'].includes(user.status)) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = hashToken(rawToken);
            user.resetPasswordExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
            await user.save({ validateBeforeSave: false });

            try {
                await mailer.sendPasswordReset({
                    to: user.email,
                    name: user.name || user.email,
                    resetUrl: buildResetUrl(req, rawToken),
                    expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
                });
            } catch (mailError) {
                console.error('[MobileAPI] Password reset email error:', mailError.message);
            }
        }

        res.json({ success: true, message: PASSWORD_RESET_SENT_MESSAGE });
    } catch (error) {
        console.error('[MobileAPI] Forgot password error:', error);
        sendError(res, 500, 'Erreur serveur');
    }
});

router.get('/me', mobileAuth, async (req, res) => {
    res.json({
        success: true,
        user: userPayload(req.user),
        accounts: await accountPayloads(req.user),
    });
});

router.use('/accounts/:accountNumber', mobileAuth, mobileAccount);

router.get('/accounts/:accountNumber/reminders', async (req, res) => {
    try {
        const reminders = await ReminderService.listReminders({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: req.query?.targetType,
            status: req.query?.status || 'scheduled',
            dueBefore: req.query?.dueBefore,
        });

        res.json({
            success: true,
            reminders: reminders.map(ReminderService.serializeReminder),
        });
    } catch (error) {
        console.error('[MobileAPI] List reminders error:', error);
        sendCaughtError(res, error);
    }
});

router.get('/accounts/:accountNumber/tasks/today', async (req, res) => {
    try {
        res.json(await taskBoard(req));
    } catch (error) {
        console.error('[MobileAPI] Tasks board error:', error);
        sendError(res, 500, error.message || 'Erreur serveur');
    }
});

router.get('/accounts/:accountNumber/tasks/:taskId', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');
        res.json({ success: true, task: await serializeSingleTask(req, task) });
    } catch (error) {
        console.error('[MobileAPI] Task detail error:', error);
        sendError(res, 500, error.message || 'Erreur serveur');
    }
});

router.post('/accounts/:accountNumber/tasks/:taskId/reminder', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);
        if (!reminderInput) return sendError(res, 400, 'Date de rappel requise', 'VALIDATION_ERROR');

        const reminder = await upsertTaskReminder(req, task, reminderInput);
        res.json({
            success: true,
            reminder: ReminderService.serializeReminder(reminder),
            task: await serializeSingleTask(req, task),
        });
    } catch (error) {
        console.error('[MobileAPI] Upsert task reminder error:', error);
        sendCaughtError(res, error);
    }
});

router.delete('/accounts/:accountNumber/tasks/:taskId/reminder', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        await cancelTaskReminder(req, task);
        res.json({
            success: true,
            reminder: null,
            task: await serializeSingleTask(req, task),
        });
    } catch (error) {
        console.error('[MobileAPI] Delete task reminder error:', error);
        sendCaughtError(res, error);
    }
});

router.post('/accounts/:accountNumber/tasks', async (req, res) => {
    try {
        const title = cleanText(req.body?.title, '');
        if (!title) return sendError(res, 400, 'Title required', 'VALIDATION_ERROR');
        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);

        const target = await ensurePersonalTaskList(req);
        const { RecordTask } = await taskTenantModels(req);
        const order = await RecordTask.countDocuments({ taskListId: target.list._id });
        const status = normalizeStatus(req.body?.status);
        const priority = normalizePriority(req.body?.priority);
        const priorities = normalizeOptions(target.list.priorities, defaultPriorities);
        const statuses = normalizeOptions(target.list.statuses, defaultStatuses);

        const schedule = cleanText(req.body?.schedule || req.query?.day, 'today').toLowerCase();
        const startDate = req.body?.startDate
            || (schedule === 'tomorrow'
                ? (() => {
                    const date = new Date();
                    date.setDate(date.getDate() + 1);
                    return date.toISOString().slice(0, 10);
                })()
                : null);

        const task = await RecordTask.create({
            taskListId: target.list._id,
            recordId: target.record._id,
            title,
            description: cleanText(req.body?.description, ''),
            status,
            statusColor: optionColor(statuses, status, '#9ca3af'),
            priority,
            priorityColor: optionColor(priorities, priority, ''),
            isDayPriority: req.body?.isDayPriority !== undefined ? !!req.body.isDayPriority : schedule !== 'tomorrow',
            startDate,
            dueDate: req.body?.dueDate || null,
            assignedTo: cleanText(req.body?.assignedTo, ''),
            order,
            completedAt: status === STATUS_DONE ? new Date() : null,
        });

        if (reminderInput?.enabled) {
            await upsertTaskReminder(req, task, reminderInput);
        }

        res.status(201).json({ success: true, task: await serializeSingleTask(req, task) });
    } catch (error) {
        console.error('[MobileAPI] Create task error:', error);
        sendCaughtError(res, error);
    }
});

router.post('/accounts/:accountNumber/tasks/reorder', async (req, res) => {
    try {
        const taskIds = Array.isArray(req.body?.taskIds) ? req.body.taskIds : [];
        const normalized = [...new Set(taskIds
            .map(id => String(id || ''))
            .filter(id => /^[a-f\d]{24}$/i.test(id)))];
        if (!normalized.length) return sendError(res, 400, 'taskIds array required', 'VALIDATION_ERROR');

        const ids = await tenantRecordIds(req);
        const { RecordTask } = await taskTenantModels(req);
        const existingTasks = await RecordTask.find({
            _id: { $in: normalized },
            recordId: { $in: ids },
        }).select('_id').lean();
        const allowedIds = new Set(existingTasks.map(task => task._id.toString()));
        const orderedAllowedTaskIds = normalized.filter(id => allowedIds.has(id));
        if (!orderedAllowedTaskIds.length) {
            return res.json({ success: true });
        }

        const allTasks = await RecordTask.find({ recordId: { $in: ids } })
            .select('_id order')
            .sort({ order: 1, createdAt: -1 })
            .lean();
        const orderedSet = new Set(orderedAllowedTaskIds);
        const remainingTasks = allTasks.filter(task => !orderedSet.has(task._id.toString()));

        const reorderedTaskIds = [
            ...orderedAllowedTaskIds.map((id, index) => ({ id, order: index })),
            ...remainingTasks.map((task, index) => ({
                id: task._id.toString(),
                order: orderedAllowedTaskIds.length + index,
            })),
        ];

        const currentOrderById = new Map(
            allTasks.map(task => [task._id.toString(), Number(task.order) || 0]),
        );
        const bulkOps = reorderedTaskIds
            .filter(({ id, order }) => currentOrderById.get(id) !== order)
            .map(({ id, order }) => ({
                updateOne: {
                    filter: { _id: id },
                    update: { $set: { order } },
                },
            }));
        if (bulkOps.length > 0) await RecordTask.bulkWrite(bulkOps);

        res.json({ success: true });
    } catch (error) {
        console.error('[MobileAPI] Reorder tasks error:', error);
        sendError(res, 500, error.message || 'Erreur serveur');
    }
});

router.patch('/accounts/:accountNumber/tasks/:taskId', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        const updates = {};
        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);
        const { TaskList } = await taskTenantModels(req);
        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null;
        const statuses = normalizeOptions(list?.statuses, defaultStatuses);
        const priorities = normalizeOptions(list?.priorities, defaultPriorities);

        if (req.body?.title !== undefined) {
            const title = cleanText(req.body.title, '');
            if (!title) return sendError(res, 400, 'Title required', 'VALIDATION_ERROR');
            updates.title = title;
        }
        if (req.body?.description !== undefined) updates.description = cleanText(req.body.description, '');
        if (req.body?.priority !== undefined) {
            updates.priority = normalizePriority(req.body.priority);
            updates.priorityColor = optionColor(priorities, updates.priority, '');
        }
        if (req.body?.status !== undefined) {
            updates.status = normalizeStatus(req.body.status);
            updates.statusColor = optionColor(statuses, updates.status, '#9ca3af');
            updates.completedAt = updates.status === STATUS_DONE ? new Date() : null;
        }
        if (req.body?.done !== undefined) {
            updates.status = req.body.done ? STATUS_DONE : STATUS_TODO;
            updates.statusColor = optionColor(statuses, updates.status, '#9ca3af');
            updates.completedAt = req.body.done ? new Date() : null;
        }
        if (req.body?.isDayPriority !== undefined) updates.isDayPriority = !!req.body.isDayPriority;
        if (req.body?.startDate !== undefined) updates.startDate = req.body.startDate || null;
        if (req.body?.dueDate !== undefined) updates.dueDate = req.body.dueDate || null;
        if (req.body?.assignedTo !== undefined) updates.assignedTo = cleanText(req.body.assignedTo, '');

        if (!Object.keys(updates).length && !reminderInput) {
            return sendError(res, 400, 'No valid fields to update', 'VALIDATION_ERROR');
        }

        if (Object.keys(updates).length) {
            Object.assign(task, updates);
            await task.save();
        }

        if (reminderInput) {
            await upsertTaskReminder(req, task, reminderInput);
        }

        res.json({ success: true, task: await serializeSingleTask(req, task) });
    } catch (error) {
        console.error('[MobileAPI] Update task error:', error);
        sendCaughtError(res, error);
    }
});

router.delete('/accounts/:accountNumber/tasks/:taskId', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        await cancelTaskReminder(req, task);
        await task.deleteOne();
        res.json({ success: true });
    } catch (error) {
        console.error('[MobileAPI] Delete task error:', error);
        sendCaughtError(res, error);
    }
});

router.post('/accounts/:accountNumber/tasks/:taskId/toggle', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        const { TaskList } = await taskTenantModels(req);
        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null;
        const statuses = normalizeOptions(list?.statuses, defaultStatuses);
        const done = req.body?.done !== undefined ? !!req.body.done : task.status !== STATUS_DONE;
        task.status = done ? STATUS_DONE : STATUS_TODO;
        task.statusColor = optionColor(statuses, task.status, '#9ca3af');
        task.completedAt = done ? new Date() : null;
        await task.save();
        if (done) await cancelTaskReminder(req, task);

        res.json({ success: true, task: await serializeSingleTask(req, task) });
    } catch (error) {
        console.error('[MobileAPI] Toggle task error:', error);
        sendCaughtError(res, error);
    }
});

module.exports = router;

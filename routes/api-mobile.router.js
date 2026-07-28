const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');

const dbConfig = require('../config/db');
const User = require('../models/user.model');
const Account = require('../models/account.model');
const TaskListShare = require('../models/task-list-share.model');
const mailer = require('../services/mailer');
const ReminderService = require('../services/reminders/reminder.service');
const { connectToTenantDb, tenantCollection } = require('../middleware/tenant');
const {
    taskTenantModels,
    GlobalTaskList,
    GlobalRecordTask,
    GlobalTaskComment,
} = require('../services/task-tenant-models.service');
const TaskOverview = require('../services/task-overview.service');
const TaskListsService = require('../services/task-lists.service');
const TaskImagesService = require('../services/task-images.service');
const TaskAgentService = require('../services/record-ai-task-bridge.service');
const MobileAgendaService = require('../services/mobile-agenda.service');
const MobileNotesService = require('../services/mobile-notes.service');
const {
    getAccountTaskPriorities,
    priorityOptionFor,
} = require('../services/task-priorities.service');
const {
    createAccountUser,
    RegistrationError,
} = require('../services/account-registration.service');

const router = express.Router();

const { STATUS_TODO, STATUS_DONE, defaultStatuses } = TaskOverview;
const TOKEN_TTL_SECONDS = Number(process.env.MOBILE_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 30);
const EMAIL_VERIFICATION_TTL_HOURS = 24;
const EMAIL_VERIFICATION_TTL_MS = EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MINUTES = 60;
const PASSWORD_RESET_TTL_MS = PASSWORD_RESET_TTL_MINUTES * 60 * 1000;
const PASSWORD_RESET_SENT_MESSAGE = "Si un compte existe avec cet email, un lien de reinitialisation vient d'etre envoye.";
const sharedTenantConnections = new Map();

async function sharedTenantConnection(accountNumber) {
    const key = String(accountNumber || '').trim();
    if (!key) return null;
    if (sharedTenantConnections.has(key)) return sharedTenantConnections.get(key);

    const connectionPromise = new Promise((resolve, reject) => {
        const connection = mongoose.createConnection(dbConfig.tenantDbUri(key), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
        });
        connection.once('open', () => resolve(connection));
        connection.once('error', reject);
    });

    sharedTenantConnections.set(key, connectionPromise);
    return connectionPromise;
}

async function sharedTenantTaskModels(accountNumber) {
    const connection = await sharedTenantConnection(accountNumber);
    if (!connection) return null;
    const TaskList = connection.models.TaskList
        || connection.model('TaskList', GlobalTaskList.schema);
    const RecordTask = connection.models.RecordTask
        || connection.model('RecordTask', GlobalRecordTask.schema);
    const TaskComment = connection.models.TaskComment
        || connection.model('TaskComment', GlobalTaskComment.schema);
    return { TaskList, RecordTask, TaskComment };
}

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
    const status = Number(error?.statusCode || error?.status || 500);
    return sendError(
        res,
        status >= 400 && status <= 599 ? status : 500,
        error.message || fallback,
        error.code
    );
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function normalizePhone(value) {
    return String(value || '').trim().replace(/[^\d+]/g, '');
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
        phone: user.phone || '',
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
    return TaskOverview.normalizeOptions(options, fallback);
}

function optionColor(options, label, fallback = '#9ca3af') {
    return TaskOverview.optionColor(options, label, fallback);
}

function normalizeStatus(value) {
    return TaskOverview.normalizeStatus(value);
}

function cleanListLabel(label) {
    return TaskOverview.cleanListLabel(label);
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
        message: reminderInput.message || '',
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
    if (slotKey && slotKey !== 'default') {
        return ReminderService.cancelReminderForTarget({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: 'task',
            targetId: task._id,
            slotKey,
        });
    }
    return ReminderService.cancelRemindersForTarget({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetId: task._id,
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
    const accountPriorities = await getAccountTaskPriorities(req);
    const lists = await TaskList.find({ recordId: record._id }).sort({ order: 1, createdAt: 1 });
    let list = lists.find(item => TaskListsService.cleanTaskListLabel(item.label).toLowerCase() === TaskListsService.DEFAULT_ACCOUNT_TASK_LIST_LABEL.toLowerCase());

    if (!list) {
        list = await TaskList.create({
            recordId: record._id,
            label: TaskListsService.DEFAULT_ACCOUNT_TASK_LIST_LABEL,
            color: '#6366f1',
            icon: 'solar:checklist-bold-duotone',
            order: lists.length,
            contextType: 'account',
            isDefault: true,
            statuses: defaultStatuses,
            priorities: accountPriorities,
        });
    } else if (!list.contextType || !list.isDefault) {
        list = await TaskList.findByIdAndUpdate(
            list._id,
            { $set: { contextType: 'account', isDefault: true } },
            { new: true }
        );
    }

    return { entity, record, list };
}

function cleanTaskListColor(value, fallback = '#6366f1') {
    return TaskListsService.cleanTaskListColor(value, fallback);
}

function cleanTaskListIcon(value, fallback = 'list') {
    return TaskListsService.cleanTaskListIcon(value, fallback);
}

function mergeTaskListTagOptions(existingTags = [], inputTags = []) {
    const existing = TaskListsService.normalizeTaskTagOptions(existingTags);
    const next = [...existing];
    const existingKeys = new Set(
        existing.map(tag => TaskListsService.normalizeOptionLabel(tag.label)),
    );

    for (const tag of TaskListsService.normalizeTaskTagOptions(inputTags)) {
        const key = TaskListsService.normalizeOptionLabel(tag.label);
        if (!key || existingKeys.has(key)) continue;
        existingKeys.add(key);
        next.push({
            ...tag,
            order: next.length,
        });
    }

    return TaskListsService.normalizeTaskTagOptions(next);
}

async function upsertTaskListTagOptions(access, inputTags = []) {
    const nextTags = mergeTaskListTagOptions(access.list?.tags || [], inputTags);
    const previous = JSON.stringify(TaskListsService.normalizeTaskTagOptions(access.list?.tags || []));
    const next = JSON.stringify(nextTags);
    if (previous !== next) {
        await access.TaskList.findByIdAndUpdate(
            access.list._id,
            { $set: { tags: nextTags } },
            { new: true },
        );
        access.list = {
            ...(access.list || {}),
            tags: nextTags,
        };
    }
    return nextTags;
}

function normalizeTagRenamePairs(renames = []) {
    return (Array.isArray(renames) ? renames : [])
        .map(item => ({
            from: cleanText(item?.from, ''),
            to: cleanText(item?.to, ''),
        }))
        .filter(item => item.from && item.to);
}

function syncTaskTagsWithListOptions(currentTags = [], previousOptions = [], nextOptions = [], renames = []) {
    const nextByKey = new Map(
        TaskListsService.normalizeTaskTagOptions(nextOptions)
            .map(tag => [TaskListsService.normalizeOptionLabel(tag.label), tag]),
    );
    const renameByKey = new Map(
        normalizeTagRenamePairs(renames)
            .map(pair => [TaskListsService.normalizeOptionLabel(pair.from), pair.to]),
    );
    const synced = [];
    const seen = new Set();

    for (const tag of TaskListsService.normalizeTaskTags(currentTags, previousOptions)) {
        const renamed = renameByKey.get(TaskListsService.normalizeOptionLabel(tag.label)) || tag.label;
        const key = TaskListsService.normalizeOptionLabel(renamed);
        const next = nextByKey.get(key);
        if (!next || seen.has(key)) continue;
        seen.add(key);
        synced.push({
            label: next.label,
            color: next.color || tag.color || '#6366f1',
            order: next.order ?? synced.length,
        });
    }

    return synced;
}

async function replaceTaskListTagOptions(access, inputTags = [], renames = []) {
    const previousTags = TaskListsService.normalizeTaskTagOptions(access.list?.tags || []);
    const nextTags = TaskListsService.normalizeTaskTagOptions(inputTags);
    await access.TaskList.findByIdAndUpdate(
        access.list._id,
        { $set: { tags: nextTags } },
        { new: true },
    );

    const tasks = await access.RecordTask.find({ taskListId: access.list._id }).select('_id tags');
    for (const task of tasks) {
        const synced = syncTaskTagsWithListOptions(task.tags, previousTags, nextTags, renames);
        if (JSON.stringify(task.tags || []) === JSON.stringify(synced)) continue;
        task.tags = synced;
        await task.save();
    }

    access.list = {
        ...(access.list || {}),
        tags: nextTags,
    };
    return nextTags;
}

function taskListTaskStats(tasks = []) {
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(task => task.status === STATUS_DONE || task.done === true).length;
    const members = [...new Set(tasks
        .map(task => cleanText(task.assignedTo, ''))
        .filter(Boolean))]
        .slice(0, 4);
    return {
        totalTasks,
        doneTasks,
        openTasks: Math.max(0, totalTasks - doneTasks),
        members,
    };
}

function serializeMobileTaskList(list, tasks = []) {
    const stats = taskListTaskStats(tasks);
    const listId = list._id?.toString?.() || String(list._id || '');
    const displayOptions = TaskListsService.normalizeTaskListDisplayOptions(list.displayOptions);
    return {
        id: listId,
        _id: listId,
        label: cleanListLabel(list.label),
        color: cleanTaskListColor(list.color, '#6366f1'),
        icon: cleanTaskListIcon(list.icon, 'list'),
        order: Number.isFinite(Number(list.order)) ? Number(list.order) : 0,
        contextType: list.contextType || 'account',
        isDefault: !!list.isDefault,
        showInMyLists: !!list.showInMyLists,
        myListOrder: Number(list.myListOrder) || 0,
        displayOptions,
        addTasksToToday: displayOptions.dayMode,
        isShared: false,
        isFavorite: false,
        ...stats,
    };
}

function currentUserShareQuery(req) {
    const email = normalizeEmail(req.user?.email);
    const phone = normalizePhone(req.user?.phone);
    const clauses = [
        { targetUserId: req.user._id },
        ...(email ? [{ targetEmail: email }] : []),
        ...(phone ? [{ targetPhone: phone }] : []),
    ];
    return {
        status: 'active',
        targetType: { $in: ['contact', 'user'] },
        $or: clauses,
    };
}

async function sharedTaskLists(req) {
    const shares = await TaskListShare.find(currentUserShareQuery(req))
        .sort({ createdAt: -1 })
        .lean();
    if (!shares.length) return [];

    const ownerIds = [...new Set(shares.map(share => String(share.ownerUserId || '')).filter(Boolean))];
    const owners = ownerIds.length
        ? await User.find({ _id: { $in: ownerIds } }).select('_id name email avatar').lean()
        : [];
    const ownerById = new Map(owners.map(owner => [owner._id.toString(), owner]));

    const sharesByAccount = new Map();
    for (const share of shares) {
        const accountNumber = String(share.ownerAccountNumber || '').trim();
        const listId = String(share.listId || '').trim();
        if (!accountNumber || !listId) continue;
        if (!sharesByAccount.has(accountNumber)) sharesByAccount.set(accountNumber, []);
        sharesByAccount.get(accountNumber).push(share);
    }

    const results = [];
    for (const [accountNumber, accountShares] of sharesByAccount.entries()) {
        const models = await sharedTenantTaskModels(accountNumber);
        if (!models) continue;

        const listIds = [...new Set(accountShares.map(share => String(share.listId || '')).filter(Boolean))];
        const lists = await models.TaskList.find({ _id: { $in: listIds } }).lean();
        const listById = new Map(lists.map(list => [list._id.toString(), list]));
        const tasks = listIds.length
            ? await models.RecordTask.find({ taskListId: { $in: listIds } })
                .select('taskListId status done assignedTo')
                .lean()
            : [];
        const tasksByListId = new Map();
        for (const task of tasks) {
            const taskListId = task.taskListId?.toString?.() || '';
            if (!tasksByListId.has(taskListId)) tasksByListId.set(taskListId, []);
            tasksByListId.get(taskListId).push(task);
        }
        const listShares = listIds.length
            ? await TaskListShare.find({
                ownerAccountNumber: accountNumber,
                listId: { $in: listIds },
                status: 'active',
            }).lean()
            : [];
        const listSharesById = groupSharesByListId(listShares);
        const memberUsersById = await userMapForShareMembers(listShares, ownerIds);

        for (const share of accountShares) {
            const list = listById.get(String(share.listId || ''));
            if (!list) continue;
            const owner = ownerById.get(String(share.ownerUserId || '')) || {};
            const ownerName = cleanText(owner.name, owner.email || 'Partage');
            const members = memberSummaryFromShares(
                listSharesById.get(String(share.listId || '')) || [share],
                memberUsersById,
                { includeOwner: true, ownerUserId: share.ownerUserId },
            );
            results.push({
                ...serializeMobileTaskList(list, tasksByListId.get(list._id.toString()) || []),
                isShared: true,
                shareId: share._id?.toString?.() || String(share._id || ''),
                ownerAccountNumber: accountNumber,
                role: share.role || 'editor',
                members: members.members.length ? members.members : [ownerName],
                memberAvatars: members.memberAvatars.length
                    ? members.memberAvatars
                    : (owner.avatar ? [owner.avatar] : []),
            });
        }
    }

    return results;
}

function shareObjectId(value) {
    return value?.toString?.() || String(value || '');
}

function groupSharesByListId(shares = []) {
    const grouped = new Map();
    for (const share of shares) {
        const listId = String(share.listId || '').trim();
        if (!listId) continue;
        if (!grouped.has(listId)) grouped.set(listId, []);
        grouped.get(listId).push(share);
    }
    return grouped;
}

async function userMapForShareMembers(shares = [], extraUserIds = []) {
    const userIds = [
        ...extraUserIds,
        ...shares.map(share => shareObjectId(share.targetUserId)),
    ].map(id => String(id || '').trim()).filter(Boolean);
    const uniqueIds = [...new Set(userIds)];
    const users = uniqueIds.length
        ? await User.find({ _id: { $in: uniqueIds } }).select('_id name email avatar').lean()
        : [];
    return new Map(users.map(user => [user._id.toString(), user]));
}

function pushUniqueText(target, value) {
    const text = cleanText(value, '');
    if (text && !target.includes(text)) target.push(text);
}

function shareTargetName(share, user = {}) {
    return cleanText(
        user.name,
        user.email || share.targetName || share.targetEmail || share.targetPhone || 'Membre',
    );
}

function memberSummaryFromShares(shares = [], userById = new Map(), options = {}) {
    const members = [];
    const memberAvatars = [];

    if (options.includeOwner && options.ownerUserId) {
        const owner = userById.get(shareObjectId(options.ownerUserId)) || {};
        pushUniqueText(members, cleanText(owner.name, owner.email || 'Proprietaire'));
        pushUniqueText(memberAvatars, owner.avatar);
    }

    for (const share of shares) {
        const user = userById.get(shareObjectId(share.targetUserId)) || {};
        pushUniqueText(members, shareTargetName(share, user));
        pushUniqueText(memberAvatars, user.avatar);
    }

    return {
        members: members.slice(0, 8),
        memberAvatars: memberAvatars.slice(0, 8),
    };
}

async function decorateOwnedTaskListsWithShares(req, lists = []) {
    const listIds = lists
        .map(list => String(list.id || list._id || list.listId || '').trim())
        .filter(Boolean);
    if (!listIds.length) {
        return lists.map(list => ({ ...list, role: list.role || 'owner' }));
    }

    const shares = await TaskListShare.find({
        ownerAccountNumber: req.account_number,
        listId: { $in: listIds },
        status: 'active',
    }).lean();
    if (!shares.length) {
        return lists.map(list => ({ ...list, role: list.role || 'owner' }));
    }

    const sharesByListId = groupSharesByListId(shares);
    const usersById = await userMapForShareMembers(shares);

    return lists.map(list => {
        const listId = String(list.id || list._id || list.listId || '').trim();
        const listShares = sharesByListId.get(listId) || [];
        if (!listShares.length) return { ...list, role: list.role || 'owner' };
        const members = memberSummaryFromShares(listShares, usersById);
        return {
            ...list,
            isShared: true,
            role: 'owner',
            ownerAccountNumber: req.account_number,
            members: members.members,
            memberAvatars: members.memberAvatars,
        };
    });
}

async function personalTaskLists(req) {
    const ownLists = await decorateOwnedTaskListsWithShares(
        req,
        await TaskListsService.listMyTaskLists(req),
    );
    const receivedLists = await sharedTaskLists(req);
    const seen = new Set(ownLists.map(list => String(list.id || list._id || '')));
    return [
        ...ownLists,
        ...receivedLists.filter(list => {
            const id = String(list.id || list._id || '');
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        }),
    ];
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
    const reminders = await ReminderService.listRemindersForTarget({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'task',
        targetId: task._id,
    });
    const accountPriorities = await getAccountTaskPriorities(req);
    const taskListTags = TaskListsService.normalizeTaskTagOptions(list?.tags || []);
    return TaskOverview.serializeTaskRow(req, task.toObject ? task.toObject() : task, list, record, entity, reminders, {
        priorities: accountPriorities,
        accountTags: taskListTags,
    });
}

function serializeTaskMessage(req, comment = {}) {
    const currentUserId = req.user?._id?.toString?.() || '';
    const userId = comment.userId?.toString?.() || String(comment.userId || '');
    const authorType = comment.authorType
        || (userId === 'dexio-ai' ? 'ai' : (comment.type === 'activity' ? 'system' : 'user'));
    const agent = comment.agent?.toObject
        ? comment.agent.toObject()
        : (comment.agent || {});
    return {
        id: comment._id?.toString?.() || String(comment._id || ''),
        taskId: comment.taskId?.toString?.() || String(comment.taskId || ''),
        type: comment.type || 'comment',
        text: comment.text || '',
        userId,
        userName: comment.userName || (authorType === 'ai' ? 'Dexio IA' : 'Membre'),
        userAvatar: comment.userAvatar || '',
        authorType,
        audience: comment.audience || 'team',
        isMine: authorType === 'user' && !!currentUserId && userId === currentUserId,
        isAi: authorType === 'ai',
        metadata: comment.metadata || {},
        agent: {
            status: agent.status || '',
            action: agent.action || '',
            createdSubtasks: (agent.createdSubtasks || []).map(item => ({
                title: item.title || '',
                subtaskId: item.subtaskId || '',
            })),
            model: agent.model || '',
            errorCode: agent.errorCode || '',
            recordAgentConversationId: agent.recordAgentConversationId?.toString?.()
                || String(agent.recordAgentConversationId || ''),
            recordAgentRunId: agent.recordAgentRunId?.toString?.()
                || String(agent.recordAgentRunId || ''),
        },
        createdAt: comment.createdAt || null,
    };
}

function normalizeMobileAiContextType(value) {
    const type = String(value || '').trim().toLowerCase();
    return ['task', 'task_list', 'note'].includes(type) ? type : '';
}

async function loadMobileAiContext(req, rawType, contextId) {
    const type = normalizeMobileAiContextType(rawType);
    if (!type || !/^[a-f\d]{24}$/i.test(String(contextId || ''))) return null;

    if (type === 'task') {
        const task = await loadTenantTask(req, contextId);
        if (!task) return null;
        return {
            type,
            id: task._id.toString(),
            label: task.title || 'Tâche',
            recordId: task.recordId,
            task,
            list: null,
            imageCount: (task.attachments || []).filter(
                attachment => TaskImagesService.isImageAttachment(attachment)
            ).length
        };
    }

    if (type === 'note') {
        const RecordNote = await tenantCollection(req, 'RecordNote');
        const note = await RecordNote.findById(contextId).lean();
        if (!note) return null;
        if (note.isProtected) {
            const error = new Error(
                "Déverrouille cette note avant de l'utiliser avec l'IA."
            );
            error.statusCode = 403;
            error.code = 'PROTECTED_NOTE_AI_FORBIDDEN';
            throw error;
        }
        return {
            type,
            id: note._id.toString(),
            label: note.title || 'Note',
            recordId: note.recordId,
            task: null,
            list: null,
            note,
            imageCount: 0
        };
    }

    const access = await loadMobileTaskListAccess(req, contextId);
    if (!access) return null;
    if (access.shared) {
        const error = new Error(
            "Le chat IA d'une liste partagée sera bientôt disponible."
        );
        error.statusCode = 403;
        error.code = 'SHARED_LIST_AI_UNAVAILABLE';
        throw error;
    }
    const taskCount = await access.RecordTask.countDocuments({
        taskListId: access.list._id
    });
    return {
        type,
        id: access.list._id.toString(),
        label: access.list.label || 'Liste',
        recordId: access.list.recordId,
        task: null,
        list: access.list,
        taskCount,
        imageCount: 0
    };
}

async function findMobileAiConversation(req, aiContext) {
    const RecordAgentConversation = await tenantCollection(
        req,
        'RecordAgentConversation'
    );
    return RecordAgentConversation.findOne({
        recordId: aiContext.recordId,
        userId: String(req.user._id),
        contextType: aiContext.type,
        contextId: aiContext.id,
        archived: { $ne: true }
    }).sort({ updatedAt: -1 });
}

async function mobileAiRuns(req, aiContext, conversationId = '') {
    let conversation = null;
    if (/^[a-f\d]{24}$/i.test(String(conversationId || ''))) {
        const RecordAgentConversation = await tenantCollection(
            req,
            'RecordAgentConversation'
        );
        conversation = await RecordAgentConversation.findOne({
            _id: conversationId,
            recordId: aiContext.recordId,
            userId: String(req.user._id),
            contextType: aiContext.type,
            contextId: aiContext.id,
            archived: { $ne: true }
        });
    }
    conversation = conversation || await findMobileAiConversation(req, aiContext);
    if (!conversation) return { conversation: null, runs: [] };

    const RecordAgentRun = await tenantCollection(req, 'RecordAgentRun');
    const runs = await RecordAgentRun.find({
        recordId: aiContext.recordId,
        userId: String(req.user._id),
        conversationId: conversation._id,
        archived: { $ne: true }
    })
        .sort({ createdAt: -1 })
        .limit(80)
        .lean();
    return { conversation, runs: runs.reverse() };
}

function serializeMobileAiMessages(runs = []) {
    return (runs || []).flatMap(run => {
        const createdItems = TaskAgentService.collectMobileCreatedItems(run);
        const pendingActionCount = (run.proposedActions || []).filter(
            action => action.status === 'proposed'
        ).length;
        const hasError = run.status === 'error' || Boolean(run.error);
        return [
            {
                id: `${run._id}-user`,
                role: 'user',
                text: run.goal || '',
                imageCount: Number(run.contextStats?.userImageCount || 0),
                createdItems: [],
                pendingActionCount: 0,
                hasError: false,
                createdAt: run.createdAt || null
            },
            {
                id: `${run._id}-assistant`,
                role: 'assistant',
                text: hasError
                    ? (run.error || "L'IA n'a pas pu traiter cette demande.")
                    : TaskAgentService.buildMobileAgentReply(run),
                imageCount: 0,
                createdItems,
                pendingActionCount,
                hasError,
                createdAt: run.updatedAt || run.createdAt || null
            }
        ];
    });
}

function serializeMobileAiContext(aiContext) {
    return {
        type: aiContext.type,
        id: aiContext.id,
        label: aiContext.label,
        imageCount: Number(aiContext.imageCount || 0),
        taskCount: Number(aiContext.taskCount || 0)
    };
}

async function loadMobileTaskListAccess(req, listId) {
    if (!/^[a-f\d]{24}$/i.test(String(listId || ''))) return null;

    const tenantModels = await taskTenantModels(req);
    const ownList = await tenantModels.TaskList.findById(listId).lean();
    if (ownList) {
        return {
            ...tenantModels,
            list: ownList,
            shared: false,
            canEdit: true,
            accountNumber: req.account_number,
        };
    }

    const share = await TaskListShare.findOne({
        ...currentUserShareQuery(req),
        listId: String(listId),
    }).lean();
    if (!share) return null;

    const sharedModels = await sharedTenantTaskModels(share.ownerAccountNumber);
    if (!sharedModels) return null;
    const sharedList = await sharedModels.TaskList.findById(listId).lean();
    if (!sharedList) return null;

    return {
        ...sharedModels,
        list: sharedList,
        share,
        shared: true,
        canEdit: ['editor', 'admin'].includes(share.role),
        accountNumber: String(share.ownerAccountNumber || ''),
    };
}

function serializeListTask(req, access, task) {
    return TaskOverview.serializeTaskRow(
        { account_number: access.accountNumber || req.account_number },
        task.toObject ? task.toObject() : task,
        access.list,
        null,
        null,
        null,
        {
            priorities: access.list?.priorities,
            accountTags: access.list?.tags,
        },
    );
}

async function taskBoard(req) {
    return TaskOverview.buildTaskBoard(req);
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
        const registration = await createAccountUser({
            req,
            name: req.body?.name,
            email: req.body?.email,
            password: req.body?.password,
            confirmPassword: req.body?.confirmPassword || req.body?.password,
            plan: req.body?.plan || 'free',
            role: 'user',
            requireEmailVerification: true,
            requirePasswordConfirmation: true,
            inviteToken: req.body?.inviteToken,
        });

        return res.status(201).json({
            success: true,
            verificationRequired: true,
            message: 'Compte cree. Verifiez votre email pour confirmer votre compte avant connexion.',
            user: userPayload(registration.user),
        });

    } catch (error) {
        if (error instanceof RegistrationError) {
            return sendError(res, error.status || 400, error.message, error.code);
        }

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

router.use(
    '/accounts/:accountNumber/task-sharing',
    require('./api/api-task-sharing.router.js'),
);
router.use('/accounts/:accountNumber/team', require('./api/api-team.router.js'));

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

router.get('/accounts/:accountNumber/agenda-events', async (req, res) => {
    try {
        const events = await MobileAgendaService.listAgendaEvents(req, req.query || {});
        res.json({ success: true, events });
    } catch (error) {
        console.error('[MobileAPI] List agenda events error:', error);
        sendCaughtError(res, error, 'Lecture de agenda impossible');
    }
});

router.post('/accounts/:accountNumber/agenda-events', async (req, res) => {
    try {
        const event = await MobileAgendaService.createAgendaEvent(req, req.body || {});
        res.status(201).json({ success: true, event });
    } catch (error) {
        console.error('[MobileAPI] Create agenda event error:', error);
        sendCaughtError(res, error, 'Creation de la date impossible');
    }
});

router.patch('/accounts/:accountNumber/agenda-events/:eventId', async (req, res) => {
    try {
        const event = await MobileAgendaService.updateAgendaEvent(
            req,
            req.params.eventId,
            req.body || {},
        );
        res.json({ success: true, event });
    } catch (error) {
        console.error('[MobileAPI] Update agenda event error:', error);
        sendCaughtError(res, error, 'Modification de la date impossible');
    }
});

router.delete('/accounts/:accountNumber/agenda-events/:eventId', async (req, res) => {
    try {
        await MobileAgendaService.deleteAgendaEvent(req, req.params.eventId);
        res.json({ success: true });
    } catch (error) {
        console.error('[MobileAPI] Delete agenda event error:', error);
        sendCaughtError(res, error, 'Suppression de la date impossible');
    }
});

async function upsertAgendaEventReminder(req, event, reminderInput) {
    return ReminderService.upsertReminder({
        accountNumber: req.account_number,
        userId: req.user._id,
        targetType: 'agenda_event',
        targetModel: 'Record',
        targetId: event.id,
        slotKey: reminderInput.slotKey || 'default',
        title: reminderInput.title || event.title,
        message: reminderInput.message || '',
        scheduledAt: reminderInput.scheduledAt,
        timeZone: reminderInput.timeZone,
        channel: reminderInput.channel || 'local',
        metadata: {
            ...(reminderInput.metadata || {}),
            eventTitle: event.title,
            eventDate: event.startAt,
            source: 'mobile',
        },
    });
}

router.post('/accounts/:accountNumber/agenda-events/:eventId/reminders', async (req, res) => {
    try {
        const event = await MobileAgendaService.getAgendaEvent(req, req.params.eventId);
        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);
        if (!reminderInput || reminderInput.enabled === false) {
            return sendError(res, 400, 'Date de rappel requise', 'VALIDATION_ERROR');
        }
        if (!req.body?.slotKey || reminderInput.slotKey === 'default') {
            reminderInput.slotKey = `mobile-${Date.now().toString(36)}`;
        }
        const reminder = await upsertAgendaEventReminder(req, event, reminderInput);
        res.status(201).json({
            success: true,
            reminder: ReminderService.serializeReminder(reminder),
            event: await MobileAgendaService.getAgendaEvent(req, req.params.eventId),
        });
    } catch (error) {
        console.error('[MobileAPI] Create agenda reminder error:', error);
        sendCaughtError(res, error);
    }
});

router.patch('/accounts/:accountNumber/agenda-events/:eventId/reminders/:reminderId', async (req, res) => {
    try {
        const event = await MobileAgendaService.getAgendaEvent(req, req.params.eventId);
        const current = await ReminderService.findReminderByIdForTarget({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: 'agenda_event',
            targetId: event.id,
            reminderId: req.params.reminderId,
        });
        if (!current) return sendError(res, 404, 'Rappel introuvable', 'REMINDER_NOT_FOUND');

        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);
        if (!reminderInput || reminderInput.enabled === false) {
            return sendError(res, 400, 'Date de rappel requise', 'VALIDATION_ERROR');
        }
        reminderInput.slotKey = current.slotKey;
        const reminder = await upsertAgendaEventReminder(req, event, reminderInput);
        res.json({
            success: true,
            reminder: ReminderService.serializeReminder(reminder),
            event: await MobileAgendaService.getAgendaEvent(req, req.params.eventId),
        });
    } catch (error) {
        console.error('[MobileAPI] Update agenda reminder error:', error);
        sendCaughtError(res, error);
    }
});

router.delete('/accounts/:accountNumber/agenda-events/:eventId/reminders/:reminderId', async (req, res) => {
    try {
        const event = await MobileAgendaService.getAgendaEvent(req, req.params.eventId);
        const reminder = await ReminderService.cancelReminderByIdForTarget({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: 'agenda_event',
            targetId: event.id,
            reminderId: req.params.reminderId,
        });
        if (!reminder) return sendError(res, 404, 'Rappel introuvable', 'REMINDER_NOT_FOUND');
        res.json({
            success: true,
            reminder: null,
            event: await MobileAgendaService.getAgendaEvent(req, req.params.eventId),
        });
    } catch (error) {
        console.error('[MobileAPI] Delete agenda reminder error:', error);
        sendCaughtError(res, error);
    }
});

router.get('/accounts/:accountNumber/notes', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        const notes = await MobileNotesService.listNotes(req, req.query || {});
        res.json({ success: true, notes, totalNotes: notes.length });
    } catch (error) {
        console.error('[MobileAPI] List notes error:', error);
        sendCaughtError(res, error, 'Lecture des notes impossible');
    }
});

router.get('/accounts/:accountNumber/notes/targets', async (req, res) => {
    try {
        const targets = await MobileNotesService.listNoteTargets(
            req,
            req.query || {},
        );
        res.json({ success: true, targets });
    } catch (error) {
        console.error('[MobileAPI] List note targets error:', error);
        sendCaughtError(res, error, 'Lecture des fiches impossible');
    }
});

router.post('/accounts/:accountNumber/notes', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        const note = await MobileNotesService.createNote(req, req.body || {});
        res.status(201).json({ success: true, note });
    } catch (error) {
        console.error('[MobileAPI] Create note error:', error);
        sendCaughtError(res, error, 'Création de la note impossible');
    }
});

router.post(
    '/accounts/:accountNumber/notes/:noteId/biometric-unlock',
    async (req, res) => {
        try {
            if (req.body?.biometricConfirmation !== true) {
                return sendError(
                    res,
                    400,
                    'Confirmation biométrique requise.',
                    'BIOMETRIC_CONFIRMATION_REQUIRED',
                );
            }
            res.setHeader('Cache-Control', 'no-store');
            const note = await MobileNotesService.unlockNoteWithBiometrics(
                req,
                req.params.noteId,
            );
            console.info(
                `[MobileAPI] Protected note unlocked user=${req.user._id} note=${req.params.noteId}`,
            );
            res.json({ success: true, note });
        } catch (error) {
            console.error('[MobileAPI] Unlock note error:', error);
            sendCaughtError(res, error, 'Déverrouillage de la note impossible');
        }
    },
);

router.patch('/accounts/:accountNumber/notes/:noteId', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        const note = await MobileNotesService.updateNote(
            req,
            req.params.noteId,
            req.body || {},
        );
        res.json({ success: true, note });
    } catch (error) {
        console.error('[MobileAPI] Update note error:', error);
        sendCaughtError(res, error, 'Modification de la note impossible');
    }
});

router.delete('/accounts/:accountNumber/notes/:noteId', async (req, res) => {
    try {
        await MobileNotesService.deleteNote(
            req,
            req.params.noteId,
            req.body || {},
        );
        res.json({ success: true });
    } catch (error) {
        console.error('[MobileAPI] Delete note error:', error);
        sendCaughtError(res, error, 'Suppression de la note impossible');
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

router.get('/accounts/:accountNumber/tasks/priorities', async (req, res) => {
    try {
        res.json({ success: true, priorities: await getAccountTaskPriorities(req) });
    } catch (error) {
        console.error('[MobileAPI] Task priorities error:', error);
        sendError(res, 500, error.message || 'Erreur serveur');
    }
});

router.get('/accounts/:accountNumber/tasks/tags', async (req, res) => {
    try {
        res.json({ success: true, tags: await TaskListsService.getAccountTaskTags(req) });
    } catch (error) {
        console.error('[MobileAPI] Task tags error:', error);
        sendError(res, 500, error.message || 'Erreur serveur');
    }
});

router.put('/accounts/:accountNumber/tasks/tags', async (req, res) => {
    try {
        const tags = Array.isArray(req.body?.tags) ? req.body.tags : null;
        if (!tags) return sendError(res, 400, 'Tags array required', 'VALIDATION_ERROR');
        const cleaned = await TaskListsService.replaceAccountTaskTags(req, {
            tags,
            renames: Array.isArray(req.body?.renames) ? req.body.renames : [],
        });
        res.json({ success: true, tags: cleaned });
    } catch (error) {
        console.error('[MobileAPI] Update task tags error:', error);
        sendCaughtError(res, error);
    }
});

router.get('/accounts/:accountNumber/ai-chat/messages', async (req, res) => {
    try {
        const aiContext = await loadMobileAiContext(
            req,
            req.query?.contextType,
            req.query?.contextId
        );
        if (!aiContext) {
            return sendError(
                res,
                404,
                'Contexte IA introuvable',
                'AI_CONTEXT_NOT_FOUND'
            );
        }
        const { conversation, runs } = await mobileAiRuns(req, aiContext);
        res.json({
            success: true,
            conversationId: conversation?._id?.toString?.() || '',
            context: serializeMobileAiContext(aiContext),
            messages: serializeMobileAiMessages(runs)
        });
    } catch (error) {
        console.error('[MobileAPI] Read AI chat error:', error);
        sendCaughtError(res, error, 'Lecture du chat IA impossible');
    }
});

router.post(
    '/accounts/:accountNumber/ai-chat/messages',
    TaskImagesService.uploadImages,
    async (req, res) => {
        try {
            const aiContext = await loadMobileAiContext(
                req,
                req.body?.contextType,
                req.body?.contextId
            );
            if (!aiContext) {
                return sendError(
                    res,
                    404,
                    'Contexte IA introuvable',
                    'AI_CONTEXT_NOT_FOUND'
                );
            }

            const uploadedAttachments = (req.files || [])
                .map(file =>
                    TaskImagesService.attachmentFromFile(req, file, req.user._id)
                )
                .filter(Boolean);
            const uploadedVision = TaskImagesService.visionContent(
                req.account_number,
                uploadedAttachments,
                { maxImages: 4, detail: 'high' }
            );
            const taskVision = aiContext.task
                ? TaskImagesService.visionContent(
                    req.account_number,
                    aiContext.task.attachments || [],
                    { maxImages: 4, detail: 'high' }
                )
                : [];
            const imageContent = [
                ...uploadedVision,
                ...taskVision
            ].slice(0, 4);
            const rawText = cleanText(req.body?.text, '').slice(0, 5000);
            const text = rawText || (
                uploadedAttachments.length
                    ? (
                        aiContext.type === 'task_list'
                            ? 'Analyse ces photos et crée dans cette liste les tâches à faire aujourd’hui.'
                            : 'Analyse ces photos et crée les sous-tâches utiles pour cette tâche.'
                    )
                    : ''
            );
            if (!text) {
                return sendError(
                    res,
                    400,
                    'Message ou photo requis',
                    'VALIDATION_ERROR'
                );
            }

            const result = await TaskAgentService.runMobileAiAgent({
                req,
                contextType: aiContext.type,
                task: aiContext.task,
                list: aiContext.list,
                note: aiContext.note,
                recordId: aiContext.recordId,
                userMessage: text,
                conversationId: cleanText(req.body?.conversationId, ''),
                imageContent,
                uploadedImageCount: uploadedAttachments.length
            });
            const { conversation, runs } = await mobileAiRuns(
                req,
                aiContext,
                result.conversation?._id?.toString?.() || ''
            );
            res.status(201).json({
                success: true,
                conversationId: conversation?._id?.toString?.() || '',
                context: serializeMobileAiContext(aiContext),
                messages: serializeMobileAiMessages(runs),
                createdItems: result.createdItems,
                pendingActionCount: result.pendingActionCount,
                ...(aiContext.task
                    ? { task: await serializeSingleTask(req, aiContext.task) }
                    : {})
            });
        } catch (error) {
            console.error('[MobileAPI] Send AI chat message error:', error);
            sendCaughtError(res, error, 'Envoi au chat IA impossible');
        } finally {
            TaskImagesService.cleanupRequestFiles(req);
        }
    }
);

router.get('/accounts/:accountNumber/task-lists', async (req, res) => {
    try {
        res.json({ success: true, lists: await personalTaskLists(req) });
    } catch (error) {
        console.error('[MobileAPI] Task lists error:', error);
        sendCaughtError(res, error);
    }
});

router.post('/accounts/:accountNumber/task-lists', async (req, res) => {
    try {
        const label = cleanText(req.body?.label, '');
        if (!label) return sendError(res, 400, 'Nom de liste requis', 'VALIDATION_ERROR');

        const { record } = await ensurePersonalTaskRecord(req);
        const { TaskList, RecordTask } = await taskTenantModels(req);
        const existingLists = await TaskList.find({ recordId: record._id }).sort({ order: 1, createdAt: 1 });
        const duplicate = existingLists.find(list => cleanListLabel(list.label).toLowerCase() === label.toLowerCase());
        if (duplicate) return sendError(res, 409, 'Une liste porte déjà ce nom', 'TASK_LIST_EXISTS');

        const priorities = await getAccountTaskPriorities(req);
        const requestedDisplayOptions = req.body?.displayOptions
            && typeof req.body.displayOptions === 'object'
            ? req.body.displayOptions
            : {};
        const displayOptions = TaskListsService.normalizeTaskListDisplayOptions({
            ...requestedDisplayOptions,
            ...(req.body?.addTasksToToday !== undefined
                ? { dayMode: req.body.addTasksToToday === true }
                : {}),
        });
        const list = await TaskList.create({
            recordId: record._id,
            label,
            color: cleanTaskListColor(req.body?.color),
            icon: cleanTaskListIcon(req.body?.icon),
            order: existingLists.length,
            contextType: 'account',
            isDefault: false,
            showInMyLists: true,
            myListOrder: existingLists.length + 1,
            displayOptions,
            statuses: defaultStatuses,
            priorities,
        });

        const tasks = await RecordTask.find({ taskListId: list._id }).select('taskListId status done assignedTo').lean();
        res.status(201).json({ success: true, list: serializeMobileTaskList(list, tasks) });
    } catch (error) {
        console.error('[MobileAPI] Create task list error:', error);
        sendCaughtError(res, error);
    }
});

router.delete('/accounts/:accountNumber/task-lists/:listId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(String(req.params.listId || ''))) {
            return sendError(res, 404, 'Liste introuvable', 'TASK_LIST_NOT_FOUND');
        }

        const { TaskList, RecordTask, TaskComment } = await taskTenantModels(req);
        const list = await TaskList.findById(req.params.listId);
        if (!list) return sendError(res, 404, 'Liste introuvable', 'TASK_LIST_NOT_FOUND');
        if (list.isDefault) {
            return sendError(res, 403, 'Cette liste ne peut pas etre supprimee', 'TASK_LIST_PROTECTED');
        }

        const tasks = await RecordTask.find({ taskListId: list._id }).select('_id attachments').lean();
        const taskIds = tasks.map(task => task._id);
        await Promise.all(tasks.map(task => cancelTaskReminder(req, task)));
        if (taskIds.length) await TaskComment.deleteMany({ taskId: { $in: taskIds } });
        tasks.forEach(task => {
            (task.attachments || []).forEach(attachment => {
                TaskImagesService.removeFile(req.account_number, attachment.filename);
            });
        });
        await RecordTask.deleteMany({ taskListId: list._id });
        await TaskListShare.deleteMany({
            ownerAccountNumber: req.account_number,
            listId: String(list._id),
        });
        await list.deleteOne();

        res.json({ success: true });
    } catch (error) {
        console.error('[MobileAPI] Delete task list error:', error);
        sendCaughtError(res, error);
    }
});

router.put('/accounts/:accountNumber/task-lists/:listId/tags', async (req, res) => {
    try {
        const access = await loadMobileTaskListAccess(req, req.params.listId);
        if (!access) return sendError(res, 404, 'Liste introuvable', 'TASK_LIST_NOT_FOUND');
        if (!access.canEdit) return sendError(res, 403, 'Modification non autorisee', 'TASK_LIST_READONLY');

        const tags = Array.isArray(req.body?.tags) ? req.body.tags : null;
        if (!tags) return sendError(res, 400, 'Tags array required', 'VALIDATION_ERROR');
        const cleaned = await replaceTaskListTagOptions(
            access,
            tags,
            Array.isArray(req.body?.renames) ? req.body.renames : [],
        );
        res.json({ success: true, tags: cleaned });
    } catch (error) {
        console.error('[MobileAPI] Update task list tags error:', error);
        sendCaughtError(res, error);
    }
});

router.get('/accounts/:accountNumber/task-lists/:listId/tasks', async (req, res) => {
    try {
        const access = await loadMobileTaskListAccess(req, req.params.listId);
        if (!access) return sendError(res, 404, 'Liste introuvable', 'TASK_LIST_NOT_FOUND');

        const tasks = await access.RecordTask.find({ taskListId: access.list._id })
            .sort({ order: 1, createdAt: 1 })
            .lean();
        let list = serializeMobileTaskList(access.list, tasks);
        if (access.shared) {
            const shares = await TaskListShare.find({
                ownerAccountNumber: access.accountNumber,
                listId: String(access.list._id || req.params.listId),
                status: 'active',
            }).lean();
            const usersById = await userMapForShareMembers(shares, [shareObjectId(access.share?.ownerUserId)]);
            const members = memberSummaryFromShares(shares, usersById, {
                includeOwner: true,
                ownerUserId: access.share?.ownerUserId,
            });
            list = {
                ...list,
                isShared: true,
                shareId: shareObjectId(access.share?._id),
                role: access.share?.role || 'editor',
                ownerAccountNumber: access.accountNumber,
                members: members.members,
                memberAvatars: members.memberAvatars,
            };
        } else {
            [list] = await decorateOwnedTaskListsWithShares(req, [{
                ...list,
                isShared: false,
                role: 'owner',
                ownerAccountNumber: req.account_number,
            }]);
        }

        res.json({
            success: true,
            list,
            tasks: tasks.map(task => serializeListTask(req, access, task)),
        });
    } catch (error) {
        console.error('[MobileAPI] List tasks error:', error);
        sendCaughtError(res, error);
    }
});

router.post('/accounts/:accountNumber/task-lists/:listId/tasks', async (req, res) => {
    try {
        const access = await loadMobileTaskListAccess(req, req.params.listId);
        if (!access) return sendError(res, 404, 'Liste introuvable', 'TASK_LIST_NOT_FOUND');
        if (!access.canEdit) return sendError(res, 403, 'Modification non autorisee', 'TASK_LIST_READONLY');

        const title = cleanText(req.body?.title, '');
        if (!title) return sendError(res, 400, 'Title required', 'VALIDATION_ERROR');

        const statuses = normalizeOptions(access.list.statuses, defaultStatuses);
        const priorities = normalizeOptions(access.list.priorities, await getAccountTaskPriorities(req));
        const priorityOption = priorityOptionFor(req.body?.priority, priorities);
        const status = normalizeStatus(req.body?.status);
        const order = await access.RecordTask.countDocuments({ taskListId: access.list._id });
        const tagOptions = await upsertTaskListTagOptions(access, req.body?.tags);
        const scheduleDefaults = TaskListsService.taskListScheduleDefaults(access.list, {
            isDayPriority: req.body?.isDayPriority,
            startDate: req.body?.startDate,
            dueDate: req.body?.dueDate,
            timeZone: req.body?.timeZone || req.query?.tz,
        });

        const task = await access.RecordTask.create({
            taskListId: access.list._id,
            recordId: access.list.recordId,
            title,
            description: cleanText(req.body?.description, ''),
            status,
            statusColor: optionColor(statuses, status, '#9ca3af'),
            priority: priorityOption.label,
            priorityColor: priorityOption.color || '',
            tags: TaskListsService.normalizeTaskTags(req.body?.tags, tagOptions),
            subtasks: TaskListsService.normalizeTaskSubtasks(req.body?.subtasks),
            isDayPriority: scheduleDefaults.isDayPriority,
            startDate: scheduleDefaults.startDate,
            dueDate: scheduleDefaults.dueDate,
            assignedTo: cleanText(req.body?.assignedTo, ''),
            order,
            completedAt: status === STATUS_DONE ? new Date() : null,
        });

        res.status(201).json({ success: true, task: serializeListTask(req, access, task) });
    } catch (error) {
        console.error('[MobileAPI] Create list task error:', error);
        sendCaughtError(res, error);
    }
});

router.patch('/accounts/:accountNumber/task-lists/:listId/tasks/:taskId', async (req, res) => {
    try {
        const access = await loadMobileTaskListAccess(req, req.params.listId);
        if (!access) return sendError(res, 404, 'Liste introuvable', 'TASK_LIST_NOT_FOUND');
        if (!access.canEdit) return sendError(res, 403, 'Modification non autorisee', 'TASK_LIST_READONLY');

        const task = await access.RecordTask.findOne({
            _id: req.params.taskId,
            taskListId: access.list._id,
        });
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        const updates = {};
        const statuses = normalizeOptions(access.list.statuses, defaultStatuses);
        const priorities = normalizeOptions(access.list.priorities, await getAccountTaskPriorities(req));

        if (req.body?.title !== undefined) {
            const title = cleanText(req.body.title, '');
            if (!title) return sendError(res, 400, 'Title required', 'VALIDATION_ERROR');
            updates.title = title;
        }
        if (req.body?.description !== undefined) updates.description = cleanText(req.body.description, '');
        if (req.body?.priority !== undefined) {
            const priorityOption = priorityOptionFor(req.body.priority, priorities);
            updates.priority = priorityOption.label;
            updates.priorityColor = priorityOption.color || '';
        }
        if (req.body?.tags !== undefined) {
            const tagOptions = await upsertTaskListTagOptions(access, req.body.tags);
            updates.tags = TaskListsService.normalizeTaskTags(req.body.tags, tagOptions);
        }
        if (req.body?.subtasks !== undefined) {
            updates.subtasks = TaskListsService.normalizeTaskSubtasks(req.body.subtasks);
        }
        if (req.body?.status !== undefined) {
            updates.status = normalizeStatus(req.body.status);
            updates.statusColor = optionColor(statuses, updates.status, '#9ca3af');
            if (req.body.completedAt === undefined) {
                updates.completedAt = updates.status === STATUS_DONE ? new Date() : null;
            } else if (updates.status !== STATUS_DONE) {
                updates.completedAt = null;
            }
        }
        if (req.body?.done !== undefined) {
            updates.status = req.body.done ? STATUS_DONE : STATUS_TODO;
            updates.statusColor = optionColor(statuses, updates.status, '#9ca3af');
            if (req.body.completedAt === undefined) {
                updates.completedAt = req.body.done ? new Date() : null;
            } else if (!req.body.done) {
                updates.completedAt = null;
            }
        }
        if (req.body?.isDayPriority !== undefined) updates.isDayPriority = !!req.body.isDayPriority;
        if (req.body?.startDate !== undefined) updates.startDate = req.body.startDate || null;
        if (req.body?.dueDate !== undefined) updates.dueDate = req.body.dueDate || null;
        if (req.body?.completedAt !== undefined) {
            if (!req.body.completedAt) {
                updates.completedAt = null;
            } else {
                const completedAt = new Date(req.body.completedAt);
                if (Number.isNaN(completedAt.getTime())) return sendError(res, 400, 'Date de fin invalide', 'VALIDATION_ERROR');
                updates.completedAt = completedAt;
            }
        }
        if (updates.completedAt !== undefined) {
            const nextStatus = updates.status || task.status;
            if (nextStatus !== STATUS_DONE) updates.completedAt = null;
        }
        if (req.body?.assignedTo !== undefined) updates.assignedTo = cleanText(req.body.assignedTo, '');

        if (!Object.keys(updates).length) {
            return sendError(res, 400, 'No valid fields to update', 'VALIDATION_ERROR');
        }

        Object.assign(task, updates);
        await task.save();
        res.json({ success: true, task: serializeListTask(req, access, task) });
    } catch (error) {
        console.error('[MobileAPI] Update list task error:', error);
        sendCaughtError(res, error);
    }
});

router.post('/accounts/:accountNumber/task-lists/:listId/tasks/:taskId/toggle', async (req, res) => {
    try {
        const access = await loadMobileTaskListAccess(req, req.params.listId);
        if (!access) return sendError(res, 404, 'Liste introuvable', 'TASK_LIST_NOT_FOUND');
        if (!access.canEdit) return sendError(res, 403, 'Modification non autorisee', 'TASK_LIST_READONLY');

        const task = await access.RecordTask.findOne({
            _id: req.params.taskId,
            taskListId: access.list._id,
        });
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        const statuses = normalizeOptions(access.list.statuses, defaultStatuses);
        const done = req.body?.done !== undefined ? !!req.body.done : task.status !== STATUS_DONE;
        task.status = done ? STATUS_DONE : STATUS_TODO;
        task.statusColor = optionColor(statuses, task.status, '#9ca3af');
        task.completedAt = done ? new Date() : null;
        await task.save();

        res.json({ success: true, task: serializeListTask(req, access, task) });
    } catch (error) {
        console.error('[MobileAPI] Toggle list task error:', error);
        sendCaughtError(res, error);
    }
});

router.delete('/accounts/:accountNumber/task-lists/:listId/tasks/:taskId', async (req, res) => {
    try {
        const access = await loadMobileTaskListAccess(req, req.params.listId);
        if (!access) return sendError(res, 404, 'Liste introuvable', 'TASK_LIST_NOT_FOUND');
        if (!access.canEdit) return sendError(res, 403, 'Modification non autorisee', 'TASK_LIST_READONLY');

        const task = await access.RecordTask.findOne({
            _id: req.params.taskId,
            taskListId: access.list._id,
        });
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        await cancelTaskReminder({
            account_number: access.accountNumber || req.account_number,
            user: req.user,
        }, task);
        if (access.TaskComment) {
            await access.TaskComment.deleteMany({ taskId: task._id });
        }
        (task.attachments || []).forEach(attachment => {
            TaskImagesService.removeFile(
                access.accountNumber || req.account_number,
                attachment.filename,
            );
        });
        await task.deleteOne();
        res.json({ success: true });
    } catch (error) {
        console.error('[MobileAPI] Delete list task error:', error);
        sendCaughtError(res, error);
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

router.get('/accounts/:accountNumber/tasks/:taskId/messages', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');
        const { TaskComment } = await taskTenantModels(req);
        const comments = await TaskComment.find({ taskId: task._id })
            .sort({ createdAt: 1 })
            .limit(250)
            .lean();
        res.json({
            success: true,
            messages: comments.map(comment => serializeTaskMessage(req, comment)),
        });
    } catch (error) {
        console.error('[MobileAPI] Read task messages error:', error);
        sendCaughtError(res, error, 'Lecture de la conversation impossible');
    }
});

router.post('/accounts/:accountNumber/tasks/:taskId/messages', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');
        const text = cleanText(req.body?.text, '').slice(0, 5000);
        if (!text) return sendError(res, 400, 'Message requis', 'VALIDATION_ERROR');
        const askAi = req.body?.askAi === true
            || ['1', 'true', 'yes'].includes(String(req.body?.askAi || '').toLowerCase());
        const { TaskComment } = await taskTenantModels(req);
        const userComment = await TaskComment.create({
            taskId: task._id,
            recordId: task.recordId,
            type: 'comment',
            text,
            userId: req.user?._id?.toString?.() || '',
            userName: req.user?.name || req.user?.email || 'Membre',
            userAvatar: req.user?.avatar || '',
            authorType: 'user',
            audience: askAi ? 'ai' : 'team',
        });
        const responseMessages = [serializeTaskMessage(req, userComment)];
        let responseTask = task;
        let agentError = null;

        if (askAi) {
            const recentComments = await TaskComment.find({ taskId: task._id })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();
            try {
                const result = await TaskAgentService.runTaskAgent({
                    req,
                    task,
                    TaskComment,
                    userMessage: text,
                    recentComments: recentComments.reverse(),
                });
                responseMessages.push(serializeTaskMessage(req, result.assistantComment));
                responseTask = result.task || task;
            } catch (error) {
                console.error('[MobileAPI] Task agent error:', error);
                agentError = {
                    code: error.code || 'TASK_AGENT_ERROR',
                    message: error.message || "L'IA n'a pas pu traiter cette demande.",
                };
                const errorComment = await TaskAgentService.createTaskAgentErrorComment({
                    task,
                    TaskComment,
                    error,
                });
                responseMessages.push(serializeTaskMessage(req, errorComment));
            }
        }

        res.status(201).json({
            success: true,
            messages: responseMessages,
            task: await serializeSingleTask(req, responseTask),
            ...(agentError ? { agentError } : {}),
        });
    } catch (error) {
        console.error('[MobileAPI] Send task message error:', error);
        sendCaughtError(res, error, 'Envoi du message impossible');
    }
});

router.post(
    '/accounts/:accountNumber/tasks/:taskId/images',
    TaskImagesService.uploadImages,
    async (req, res) => {
        let persisted = false;
        try {
            const task = await loadTenantTask(req, req.params.taskId);
            if (!task) {
                TaskImagesService.cleanupRequestFiles(req);
                return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');
            }
            if (!req.files?.length) {
                return sendError(res, 400, 'Aucune image fournie', 'VALIDATION_ERROR');
            }

            const attachments = req.files
                .map(file => TaskImagesService.attachmentFromFile(req, file, req.user._id))
                .filter(Boolean);
            if (!attachments.length) {
                TaskImagesService.cleanupRequestFiles(req);
                return sendError(res, 400, 'Images invalides', 'VALIDATION_ERROR');
            }

            task.attachments = task.attachments || [];
            task.attachments.push(...attachments);
            await task.save();
            persisted = true;
            res.status(201).json({
                success: true,
                task: await serializeSingleTask(req, task),
            });
        } catch (error) {
            if (!persisted) TaskImagesService.cleanupRequestFiles(req);
            console.error('[MobileAPI] Upload task images error:', error);
            sendCaughtError(res, error, 'Upload des images impossible');
        }
    },
);

router.get('/accounts/:accountNumber/tasks/:taskId/images/:attachmentId/content', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');
        const attachment = typeof task.attachments?.id === 'function'
            ? task.attachments.id(req.params.attachmentId)
            : (task.attachments || []).find(item => String(item._id) === String(req.params.attachmentId));
        if (!attachment || !TaskImagesService.isImageAttachment(attachment)) {
            return sendError(res, 404, 'Image introuvable', 'IMAGE_NOT_FOUND');
        }
        const filePath = TaskImagesService.resolvePath(req.account_number, attachment.filename);
        if (!filePath) return sendError(res, 404, 'Image introuvable', 'IMAGE_NOT_FOUND');

        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.originalName || 'image')}"`);
        if (attachment.mimeType) res.type(attachment.mimeType);
        return res.sendFile(filePath);
    } catch (error) {
        console.error('[MobileAPI] Read task image error:', error);
        sendCaughtError(res, error, 'Lecture de l’image impossible');
    }
});

router.delete('/accounts/:accountNumber/tasks/:taskId/images/:attachmentId', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');
        const attachment = typeof task.attachments?.id === 'function'
            ? task.attachments.id(req.params.attachmentId)
            : (task.attachments || []).find(item => String(item._id) === String(req.params.attachmentId));
        if (!attachment || !TaskImagesService.isImageAttachment(attachment)) {
            return sendError(res, 404, 'Image introuvable', 'IMAGE_NOT_FOUND');
        }

        const filename = attachment.filename;
        if (typeof attachment.deleteOne === 'function') attachment.deleteOne();
        else task.attachments = (task.attachments || [])
            .filter(item => String(item._id) !== String(req.params.attachmentId));
        await task.save();
        TaskImagesService.removeFile(req.account_number, filename);
        res.json({
            success: true,
            task: await serializeSingleTask(req, task),
        });
    } catch (error) {
        console.error('[MobileAPI] Delete task image error:', error);
        sendCaughtError(res, error, 'Suppression de l’image impossible');
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

router.post('/accounts/:accountNumber/tasks/:taskId/reminders', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');

        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);
        if (!reminderInput || reminderInput.enabled === false) {
            return sendError(res, 400, 'Date de rappel requise', 'VALIDATION_ERROR');
        }
        if (!req.body?.slotKey || reminderInput.slotKey === 'default') {
            reminderInput.slotKey = `mobile-${Date.now().toString(36)}`;
        }

        const reminder = await upsertTaskReminder(req, task, reminderInput);
        res.status(201).json({
            success: true,
            reminder: ReminderService.serializeReminder(reminder),
            task: await serializeSingleTask(req, task),
        });
    } catch (error) {
        console.error('[MobileAPI] Create task reminder error:', error);
        sendCaughtError(res, error);
    }
});

router.patch('/accounts/:accountNumber/tasks/:taskId/reminders/:reminderId', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');
        const current = await ReminderService.findReminderByIdForTarget({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: 'task',
            targetId: task._id,
            reminderId: req.params.reminderId,
        });
        if (!current) return sendError(res, 404, 'Rappel introuvable', 'REMINDER_NOT_FOUND');

        const reminderInput = ReminderService.reminderPayloadFromBody(req.body);
        if (!reminderInput || reminderInput.enabled === false) {
            return sendError(res, 400, 'Date de rappel requise', 'VALIDATION_ERROR');
        }
        reminderInput.slotKey = current.slotKey;
        const reminder = await upsertTaskReminder(req, task, reminderInput);
        res.json({
            success: true,
            reminder: ReminderService.serializeReminder(reminder),
            task: await serializeSingleTask(req, task),
        });
    } catch (error) {
        console.error('[MobileAPI] Update task reminder error:', error);
        sendCaughtError(res, error);
    }
});

router.delete('/accounts/:accountNumber/tasks/:taskId/reminders/:reminderId', async (req, res) => {
    try {
        const task = await loadTenantTask(req, req.params.taskId);
        if (!task) return sendError(res, 404, 'Tache introuvable', 'TASK_NOT_FOUND');
        const reminder = await ReminderService.cancelReminderByIdForTarget({
            accountNumber: req.account_number,
            userId: req.user._id,
            targetType: 'task',
            targetId: task._id,
            reminderId: req.params.reminderId,
        });
        if (!reminder) return sendError(res, 404, 'Rappel introuvable', 'REMINDER_NOT_FOUND');
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
        const tenantModels = await taskTenantModels(req);
        const { RecordTask } = tenantModels;
        const order = await RecordTask.countDocuments({ taskListId: target.list._id });
        const status = normalizeStatus(req.body?.status);
        const priorities = await getAccountTaskPriorities(req);
        const priorityOption = priorityOptionFor(req.body?.priority, priorities);
        const statuses = normalizeOptions(target.list.statuses, defaultStatuses);
        const tagAccess = {
            ...tenantModels,
            list: target.list,
        };
        const tagOptions = await upsertTaskListTagOptions(tagAccess, req.body?.tags);

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
            priority: priorityOption.label,
            priorityColor: priorityOption.color || '',
            tags: TaskListsService.normalizeTaskTags(req.body?.tags, tagOptions),
            subtasks: TaskListsService.normalizeTaskSubtasks(req.body?.subtasks),
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
        const tenantModels = await taskTenantModels(req);
        const { TaskList } = tenantModels;
        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null;
        const statuses = normalizeOptions(list?.statuses, defaultStatuses);
        const priorities = await getAccountTaskPriorities(req);

        if (req.body?.title !== undefined) {
            const title = cleanText(req.body.title, '');
            if (!title) return sendError(res, 400, 'Title required', 'VALIDATION_ERROR');
            updates.title = title;
        }
        if (req.body?.description !== undefined) updates.description = cleanText(req.body.description, '');
        if (req.body?.priority !== undefined) {
            const priorityOption = priorityOptionFor(req.body.priority, priorities);
            updates.priority = priorityOption.label;
            updates.priorityColor = priorityOption.color || '';
        }
        if (req.body?.tags !== undefined) {
            const tagOptions = list
                ? await upsertTaskListTagOptions({ ...tenantModels, list }, req.body.tags)
                : TaskListsService.normalizeTaskTagOptions(req.body.tags);
            updates.tags = TaskListsService.normalizeTaskTags(req.body.tags, tagOptions);
        }
        if (req.body?.subtasks !== undefined) {
            updates.subtasks = TaskListsService.normalizeTaskSubtasks(req.body.subtasks);
        }
        if (req.body?.status !== undefined) {
            updates.status = normalizeStatus(req.body.status);
            updates.statusColor = optionColor(statuses, updates.status, '#9ca3af');
            if (req.body.completedAt === undefined) updates.completedAt = updates.status === STATUS_DONE ? new Date() : null;
            else if (updates.status !== STATUS_DONE) updates.completedAt = null;
        }
        if (req.body?.done !== undefined) {
            updates.status = req.body.done ? STATUS_DONE : STATUS_TODO;
            updates.statusColor = optionColor(statuses, updates.status, '#9ca3af');
            if (req.body.completedAt === undefined) updates.completedAt = req.body.done ? new Date() : null;
            else if (!req.body.done) updates.completedAt = null;
        }
        if (req.body?.isDayPriority !== undefined) updates.isDayPriority = !!req.body.isDayPriority;
        if (req.body?.startDate !== undefined) updates.startDate = req.body.startDate || null;
        if (req.body?.dueDate !== undefined) updates.dueDate = req.body.dueDate || null;
        if (req.body?.completedAt !== undefined) {
            if (!req.body.completedAt) {
                updates.completedAt = null;
            } else {
                const completedAt = new Date(req.body.completedAt);
                if (Number.isNaN(completedAt.getTime())) return sendError(res, 400, 'Date de fin invalide', 'VALIDATION_ERROR');
                updates.completedAt = completedAt;
            }
        }
        if (updates.completedAt !== undefined) {
            const nextStatus = updates.status || task.status;
            if (nextStatus !== STATUS_DONE) updates.completedAt = null;
        }
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
        (task.attachments || []).forEach(attachment => {
            TaskImagesService.removeFile(req.account_number, attachment.filename);
        });
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

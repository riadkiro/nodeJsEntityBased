const express = require('express');
const crypto = require('crypto');

const User = require('../models/user.model');
const Account = require('../models/account.model');
const mailer = require('../services/mailer');
const ReminderService = require('../services/reminders/reminder.service');
const { connectToTenantDb, tenantCollection } = require('../middleware/tenant');
const { taskTenantModels } = require('../services/task-tenant-models.service');
const TaskOverview = require('../services/task-overview.service');
const TaskListsService = require('../services/task-lists.service');
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
        isShared: false,
        isFavorite: false,
        ...stats,
    };
}

async function personalTaskLists(req) {
    await ensurePersonalTaskList(req);
    if (String(req.account_number) === '6804') {
        await TaskListsService.createAccountTaskList(req, {
            label: TaskListsService.SHOPPING_TASK_LIST_LABEL,
            color: '#10b981',
            icon: 'solar:cart-large-bold-duotone',
            showInMyLists: true,
        });
    }
    return TaskListsService.listMyTaskLists(req);
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
    const accountPriorities = await getAccountTaskPriorities(req);
    const accountTags = await TaskListsService.getAccountTaskTags(req);
    return TaskOverview.serializeTaskRow(req, task.toObject ? task.toObject() : task, list, record, entity, reminder, {
        priorities: accountPriorities,
        accountTags,
    });
}

async function taskBoard(req) {
    const accountTags = await TaskListsService.getAccountTaskTags(req);
    return TaskOverview.buildTaskBoard(req, { accountTags });
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
        const priorities = await getAccountTaskPriorities(req);
        const priorityOption = priorityOptionFor(req.body?.priority, priorities);
        const statuses = normalizeOptions(target.list.statuses, defaultStatuses);
        const accountTags = await TaskListsService.upsertAccountTaskTags(req, req.body?.tags);

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
            tags: TaskListsService.normalizeTaskTags(req.body?.tags, accountTags),
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
        const { TaskList } = await taskTenantModels(req);
        const list = task.taskListId ? await TaskList.findById(task.taskListId).lean() : null;
        const statuses = normalizeOptions(list?.statuses, defaultStatuses);
        const priorities = await getAccountTaskPriorities(req);
        let accountTags = null;

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
            accountTags = await TaskListsService.upsertAccountTaskTags(req, req.body.tags);
            updates.tags = TaskListsService.normalizeTaskTags(req.body.tags, accountTags);
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

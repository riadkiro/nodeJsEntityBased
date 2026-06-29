const crypto = require('crypto');

const User = require('../models/user.model');
const Account = require('../models/account.model');
const mailer = require('./mailer');
const { convertPendingInvitesToGrants } = require('./record-access-invitations');
const { ensureTenantDatabase } = require('./tenant-provisioning');

const EMAIL_VERIFICATION_TTL_HOURS = 24;
const EMAIL_VERIFICATION_TTL_MS = EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000;
const DEFAULT_ICON = 'solar:home-2-bold-duotone';
const VALID_ROLES = ['user', 'admin', 'superadmin'];
const VALID_STATUSES = ['active', 'inactive', 'suspended', 'pending'];
const VALID_PLANS = ['free', 'basic', 'premium', 'enterprise'];

class RegistrationError extends Error {
    constructor(status, message, code) {
        super(message);
        this.name = 'RegistrationError';
        this.status = status;
        this.code = code;
    }
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function cleanText(value) {
    return String(value || '').trim();
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

function queueVerificationEmail(req, user, rawToken) {
    if (!req) return;

    setImmediate(() => {
        mailer.sendEmailVerification({
            to: user.email,
            name: user.name || user.email,
            verifyUrl: buildVerificationUrl(req, rawToken),
            expiresInHours: EMAIL_VERIFICATION_TTL_HOURS,
        }).catch((error) => {
            console.error('[Registration] Email verification send error:', error.message);
        });
    });
}

function planValue(value) {
    const plan = cleanText(value || 'free').toLowerCase();
    return VALID_PLANS.includes(plan) ? plan : 'free';
}

function roleValue(value) {
    const role = cleanText(value || 'user').toLowerCase();
    return VALID_ROLES.includes(role) ? role : 'user';
}

function statusValue(value, fallback) {
    const status = cleanText(value || fallback).toLowerCase();
    return VALID_STATUSES.includes(status) ? status : fallback;
}

async function generateAccountNumber() {
    let accountNumber;
    let attempts = 0;

    do {
        accountNumber = String(5000 + Math.floor(Math.random() * 5000));
        // eslint-disable-next-line no-await-in-loop
        const existing = await Account.findOne({ account_number: accountNumber }).select('_id').lean();
        if (!existing) return accountNumber;
        attempts += 1;
    } while (attempts < 100);

    throw new RegistrationError(500, "Impossible de generer un numero d'espace unique", 'ACCOUNT_NUMBER_FAILED');
}

function validateInput({
    name,
    email,
    password,
    confirmPassword,
    requirePasswordConfirmation,
}) {
    const errors = [];

    if (!name) errors.push('Le nom est requis');
    if (!email) errors.push("L'email est requis");
    if (!password || password.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caracteres');
    }
    if (requirePasswordConfirmation && password !== confirmPassword) {
        errors.push('Les mots de passe ne correspondent pas');
    }

    if (errors.length) {
        throw new RegistrationError(400, errors.join('. '), 'VALIDATION_ERROR');
    }
}

async function applyInviteIfNeeded(newUser, inviteToken) {
    const token = cleanText(inviteToken);
    if (!token) return null;

    const invitedAccount = await Account.findOne({
        'invitations.token': token,
        'invitations.status': 'pending',
    });
    const invite = invitedAccount?.invitations?.find(item => item.token === token && item.status === 'pending');

    if (!invitedAccount || !invite || (invite.expiresAt && new Date() >= new Date(invite.expiresAt))) {
        return null;
    }

    const alreadyMember = invitedAccount.users.some(member => normalizeEmail(member.email) === newUser.email);
    if (!alreadyMember) {
        invitedAccount.users.push({
            userId: newUser._id.toString(),
            email: newUser.email,
            role: invite.role,
            status: 'active',
            invitedBy: invite.invitedBy,
            joinedAt: new Date(),
        });
    }

    invite.status = 'accepted';
    await invitedAccount.save();

    const hasAccount = newUser.accounts.some(account => String(account.account_number) === String(invitedAccount.account_number));
    if (!hasAccount) {
        newUser.accounts.push({
            account_number: invitedAccount.account_number,
            name: invitedAccount.name,
            icon: invitedAccount.icon || DEFAULT_ICON,
            role: invite.role,
            joinedAt: new Date(),
        });
        await newUser.save();
    }

    await convertPendingInvitesToGrants(invitedAccount.account_number, newUser.email, newUser._id);
    return invitedAccount;
}

async function createAccountUser(options = {}) {
    const name = cleanText(options.name);
    const email = normalizeEmail(options.email);
    const password = String(options.password || '');
    const confirmPassword = String(options.confirmPassword || '');
    const requirePasswordConfirmation = options.requirePasswordConfirmation !== false;
    const requireEmailVerification = options.requireEmailVerification === true;
    const plan = planValue(options.plan);
    const role = roleValue(options.role);
    const status = requireEmailVerification
        ? 'pending'
        : statusValue(options.status, 'active');

    validateInput({
        name,
        email,
        password,
        confirmPassword,
        requirePasswordConfirmation,
    });

    const existing = await User.findOne({ email }).select('_id').lean();
    if (existing) {
        throw new RegistrationError(409, 'Cet email est deja utilise', 'EMAIL_EXISTS');
    }

    const limits = User.getPlanLimits(plan);
    const accountNumber = await generateAccountNumber();

    await ensureTenantDatabase(accountNumber);

    const newUser = new User({
        name,
        email,
        password,
        role,
        status,
        authProvider: 'local',
        emailVerified: !requireEmailVerification,
        membership: {
            plan,
            startDate: new Date(),
            expiresAt: plan !== 'free'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                : null,
            ...limits,
        },
        loginCount: 0,
    });

    if (requireEmailVerification) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        newUser.verificationToken = hashToken(rawToken);
        newUser.verificationTokenExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
        options._verificationToken = rawToken;
    }

    await newUser.save();

    const accountName = cleanText(options.accountName) || `${name}'s Workspace`;
    const newAccount = new Account({
        name: accountName,
        icon: DEFAULT_ICON,
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
        icon: DEFAULT_ICON,
        role: 'owner',
    });
    await newUser.save();

    const invitedAccount = await applyInviteIfNeeded(newUser, options.inviteToken);

    if (requireEmailVerification && options.sendVerificationEmail !== false) {
        queueVerificationEmail(options.req, newUser, options._verificationToken);
    }

    return {
        user: newUser,
        account: newAccount,
        invitedAccount,
        account_number: accountNumber,
        verificationRequired: requireEmailVerification,
    };
}

module.exports = {
    RegistrationError,
    createAccountUser,
    normalizeEmail,
};

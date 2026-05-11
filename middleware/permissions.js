/**
 * Workspace Permissions Middleware
 * ────────────────────────────────
 * Centralized role-based permission system.
 * 
 * Roles: owner > admin > manager > member > external > guest
 * 
 * Usage:
 *   const { requirePerm } = require('../middleware/permissions');
 *   router.post('/api/invite', requirePerm('members.invite'), controller.invite);
 * 
 * In templates:
 *   <% if (can('members.invite')) { %> ... <% } %>
 */

const Account = require('../models/account.model');

// ═══════════════════════════════════════════
// Role hierarchy (for comparisons)
// ═══════════════════════════════════════════
const ROLE_HIERARCHY = {
    owner: 100,
    admin: 80,
    manager: 60,
    member: 40,
    external: 20,
    guest: 10,
};

// ═══════════════════════════════════════════
// Role display metadata
// ═══════════════════════════════════════════
const ROLE_META = {
    owner:    { name: 'Propriétaire', color: '#7c3aed', icon: 'solar:crown-bold-duotone', editable: false },
    admin:    { name: 'Administrateur', color: '#4361ee', icon: 'solar:shield-keyhole-bold-duotone', editable: false },
    manager:  { name: 'Manager', color: '#f59e0b', icon: 'solar:clipboard-bold-duotone', editable: true },
    member:   { name: 'Membre', color: '#22c55e', icon: 'solar:user-bold-duotone', editable: true },
    external: { name: 'Externe', color: '#64748b', icon: 'solar:user-cross-bold-duotone', editable: true },
    guest:    { name: 'Invité', color: '#94a3b8', icon: 'solar:eye-bold-duotone', editable: true },
};

function getRoleLevel(role, customRoles) {
    if (ROLE_HIERARCHY[role]) return ROLE_HIERARCHY[role];
    // Check custom roles for level
    if (customRoles && customRoles.length > 0) {
        const custom = customRoles.find(r => r.slug === role);
        if (custom && custom.level) return custom.level;
        // Fallback to baseRole level
        if (custom && custom.baseRole) return ROLE_HIERARCHY[custom.baseRole] || 0;
    }
    return 0;
}

// ═══════════════════════════════════════════
// Permission Matrix
// ═══════════════════════════════════════════
const PERMISSIONS = {
    // ── Settings ──
    'settings.view':           ['owner', 'admin'],
    'settings.update':         ['owner', 'admin'],

    // ── Members ──
    'members.view':            ['owner', 'admin'],
    'members.invite':          ['owner', 'admin'],
    'members.inviteExternal':  ['owner', 'admin', 'manager'],
    'members.remove':          ['owner', 'admin'],
    'members.changeRole':      ['owner', 'admin'],

    // ── Invitations ──
    'invites.cancel':          ['owner', 'admin'],

    // ── Account-level (destructive) ──
    'account.delete':          ['owner'],
    'account.export':          ['owner', 'admin'],

    // ── Admin role assignment (only owner) ──
    'members.inviteAdmin':     ['owner'],
    'members.promoteAdmin':    ['owner'],

    // ── Integrations ──
    'integrations.manage':     ['owner', 'admin'],

    // ── Records (data) ──
    'records.create':          ['owner', 'admin', 'manager', 'member'],
    'records.read':            ['owner', 'admin', 'manager', 'member', 'external', 'guest'],
    'records.update':          ['owner', 'admin', 'manager', 'member', 'external'],
    'records.delete':          ['owner', 'admin', 'manager'],
    'records.export':          ['owner', 'admin', 'manager'],
    'records.share':           ['owner', 'admin', 'manager', 'member'],

    // ── Entities ──
    'entities.manage':         ['owner', 'admin'],
    'entities.view':           ['owner', 'admin', 'manager', 'member', 'external'],

    // ── Modules ──
    'dashboard.view':          ['owner', 'admin', 'manager', 'member'],
    'agenda.view':             ['owner', 'admin', 'manager', 'member'],
    'agenda.manage':           ['owner', 'admin', 'manager', 'member'],
    'team.view':               ['owner', 'admin', 'manager', 'member'],
    'chat.view':               ['owner', 'admin', 'manager', 'member', 'external'],
    'chat.send':               ['owner', 'admin', 'manager', 'member', 'external'],
    'tasks.view':              ['owner', 'admin', 'manager', 'member', 'external'],
    'tasks.manage':            ['owner', 'admin', 'manager', 'member'],
    'documents.view':          ['owner', 'admin', 'manager', 'member', 'external'],
    'documents.create':        ['owner', 'admin', 'manager', 'member'],
    'documents.manage':        ['owner', 'admin', 'manager'],
    'notes.view':              ['owner', 'admin', 'manager', 'member'],
    'notes.create':            ['owner', 'admin', 'manager', 'member'],
    'drive.view':              ['owner', 'admin', 'manager', 'member', 'external'],
    'drive.upload':            ['owner', 'admin', 'manager', 'member'],
    'email.view':              ['owner', 'admin', 'manager'],
    'email.send':              ['owner', 'admin', 'manager'],

    // ── Automations / Workflows ──
    'automations.view':        ['owner', 'admin'],
    'automations.manage':      ['owner', 'admin'],

    // ── AI ──
    'ai.use':                  ['owner', 'admin', 'manager', 'member'],
    'ai.manage':               ['owner', 'admin'],

    // ── General access ──
    'workspace.access':        ['owner', 'admin', 'manager', 'member', 'external', 'guest'],
};

// ═══════════════════════════════════════════
// Permission categories for UI grouping
// ═══════════════════════════════════════════
const PERMISSION_CATEGORIES = [
    {
        key: 'settings', name: 'Paramètres', icon: 'solar:settings-bold-duotone',
        permissions: ['settings.view', 'settings.update'],
    },
    {
        key: 'members', name: 'Membres & Équipe', icon: 'solar:users-group-rounded-bold-duotone',
        permissions: ['members.view', 'members.invite', 'members.inviteExternal', 'members.remove', 'members.changeRole', 'invites.cancel'],
    },
    {
        key: 'account', name: 'Compte', icon: 'solar:buildings-bold-duotone',
        permissions: ['account.delete', 'account.export', 'members.inviteAdmin', 'members.promoteAdmin'],
    },
    {
        key: 'records', name: 'Données & Records', icon: 'solar:database-bold-duotone',
        permissions: ['records.create', 'records.read', 'records.update', 'records.delete', 'records.export', 'records.share'],
    },
    {
        key: 'entities', name: 'Entités', icon: 'solar:folder-bold-duotone',
        permissions: ['entities.manage', 'entities.view'],
    },
    {
        key: 'modules', name: 'Modules', icon: 'solar:widget-bold-duotone',
        permissions: ['dashboard.view', 'agenda.view', 'agenda.manage', 'team.view', 'chat.view', 'chat.send', 'tasks.view', 'tasks.manage', 'documents.view', 'documents.create', 'documents.manage', 'notes.view', 'notes.create', 'drive.view', 'drive.upload', 'email.view', 'email.send'],
    },
    {
        key: 'integrations', name: 'Intégrations & IA', icon: 'solar:bolt-bold-duotone',
        permissions: ['integrations.manage', 'automations.view', 'automations.manage', 'ai.use', 'ai.manage'],
    },
    {
        key: 'general', name: 'Accès général', icon: 'solar:lock-keyhole-bold-duotone',
        permissions: ['workspace.access'],
    },
];

// Human-readable labels for each permission
const PERMISSION_LABELS = {
    'settings.view': 'Voir les paramètres',
    'settings.update': 'Modifier les paramètres',
    'members.view': 'Voir les membres',
    'members.invite': 'Inviter des membres',
    'members.inviteExternal': 'Inviter des externes',
    'members.remove': 'Supprimer des membres',
    'members.changeRole': 'Changer les rôles',
    'invites.cancel': 'Annuler les invitations',
    'account.delete': 'Supprimer le compte',
    'account.export': 'Exporter les données',
    'members.inviteAdmin': 'Inviter un admin',
    'members.promoteAdmin': 'Promouvoir en admin',
    'integrations.manage': 'Gérer les intégrations',
    'records.create': 'Créer des records',
    'records.read': 'Voir les records',
    'records.update': 'Modifier les records',
    'records.delete': 'Supprimer des records',
    'records.export': 'Exporter les records',
    'records.share': 'Partager des records',
    'entities.manage': 'Gérer les entités',
    'entities.view': 'Voir les entités',
    'dashboard.view': 'Voir le dashboard',
    'agenda.view': 'Voir l\'agenda',
    'agenda.manage': 'Gérer l\'agenda',
    'team.view': 'Voir l\'équipe',
    'chat.view': 'Voir le chat',
    'chat.send': 'Envoyer des messages',
    'tasks.view': 'Voir les tâches',
    'tasks.manage': 'Gérer les tâches',
    'documents.view': 'Voir les documents',
    'documents.create': 'Créer des documents',
    'documents.manage': 'Gérer les documents',
    'notes.view': 'Voir les notes',
    'notes.create': 'Créer des notes',
    'drive.view': 'Voir le drive',
    'drive.upload': 'Uploader des fichiers',
    'email.view': 'Voir les emails',
    'email.send': 'Envoyer des emails',
    'automations.view': 'Voir les automations',
    'automations.manage': 'Gérer les automations',
    'ai.use': 'Utiliser l\'IA',
    'ai.manage': 'Gérer l\'IA',
    'workspace.access': 'Accéder à l\'espace',
};

// ═══════════════════════════════════════════
// Check if role has a specific permission
// Supports workspace-level overrides via customRoles
// ═══════════════════════════════════════════
function hasPermission(role, permission, customRoles) {
    // Owner always has all permissions (non-overridable)
    if (role === 'owner') return true;

    // Check workspace-level override first
    if (customRoles && customRoles.length > 0) {
        const roleOverride = customRoles.find(r => r.slug === role);
        if (roleOverride && roleOverride.permissions) {
            const perms = roleOverride.permissions instanceof Map
                ? Object.fromEntries(roleOverride.permissions)
                : roleOverride.permissions;
            if (permission in perms) {
                return perms[permission];
            }
        }
        // For custom roles, fallback to baseRole's defaults
        if (roleOverride && roleOverride.isCustom && roleOverride.baseRole) {
            const allowedRoles = PERMISSIONS[permission];
            if (!allowedRoles) return false;
            return allowedRoles.includes(roleOverride.baseRole);
        }
    }

    // Fallback to default matrix
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
        console.warn(`[Permissions] Unknown permission: ${permission}`);
        return false;
    }
    return allowedRoles.includes(role);
}

// ═══════════════════════════════════════════
// Check entity-level CRUD permission
// Resolves: member entityPermissions > team entityPermissions > role default
// ═══════════════════════════════════════════
function checkEntityPermission(member, account, entityId, action) {
    if (!member || !entityId) return true; // No restriction if no entity context

    // 1. Owner/Admin bypass entity restrictions
    if (['owner', 'admin'].includes(member.role)) return true;

    // 2. Check member-level entity permissions
    if (member.entityPermissions && member.entityPermissions.length > 0) {
        const perm = member.entityPermissions.find(ep => ep.entityId === entityId);
        if (perm) return perm[action] !== false;
        // If entityPermissions exist but this entity isn't listed → denied for external/guest
        if (['external', 'guest'].includes(member.role)) return false;
        return true; // member/manager with entityPermissions but entity not listed = allowed
    }

    // 3. Check team-level entity permissions (inheritance)
    if (account && account.teams) {
        const userId = String(member.userId);
        const memberTeams = account.teams.filter(t =>
            (t.memberIds || []).includes(userId)
        );
        for (const team of memberTeams) {
            if (team.entityPermissions && team.entityPermissions.length > 0) {
                const teamPerm = team.entityPermissions.find(ep => ep.entityId === entityId);
                if (teamPerm) return teamPerm[action] !== false;
            }
        }
    }

    // 4. External/Guest with no explicit permissions → restrict
    if (['external', 'guest'].includes(member.role)) return false;

    // 5. Default: allow for member+ roles
    return true;
}

// ═══════════════════════════════════════════
// Middleware: Hydrate workspace role on req
// ═══════════════════════════════════════════
async function hydrateWorkspaceRole(req, res, next) {
    if (!req.user || !req.account_number) return next();

    try {
        // Cache the account lookup per request (avoid duplicate queries)
        if (!req._workspaceAccount) {
            req._workspaceAccount = await Account.findOne(
                { account_number: req.account_number },
                { users: 1, teams: 1, name: 1, settings: 1, customRoles: 1 }
            ).lean();
        }

        const account = req._workspaceAccount;
        if (!account) return next();

        const memberEntry = account.users.find(
            u => String(u.userId) === String(req.user._id) && u.status === 'active'
        );

        if (memberEntry) {
            // Normalize legacy roles
            let role = memberEntry.role;
            if (role === 'viewer') role = 'guest';

            req.workspaceRole = role;
            req.workspaceMember = memberEntry;
        } else {
            req.workspaceRole = null;
            req.workspaceMember = null;
        }

        // Store customRoles for permission checks
        req._customRoles = account.customRoles || [];

        // Attach helper functions
        req.can = (permission) => {
            if (!req.workspaceRole) return false;
            // Superadmin bypasses all checks
            if (req.user.role === 'superadmin') return true;
            return hasPermission(req.workspaceRole, permission, req._customRoles);
        };

        // Entity-level permission check helper
        req.canEntity = (entityId, action) => {
            if (!req.workspaceRole) return false;
            if (req.user.role === 'superadmin') return true;
            // First check global record permission
            if (!hasPermission(req.workspaceRole, `records.${action}`)) return false;
            // Then check entity-level
            return checkEntityPermission(req.workspaceMember, account, entityId, action);
        };

        next();
    } catch (err) {
        console.error('[Permissions] Hydration error:', err.message);
        next();
    }
}

// ═══════════════════════════════════════════
// Route guard: requirePerm('permission.name')
// ═══════════════════════════════════════════
function requirePerm(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        if (!req.workspaceRole) {
            return res.status(403).json({ error: 'Vous n\'êtes pas membre de cet espace' });
        }

        if (!req.can(permission)) {
            return res.status(403).json({
                error: 'Permission refusée',
                required: permission,
                role: req.workspaceRole,
            });
        }

        next();
    };
}

// ═══════════════════════════════════════════
// Route guard: requireEntityPerm(entityId, action)
// Usage: requireEntityPerm('read') — reads entityId from req.params or req.body
// ═══════════════════════════════════════════
function requireEntityPerm(action) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        if (!req.workspaceRole) {
            return res.status(403).json({ error: 'Vous n\'êtes pas membre de cet espace' });
        }

        const entityId = req.params.entityId || req.body.entityId || req.query.entityId;
        if (entityId && !req.canEntity(entityId, action)) {
            return res.status(403).json({
                error: 'Permission refusée pour cette entité',
                required: `${action} on entity ${entityId}`,
                role: req.workspaceRole,
            });
        }

        next();
    };
}

// ═══════════════════════════════════════════
// Template helper: build "can" object for EJS
// ═══════════════════════════════════════════
function buildCanObject(role) {
    const can = {};
    for (const perm of Object.keys(PERMISSIONS)) {
        can[perm] = hasPermission(role, perm);
    }
    return can;
}

// ═══════════════════════════════════════════
// Validate role hierarchy for operations
// ═══════════════════════════════════════════
function canManageRole(callerRole, targetRole) {
    const callerLevel = getRoleLevel(callerRole);
    const targetLevel = getRoleLevel(targetRole);
    return callerLevel > targetLevel;
}

// ═══════════════════════════════════════════
// Get valid assignable roles for a caller
// ═══════════════════════════════════════════
function getAssignableRoles(callerRole) {
    const callerLevel = getRoleLevel(callerRole);
    return Object.entries(ROLE_HIERARCHY)
        .filter(([role, level]) => level < callerLevel && role !== 'owner')
        .map(([role]) => role)
        .sort((a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a]);
}

module.exports = {
    PERMISSIONS,
    PERMISSION_CATEGORIES,
    PERMISSION_LABELS,
    ROLE_HIERARCHY,
    ROLE_META,
    getRoleLevel,
    hasPermission,
    checkEntityPermission,
    hydrateWorkspaceRole,
    requirePerm,
    requireEntityPerm,
    buildCanObject,
    canManageRole,
    getAssignableRoles,
};

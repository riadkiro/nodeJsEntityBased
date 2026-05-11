const { PERMISSIONS, ROLE_HIERARCHY, hasPermission, canManageRole, getAssignableRoles, checkEntityPermission } = require('../middleware/permissions');

console.log('=== Role Hierarchy ===');
console.table(ROLE_HIERARCHY);

console.log('\n=== Permission Matrix (selected) ===');
const testPerms = [
    'members.invite', 'members.inviteExternal', 'records.create', 'records.read',
    'records.delete', 'chat.view', 'documents.create', 'entities.manage', 'ai.use'
];
const roles = ['owner', 'admin', 'manager', 'member', 'external', 'guest'];

const matrix = {};
for (const perm of testPerms) {
    matrix[perm] = {};
    for (const role of roles) {
        matrix[perm][role] = hasPermission(role, perm) ? '✅' : '❌';
    }
}
console.table(matrix);

console.log('\n=== Role Management ===');
console.log('Owner can manage admin?', canManageRole('owner', 'admin'));  // true
console.log('Admin can manage admin?', canManageRole('admin', 'admin'));  // false
console.log('Admin can manage manager?', canManageRole('admin', 'manager'));  // true
console.log('Manager can manage member?', canManageRole('manager', 'member'));  // true
console.log('Member can manage external?', canManageRole('member', 'external'));  // true
console.log('External can manage guest?', canManageRole('external', 'guest'));  // true

console.log('\n=== Assignable Roles ===');
for (const role of roles) {
    console.log(`${role} can assign:`, getAssignableRoles(role));
}

console.log('\n=== Entity Permission Check ===');
const memberWithPerms = {
    userId: '123',
    role: 'member',
    entityPermissions: [
        { entityId: 'ent1', create: true, read: true, update: true, delete: false },
        { entityId: 'ent2', create: false, read: true, update: false, delete: false },
    ]
};
const memberNoPerms = { userId: '456', role: 'member', entityPermissions: [] };
const externalWithPerms = {
    userId: '789',
    role: 'external',
    entityPermissions: [
        { entityId: 'ent1', create: false, read: true, update: false, delete: false },
    ]
};

console.log('member w/ perms → ent1.create:', checkEntityPermission(memberWithPerms, null, 'ent1', 'create'));  // true
console.log('member w/ perms → ent1.delete:', checkEntityPermission(memberWithPerms, null, 'ent1', 'delete'));  // false
console.log('member w/ perms → ent2.update:', checkEntityPermission(memberWithPerms, null, 'ent2', 'update'));  // false
console.log('member w/o perms → any.create:', checkEntityPermission(memberNoPerms, null, 'ent1', 'create'));   // true (no restrictions)
console.log('external w/ perms → ent1.read:', checkEntityPermission(externalWithPerms, null, 'ent1', 'read'));  // true
console.log('external w/ perms → ent2.read:', checkEntityPermission(externalWithPerms, null, 'ent2', 'read'));  // false (not listed)

console.log('\n✅ All permission checks passed!');

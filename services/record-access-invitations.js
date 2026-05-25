const mongoose = require('mongoose');
const dbConfig = require('../config/db');

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function buildDataRoomShareQuery(email, userId) {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : null;
    const userMatch = userObjectId ? [
        { 'dataRoom.shares.userId': userObjectId },
        { 'dataRoom.folders.shares.userId': userObjectId },
        { 'dataRoom.items.shares.userId': userObjectId },
    ] : [];

    return {
        $or: [
            { 'dataRoom.shares.email': email },
            { 'dataRoom.folders.shares.email': email },
            { 'dataRoom.items.shares.email': email },
            ...userMatch,
        ],
    };
}

function dataRoomOnlyPermissions(permissions = {}) {
    const app = (view, edit = false) => ({ view, edit });
    return {
        read: permissions.read !== false,
        update: permissions.update === true,
        delete: permissions.delete === true,
        share: permissions.share === true,
        modules: {
            overview: app(false),
            fiche: app(false),
            docs: app(false),
            drive: app(false),
            dataRoom: app(true, permissions.update === true),
            tasks: app(false),
            agenda: app(false),
            chat: app(false),
            emails: app(false),
            notes: app(false),
            team: app(false),
        },
    };
}

async function hasDataRoomShareForUser(accountNumber, userEmail, userId) {
    let tenantConn;
    try {
        const tenantDbUrl = dbConfig.tenantDbUri(accountNumber);
        tenantConn = await mongoose.createConnection(tenantDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const Record = tenantConn.model('Record', require('../models/record.model').schema);
        const email = normalizeEmail(userEmail);
        const record = await Record.findOne(buildDataRoomShareQuery(email, userId)).select('_id').lean();
        return !!record;
    } catch (err) {
        console.error('[Invitation] Error checking Data Room share:', err.message);
        return false;
    } finally {
        if (tenantConn) {
            try { await tenantConn.close(); } catch (e) { /* ignore */ }
        }
    }
}

async function convertPendingInvitesToGrants(accountNumber, userEmail, userId) {
    let tenantConn;
    const email = normalizeEmail(userEmail);
    const userIdString = String(userId || '');
    const result = { converted: 0, removedPending: 0, dataRoomConverted: 0 };

    if (!accountNumber || !email || !userIdString) return result;

    try {
        const tenantDbUrl = dbConfig.tenantDbUri(accountNumber);
        tenantConn = await mongoose.createConnection(tenantDbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const RecordAccess = tenantConn.model('RecordAccess', require('../models/record-access.model').schema);
        const Record = tenantConn.model('Record', require('../models/record.model').schema);

        const pendingDocs = await RecordAccess.find({ 'pendingInvites.email': email });

        for (const doc of pendingDocs) {
            const pending = (doc.pendingInvites || []).find(invite => normalizeEmail(invite.email) === email);
            if (!pending) continue;

            const dataRoomRecord = await Record.findOne({
                _id: doc.recordId,
                ...buildDataRoomShareQuery(email, userIdString),
            }).select('_id').lean();
            const isDataRoomInvite = !!dataRoomRecord;
            const permissions = isDataRoomInvite
                ? dataRoomOnlyPermissions(pending.permissions || { read: true })
                : (pending.permissions || { read: true });

            const existingGrant = (doc.grants || []).find(grant =>
                grant.granteeType === 'user' && String(grant.granteeId) === userIdString
            );

            if (existingGrant) {
                existingGrant.permissions = permissions || existingGrant.permissions || { read: true };
                if (isDataRoomInvite) existingGrant.note = 'Data Room';
            } else {
                doc.grants.push({
                    granteeType: 'user',
                    granteeId: userIdString,
                    permissions,
                    grantedBy: pending.invitedBy,
                    grantedAt: new Date(),
                    expiresAt: null,
                    note: isDataRoomInvite ? 'Data Room' : undefined,
                });
                result.converted++;
            }

            doc.pendingInvites = (doc.pendingInvites || []).filter(invite => normalizeEmail(invite.email) !== email);
            result.removedPending++;
            if (isDataRoomInvite) result.dataRoomConverted++;
            await doc.save();
            console.log(`[Invitation] Converted pending invite to grant for record ${doc.recordId}`);
        }

        return result;
    } catch (err) {
        console.error('[Invitation] Error converting RecordAccess pendingInvites:', err.message);
        return result;
    } finally {
        if (tenantConn) {
            try { await tenantConn.close(); } catch (e) { /* ignore */ }
        }
    }
}

async function invitationRedirectUrl(account, userEmail, userId) {
    const hasDataRoomShare = await hasDataRoomShareForUser(account.account_number, userEmail, userId);
    if (hasDataRoomShare) return `/account/${account.account_number}/shared-with-you`;
    return '/user/accounts';
}

module.exports = {
    convertPendingInvitesToGrants,
    hasDataRoomShareForUser,
    invitationRedirectUrl,
};

const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const dbConfig = require('../config/db');
const { ensureSystemEntities } = require('../utils/system-entities');

function credentialsFromBaseUri() {
    try {
        const url = new URL(dbConfig.uri);
        if (!url.username || !url.password) return null;
        return {
            username: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
        };
    } catch (_) {
        return null;
    }
}

async function ensureTenantMongoUser(accountNumber) {
    const credentials = credentialsFromBaseUri();
    if (!credentials) return { skipped: true, reason: 'no_credentials' };

    const dbName = dbConfig.tenantDbName(accountNumber);
    const client = new MongoClient(dbConfig.adminDbUri(), { maxPoolSize: 2 });

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersInfo = await db.command({ usersInfo: credentials.username });
        const roles = [{ role: 'dbOwner', db: dbName }];

        if (usersInfo.users && usersInfo.users.length > 0) {
            await db.command({ updateUser: credentials.username, roles });
            return { created: false };
        }

        await db.command({
            createUser: credentials.username,
            pwd: credentials.password,
            roles,
        });
        return { created: true };
    } finally {
        await client.close().catch(() => {});
    }
}

async function ensureTenantDatabase(accountNumber) {
    if (!accountNumber) throw new Error('accountNumber is required');

    const dbName = dbConfig.tenantDbName(accountNumber);
    let tenantDb;

    try {
        await ensureTenantMongoUser(accountNumber);
    } catch (error) {
        throw new Error(`Impossible de préparer l'utilisateur Mongo du tenant ${dbName}: ${error.message}`);
    }

    try {
        tenantDb = await mongoose.createConnection(dbConfig.tenantDbUri(accountNumber), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 8000,
        }).asPromise();

        await ensureSystemEntities(tenantDb);
        return { ok: true, dbName };
    } finally {
        if (tenantDb) {
            await tenantDb.close().catch(() => {});
        }
    }
}

module.exports = {
    ensureTenantDatabase,
    ensureTenantMongoUser,
};

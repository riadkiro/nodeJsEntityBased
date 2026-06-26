require('dotenv').config();

const mongoose = require('mongoose');
const dbConfig = require('../config/db');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const deleteGlobal = args.has('--delete-global');
const onlyAccountArg = process.argv.slice(2).find(arg => arg.startsWith('--account='));
const onlyAccount = onlyAccountArg ? onlyAccountArg.split('=')[1] : '';

function asIdList(items = []) {
    return items.map(item => item?._id).filter(Boolean);
}

function withoutId(doc) {
    const clone = { ...doc };
    delete clone._id;
    return clone;
}

async function upsertMissing(collection, docs) {
    if (!docs.length) return { matched: 0, upserted: 0 };
    const ops = docs.map(doc => ({
        updateOne: {
            filter: { _id: doc._id },
            update: { $setOnInsert: withoutId(doc) },
            upsert: true,
        },
    }));
    const result = await collection.bulkWrite(ops, { ordered: false });
    return {
        matched: result.matchedCount || 0,
        upserted: result.upsertedCount || 0,
    };
}

async function migrateAccount(account, globalCollections) {
    const accountNumber = String(account.account_number || '').trim();
    if (!accountNumber) return null;

    const tenantConn = mongoose.createConnection(dbConfig.tenantDbUri(accountNumber), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await tenantConn.asPromise();

    try {
        const tenantDb = tenantConn.db;
        const recordIds = await tenantDb.collection('records').distinct('_id');
        if (!recordIds.length) {
            return { accountNumber, records: 0, taskLists: 0, tasks: 0, comments: 0, upserted: { taskLists: 0, tasks: 0, comments: 0 } };
        }

        const taskLists = await globalCollections.taskLists
            .find({ recordId: { $in: recordIds } })
            .toArray();
        const taskListIds = asIdList(taskLists);
        const tasks = await globalCollections.recordTasks
            .find({
                $or: [
                    { recordId: { $in: recordIds } },
                    taskListIds.length ? { taskListId: { $in: taskListIds } } : { _id: null },
                ],
            })
            .toArray();
        const taskIds = asIdList(tasks);
        const comments = await globalCollections.taskComments
            .find({
                $or: [
                    { recordId: { $in: recordIds } },
                    taskIds.length ? { taskId: { $in: taskIds } } : { _id: null },
                ],
            })
            .toArray();

        const summary = {
            accountNumber,
            records: recordIds.length,
            taskLists: taskLists.length,
            tasks: tasks.length,
            comments: comments.length,
            upserted: { taskLists: 0, tasks: 0, comments: 0 },
        };

        if (!dryRun) {
            const tenantTaskLists = tenantDb.collection('tasklists');
            const tenantRecordTasks = tenantDb.collection('recordtasks');
            const tenantTaskComments = tenantDb.collection('taskcomments');

            summary.upserted.taskLists = (await upsertMissing(tenantTaskLists, taskLists)).upserted;
            summary.upserted.tasks = (await upsertMissing(tenantRecordTasks, tasks)).upserted;
            summary.upserted.comments = (await upsertMissing(tenantTaskComments, comments)).upserted;

            if (deleteGlobal) {
                const listIds = asIdList(taskLists);
                const migratedTaskIds = asIdList(tasks);
                const commentIds = asIdList(comments);
                if (listIds.length) await globalCollections.taskLists.deleteMany({ _id: { $in: listIds } });
                if (migratedTaskIds.length) await globalCollections.recordTasks.deleteMany({ _id: { $in: migratedTaskIds } });
                if (commentIds.length) await globalCollections.taskComments.deleteMany({ _id: { $in: commentIds } });
            }
        }

        return summary;
    } finally {
        await tenantConn.close();
    }
}

async function main() {
    await mongoose.connect(dbConfig.globalDbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const globalDb = mongoose.connection.db;
    const globalCollections = {
        taskLists: globalDb.collection('tasklists'),
        recordTasks: globalDb.collection('recordtasks'),
        taskComments: globalDb.collection('taskcomments'),
    };

    const query = onlyAccount ? { account_number: onlyAccount } : { account_number: { $exists: true, $ne: '' } };
    const accounts = await globalDb.collection('accounts')
        .find(query, { projection: { account_number: 1, name: 1 } })
        .sort({ account_number: 1 })
        .toArray();

    const totals = {
        accounts: 0,
        records: 0,
        taskLists: 0,
        tasks: 0,
        comments: 0,
        upserted: { taskLists: 0, tasks: 0, comments: 0 },
    };

    for (const account of accounts) {
        const result = await migrateAccount(account, globalCollections);
        if (!result) continue;
        totals.accounts += 1;
        totals.records += result.records;
        totals.taskLists += result.taskLists;
        totals.tasks += result.tasks;
        totals.comments += result.comments;
        totals.upserted.taskLists += result.upserted.taskLists;
        totals.upserted.tasks += result.upserted.tasks;
        totals.upserted.comments += result.upserted.comments;
        if (result.taskLists || result.tasks || result.comments || onlyAccount) {
            console.log(JSON.stringify(result));
        }
    }

    console.log(JSON.stringify({
        dryRun,
        deleteGlobal,
        onlyAccount: onlyAccount || null,
        totals,
    }, null, 2));

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error('[migrate-record-tasks-to-tenants] Failed:', error);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
});

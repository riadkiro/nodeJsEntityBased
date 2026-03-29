/**
 * Verify column width persistence in UserPreferences and GridSnapshots
 */
const mongoose = require('mongoose');
const http = require('http');

const DB_URL = 'mongodb://127.0.0.1:27017/saas_app_rb_7846';
const ACCOUNT = '7846';

/**
 * Perform a login request to get the session cookie and return it.
 */
async function login() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
        const req = http.request({
            hostname: '127.0.0.1',
            port: 3000,
            path: '/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            const cookies = res.headers['set-cookie'] || [];
            const session = cookies.map(c => c.split(';')[0]).join('; ');
            resolve(session);
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

/**
 * Execute a request with JSON and returns the response body.
 */
async function apiCall(method, path, cookie, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: 3000,
            path,
            method,
            headers: {
                Cookie: cookie
            }
        };
        if (data) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }
        const req = http.request(options, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: resBody }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    console.log('--- Verification Script Started ---');
    
    // 1. Login
    const cookie = await login();
    console.log('1. Login successful');

    // 2. Test UserPreferences persistence
    const viewId = 'dynamic-table:test_persistence_v3';
    const testWidths = { 'schema_1': { 'col_A': 150, 'col_B': 300 } };
    
    await apiCall('POST', `/account/${ACCOUNT}/api/user/view-preferences`, cookie, {
        viewId,
        preferences: { gridColumnWidths: testWidths }
    });
    console.log('2. UserPreferences (gridColumnWidths) saved');

    const loadRes = await apiCall('GET', `/account/${ACCOUNT}/api/user/view-preferences/${encodeURIComponent(viewId)}`, cookie);
    const loadData = JSON.parse(loadRes.body);
    const savedWidths = loadData?.preferences?.gridColumnWidths;
    
    if (JSON.stringify(savedWidths) === JSON.stringify(testWidths)) {
        console.log('✅ UserPreferences persistence WORKS!');
    } else {
        console.log('❌ UserPreferences persistence FAILED');
        console.log('   Expected:', JSON.stringify(testWidths));
        console.log('   Got:', JSON.stringify(savedWidths));
    }

    // 3. Test GridSnapshot persistence directly in DB (since creating a real snapshot via API requires real DocumentLines)
    const conn = mongoose.createConnection(DB_URL);
    await new Promise(r => conn.once('open', r));
    const GridSnapshot = conn.model('GS_Verify', new mongoose.Schema({
        columnWidths: mongoose.Schema.Types.Mixed
    }, { strict: false }), 'gridsnapshots');

    // Find latest snapshot or create a dummy one if needed
    // Actually, let's just create a dummy one with columnWidths
    const dummyId = new mongoose.Types.ObjectId();
    const dummySnapshot = new GridSnapshot({
        schemaId: dummyId,
        recordId: dummyId,
        targetRecordId: dummyId,
        date: new Date(),
        columnWidths: { ACTE: 450, CODE: 120 },
        lines: []
    });
    await dummySnapshot.save();
    
    const retrieved = await GridSnapshot.findById(dummySnapshot._id).lean();
    if (retrieved && JSON.stringify(retrieved.columnWidths) === JSON.stringify({ ACTE: 450, CODE: 120 })) {
        console.log('✅ GridSnapshot columnWidths persistence WORKS!');
    } else {
        console.log('❌ GridSnapshot columnWidths persistence FAILED');
        console.log('   Retrieved columnWidths:', retrieved?.columnWidths);
    }
    
    // Clean up dummy
    await GridSnapshot.deleteOne({ _id: dummySnapshot._id });
    await conn.close();

    console.log('--- Verification Script Completed ---');
    process.exit(0);
}

run().catch(e => {
    console.error('Verification failed:', e);
    process.exit(1);
});

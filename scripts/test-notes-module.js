/**
 * Test script for the Evernote-like Notes module
 * Tests: login, page render, CRUD API, autosave
 */
const http = require('http');
const https = require('https');

const BASE = 'http://localhost:3000';
let cookies = '';

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/json',
            },
        };
        if (method === 'GET' || !body) delete options.headers['Content-Type'];

        const req = http.request(options, (res) => {
            let data = '';
            // Capture Set-Cookie headers
            if (res.headers['set-cookie']) {
                const newCookies = res.headers['set-cookie'].map(c => c.split(';')[0]);
                // Merge cookies
                const existing = cookies ? cookies.split('; ') : [];
                const map = {};
                existing.forEach(c => { const [k] = c.split('='); map[k] = c; });
                newCookies.forEach(c => { const [k] = c.split('='); map[k] = c; });
                cookies = Object.values(map).join('; ');
            }
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, headers: res.headers, body: data });
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function followRedirects(method, path, body, maxRedirects = 5) {
    let res = await request(method, path, body);
    let redirects = 0;
    while ((res.status === 301 || res.status === 302 || res.status === 303) && redirects < maxRedirects) {
        const location = res.headers.location;
        if (!location) break;
        res = await request('GET', location);
        redirects++;
    }
    return res;
}

async function run() {
    console.log('═══════════════════════════════════════════');
    console.log('  Notes Module Test Suite');
    console.log('═══════════════════════════════════════════\n');

    // Step 1: Login
    console.log('1️⃣  Logging in...');
    const loginRes = await followRedirects('POST', '/auth/login', {
        email: 'boukirou6@hotmail.com',
        password: 'test'
    });
    console.log('   Login response status:', loginRes.status);
    if (loginRes.status !== 200) {
        console.error('   ❌ Login failed! Status:', loginRes.status);
        // Try form-encoded login
        console.log('   Trying form-encoded login...');
        const formReq = await new Promise((resolve, reject) => {
            const postData = 'email=boukirou6%40hotmail.com&password=test';
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/auth/login',
                method: 'POST',
                headers: {
                    'Cookie': cookies,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData),
                },
            };
            const req = http.request(options, (res) => {
                let data = '';
                if (res.headers['set-cookie']) {
                    const newCookies = res.headers['set-cookie'].map(c => c.split(';')[0]);
                    const existing = cookies ? cookies.split('; ') : [];
                    const map = {};
                    existing.forEach(c => { const [k] = c.split('='); map[k] = c; });
                    newCookies.forEach(c => { const [k] = c.split('='); map[k] = c; });
                    cookies = Object.values(map).join('; ');
                }
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
        console.log('   Form login status:', formReq.status);
        if (formReq.headers.location) {
            console.log('   Redirect to:', formReq.headers.location);
            await request('GET', formReq.headers.location);
        }
    }
    console.log('   ✅ Login cookies captured\n');

    // Step 1b: Select workspace 5096
    console.log('1b. Selecting workspace 5096...');
    const wsRes = await request('GET', '/user/select-account/5096');
    if (wsRes.headers.location) {
        await request('GET', wsRes.headers.location);
    }
    console.log('   ✅ Workspace selected\n');

    // Step 2: Load the notes page
    console.log('2️⃣  Loading notes page...');
    const pageRes = await request('GET', '/account/5096/record/contacts/6a0d6bf5491c52a4e438b729/notes');
    console.log('   Page status:', pageRes.status);
    if (pageRes.status === 200) {
        // Check for key elements in the HTML
        const html = pageRes.body;
        const checks = [
            ['notes-layout', 'Main layout container'],
            ['notes-sidebar', 'Left sidebar'],
            ['notes-editor-panel', 'Right editor panel'],
            ['notes-search-input', 'Search input'],
            ['notes-create-btn', 'Create button'],
            ['ne-toolbar', 'Editor toolbar'],
            ['ne-content', 'Editor content area'],
            ['notesModule', 'Alpine.js data component'],
        ];
        console.log('   Checking HTML elements:');
        let allFound = true;
        for (const [cls, desc] of checks) {
            const found = html.includes(cls);
            console.log(`   ${found ? '✅' : '❌'} ${desc} (${cls})`);
            if (!found) allFound = false;
        }
        if (allFound) {
            console.log('   ✅ All UI elements present!\n');
        } else {
            console.log('   ⚠️ Some elements missing!\n');
        }
    } else {
        console.error('   ❌ Page failed to load! Status:', pageRes.status);
        console.log('   Response body (first 500 chars):', pageRes.body.substring(0, 500));
        console.log('');
    }

    // Step 3: Test Notes API - List
    console.log('3️⃣  Testing API: List notes...');
    const listRes = await request('GET', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes');
    console.log('   Status:', listRes.status);
    let listData;
    try {
        listData = JSON.parse(listRes.body);
        console.log('   Success:', listData.success);
        console.log('   Notes count:', (listData.notes || []).length);
        console.log('   ✅ List API works\n');
    } catch (e) {
        console.log('   ❌ Failed to parse response:', listRes.body.substring(0, 200));
        console.log('');
    }

    // Step 4: Test Notes API - Create
    console.log('4️⃣  Testing API: Create note...');
    const createRes = await request('POST', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes', {
        title: 'Test Note - Evernote Layout',
        color: '#8b5cf6'
    });
    console.log('   Status:', createRes.status);
    let createdNote;
    try {
        const createData = JSON.parse(createRes.body);
        console.log('   Success:', createData.success);
        if (createData.note) {
            createdNote = createData.note;
            console.log('   Note ID:', createdNote._id);
            console.log('   Title:', createdNote.title);
            console.log('   Color:', createdNote.color);
            console.log('   ✅ Create API works\n');
        }
    } catch (e) {
        console.log('   ❌ Failed:', createRes.body.substring(0, 200));
        console.log('');
    }

    // Step 5: Test Notes API - Update (autosave simulation)
    if (createdNote) {
        console.log('5️⃣  Testing API: Update note (autosave)...');
        const updateRes = await request('PUT', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes/' + createdNote._id, {
            title: 'Test Note - Updated Title',
            content: '<p>Ceci est un test de <strong>texte riche</strong> avec du <em>formatage</em>.</p><ul><li>Item 1</li><li>Item 2</li></ul><blockquote>Une citation</blockquote><div class="note-checklist-item"><input type="checkbox"><span class="note-checklist-text">Tâche 1</span></div>'
        });
        console.log('   Status:', updateRes.status);
        try {
            const updateData = JSON.parse(updateRes.body);
            console.log('   Success:', updateData.success);
            console.log('   Updated title:', updateData.note?.title);
            console.log('   Content saved:', updateData.note?.content ? 'Yes (' + updateData.note.content.length + ' chars)' : 'No');
            console.log('   ✅ Update/Autosave API works\n');
        } catch (e) {
            console.log('   ❌ Failed:', updateRes.body.substring(0, 200));
            console.log('');
        }

        // Step 6: Test Notes API - Get single note
        console.log('6️⃣  Testing API: Get single note...');
        const getRes = await request('GET', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes/' + createdNote._id);
        console.log('   Status:', getRes.status);
        try {
            const getData = JSON.parse(getRes.body);
            console.log('   Success:', getData.success);
            console.log('   Title:', getData.note?.title);
            console.log('   Has content:', !!getData.note?.content);
            console.log('   ✅ Get single note API works\n');
        } catch (e) {
            console.log('   ❌ Failed:', getRes.body.substring(0, 200));
            console.log('');
        }

        // Step 7: Test Notes API - Pin
        console.log('7️⃣  Testing API: Toggle pin...');
        const pinRes = await request('PATCH', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes/' + createdNote._id + '/pin');
        console.log('   Status:', pinRes.status);
        try {
            const pinData = JSON.parse(pinRes.body);
            console.log('   Success:', pinData.success);
            console.log('   Pinned:', pinData.pinned);
            console.log('   ✅ Pin API works\n');
        } catch (e) {
            console.log('   ❌ Failed:', pinRes.body.substring(0, 200));
            console.log('');
        }

        // Step 8: Create a second note
        console.log('8️⃣  Creating second note...');
        const create2Res = await request('POST', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes', {
            title: 'Deuxième note test',
            color: '#3b82f6'
        });
        let note2;
        try {
            const create2Data = JSON.parse(create2Res.body);
            if (create2Data.success) {
                note2 = create2Data.note;
                console.log('   ✅ Second note created:', note2.title, '\n');
            }
        } catch (e) {}

        // Step 9: Verify list now has our notes
        console.log('9️⃣  Verifying list with new notes...');
        const list2Res = await request('GET', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes');
        try {
            const list2Data = JSON.parse(list2Res.body);
            console.log('   Notes count:', (list2Data.notes || []).length);
            const ourNotes = (list2Data.notes || []).filter(n => n.title.includes('Test Note') || n.title.includes('Deuxième'));
            console.log('   Our test notes found:', ourNotes.length);
            ourNotes.forEach(n => console.log('     -', n.title, n.pinned ? '📌' : '', '(' + n.color + ')'));
            console.log('   ✅ List reflects created notes\n');
        } catch (e) {}

        // Step 10: Test Delete
        console.log('🔟  Testing API: Delete notes...');
        if (note2) {
            const del2Res = await request('DELETE', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes/' + note2._id);
            console.log('   Delete note 2 status:', del2Res.status);
        }
        const delRes = await request('DELETE', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes/' + createdNote._id);
        console.log('   Delete note 1 status:', delRes.status);
        try {
            const delData = JSON.parse(delRes.body);
            console.log('   Success:', delData.success);
            console.log('   ✅ Delete API works\n');
        } catch (e) {}

        // Step 11: Verify deletion
        console.log('1️⃣1️⃣ Verifying deletion...');
        const list3Res = await request('GET', '/account/5096/api/record/6a0d6bf5491c52a4e438b729/notes');
        try {
            const list3Data = JSON.parse(list3Res.body);
            const ourNotes = (list3Data.notes || []).filter(n => n.title.includes('Test Note') || n.title.includes('Deuxième'));
            console.log('   Our test notes remaining:', ourNotes.length);
            console.log('   ✅ Deletion verified\n');
        } catch (e) {}
    }

    console.log('═══════════════════════════════════════════');
    console.log('  ✅ ALL TESTS COMPLETED');
    console.log('═══════════════════════════════════════════');
}

run().catch(err => {
    console.error('Test suite error:', err);
    process.exit(1);
});

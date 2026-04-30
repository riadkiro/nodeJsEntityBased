// Test: create conversation + send message via API
const http = require('http');

const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });

function makeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    // 1. Login
    const loginRes = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
    }, loginData);
    
    const cookie = (loginRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
    console.log('1. Login:', loginRes.status, '| Cookie:', cookie.substring(0, 50) + '...');

    // 2. List conversations (should be empty)
    const listRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/7846/api/record/69e9e3e85ca57f4b82f9279f/conversations',
        method: 'GET', headers: { 'Cookie': cookie }
    });
    console.log('\n2. List conversations:', listRes.status, listRes.body);

    // 3. Create a conversation
    const createBody = JSON.stringify({ name: 'Discussion patient test' });
    const createRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/7846/api/record/69e9e3e85ca57f4b82f9279f/conversations',
        method: 'POST',
        headers: { 'Cookie': cookie, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(createBody) }
    }, createBody);
    console.log('\n3. Create conversation:', createRes.status);
    const createData = JSON.parse(createRes.body);
    console.log('   Success:', createData.success);
    if (createData.conversation) {
        console.log('   ID:', createData.conversation._id);
        console.log('   Name:', createData.conversation.name);
        console.log('   Participants:', createData.conversation.participants?.length);
    }
    if (createData.error) console.log('   ERROR:', createData.error);

    if (!createData.success) { process.exit(1); }

    const convId = createData.conversation._id;

    // 4. Send a message
    const msgBody = JSON.stringify({ text: 'Bonjour, ceci est un test depuis le script!' });
    const msgRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/7846/api/record/69e9e3e85ca57f4b82f9279f/conversations/' + convId + '/messages',
        method: 'POST',
        headers: { 'Cookie': cookie, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(msgBody) }
    }, msgBody);
    console.log('\n4. Send message:', msgRes.status);
    const msgData = JSON.parse(msgRes.body);
    console.log('   Success:', msgData.success);
    if (msgData.message) {
        console.log('   Message ID:', msgData.message._id);
        console.log('   Text:', msgData.message.text);
        console.log('   Sender:', msgData.message.senderName);
    }
    if (msgData.error) console.log('   ERROR:', msgData.error);

    // 5. Get conversation with messages
    const getRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/7846/api/record/69e9e3e85ca57f4b82f9279f/conversations/' + convId,
        method: 'GET', headers: { 'Cookie': cookie }
    });
    console.log('\n5. Get conversation:', getRes.status);
    const getData = JSON.parse(getRes.body);
    console.log('   Messages count:', getData.messages?.length);

    // 6. List again to verify
    const list2Res = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/7846/api/record/69e9e3e85ca57f4b82f9279f/conversations',
        method: 'GET', headers: { 'Cookie': cookie }
    });
    console.log('\n6. List conversations (after create):', list2Res.status);
    const list2Data = JSON.parse(list2Res.body);
    console.log('   Count:', list2Data.conversations?.length);

    console.log('\n✅ All API tests passed!');
    process.exit(0);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });

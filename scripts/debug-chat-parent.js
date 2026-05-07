// Quick debug: check what data the record-parent items have
const http = require('http');

// First login
const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
const loginOptions = {
  hostname: 'localhost', port: 3000, path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
};

const loginReq = http.request(loginOptions, (res) => {
  const cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
  console.log('Login status:', res.statusCode);
  
  // Fetch conversations
  const convOptions = {
    hostname: 'localhost', port: 3000,
    path: '/account/9194/api/team-chat/conversations',
    headers: { 'Cookie': cookies }
  };
  
  http.get(convOptions, (res2) => {
    let body = '';
    res2.on('data', d => body += d);
    res2.on('end', () => {
      const data = JSON.parse(body);
      if (data.recordConversations) {
        console.log('\n=== Record Conversations ===');
        for (const rc of data.recordConversations) {
          console.log(`  - name: ${rc.name}, recordId: ${rc.recordId}, _id: ${rc._id}`);
        }
        
        // Group by recordId to see what the parent would have
        const groups = {};
        for (const rc of data.recordConversations) {
          const rId = rc.recordId?.toString() || rc._id;
          if (!groups[rId]) groups[rId] = { recordId: rId, title: rc.recordDisplayTitle, children: [] };
          groups[rId].children.push(rc.name);
        }
        console.log('\n=== Groups ===');
        for (const [rId, g] of Object.entries(groups)) {
          console.log(`  recordId: ${rId} | title: ${g.title} | children: [${g.children.join(', ')}]`);
        }
      }
    });
  });
});
loginReq.write(loginData);
loginReq.end();

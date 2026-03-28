const http = require('http');
const fs = require('fs');

const loginReq = http.request({
    hostname: 'localhost', port: 3000, method: 'POST',
    path: '/auth/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, (res) => {
    const cookieStr = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        const pageReq = http.get({
            hostname: 'localhost', port: 3000,
            path: '/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit',
            headers: { Cookie: cookieStr }
        }, (rp) => {
            let html = '';
            rp.on('data', c => html += c);
            rp.on('end', () => {
                // Find entity_id references
                const out = [];
                
                // Look for how entity_id is used in Alpine bindings
                const matches = html.match(/entity_id[^"\n]{0,100}/g);
                out.push('entity_id patterns:');
                (matches || []).slice(0, 10).forEach(m => out.push('  ' + m));
                
                // Look for the initial-data JSON which contains the record
                const jsonMatch = html.match(/id="record-values"[^>]*>([\s\S]*?)<\/script>/);
                if (jsonMatch) {
                    try {
                        const rv = JSON.parse(jsonMatch[1]);
                        out.push('\nrecord-values.entity_id: ' + JSON.stringify(rv.entity_id));
                    } catch(e) {}
                }
                
                // Look for how record.entity_id is rendered on server side
                const eidPattern = html.match(/data-entity-id="([^"]*)"/);
                out.push('\ndata-entity-id raw: "' + (eidPattern ? eidPattern[1] : 'NOT FOUND') + '"');
                
                // Look for entityId in x-data
                const xDataEntity = html.match(/entityId['":\s]+['"]([a-f0-9]{24})['"]/g);
                out.push('\nAlpine entityId refs:');
                (xDataEntity || []).slice(0, 5).forEach(m => out.push('  ' + m));
                
                fs.writeFileSync('scripts/debug-output.txt', out.join('\n'));
                console.log('Done');
            });
        });
    });
});
loginReq.write('email=boukirou6@hotmail.com&password=test');
loginReq.end();

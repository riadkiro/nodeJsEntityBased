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
        const redirectReq = http.get({
            hostname: 'localhost', port: 3000,
            path: res.headers.location || '/account/9194/dashboard',
            headers: { Cookie: cookieStr }
        }, (r2) => {
            const cookies2 = (r2.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
            const finalCookies = cookies2 || cookieStr;
            let b2 = '';
            r2.on('data', c => b2 += c);
            r2.on('end', () => {
                const recUrl = '/account/9194/record/consultations/69c232ce0fa7abd357abd6f3/edit';
                const recReq = http.get({
                    hostname: 'localhost', port: 3000,
                    path: recUrl,
                    headers: { Cookie: finalCookies }
                }, (r3) => {
                    let html = '';
                    r3.on('data', c => html += c);
                    r3.on('end', () => {
                        const out = [];
                        out.push('Status: ' + r3.statusCode);
                        out.push('HTML length: ' + html.length);
                        
                        // Find data-island="dynamic-table"
                        const idx = html.indexOf('data-island="dynamic-table"');
                        out.push('data-island="dynamic-table" found at: ' + idx);
                        if (idx > 0) {
                            out.push('Context: ' + html.substring(Math.max(0, idx - 200), idx + 300));
                        }
                        
                        // Find all unique entity IDs
                        const entityIds = new Set();
                        const regex = /([a-f0-9]{24})/g;
                        let m;
                        const entityContext = html.substring(Math.max(0, idx - 500), idx + 500);
                        while ((m = regex.exec(entityContext)) !== null) {
                            entityIds.add(m[1]);
                        }
                        out.push('Entity IDs near island: ' + [...entityIds].join(', '));
                        
                        // Find how record._id and entity_id are passed
                        const recIdPattern = html.match(/record\??\._id/g);
                        out.push('record._id occurrences: ' + (recIdPattern?.length || 0));
                        
                        // Find the account number  
                        const accNum = html.match(/data-account-number="(\d+)"/);
                        out.push('data-account-number: ' + (accNum ? accNum[1] : 'NOT FOUND'));
                        
                        // Check for :data-record-id binding
                        const dynRecId = html.indexOf(':data-record-id');
                        out.push(':data-record-id binding at: ' + dynRecId);
                        if (dynRecId > 0) {
                            out.push(':data-record-id context: ' + html.substring(dynRecId, dynRecId + 100));
                        }
                        
                        // Now test catalog API
                        // First find the entity ID for Traitement
                        // The relation column entityId is what we need
                        const relSearchUrl = '/account/9194/api/line-schemas/by-context?entityId=69c232cd0fa7abd357abd654';
                        const schReq = http.get({
                            hostname: 'localhost', port: 3000,
                            path: relSearchUrl,
                            headers: { Cookie: finalCookies }
                        }, (r4) => {
                            let sBod = '';
                            r4.on('data', c => sBod += c);
                            r4.on('end', () => {
                                out.push('\n=== LINE SCHEMAS ===');
                                out.push('Status: ' + r4.statusCode);
                                try {
                                    const schemas = JSON.parse(sBod);
                                    out.push('Schemas count: ' + schemas.data?.length);
                                    if (schemas.data) {
                                        schemas.data.forEach(s => {
                                            out.push('  Schema: ' + s.name + ' (' + s._id + ')');
                                            out.push('  Columns: ' + (s.columns || []).map(c => c.key + ':' + c.type).join(', '));
                                            const relCol = (s.columns || []).find(c => c.type === 'relation');
                                            if (relCol) {
                                                out.push('  Relation col entityId: ' + relCol.config?.entityId);
                                            }
                                        });
                                    }
                                } catch(e) {
                                    out.push('Parse error: ' + e.message);
                                    out.push('Body: ' + sBod.substring(0, 300));
                                }
                                
                                fs.writeFileSync('scripts/debug-output.txt', out.join('\n'));
                                console.log('Output written to scripts/debug-output.txt');
                            });
                        });
                    });
                });
            });
        });
    });
});
loginReq.write('email=boukirou6@hotmail.com&password=test');
loginReq.end();

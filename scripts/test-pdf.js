/**
 * Test script: Check if PDF export endpoint works properly
 */
const http = require('http');

const docId = '6a0c59225d62fd16024c9a5d';
const accountNumber = '5096';

// First, login to get session cookie
const loginData = JSON.stringify({
    email: 'boukirou6@hotmail.com',
    password: 'test'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

console.log('[Test] Logging in...');
const loginReq = http.request(loginOptions, (loginRes) => {
    let body = '';
    loginRes.on('data', d => body += d);
    loginRes.on('end', () => {
        const cookies = loginRes.headers['set-cookie'];
        if (!cookies || cookies.length === 0) {
            console.log('[Test] No cookies from login. Status:', loginRes.statusCode);
            return;
        }
        const sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
        console.log('[Test] Login OK. Cookie:', sessionCookie.substring(0, 50) + '...');
        
        // Now test PDF export
        const pdfBody = JSON.stringify({
            html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@page{margin:0;size:A4;}body{font-family:Arial;}</style></head><body><div class="doc-page"><div class="doc-content" style="padding:40px;">
                <h1>Test PDF</h1>
                <p>Hello world - this is a test PDF.</p>
            </div></div></body></html>`
        });
        
        const pdfOptions = {
            hostname: 'localhost',
            port: 3000,
            path: `/account/${accountNumber}/documents/api/${docId}/pdf`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(pdfBody),
                'Cookie': sessionCookie
            }
        };
        
        console.log('[Test] Requesting PDF...');
        const pdfReq = http.request(pdfOptions, (pdfRes) => {
            console.log('[Test] PDF Response Status:', pdfRes.statusCode);
            console.log('[Test] PDF Response Headers:', JSON.stringify(pdfRes.headers, null, 2));
            
            const chunks = [];
            pdfRes.on('data', chunk => chunks.push(chunk));
            pdfRes.on('end', () => {
                const buf = Buffer.concat(chunks);
                console.log('[Test] Response body size:', buf.length, 'bytes');
                console.log('[Test] First 20 bytes (hex):', buf.slice(0, 20).toString('hex'));
                console.log('[Test] First 20 bytes (utf8):', buf.slice(0, 20).toString('utf8'));
                
                // PDF files start with %PDF
                if (buf.slice(0, 4).toString('utf8') === '%PDF') {
                    console.log('[Test] ✅ Valid PDF response');
                } else {
                    console.log('[Test] ❌ NOT a valid PDF. Response text:', buf.slice(0, 500).toString('utf8'));
                }
            });
        });
        
        pdfReq.on('error', e => console.error('[Test] PDF request error:', e));
        pdfReq.write(pdfBody);
        pdfReq.end();
    });
});

loginReq.on('error', e => console.error('[Test] Login error:', e));
loginReq.write(loginData);
loginReq.end();

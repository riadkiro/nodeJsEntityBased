// This script logs into the app and checks the drive page console for JS errors
const http = require('http');

const BASE = 'http://localhost:3000';
let cookies = '';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const opts = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: { 'Cookie': cookies }
        };
        if (body) opts.headers['Content-Type'] = 'application/json';
        if (body && typeof body !== 'string') body = JSON.stringify(body);
        if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);

        const req = http.request(opts, (res) => {
            const setCookies = res.headers['set-cookie'];
            if (setCookies) {
                setCookies.forEach(c => {
                    const name = c.split('=')[0];
                    const val = c.split(';')[0];
                    if (cookies.includes(name + '=')) {
                        cookies = cookies.replace(new RegExp(name + '=[^;]*'), val);
                    } else {
                        cookies = cookies ? cookies + '; ' + val : val;
                    }
                });
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if ([301, 302, 303].includes(res.statusCode) && res.headers.location) {
                    request('GET', res.headers.location, null).then(resolve).catch(reject);
                } else {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    console.log('=== Drive Page HTML Output Test ===\n');

    await request('POST', '/auth/login', { email: 'boukirou6@hotmail.com', password: 'test' });
    
    const driveRes = await request('GET', '/account/5096/drive');
    const html = driveRes.data;
    
    // Check for any EJS errors in the page
    if (html.includes('SyntaxError') || html.includes('ReferenceError') || html.includes('TypeError')) {
        console.log('❌ Error found in page:');
        const lines = html.split('\n');
        lines.forEach((line, i) => {
            if (line.includes('Error')) console.log(`  Line ${i+1}: ${line.trim().substring(0, 200)}`);
        });
        return;
    }
    
    // Check that x-html="renderItemsHtml()" is in the output
    const hasXHtml = html.includes('x-html="renderItemsHtml()"');
    console.log(`x-html="renderItemsHtml()": ${hasXHtml ? '✅' : '❌'}`);
    
    // Check that x-show directive is correct
    const hasXShow = html.includes('x-show="!loading && displayItems.length > 0"');
    console.log(`x-show for items list: ${hasXShow ? '✅' : '❌'}`);
    
    // Check for the renderItemsHtml function definition
    const hasRenderFn = html.includes('renderItemsHtml()');
    console.log(`renderItemsHtml function: ${hasRenderFn ? '✅' : '❌'}`);
    
    // Check for handleItemClick 
    const hasHandleClick = html.includes('handleItemClick');
    console.log(`handleItemClick: ${hasHandleClick ? '✅' : '❌'}`);
    
    // Check for handleItemContext
    const hasHandleCtx = html.includes('handleItemContext');
    console.log(`handleItemContext: ${hasHandleCtx ? '✅' : '❌'}`);
    
    // Check the structure around x-html
    const xhtmlIdx = html.indexOf('x-html="renderItemsHtml()"');
    if (xhtmlIdx > -1) {
        const start = Math.max(0, xhtmlIdx - 200);
        const end = Math.min(html.length, xhtmlIdx + 200);
        console.log('\n--- Context around x-html ---');
        console.log(html.substring(start, end));
    }
    
    // Check if there's the Alpine x-data
    const xDataMatch = html.match(/x-data="globalDrive\(\)"/);
    console.log(`\nx-data="globalDrive()": ${xDataMatch ? '✅' : '❌'}`);
    
    // Check for any syntax issues in the JS
    // Extract the script content
    const scriptStart = html.indexOf('function globalDrive()');
    const scriptEnd = html.lastIndexOf('</script>');
    if (scriptStart > -1 && scriptEnd > -1) {
        const scriptContent = html.substring(scriptStart, scriptEnd);
        
        // Count opening/closing braces
        let braces = 0;
        for (const c of scriptContent) {
            if (c === '{') braces++;
            if (c === '}') braces--;
        }
        console.log(`JS brace balance: ${braces === 0 ? '✅ Balanced' : '❌ Unbalanced: ' + braces}`);
        
        // Check for common issues
        const hasRenderDef = scriptContent.includes('renderItemsHtml()');
        console.log(`renderItemsHtml defined in script: ${hasRenderDef ? '✅' : '❌'}`);
        
        const hasBuildItems = scriptContent.includes('_buildItems()');
        console.log(`_buildItems defined in script: ${hasBuildItems ? '✅' : '❌'}`);
    }
    
    console.log('\n=== Done ===');
}

main().catch(e => console.error('Error:', e));

// Simulate renderItemsHtml() with actual API data
const http = require('http');
const BASE = 'http://localhost:3000';
let cookies = '';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const opts = { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers: { 'Cookie': cookies } };
        if (body) { opts.headers['Content-Type'] = 'application/json'; body = JSON.stringify(body); opts.headers['Content-Length'] = Buffer.byteLength(body); }
        const req = http.request(opts, (res) => {
            const sc = res.headers['set-cookie'];
            if (sc) sc.forEach(c => { const v = c.split(';')[0]; const n = v.split('=')[0]; cookies = cookies.includes(n+'=') ? cookies.replace(new RegExp(n+'=[^;]*'), v) : (cookies ? cookies+'; '+v : v); });
            let data = ''; res.on('data', c => data += c);
            res.on('end', () => { if ([301,302,303].includes(res.statusCode) && res.headers.location) request('GET', res.headers.location).then(resolve).catch(reject); else resolve({ status: res.statusCode, data }); });
        });
        req.on('error', reject); if (body) req.write(body); req.end();
    });
}

function getFileIcon(cat) {
    const map = { image: 'solar:gallery-bold-duotone', pdf: 'solar:document-text-bold-duotone', word: 'solar:file-text-bold-duotone', excel: 'solar:chart-square-bold-duotone', video: 'solar:videocamera-record-bold-duotone', audio: 'solar:music-notes-bold-duotone' };
    return map[cat] || 'solar:file-bold-duotone';
}
function getFileColor(cat) {
    const map = { image: '#4361ee', pdf: '#e7515a', word: '#2196f3', excel: '#00ab55', video: '#e2a03f', audio: '#805dca' };
    return map[cat] || '#888ea8';
}

async function main() {
    await request('POST', '/auth/login', { email: 'boukirou6@hotmail.com', password: 'test' });
    const apiRes = await request('GET', '/account/5096/api/drive');
    const data = JSON.parse(apiRes.data);
    
    // Simulate _buildItems at root level
    const entities = data.entities;
    const displayItems = entities.map(entity => ({
        id: 'e-' + entity.entityId,
        type: 'folder',
        folderLevel: 'entity',
        icon: entity.entityIcon || 'solar:database-bold-duotone',
        color: entity.entityColor || '#4361ee',
        label: entity.entityName,
        sublabel: (entity.fileCount || 0) + ' fichier' + ((entity.fileCount||0)>1?'s':'') + ' • ' + (entity.records||[]).length + ' fiche' + ((entity.records||[]).length>1?'s':''),
        count: (entity.records || []).length,
        data: entity
    }));
    
    console.log('displayItems:', displayItems.length);
    
    // Simulate renderItemsHtml
    const esc = (s) => (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const selectedIds = [];
    
    const html = displayItems.map((item, idx) => {
        const isFolder = item.type === 'folder';
        const isImage = !isFolder && item.file && item.file.category === 'image';
        const color = item.color || '#4361ee';
        const isSelected = selectedIds.includes(item.id);
        
        const checkIcon = isSelected ? '<iconify-icon icon="solar:check-read-bold" width="12" style="color:#fff"></iconify-icon>' : '';
        const checkHtml = '<div class="rm-item-check ' + (isSelected ? 'checked' : '') + '" data-check="' + idx + '">' + checkIcon + '</div>';
        
        let iconHtml;
        if (isImage) {
            iconHtml = '<img src="' + esc(item.file.url) + '" alt="' + esc(item.label) + '" class="rm-item-icon">';
        } else if (isFolder) {
            iconHtml = '<div class="rm-item-icon" style="background:linear-gradient(135deg,' + color + '15,' + color + '08)"><iconify-icon icon="' + esc(item.icon || 'solar:folder-bold-duotone') + '" width="20" style="color:' + color + '"></iconify-icon></div>';
        } else {
            const cat = item.file ? item.file.category : '';
            iconHtml = '<div class="rm-item-icon" style="background:#f1f5f9;"><iconify-icon icon="' + esc(getFileIcon(cat)) + '" width="20" style="color:' + esc(getFileColor(cat)) + '"></iconify-icon></div>';
        }
        
        let badgeHtml = '';
        if (isFolder) {
            badgeHtml = '<span class="rm-item-badge" style="background:' + color + '10;color:' + color + '">Dossier</span>';
        }
        
        const actionIcon = isFolder ? 'solar:alt-arrow-right-linear' : 'solar:eye-bold-duotone';
        const dateIcon = isFolder ? 'solar:documents-linear' : 'solar:hard-drive-linear';
        
        return '<div class="rm-item" data-idx="' + idx + '" style="animation-delay:' + (idx * 30) + 'ms;cursor:pointer;">'
          + checkHtml
          + iconHtml
          + '<div class="rm-item-body">'
          +   '<div class="rm-item-title">' + esc(item.label) + '</div>'
          +   '<div class="rm-item-date"><iconify-icon icon="' + dateIcon + '" width="12"></iconify-icon> ' + esc(item.sublabel) + '</div>'
          + '</div>'
          + badgeHtml
          + '<span class="rm-item-action" style="color:#94a3b8;"><iconify-icon icon="' + actionIcon + '" width="18"></iconify-icon></span>'
          + '</div>';
    }).join('');
    
    console.log('\n=== Generated HTML ===');
    console.log(html);
    console.log('\n=== HTML Length:', html.length, '===');
    console.log('Contains rm-item:', html.includes('rm-item'));
    console.log('Contains data-idx:', html.includes('data-idx'));
    console.log('Contains rm-item-title:', html.includes('rm-item-title'));
}

main().catch(e => console.error('Error:', e));

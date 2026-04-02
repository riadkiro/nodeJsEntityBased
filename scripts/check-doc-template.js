const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    const docId = '69cda860738ff763a64804be';
    const doc = await conn.db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId(docId) });
    
    const results = [];
    results.push('=== DOCUMENT PAGES CONTENT ===');
    
    if (doc.pages && doc.pages.length > 0) {
        doc.pages.forEach((page, i) => {
            results.push(`\n--- Page ${i} ---`);
            results.push('Content: ' + (page.content || '(empty)'));
            if (page.rows && page.rows.length > 0) {
                results.push('Rows: ' + page.rows.length);
                page.rows.forEach((row, ri) => {
                    row.columns?.forEach((col, ci) => {
                        col.blocks?.forEach((block, bi) => {
                            results.push(`  Row ${ri} Col ${ci} Block ${bi}: ${(block.content || block.html || '').substring(0, 200)}`);
                        });
                    });
                });
            }
        });
    }
    
    results.push('\n=== HEADER ===');
    results.push(doc.headerHtml || '(empty)');
    results.push('\n=== FOOTER ===');
    results.push(doc.footerHtml || '(empty)');
    
    // Find all {{xxx}} tokens in the document
    const allContent = JSON.stringify(doc);
    const tokenRegex = /\{\{([^}]+)\}\}/g;
    const tokens = new Set();
    let match;
    while ((match = tokenRegex.exec(allContent)) !== null) {
        tokens.add(match[1]);
    }
    results.push('\n=== ALL TOKENS USED ===');
    for (const t of tokens) {
        results.push('  {{' + t + '}}');
    }
    
    fs.writeFileSync('scripts/doc-content-output.txt', results.join('\n'));
    console.log('Done');
    
    await conn.close();
}

main().catch(console.error);

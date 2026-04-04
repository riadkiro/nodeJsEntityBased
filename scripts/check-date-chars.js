const mongoose = require('mongoose');
const fs = require('fs');

async function checkDateChars() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    
    const doc = await conn.db.collection('documents').findOne({ _id: new mongoose.Types.ObjectId('69ce60dd52c96f71dd936af1') });
    
    const results = [];
    
    if (!doc) {
        results.push('Not found');
        await conn.close();
        fs.writeFileSync('scripts/char-results.json', JSON.stringify(results, null, 2));
        return;
    }
    
    results.push({ name: doc.name });
    
    for (let i = 0; i < doc.pages.length; i++) {
        const content = doc.pages[i].content || '';
        
        // Find DU section
        const duIdx = content.indexOf('DU');
        if (duIdx >= 0) {
            const segment = content.substring(duIdx, duIdx + 200);
            // Find all underscore-like chars
            const charInfo = [];
            for (let j = 0; j < segment.length; j++) {
                const ch = segment[j];
                const code = ch.charCodeAt(0);
                if (code === 95 || code > 8000) {
                    charInfo.push({ pos: j, char: ch, code: code, hex: 'U+' + code.toString(16).padStart(4, '0') });
                }
            }
            results.push({ 
                section: 'DU area', 
                rawSegment: segment.substring(0, 150),
                underscoreChars: charInfo
            });
        }
        
        // Find checkboxes
        const checkResults = [];
        for (let j = 0; j < content.length; j++) {
            const code = content.charCodeAt(j);
            if (code === 0x2610 || code === 0x2611 || code === 0x2612 || 
                code === 0x25A1 || code === 0x25A0 || code === 0x25A2 || code === 0x25A3) {
                checkResults.push({
                    pos: j,
                    char: content[j],
                    code: code,
                    hex: 'U+' + code.toString(16).padStart(4, '0'),
                    context: content.substring(j, j + 30)
                });
            }
        }
        results.push({ checkboxes: checkResults });
        
        // Check if underscores are inside HTML tags
        const underscoreRegex = /_{2,}\s*\/\s*_{2,}\s*\/\s*_{2,}/g;
        let m;
        const dateMatches = [];
        while ((m = underscoreRegex.exec(content)) !== null) {
            dateMatches.push({ match: m[0], index: m.index });
        }
        results.push({ datePatterns: dateMatches, datePatternCount: dateMatches.length });
        
        // Also check if dates are inside span/div elements
        const htmlTagPattern = /<[^>]+>_{2,}/g;
        const htmlMatches = [];
        while ((m = htmlTagPattern.exec(content)) !== null) {
            htmlMatches.push({ match: m[0].substring(0, 80), index: m.index });
        }
        results.push({ datesInHtml: htmlMatches });
    }
    
    await conn.close();
    fs.writeFileSync('scripts/char-results.json', JSON.stringify(results, null, 2), 'utf8');
    console.log('Results written to scripts/char-results.json');
}

checkDateChars().catch(console.error);

const fs = require('fs');
const content = fs.readFileSync('views/document/document-list.ejs', 'utf8');
const lines = content.split(/\r?\n/);
lines.forEach((l, i) => {
    if (l.includes('activeSection') && l.includes('recent')) {
        console.log(`${i + 1}: ${l.trim().substring(0, 120)}`);
    }
});

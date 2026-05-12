const fs = require('fs');
const lines = fs.readFileSync('views/record/record-module.ejs', 'utf8').split('\n');

// Find all occurrences of ovInlineEdit and ovRelEditor
lines.forEach((l, i) => {
    if (l.includes('ovInlineEdit') || l.includes('ovRelEditor')) {
        console.log(`${i+1}: ${l.trim().substring(0, 100)}`);
    }
});

// Find the closing of overview guard
console.log('\n--- moduleName guards ---');
lines.forEach((l, i) => {
    if (l.includes("moduleName === 'overview'") || l.includes("moduleName === 'fiche'")) {
        console.log(`${i+1}: ${l.trim().substring(0, 100)}`);
    }
});

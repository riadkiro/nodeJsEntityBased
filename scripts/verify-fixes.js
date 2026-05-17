const fs = require('fs');
const c = fs.readFileSync('views/record/record-module.ejs', 'utf8');
const lines = c.split('\n');

const occurrences = lines.filter(l => l.includes('closeAndSave()')).length;
console.log('Number of closeAndSave() in template:', occurrences);

// Let's print around the closeAndSave calls to make sure they are clean
lines.forEach((l, i) => {
    if (l.includes('closeAndSave()')) {
        console.log(`Line ${i+1}: ${l.trim()}`);
    }
});

const fs = require('fs');
const content = fs.readFileSync('views/record/record-module.ejs', 'utf8');
const lines = content.split('\n');

// Find gallery field rendering in fiche
const results = [];
lines.forEach((l, i) => {
    const t = l.trim();
    if (t.includes('gallery') || t.includes('_persist') || t.includes('selectedFiles') || t.includes('ovMediaEditor')) {
        results.push((i+1) + ': ' + t.substring(0, 150));
    }
});
console.log('=== Gallery/persist occurrences (first 40):');
results.slice(0, 40).forEach(r => console.log(r));

// Also find allFiles.splice vs filter
console.log('\n=== executeBulkDelete and deleteFile:');
let inFunc = false;
lines.forEach((l, i) => {
    if (l.includes('executeBulkDelete') || l.includes('async deleteFile') || l.includes('allFiles.filter') || l.includes('allFiles.splice')) {
        console.log((i+1) + ': ' + l.trim().substring(0, 120));
    }
});

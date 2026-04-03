const fs = require('fs');
const content = fs.readFileSync('routes/document.routes.js', 'utf8');
const lines = content.split(/\r?\n/);
const results = [];
lines.forEach((l, i) => {
    if (l.includes('document-list') || l.includes('templateDocs') || l.includes('documents:') || l.includes('render') || l.includes('_denorm') || l.includes('relations') || l.includes('generatedFrom')) {
        results.push(`${i + 1}: ${l.trim().substring(0, 180)}`);
    }
});
fs.writeFileSync('scripts/catalog-refs.txt', results.join('\n'));
console.log('Found: ' + results.length);

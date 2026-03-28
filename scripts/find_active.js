const fs = require('fs');
const lines = fs.readFileSync('c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8').split('\n');

const results = [];
lines.forEach((l, i) => {
    if (l.includes('activeSchemaId')) {
        results.push((i + 1) + ': ' + l.trim());
    }
});
fs.writeFileSync('c:/Users/pc/Documents/nodeJsProject/tmp/activeSchema.txt', results.join('\n'));
console.log('Found', results.length, 'references');

const fs = require('fs');
const lines = fs.readFileSync('c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8').split('\n');

// Find 'get lines' or 'lines:' or 'this.lines' definition
const results = [];
lines.forEach((l, i) => {
    const trimmed = l.trim();
    if (trimmed.startsWith('get lines()') || trimmed.startsWith('get lines ') || 
        (trimmed.includes('get lines()') && !trimmed.includes('//'))) {
        results.push((i + 1) + ': ' + trimmed);
    }
    if (trimmed.startsWith('lines:') && i < 500) {
        results.push((i + 1) + ': ' + trimmed);
    }
});
console.log(results.join('\n'));

const fs = require('fs');
const lines = fs.readFileSync('c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8').split('\n');
const results = [];
lines.forEach((l, i) => {
    if (l.includes('openRelationSearch')) {
        results.push((i + 1) + ': ' + l.trim());
    }
});
fs.writeFileSync('c:/Users/pc/Documents/nodeJsProject/tmp/openRelSearch.txt', results.join('\n'));
console.log(results.join('\n'));

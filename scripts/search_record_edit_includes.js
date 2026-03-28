const fs = require('fs');
const c = fs.readFileSync('c:/Users/pc/Documents/nodeJsProject/views/record/record-edit.ejs', 'utf8');
const lines = c.split('\n');
const output = [];
output.push('=== INCLUDES ===');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('include(')) {
        output.push((i + 1) + ': ' + lines[i].trim().substring(0, 160));
    }
}
output.push('\n=== gridSchema/linesPanel references ===');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('gridSchema') || lines[i].includes('linesPanel') || lines[i].includes('record-lines')) {
        output.push((i + 1) + ': ' + lines[i].trim().substring(0, 160));
    }
}
fs.writeFileSync('c:/Users/pc/Documents/nodeJsProject/tmp/search_results.txt', output.join('\n'), 'utf8');
console.log('Done. Written', output.length, 'lines');

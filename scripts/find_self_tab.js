const fs = require('fs');
const filePath = 'views/record/record-edit.ejs';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const output = [];
lines.forEach((line, index) => {
    if (line.includes('insert-tab') || line.includes('blockId') || line.includes('_genId')) {
        output.push(`${index + 1}: ${line.trim().replace(/\r/g, '').substring(0, 150)}`);
    }
});
fs.writeFileSync('scripts/debug_output.txt', output.join('\n'), 'utf8');
console.log('Done');

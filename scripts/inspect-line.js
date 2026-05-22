const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/nav/nav-sidebar.ejs');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);
const lineIndex = 1364 - 1; // 0-indexed
const line = lines[lineIndex];

console.log('Line 1364 raw length:', line.length);
console.log('Line 1364 representation:', JSON.stringify(line));
console.log('Char codes:');
for (let i = 0; i < line.length; i++) {
    console.log(`char[${i}]: ${line[i]} (code: ${line.charCodeAt(i)})`);
}

const fs = require('fs');
const filePath = 'views/document/document-list.ejs';
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

// Remove lines 650-915 (0-indexed 649-914) - old duplicate gdoc CSS
const linesToRemove = new Set();
for (let i = 649; i <= 914; i++) linesToRemove.add(i);

const newLines = lines.filter((_, idx) => !linesToRemove.has(idx));
fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
console.log(`Removed ${linesToRemove.size} duplicate CSS lines. New file has ${newLines.length} lines (was ${lines.length}).`);

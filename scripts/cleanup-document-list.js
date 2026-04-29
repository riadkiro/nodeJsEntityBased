const fs = require('fs');
const filePath = 'views/document/document-list.ejs';
const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

// Remove orphan Documents section (lines 207-357, 0-indexed 206-356)
// Remove orphan Uploads section (lines 407-457, 0-indexed 406-456 after first removal)
// After first removal, the uploads section shifts up by 151 lines

const linesToRemove = new Set();

// Orphan documents section: lines 207-357
for (let i = 206; i <= 356; i++) linesToRemove.add(i);
// Orphan uploads section: lines 407-457
for (let i = 406; i <= 456; i++) linesToRemove.add(i);

const newLines = lines.filter((_, idx) => !linesToRemove.has(idx));
fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
console.log(`Removed ${linesToRemove.size} orphan lines. New file has ${newLines.length} lines (was ${lines.length}).`);

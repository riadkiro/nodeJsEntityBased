const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'routes', 'document.routes.js');
const content = fs.readFileSync(filePath, 'utf-8');

// Find the FIRST "module.exports = router;" and keep everything up to and including that line
const lines = content.split('\n');
let cutIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'module.exports = router;') {
        cutIndex = i;
        break;
    }
}

if (cutIndex === -1) {
    console.log('module.exports not found!');
    process.exit(1);
}

const newContent = lines.slice(0, cutIndex + 1).join('\n') + '\n';
fs.writeFileSync(filePath, newContent);
console.log(`Truncated at line ${cutIndex + 1}. Removed ${lines.length - cutIndex - 1} lines.`);

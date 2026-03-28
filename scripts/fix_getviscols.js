const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the bad insertion at 3416
const badChunk = `        getVisibleColumnsForLine(line) {
            if (!this.activeSchema) return [];
            return (this.activeSchema.columns || [])
                .filter(c => c.visible !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
        },`;

if (content.includes(badChunk)) {
    content = content.replace(badChunk, '');
} else if (content.includes(badChunk.replace(/\n/g, '\r\n'))) {
    content = content.replace(badChunk.replace(/\n/g, '\r\n'), '');
}

// 2. Remove the actual exact line
const targetLine = "                .filter(c => !(line._excludedColumns || []).includes(c.key))\n";
if (content.includes(targetLine)) {
    content = content.replace(targetLine, "");
} else {
    const targetLineR = "                .filter(c => !(line._excludedColumns || []).includes(c.key))\r\n";
    if (content.includes(targetLineR)) {
        content = content.replace(targetLineR, "");
    }
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed');

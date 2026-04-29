const fs = require('fs');
const content = fs.readFileSync('src/islands/document-editor/DocumentEditorIsland.jsx', 'utf-8');
const lines = content.split('\n');

const keywords = ['LeftSidebar', 'leftSidebar', 'return (', 'flex h-full', 'flex-1', 'layout-app', 'isMinimal', 'contextFree'];
keywords.forEach(kw => {
    const matches = [];
    lines.forEach((line, i) => {
        if (line.includes(kw)) {
            matches.push(`  L${i+1}: ${line.trim().substring(0, 130)}`);
        }
    });
    if (matches.length > 0 && matches.length < 15) {
        console.log(`\n=== "${kw}" (${matches.length}) ===`);
        matches.forEach(m => console.log(m));
    }
});

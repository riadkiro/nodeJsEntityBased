const fs = require('fs');
const files = ['views/record/partials/record-lines.ejs', 'views/record/partials/record-sidebar.ejs'];
files.forEach(f => {
    const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/' + f, 'utf8');
    const matches = content.match(/isOptSelected\s*\(/g) || [];
    console.log(`${f}: ${matches.length} matches`);
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('isOptSelected(') && line.includes('{')) {
             console.log(`  Definition at Line ${i+1}: ${line.trim()}`);
        }
    });
});

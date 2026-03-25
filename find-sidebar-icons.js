const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('isOptSelected(') && line.includes('iconify-icon')) {
        console.log(`L${i + 1}: ${line.trim()}`);
    }
});

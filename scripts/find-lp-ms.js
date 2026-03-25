const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('lp-ms-wrap') || line.includes('lp-ms-dropdown')) {
        console.log(`Line ${i+1}: ${line.trim().substring(0, 150)}`);
    }
});

const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/themes/default/assets/css/style.css');
const content = fs.readFileSync(cssPath, 'utf8');

// Search for any line containing "header" and "margin" or "padding"
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('header') && (line.includes('margin') || line.includes('padding')) && line.includes('{')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});

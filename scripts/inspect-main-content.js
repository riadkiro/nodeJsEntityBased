const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/themes/default/assets/css/style.css');
const content = fs.readFileSync(cssPath, 'utf8');

const regex = /\.main-content\s*\{([^}]+)\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log('Match found:');
    console.log(match[0]);
}

// Also search for rules containing .main-content
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('.main-content') && line.includes('{')) {
        console.log(`Line ${idx + 1}: ${line}`);
    }
});

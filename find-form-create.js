const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('formSelCreateOption(')) {
        console.log(`Found formSelCreateOption at line ${i + 1}: ${line.trim()}`);
    }
});

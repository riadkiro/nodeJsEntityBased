const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8');
const lines = content.split('\n');
let inStyle = false;
let tpStyles = [];
lines.forEach((line, i) => {
    if (line.includes('<style>')) inStyle = true;
    if (line.includes('</style>')) inStyle = false;
    if (inStyle && line.includes('.tp-')) {
        tpStyles.push(`Line ${i+1}: ${line.trim()}`);
    }
});
console.log(tpStyles.join('\n'));

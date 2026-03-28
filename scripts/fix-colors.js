const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'partials', 'record-lines.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Check if colors are already present
if (content.includes('#3730a3')) {
    console.log('Colors already present, no change needed');
    process.exit(0);
}

// Find the exact pattern and add missing colors
const oldPattern = `{ bg: '#fce7f3', text: '#9d174d' },\r\n            ];`;
const newPattern = `{ bg: '#fce7f3', text: '#9d174d' },\r\n                { bg: '#e0e7ff', text: '#3730a3' },\r\n                { bg: '#fae8ff', text: '#86198f' },\r\n                { bg: '#ecfdf5', text: '#065f46' },\r\n            ];`;

if (content.includes(oldPattern)) {
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(filePath, content);
    console.log('Colors restored successfully');
} else {
    console.log('Pattern not found! Trying with LF...');
    const oldPatternLF = `{ bg: '#fce7f3', text: '#9d174d' },\n            ];`;
    if (content.includes(oldPatternLF)) {
        const newPatternLF = `{ bg: '#fce7f3', text: '#9d174d' },\n                { bg: '#e0e7ff', text: '#3730a3' },\n                { bg: '#fae8ff', text: '#86198f' },\n                { bg: '#ecfdf5', text: '#065f46' },\n            ];`;
        content = content.replace(oldPatternLF, newPatternLF);
        fs.writeFileSync(filePath, content);
        console.log('Colors restored with LF');
    } else {
        console.log('Neither pattern found!');
    }
}

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'partials', 'record-sidebar.ejs');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let found = 0;
lines.forEach((line, i) => {
    // Check for U+FFFD replacement character
    if (line.includes('\uFFFD')) {
        found++;
        const idx = line.indexOf('\uFFFD');
        const context = line.substring(Math.max(0, idx - 20), Math.min(line.length, idx + 30)).trim();
        console.log(`Line ${i + 1}: ...${context}...`);
    }
});

if (found === 0) {
    console.log('✅ No U+FFFD characters remaining!');
} else {
    console.log(`\n⚠️  ${found} lines still have replacement characters.`);
}

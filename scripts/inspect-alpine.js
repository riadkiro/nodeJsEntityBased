const fs = require('fs');
const path = require('path');

function inspect() {
    const filePath = path.join(__dirname, '../public/themes/default/assets/js/alpine.min.js');
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    console.log(`Total lines: ${lines.length}`);
    
    // Line 5 is 1-indexed, so lines[4]
    const line5 = lines[4];
    if (!line5) {
        console.error('Line 5 not found');
        return;
    }
    console.log(`Line 5 length: ${line5.length}`);
    
    const start = Math.max(0, 9014 - 100);
    const end = Math.min(line5.length, 9014 + 100);
    console.log('\n--- CODE AROUND COLUMN 9014 ---');
    console.log(line5.substring(start, end));
    console.log('^'.padStart(100 + 1));
}

inspect();

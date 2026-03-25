const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/record-edit.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('Consultation')) {
        console.log(`Line ${i+1}: ${line.trim()}`);
    }
});

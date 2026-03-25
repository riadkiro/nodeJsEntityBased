const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/record-edit.ejs', 'utf8');
const search = 'record-sidebar';
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes(search)) {
        console.log(`Line ${i+1}: ${line.trim()}`);
    }
});

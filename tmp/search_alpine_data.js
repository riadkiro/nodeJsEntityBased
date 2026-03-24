const fs = require('fs');
const content = fs.readFileSync('c:/Users/pc/Documents/nodeJsProject/views/record/record-edit.ejs', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('Alpine.data("relationField"') || line.includes('Alpine.data("modalPickerField"')) {
        console.log(`${i+1}: ${line.trim()}`);
    }
});

const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8');
const search = 'saveInlineOptionToSchema(';
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes(search) && line.includes('{')) {
        console.log(`Line ${i+1}: ${line.trim()}`);
    }
});

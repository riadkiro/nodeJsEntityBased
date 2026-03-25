const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs', 'utf8');
const search = '<!-- end swActiveTab wrapper -->';
const lines = content.split(/\r?\n/);
let count = 0;
lines.forEach((line, i) => {
    if (line.includes(search)) {
        count++;
        console.log(`Line ${i+1}: ${line}`);
    }
});
console.log(`\nTotal occurrences: ${count}`);

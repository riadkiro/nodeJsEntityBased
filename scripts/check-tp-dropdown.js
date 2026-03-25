const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8');
const search = 'tp-dropdown';
const parts = content.split(search);
console.log(`Found ${parts.length - 1} occurrences of "${search}"`);

const fs = require('fs');
const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
const content = fs.readFileSync(filePath, 'utf8');
const newContent = content.replace(/\(formAddValues\[schema\._id \+ '_' \+ col\.key\] \|\| \[\]\)\.includes\(opt\.value\)/g, "isOptSelected(formAddValues[schema._id + '_' + col.key], opt.value)");
fs.writeFileSync(filePath, newContent);
console.log('Fixed multiselect checks in record-lines.ejs');

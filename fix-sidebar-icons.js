const fs = require('fs');
const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Pattern for record-sidebar.ejs icons (uses EJS tags inside Alpine expressions)
// <iconify-icon x-show="isOptSelected(line, '<%= col.key %>', opt.value)" ...></iconify-icon>
content = content.replace(/<iconify-icon x-show="isOptSelected\(line, '(.*?)', opt\.value\)"([^>]*icon="tabler:check"[^>]*)><\/iconify-icon>/g, (match, key, rest) => {
    return `<template x-if="isOptSelected(line, '${key}', opt.value)"><iconify-icon${rest}></iconify-icon></template>`;
});

fs.writeFileSync(filePath, content);
console.log('Fixed multiselect ghost icons in record-sidebar.ejs');

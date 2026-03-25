const fs = require('fs');
const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find iconify-icon with isOptSelected and wrap it
content = content.replace(/<iconify-icon\s+x-show="isOptSelected\(line,\s+'<%= col\.key %>',\s+opt\.value\)"([^>]*icon="tabler:check"[^>]*)><\/iconify-icon>/g, (match, rest) => {
    return `<template x-if="isOptSelected(line, '<%= col.key %>', opt.value)"><iconify-icon${rest}></iconify-icon></template>`;
});

fs.writeFileSync(filePath, content);
console.log('Fixed multiselect ghost icons in record-sidebar.ejs using regex');

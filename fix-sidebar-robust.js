const fs = require('fs');
const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Use a regex that allows any amount of whitespace (including newlines)
// between the attributes of the iconify-icon tag.
const searchRegex = /<iconify-icon\s+x-show="isOptSelected\(line,\s+'<%= col\.key %>',\s+opt\.value\)"[\s\S]*?icon="tabler:check"[\s\S]*?><\/iconify-icon>/g;

content = content.replace(searchRegex, (match) => {
    // Remove the x-show="..." part from the icon tag if we wrap it in a template
    const cleanIcon = match.replace(/x-show="isOptSelected\(line,\s+'<%= col\.key %>',\s+opt\.value\)"/, '');
    return `<template x-if="isOptSelected(line, '<%= col.key %>', opt.value)">${cleanIcon}</template>`;
});

fs.writeFileSync(filePath, content);
console.log('Fixed multiselect ghost icons in record-sidebar.ejs using robust regex');

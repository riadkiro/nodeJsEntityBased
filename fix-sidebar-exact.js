const fs = require('fs');
const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Target exact lines from record-sidebar.ejs around 2021
const target = `<iconify-icon x-show="isOptSelected(line, '<%= col.key %>', opt.value)"
                                                                                             icon="tabler:check" width="12"
                                                                                             :style="'color:' + getMultiselectOptStyle(columns[<%= ci %>], opt.value).text"></iconify-icon>`;

const replacement = `<template x-if="isOptSelected(line, '<%= col.key %>', opt.value)">
                                                                                    <iconify-icon icon="tabler:check" width="12"
                                                                                                  :style="'color:' + getMultiselectOptStyle(columns[<%= ci %>], opt.value).text"></iconify-icon>
                                                                                </template>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Successfully replaced icon with template x-if in record-sidebar.ejs');
} else {
    console.log('Target icon string not found in record-sidebar.ejs');
}

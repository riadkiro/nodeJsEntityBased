const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(file, 'utf8');

const target = `<template x-for="col in getEditableColumns()" :key="col.key">
                                                <div class="lp-config-field">`;

const replacement = `<template x-for="col in getEditableColumns()" :key="col.key">
                                                <div class="lp-config-field" x-show="!(addModal.selected.find(s => s._id === item._id)._excludedColumns || []).includes(col.key)">`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
} else {
    // try \r\n
    if (content.includes(target.replace(/\n/g, '\r\n'))) {
        content = content.replace(target.replace(/\n/g, '\r\n'), replacement.replace(/\n/g, '\r\n'));
    }
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done');

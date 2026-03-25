const fs = require('fs');
const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Target the Inline Add icon box in record-lines.ejs
const target = `<div class="tp-option-icon" style="background:#dbeafe;">
                                                                         <template x-if="isOptSelected(formAddValues[schema._id + '_' + col.key], opt.value)"><iconify-icon icon="tabler:check" width="12" style="color:#2563eb;"></iconify-icon></template>
                                                                     </div>`;

const replacement = `<div class="tp-option-icon"
                                                                          :style="isOptSelected(formAddValues[schema._id + '_' + col.key], opt.value)
                                                                              ? 'background:' + getMultiselectOptStyle(col, opt.value).bg + '; border: 2px solid ' + getMultiselectOptStyle(col, opt.value).bg
                                                                              : 'background: #fff; border: 2px solid #d1d5db'">
                                                                         <template x-if="isOptSelected(formAddValues[schema._id + '_' + col.key], opt.value)">
                                                                             <iconify-icon icon="tabler:check" width="12"
                                                                                           :style="'color:' + getMultiselectOptStyle(col, opt.value).text"></iconify-icon>
                                                                         </template>
                                                                     </div>`;

// Use simple replacement but handle indentation variations
if (content.includes('style="background:#dbeafe;"')) {
    content = content.replace(/<div class="tp-option-icon" style="background:#dbeafe;">\s*<template x-if="isOptSelected\(formAddValues\[schema\._id \+ '_' \+ col\.key\], opt\.value\)">([\s\S]*?)<\/template>\s*<\/div>/, (match, iconPart) => {
         return replacement;
    });
    fs.writeFileSync(filePath, content);
    console.log('Fixed Inline Add icon style in record-lines.ejs');
} else {
    console.log('Fixed blue background marker not found');
}

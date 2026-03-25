const fs = require('fs');
const filePath = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Pattern for iconify-icon with x-show="isOptSelected(...)"
// Replace with <template x-if="isOptSelected(...)"><iconify-icon ...></template>
const patterns = [
    {
        search: /<iconify-icon x-show="isOptSelected\(line\.values\[col\.key\], opt\.value\)"([^>]*icon="tabler:check"[^>]*)><\/iconify-icon>/g,
        replace: '<template x-if="isOptSelected(line.values[col.key], opt.value)"><iconify-icon$1></iconify-icon></template>'
    },
    {
        search: /<iconify-icon x-show="isOptSelected\(formAddValues\[schema\._id \+ '_' \+ col\.key\], opt\.value\)"([^>]*icon="tabler:check"[^>]*)><\/iconify-icon>/g,
        replace: "<template x-if=\"isOptSelected(formAddValues[schema._id + '_' + col.key], opt.value)\"><iconify-icon$1></iconify-icon></template>"
    },
    {
        search: /<iconify-icon x-show="isOptSelected\(getEditLines\(\)\[editModal\.lineIdx\]\.values\[col\.key\], opt\.value\)"([^>]*icon="tabler:check"[^>]*)><\/iconify-icon>/g,
        replace: '<template x-if="isOptSelected(getEditLines()[editModal.lineIdx].values[col.key], opt.value)"><iconify-icon$1></iconify-icon></template>'
    }
];

patterns.forEach(p => {
    content = content.replace(p.search, p.replace);
});

fs.writeFileSync(filePath, content);
console.log('Fixed multiselect ghost icons in record-lines.ejs');

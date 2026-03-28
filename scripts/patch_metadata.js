const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(file, 'utf8');

// 1. Patch confirmAddLines
let confirmSearch = "                    computed: {},\n                    order: schemaLines.length\n                };";
if (content.includes(confirmSearch)) {
    content = content.replace(confirmSearch, "                    computed: {},\n                    order: schemaLines.length,\n                    _availableOptions: sel._availableOptions || {},\n                    _excludedColumns: sel._excludedColumns || []\n                };");
} else {
    // try \r\n
    confirmSearch = "                    computed: {},\r\n                    order: schemaLines.length\r\n                };";
    if (content.includes(confirmSearch)) {
        content = content.replace(confirmSearch, "                    computed: {},\r\n                    order: schemaLines.length,\r\n                    _availableOptions: sel._availableOptions || {},\r\n                    _excludedColumns: sel._excludedColumns || []\r\n                };");
    }
}

// 2. Patch selectRelation
let selectSearch = "            if (lineDefaultsForSchema) {\n                for (const [key, val] of Object.entries(lineDefaultsForSchema.defaults || {})) {\n                    if (val !== null && val !== undefined && val !== '') {\n                        line.values[key] = val;\n                    }\n                }\n            }";
let replacement = selectSearch + "\n                line._availableOptions = lineDefaultsForSchema.availableOptions || {};\n                line._excludedColumns = lineDefaultsForSchema.excludedColumns || [];";
if (content.includes(selectSearch)) {
    content = content.replace(selectSearch, replacement);
} else {
    // try \r\n
    selectSearch = "            if (lineDefaultsForSchema) {\r\n                for (const [key, val] of Object.entries(lineDefaultsForSchema.defaults || {})) {\r\n                    if (val !== null && val !== undefined && val !== '') {\r\n                        line.values[key] = val;\r\n                    }\r\n                }\r\n            }";
    replacement = selectSearch + "\r\n                line._availableOptions = lineDefaultsForSchema.availableOptions || {};\r\n                line._excludedColumns = lineDefaultsForSchema.excludedColumns || [];";
    if (content.includes(selectSearch)) {
        content = content.replace(selectSearch, replacement);
    }
}

// 3. Patch getVisibleColumnsForLine
let visColSearch = "                .filter(c => c.visible !== false)\n                .filter(c => {\n                    // Show if no lineType restriction";
if (content.includes(visColSearch)) {
    content = content.replace(visColSearch, "                .filter(c => c.visible !== false)\n                .filter(c => !(line._excludedColumns || []).includes(c.key))\n                .filter(c => {\n                    // Show if no lineType restriction");
} else {
    visColSearch = "                .filter(c => c.visible !== false)\r\n                .filter(c => {\r\n                    // Show if no lineType restriction";
    if (content.includes(visColSearch)) {
        content = content.replace(visColSearch, "                .filter(c => c.visible !== false)\r\n                .filter(c => !(line._excludedColumns || []).includes(c.key))\r\n                .filter(c => {\r\n                    // Show if no lineType restriction");
    }
}

// 4. Patch filterMsOptions (we need the line!)
// Wait, currently filterMsOptions takes `col` and is called inside x-for. But the line context is available as `line`.
// In Alpine x-for inside a x-for "line in lines", `line` is in scope!
// So we can change `filterMsOptions(col)` to `filterMsOptions(col, line)` in the UI? 
// Or better, let's just make filterMsOptions grab the line via `this.lines[this.msDropdown.lineIdx]`.
// Wait, for the "add catalog" modal, lineIdx is a string like "add_tmp_colkey", it's not in this.lines!
// In that case line._availableOptions isn't there, it's in this.addModal.selected.
// It's much safer to pass `line` as an argument from the HTML, but that requires updating all HTML calls.
// Let's just fix the HTML AND JS together.

// This is getting complex, so I'll write a focused replace logic for the filters.

fs.writeFileSync(file, content, 'utf8');
console.log('Patches 1, 2, 3 applied');

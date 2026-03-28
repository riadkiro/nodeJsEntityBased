const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(file, 'utf8');

// 1. Add options to newLine
const targetLine = `            const newLine = {
                _tempId: 'temp_' + Date.now(),
                lineType: schema.defaultLineType || 'default',
                values,
                computed: {},
                order: (this.linesMap[schema._id] || []).length
            };`;

const replacementLine = `            const newLine = {
                _tempId: 'temp_' + Date.now(),
                lineType: schema.defaultLineType || 'default',
                values,
                computed: {},
                order: (this.linesMap[schema._id] || []).length,
                _availableOptions: this.formAddValues[schema._id + '__availableOptions'] || {},
                _excludedColumns: this.formAddValues[schema._id + '__excludedColumns'] || []
            };`;

if (content.includes(targetLine)) {
    content = content.replace(targetLine, replacementLine);
} else if (content.includes(targetLine.replace(/\n/g, '\r\n'))) {
    content = content.replace(targetLine.replace(/\n/g, '\r\n'), replacementLine.replace(/\n/g, '\r\n'));
}

// 2. Clear options at the bottom of submitFormEntry
const targetClear = `            }
            this.formAddOpen[schema._id] = false;
            this.debouncedSave();
        },`;

const replacementClear = `            }
            this.formAddValues[schema._id + '__availableOptions'] = {};
            this.formAddValues[schema._id + '__excludedColumns'] = [];
            this.formAddOpen[schema._id] = false;
            this.debouncedSave();
        },`;

if (content.includes(targetClear)) {
    content = content.replace(targetClear, replacementClear);
} else if (content.includes(targetClear.replace(/\n/g, '\r\n'))) {
    content = content.replace(targetClear.replace(/\n/g, '\r\n'), replacementClear.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(file, content, 'utf8');
console.log('patched submitFormEntry applied.');

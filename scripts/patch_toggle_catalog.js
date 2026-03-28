const fs = require('fs');
const filePath = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// Target: replace the section between "// Set default qty to 1" and the closing of addModal.selected.push
const oldCode = `                // Set default qty to 1\r\n                const qtyCol = (this.activeSchema?.columns || []).find(c => c.key === 'qty');\r\n                if (qtyCol && !values.qty) values.qty = 1;\r\n\r\n                this.addModal.selected.push({\r\n                    _id: item._id,\r\n                    label: item.label || item.title,\r\n                    customFields: cfArray,\r\n                    values: values\r\n                });`;

const newCode = `                // Set default qty to 1\r\n                const qtyCol = (this.activeSchema?.columns || []).find(c => c.key === 'qty');\r\n                if (qtyCol && !values.qty) values.qty = 1;\r\n\r\n                // ── Apply lineDefaults (pre-encoded per record) ──\r\n                let _availableOptions = {};\r\n                let _excludedColumns = [];\r\n                const lineDefaultsForSchema = (item.lineDefaults || [])\r\n                    .find(ld => ld.schemaId && ld.schemaId.toString() === this.activeSchemaId);\r\n                if (lineDefaultsForSchema) {\r\n                    for (const [key, val] of Object.entries(lineDefaultsForSchema.defaults || {})) {\r\n                        if (val !== null && val !== undefined && val !== '') {\r\n                            values[key] = val;\r\n                        }\r\n                    }\r\n                    _availableOptions = lineDefaultsForSchema.availableOptions || {};\r\n                    _excludedColumns = lineDefaultsForSchema.excludedColumns || [];\r\n                }\r\n\r\n                this.addModal.selected.push({\r\n                    _id: item._id,\r\n                    label: item.label || item.title,\r\n                    customFields: cfArray,\r\n                    values: values,\r\n                    _availableOptions,\r\n                    _excludedColumns\r\n                });`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('SUCCESS: toggleCatalogItem updated with lineDefaults support');
} else {
    console.log('ERROR: Target code not found');
    // Debug: find approximate location
    const lines = content.split('\n');
    for (let i = 3845; i < 3860; i++) {
        console.log(i + ':', JSON.stringify(lines[i]));
    }
}

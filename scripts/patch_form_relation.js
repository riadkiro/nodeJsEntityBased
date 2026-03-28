const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace the inline handler in the template
const target = `formAddValues[schema._id + '_' + col.key] = result.id; formAddValues[schema._id + '_' + col.key + '_label'] = result.label; formRelOpen[schema._id + '_' + col.key] = false`;
const replacement = `selectFormRelation(schema, col, result)`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
}

// 2. Add selectFormRelation method
const methodAnchor = `        async searchFormRelation(schemaId, col) {`;
const newMethod = `        selectFormRelation(schema, col, result) {
            const key = schema._id + '_' + col.key;
            this.formAddValues[key] = result.id;
            this.formAddValues[key + '_label'] = result.label;
            this.formRelOpen[key] = false;

            // Apply lineDefaults
            const lineDefaultsForSchema = (result.lineDefaults || []).find(ld => ld.schemaId && ld.schemaId.toString() === schema._id);
            if (lineDefaultsForSchema) {
                for (const [defKey, val] of Object.entries(lineDefaultsForSchema.defaults || {})) {
                    if (val !== null && val !== undefined && val !== '') {
                        this.formAddValues[schema._id + '_' + defKey] = val;
                    }
                }
                
                // Although _availableOptions doesn't have an immediate hook in the quick add "formAddValues" yet, 
                // we can store them to be applied when the actual row is created.
                this.formAddValues[schema._id + '__availableOptions'] = lineDefaultsForSchema.availableOptions || {};
                this.formAddValues[schema._id + '__excludedColumns'] = lineDefaultsForSchema.excludedColumns || {};
            }
        },

        async searchFormRelation(schemaId, col) {`;

if (content.includes(methodAnchor)) {
    content = content.replace(methodAnchor, newMethod);
}

fs.writeFileSync(file, content, 'utf8');
console.log('patched selectFormRelation applied.');

const fs = require('fs');
const filePath = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs';
let content = fs.readFileSync(filePath, 'utf8');

// After the legacy applyDefaults block (line ~4516), before recomputeLine (line ~4518),
// we need to inject lineDefaults logic.
// Target: the closing of the applyDefaults block "}" and then the recomputeLine call
const oldCode = [
    '            this.recomputeLine(line);',
    '            this.closeRelationSearch();'
].join('\r\n');

const newCode = [
    '            // ── Apply lineDefaults (pre-encoded per record) ──',
    '            const lineDefaultsForSchema = (item.lineDefaults || [])',
    '                .find(ld => ld.schemaId && ld.schemaId.toString() === this.activeSchemaId);',
    '            if (lineDefaultsForSchema) {',
    '                for (const [key, val] of Object.entries(lineDefaultsForSchema.defaults || {})) {',
    '                    if (val !== null && val !== undefined && val !== \'\') {',
    '                        line.values[key] = val;',
    '                    }',
    '                }',
    '            }',
    '',
    '            this.recomputeLine(line);',
    '            this.closeRelationSearch();'
].join('\r\n');

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('SUCCESS: selectRelation patched with lineDefaults support');
} else {
    console.log('ERROR: Target code not found');
    // Debug
    const lines = content.split('\n');
    for (let i = 4515; i < 4525; i++) {
        console.log(i + ':', JSON.stringify(lines[i]));
    }
}

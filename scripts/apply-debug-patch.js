const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'partials', 'record-lines.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// The key line to find
const searchStr = "resolvedSchemaId:', resolvedSchemaId";
const idx = content.indexOf(searchStr);
console.log('Found key string at index:', idx);

if (idx > 0) {
    // Get context around it - 300 chars before and 500 after
    const context = content.substring(idx - 300, idx + 500);
    console.log('=== CONTEXT ===');
    console.log(context);
}

// Now do the actual search for the old pattern
const patterns = [
    "const lineDefaultsForSchema = (item.lineDefaults || [])\r\n                .find(ld => ld.schemaId && ld.schemaId.toString() === resolvedSchemaId?.toString());",
    "const lineDefaultsForSchema = (item.lineDefaults || [])\n                .find(ld => ld.schemaId && ld.schemaId.toString() === resolvedSchemaId?.toString());"
];

for (const p of patterns) {
    if (content.includes(p)) {
        console.log('\nPattern found with', p.includes('\r\n') ? 'CRLF' : 'LF');
        
        // Replace with robust version
        const replacement = p.includes('\r\n')
            ? "const defaults = item.lineDefaults || [];\r\n            const lineDefaultsForSchema = Array.isArray(defaults)\r\n                ? defaults.find(ld => ld.schemaId && ld.schemaId.toString() === resolvedSchemaId?.toString())\r\n                : null;\r\n            document.title = '[DEBUG] selectRelation: resolved=' + resolvedSchemaId + ' found=' + (lineDefaultsForSchema ? 'YES' : 'NO') + ' isArr=' + Array.isArray(defaults) + ' len=' + (Array.isArray(defaults) ? defaults.length : 'NA');"
            : "const defaults = item.lineDefaults || [];\n            const lineDefaultsForSchema = Array.isArray(defaults)\n                ? defaults.find(ld => ld.schemaId && ld.schemaId.toString() === resolvedSchemaId?.toString())\n                : null;\n            document.title = '[DEBUG] selectRelation: resolved=' + resolvedSchemaId + ' found=' + (lineDefaultsForSchema ? 'YES' : 'NO') + ' isArr=' + Array.isArray(defaults) + ' len=' + (Array.isArray(defaults) ? defaults.length : 'NA');";
        
        content = content.replace(p, replacement);
        fs.writeFileSync(filePath, content);
        console.log('Patch applied successfully!');
        break;
    }
}

const fs = require('fs');
const content = fs.readFileSync('views/record/record-module.ejs', 'utf-8');
const lines = content.split('\n');

// Find lines containing "generatedDocs" or "generated" near the docsModule Alpine data
const keywords = ['generatedDocs', 'fetchGenerated', 'loadDocs', 'docsModule', 'initDocs', 'generated_from', 'generatedFrom'];
keywords.forEach(kw => {
    const matches = [];
    lines.forEach((line, i) => {
        if (line.toLowerCase().includes(kw.toLowerCase())) {
            matches.push(`  L${i+1}: ${line.trim().substring(0, 120)}`);
        }
    });
    if (matches.length > 0) {
        console.log(`\n=== "${kw}" (${matches.length} matches) ===`);
        matches.forEach(m => console.log(m));
    }
});

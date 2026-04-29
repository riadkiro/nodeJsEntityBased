const fs = require('fs');
const content = fs.readFileSync('src/islands/document-editor/components/EditorHeader.jsx', 'utf-8');
const lines = content.split('\n');

// Find key sections
const keywords = ['isMinimal', 'isTemplate', 'Template', 'contextFree', 'header-bar', 'doc-header', 'topBar', 'name-row', 'back', 'Enregistrer', 'Save', 'save', 'PDF', 'Finaliser', 'Annuler', 'return', 'EditorHeader'];
keywords.forEach(kw => {
    const matches = [];
    lines.forEach((line, i) => {
        if (line.includes(kw)) {
            matches.push(`  L${i+1}: ${line.trim().substring(0, 130)}`);
        }
    });
    if (matches.length > 0 && matches.length < 20) {
        console.log(`\n=== "${kw}" (${matches.length}) ===`);
        matches.forEach(m => console.log(m));
    }
});

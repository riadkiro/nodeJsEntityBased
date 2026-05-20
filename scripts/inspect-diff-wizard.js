const { execSync } = require('child_process');
const fs = require('fs');

try {
    const diff = execSync('git diff src/islands/doc-generate-wizard/DocGenerateWizard.jsx', { encoding: 'utf8' });
    fs.writeFileSync('scripts/diff.txt', diff);
    console.log('Diff written to scripts/diff.txt successfully!');
} catch (err) {
    console.error(err);
}

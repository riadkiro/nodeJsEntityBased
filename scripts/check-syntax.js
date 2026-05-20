const fs = require('fs');
const { Script } = require('vm');

const files = [
    'routes/api/api-smartdoc.router.js',
    'routes/document.routes.js'
];

for (const file of files) {
    try {
        const code = fs.readFileSync(file, 'utf8');
        new Script(code);
        console.log(`✅ ${file} syntax is perfect!`);
    } catch (e) {
        console.error(`❌ ${file} has syntax errors:`, e);
        process.exit(1);
    }
}

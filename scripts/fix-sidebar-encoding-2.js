const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'partials', 'record-sidebar.ejs');

let content = fs.readFileSync(filePath, 'utf8');
let count = 0;

function replace(from, to) {
    const before = content;
    content = content.split(from).join(to);
    const occurrences = before.split(from).length - 1;
    if (occurrences > 0) {
        console.log(`  ✓ "${from}" → "${to}" (${occurrences})`);
        count += occurrences;
    }
}

console.log('Fixing remaining encoding errors (pass 2)...\n');

// Replacement character (U+FFFD) based patterns
replace('biblioth\uFFFDque', 'bibliothèque');
replace('cr\uFFFDation', 'création');
replace('Cr\uFFFDation', 'Création');
replace('Cr\uFFFDer', 'Créer');
replace('cr\uFFFD\uFFFD', 'créé');
replace('mod\uFFFDle', 'modèle');
replace('l\'\uFFFDditeur', "l'éditeur");
replace('Li\uFFFD \uFFFD', 'Lié à');
replace('Entit\uFFFD', 'Entité');
replace('port\uFFFDe', 'portée');
replace('personnalis\uFFFD', 'personnalisé');
replace('sympt\uFFFDme', 'symptôme');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✅ Done! Fixed ${count} remaining issues.`);

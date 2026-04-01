const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'partials', 'record-sidebar.ejs');

let content = fs.readFileSync(filePath, 'utf8');

// Track replacements
let count = 0;
function replace(from, to) {
    const before = content;
    content = content.split(from).join(to);
    const diff = (before.length - content.length + to.length * ((before.length - content.length) / from.length + (before.split(from).length - 1)));
    const occurrences = before.split(from).length - 1;
    if (occurrences > 0) {
        console.log(`  ✓ "${from}" → "${to}" (${occurrences} occurrences)`);
        count += occurrences;
    }
}

console.log('Fixing encoding errors in record-sidebar.ejs...\n');

// Common Mojibake patterns (UTF-8 read as Windows-1252 then re-encoded)
// é → Ã©
replace('liÃ©e', 'liée');
replace('liÃ©', 'lié');
replace("l'entitÃ©", "l'entité");
replace('Configurer l\'entitÃ©', 'Configurer l\'entité');
replace('piÃ¨ce', 'pièce');
replace('Aucune piÃ¨ce jointe', 'Aucune pièce jointe');
replace('sÃ©lectionnez', 'sélectionnez');
replace('DÃ©poser', 'Déposer');
replace('dÃ©posez', 'déposez');
replace('Glissez-dÃ©posez', 'Glissez-déposez');
replace('TerminÃ©', 'Terminé');
replace('GÃ©nÃ©rer', 'Générer');
replace('DÃ©lier', 'Délier');
replace('irrÃ©versible', 'irréversible');
replace('modÃ¨le', 'modèle');
replace('Aucun document modÃ¨le', 'Aucun document modèle');

// More patterns from the SmartDoc modal area
replace('Biblioth\u00e8que', 'Bibliothèque'); // just in case
replace('Biblioth�que', 'Bibliothèque');
replace('mod�le', 'modèle');
replace('cr��', 'créé');
replace('l\'�diteur', "l'éditeur");
replace('Li� �', 'Lié à');
replace('Entit�', 'Entité');
replace('sympt�me', 'symptôme');
replace('Cr�ation', 'Création');
replace('Cr�er', 'Créer');
replace('port�e', 'portée');
replace('personnalis�', 'personnalisé');
replace('personalis�', 'personnalisé');

// Also fix title attributes
replace('Modifier le modÃ¨le', 'Modifier le modèle');
replace('DÃ©lier ce document', 'Délier ce document');

// Clean up any remaining common patterns  
replace('Ã©', 'é');
replace('Ã¨', 'è');
replace('Ã ', 'à');
replace('Ã´', 'ô');
replace('Ã®', 'î');
replace('Ã¹', 'ù');
replace('Ã§', 'ç');
replace('Ãª', 'ê');

fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Done! Fixed ${count} encoding issues.`);

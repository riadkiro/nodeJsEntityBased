const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/record/partials/record-sidebar.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Fix Pièces jointes
content = content.replace(/PiÃ¨ces jointes/g, 'Pièces jointes');
// Fix Documents modèles
content = content.replace(/Documents modÃ¨les/g, 'Documents modèles');
content = content.replace(/âœ✨ Documents modÃ¨les/g, '✨ Documents modèles');
content = content.replace(/âœ¨ Documents/g, '✨ Documents');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Encoding fixed in record-sidebar.ejs');

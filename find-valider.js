const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8');
content.split('\n').filter(line => line.includes('Valider')).forEach(line => console.log(line.trim()));

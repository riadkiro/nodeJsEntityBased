const fs = require('fs');
const content = fs.readFileSync('c:/Users/pc/Documents/nodeJsProject/views/entity/entity-settings.ejs', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('cardinality')) {
        console.log(`${i+1}: ${line.trim()}`);
    }
});

const fs = require('fs');
const content = fs.readFileSync('C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-lines.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('this.schemas =') || line.includes('this.schemas.push') || line.includes('/api/line-schemas') || (line.includes('schemas') && line.includes('await') && line.includes('fetch'))) {
        console.log(`Line ${i+1}: ${line.trim().substring(0, 200)}`);
    }
});

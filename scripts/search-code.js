const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'views', 'record', 'partials', 'record-lines.ejs'), 'utf8');
const lines = content.split('\n');
const results = [];

lines.forEach((l, i) => {
    const t = l.trim();
    if (t.includes('get lines()') || t.includes('get lines(') || 
        (t.includes('lines') && t.includes('get') && t.includes('{') && !t.includes('getSchemaLines')) ||
        t.includes('getSchemaLines')) {
        results.push(`Line ${i+1}: ${t.substring(0, 200)}`);
    }
});

// Also check 'this.lines' usage in selectRelation area 
lines.forEach((l, i) => {
    const t = l.trim();
    if ((i >= 4505 && i <= 4530) && t.includes('this.lines')) {
        results.push(`Line ${i+1}: ${t.substring(0, 200)}`);
    }
});

fs.writeFileSync(path.join(__dirname, 'debug-output.txt'), results.join('\n'));
console.log(`Found ${results.length} matches`);

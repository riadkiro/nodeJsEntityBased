const fs = require('fs');
const color = process.argv[2];
const file = process.argv[3];
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.toLowerCase().includes(color.toLowerCase())) {
        console.log(`Line ${i+1}: ${line.trim().substring(0, 150)}`);
    }
});

const fs = require('fs');
const lines = fs.readFileSync('views/record/record-module.ejs', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.toLowerCase().includes('drive')) {
        console.log(`${i+1}: ${l.trim().substring(0, 120)}`);
    }
});

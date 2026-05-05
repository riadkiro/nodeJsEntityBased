const fs = require('fs');
const c = fs.readFileSync('views/record/partials/record-tasks-module.ejs', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
    if (l.includes('loadLists')) {
        console.log((i + 1) + ': ' + l.substring(0, 140));
    }
});

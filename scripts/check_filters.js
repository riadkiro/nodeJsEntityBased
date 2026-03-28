const fs = require('fs');
const lines = fs.readFileSync('views/record/partials/record-lines.ejs','utf8').split('\n');
const res = [];
lines.forEach((l,i) => {
    if(l.includes('filterMsOptions') || l.includes('filterSelOptions')) {
        res.push((i+1) + ': ' + l.trim());
    }
});
fs.writeFileSync('tmp/filters.txt', res.join('\n'));

const fs = require('fs');
const content = fs.readFileSync('views/record/partials/record-tasks-module.ejs', 'utf8');
const re = /<%=\s*([^%]+)%>/g;
const vars = new Set();
let m;
while ((m = re.exec(content)) !== null) {
    vars.add(m[1].trim());
}
console.log('EJS variables used:');
[...vars].forEach(v => console.log(' -', v));

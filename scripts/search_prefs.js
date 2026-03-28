const fs = require('fs');
const content = fs.readFileSync('views/record/record-edit.ejs', 'utf8');
const lines = content.split('\n');
const results = [];
for(let i=0; i<lines.length; i++) {
   if(lines[i].includes('preferences') || lines[i].includes('viewPreferences')) {
      results.push(`${i+1}: ${lines[i].trim()}`);
   }
}
fs.writeFileSync('C:/tmp/prefs_search.txt', results.join('\n'));

const fs = require('fs');
const path = require('path');

function searchInDir(dir, term) {
    let results = [];
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (['node_modules', '.git', 'public', 'uploads', '.gemini'].includes(file)) continue;
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                results = results.concat(searchInDir(fullPath, term));
            } else if (fullPath.endsWith('.js') || fullPath.endsWith('.ejs') || fullPath.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.includes(term)) {
                        const lines = content.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].includes(term)) {
                                results.push(`Found in ${file}:${i+1} -> ${lines[i].trim().substring(0, 100)}`);
                            }
                        }
                    }
                } catch (e) {}
            }
        }
    } catch(err) {}
    return results;
}

console.log('--- Searching for __documents__ ---');
const docs = searchInDir(path.join(process.cwd(), 'controllers'), '__documents__');
const routes = searchInDir(path.join(process.cwd(), 'routes'), '__documents__');
const views = searchInDir(path.join(process.cwd(), 'views'), '__documents__');
console.log(docs.join('\n'));
console.log(routes.join('\n'));
console.log(views.join('\n'));

console.log('--- Searching for related icons in record.controller.js ---');
const recCtrl = fs.readFileSync(path.join(process.cwd(), 'controllers/record.controller.js'), 'utf8');
const linesRec = recCtrl.split('\n');
for(let i = 0; i < linesRec.length; i++) {
    if (linesRec[i].includes('solar:folder') || linesRec[i].includes('Documents')) {
         console.log(`Line ${i+1}: ${linesRec[i].trim().substring(0, 100)}`);
    }
}

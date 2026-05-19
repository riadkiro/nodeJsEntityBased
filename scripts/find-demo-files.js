const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (file.includes('demo_gen')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const found = walk('.');
console.log('Found demo_gen files:', found);

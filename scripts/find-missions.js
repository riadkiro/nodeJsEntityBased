const fs = require('fs');
const path = require('path');

function searchFile(dir, fileName) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            let stat;
            try {
                stat = fs.statSync(fullPath);
            } catch (e) {
                continue; // skip inaccessible files
            }
            if (stat.isDirectory()) {
                if (file !== 'node_modules' && file !== '.git') {
                    searchFile(fullPath, fileName);
                }
            } else if (file.toLowerCase() === fileName.toLowerCase()) {
                console.log('Found match:', fullPath);
            }
        }
    } catch (err) {
        // ignore errors
    }
}

console.log('Searching in nodeJsProject...');
searchFile('C:\\Users\\pc\\Documents\\nodeJsProject', 'missions.md');
console.log('Searching in Documents...');
searchFile('C:\\Users\\pc\\Documents', 'missions.md');
console.log('Search finished.');

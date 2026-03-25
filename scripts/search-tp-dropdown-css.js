const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                searchDir(fullPath, pattern);
            }
        } else if (file.endsWith('.css') || file.endsWith('.ejs')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(pattern)) {
                console.log(`Found in: ${fullPath}`);
            }
        }
    }
}

searchDir('C:/Users/pc/Documents/nodeJsProject', '.tp-dropdown {');

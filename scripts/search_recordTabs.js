const fs = require('fs');
const path = require('path');

function search(dir, query) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                search(fullPath, query);
            }
        } else if (file.endsWith('.js') || file.endsWith('.ejs') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                if (line.includes(query)) {
                    console.log(`${fullPath}:${i + 1}: ${line.trim()}`);
                }
            });
        }
    }
}

search('C:/Users/pc/Documents/nodeJsProject', 'recordTabs');

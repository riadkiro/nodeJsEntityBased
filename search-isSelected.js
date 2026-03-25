const fs = require('fs');
const path = require('path');
const searchInDir = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchInDir(fullPath);
        } else if (file.endsWith('.ejs') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('isSelected(')) {
                console.log(fullPath);
                content.split('\n').forEach((line, i) => {
                    if (line.includes('isSelected(')) {
                        console.log(`  L${i+1}: ${line.trim()}`);
                    }
                });
            }
        }
    });
};
searchInDir('C:/Users/pc/Documents/nodeJsProject/views/record');

const fs = require('fs');
const content = fs.readFileSync('routes/document.routes.js', 'utf-8');
const lines = content.split('\n');
lines.forEach((l, i) => {
    if (/\.(post|put|get|delete|patch)\s*\(/.test(l)) {
        console.log((i+1) + ': ' + l.trim());
    }
});

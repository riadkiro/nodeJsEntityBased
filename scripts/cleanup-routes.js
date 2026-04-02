const fs = require('fs');
const filepath = 'c:/Users/pc/Documents/nodeJsProject/routes/document.routes.js';
let content = fs.readFileSync(filepath, 'utf-8');

// Find the first "module.exports = router;" and remove everything after it
const marker = 'module.exports = router;';
const idx = content.indexOf(marker);
if (idx !== -1) {
    content = content.substring(0, idx + marker.length) + '\n';
    fs.writeFileSync(filepath, content);
    console.log('Cleaned up. File now ends at line', content.split('\n').length);
} else {
    console.log('Marker not found!');
}

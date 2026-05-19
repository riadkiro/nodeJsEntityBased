const fs = require('fs');
const content = fs.readFileSync('routes/api/api-smartdoc.router.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.toLowerCase().includes('finalize') || line.toLowerCase().includes('finalise')) {
        console.log(`Line ${index + 1}: ${line}`);
    }
});

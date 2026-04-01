const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'record', 'partials', 'record-sidebar.ejs');
const content = fs.readFileSync(filePath, 'utf8');

// Check for remaining mojibake patterns
const patterns = [
    /Ã©/g, /Ã¨/g, /Ã /g, /Ã´/g, /Ã®/g, /Ã¹/g, /Ã§/g, /Ãª/g,
    /ï¿½/g, /�/g
];

let found = false;
patterns.forEach(p => {
    const matches = content.match(p);
    if (matches) {
        found = true;
        // Find line numbers
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (p.test(line)) {
                console.log(`Line ${i + 1}: ${line.trim().substring(0, 120)}`);
            }
        });
    }
});

if (!found) {
    console.log('✅ No encoding issues found!');
} else {
    console.log('\n⚠️  Some encoding issues remain.');
}

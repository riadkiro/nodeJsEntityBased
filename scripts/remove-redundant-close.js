const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/nav/nav-sidebar.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Match:
//                     }
//                     this.showRecordsWizard = false;
//                  }
// With potential differences in spaces and line endings
const lines = content.split(/\r?\n/);
let foundIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('this.showRecordsWizard = false;') && i > 0 && lines[i-1].includes('}') && i < lines.length - 1 && lines[i+1].includes('}')) {
        // Double check it's the one under the catch block of validateRecordsWizard (around line 1390)
        if (i > 1370 && i < 1410) {
            foundIndex = i;
            break;
        }
    }
}

if (foundIndex !== -1) {
    console.log(`Found line to remove at index ${foundIndex}:`, lines[foundIndex]);
    lines.splice(foundIndex, 1);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('SUCCESS: Cleaned up redundant closing statement.');
} else {
    console.error('ERROR: Could not locate redundant closing statement.');
}

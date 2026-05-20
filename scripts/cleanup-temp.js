const fs = require('fs');
const path = require('path');

const filesToClean = [
    'inspect-database.js',
    'view-drafts.js',
    'inspect-draft-details.js',
    'inspect-records.js',
    'test-new-draft.js'
];

filesToClean.forEach(f => {
    const fullPath = path.join(__dirname, f);
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            console.log(`Cleaned up temporary script: ${f}`);
        } catch (err) {
            console.warn(`Could not clean up ${f}:`, err.message);
        }
    }
});

// Self deletion
setTimeout(() => {
    try {
        fs.unlinkSync(__filename);
        console.log('Cleaned up self.');
    } catch (err) {}
}, 100);

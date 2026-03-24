const fs = require('fs');
const path = require('path');
const scriptsDir = 'c:/Users/pc/Documents/nodeJsProject/scripts';

const scriptsToDelete = [
    'update-sidebar-buttons.js',
    'update-table-label.js',
    'update-table-renderer-v2.js',
    'update-table-renderer.js',
    'fix-sidebar.js'
];

scriptsToDelete.forEach(script => {
    const fullPath = path.join(scriptsDir, script);
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            console.log(`Deleted: ${script}`);
        } catch (err) {
            console.error(`Error deleting ${script}:`, err.message);
        }
    }
});

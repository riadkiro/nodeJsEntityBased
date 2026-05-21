const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/pc/Documents/nodeJsProject/screenshots';
const destDir = 'C:/Users/pc/.gemini/antigravity/brain/780e97ec-9b7a-4d0d-be22-f3722092fcff';

const filesToCopy = [
    'root_drive_test.png',
    'custom_deeplink_test.png',
    'folder_created_factures.png',
    'folder_achats_verified.png'
];

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

filesToCopy.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} successfully.`);
    } else {
        console.warn(`Source file not found: ${srcPath}`);
    }
});

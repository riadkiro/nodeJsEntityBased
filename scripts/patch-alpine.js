const fs = require('fs');
const path = require('path');

const filesToPatch = [
    'public/themes/default/assets/js/alpine.min.js',
    'public/dist/themes/default/assets/js/alpine.min.js',
    'public/assets/js/alpine.min.js',
    'public/dist/assets/js/alpine.min.js'
];

function patchFile(relPath) {
    const filePath = path.join(__dirname, '..', relPath);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping (not found): ${relPath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const target = 'then(([u])=>u())';
    const replacement = 'then(([u])=>typeof u==="function"&&u())';
    
    if (content.includes(replacement)) {
        console.log(`Already patched: ${relPath}`);
        return;
    }
    
    if (!content.includes(target)) {
        console.log(`Warning: Target pattern not found in ${relPath}`);
        return;
    }
    
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully patched: ${relPath}`);
}

filesToPatch.forEach(patchFile);
console.log('Patching complete.');

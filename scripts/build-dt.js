const { execSync } = require('child_process');
const fs = require('fs');
try {
    const out = execSync('npx vite build --config vite.config.dynamic-table.js', {
        cwd: 'c:\\Users\\pc\\Documents\\nodeJsProject',
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    fs.writeFileSync('c:\\Users\\pc\\Documents\\nodeJsProject\\scripts\\build-output.txt', 'SUCCESS:\n' + out);
} catch (e) {
    const combined = 'STDOUT:\n' + (e.stdout || '') + '\n\nSTDERR:\n' + (e.stderr || '');
    fs.writeFileSync('c:\\Users\\pc\\Documents\\nodeJsProject\\scripts\\build-output.txt', combined);
}
console.log('Done - check scripts/build-output.txt');

const fs = require('fs');
const path = require('path');

function walk(dir, ext) {
    const results = [];
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
            const full = path.join(dir, e.name);
            if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
                results.push(...walk(full, ext));
            } else if (e.isFile() && ext.some(x => e.name.endsWith(x))) {
                results.push(full);
            }
        }
    } catch(e) {}
    return results;
}

const root = path.join(__dirname, '..');
const out = [];

// 1. Find all React island entry files
out.push('=== REACT ISLAND ENTRIES (.entry.jsx / .entry.tsx) ===');
const entries = walk(root, ['.entry.jsx', '.entry.tsx']);
entries.forEach(f => out.push('  ' + path.relative(root, f)));

// 2. Find vite config
out.push('\n=== VITE CONFIG ===');
const viteFiles = walk(root, ['vite.config.js', 'vite.config.ts']);
viteFiles.forEach(f => out.push('  ' + path.relative(root, f)));

// 3. Find all .jsx/.tsx files to understand component structure
out.push('\n=== ALL JSX/TSX FILES ===');
const jsxFiles = walk(root, ['.jsx', '.tsx']);
jsxFiles.forEach(f => out.push('  ' + path.relative(root, f)));

// 4. Find how islands are mounted in EJS
out.push('\n=== ISLAND MOUNT POINTS IN EJS (data-island / react-root) ===');
const ejsFiles = walk(path.join(root, 'views'), ['.ejs']);
for (const f of ejsFiles) {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('data-island') || content.includes('react-root') || content.includes('ReactDOM') || content.includes('createRoot')) {
        const lines = content.split('\n');
        lines.forEach((l, i) => {
            if (l.includes('data-island') || l.includes('react-root') || l.includes('island')) {
                out.push(`  ${path.relative(root, f)}:${i+1}: ${l.trim().substring(0, 150)}`);
            }
        });
    }
}

// 5. Check package.json for react dependencies
out.push('\n=== REACT DEPENDENCIES ===');
try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    ['react', 'react-dom', 'vite', '@vitejs/plugin-react'].forEach(d => {
        out.push(`  ${d}: ${deps[d] || 'NOT FOUND'}`);
    });
    // Check scripts
    out.push('\n=== NPM SCRIPTS (vite/build related) ===');
    Object.entries(pkg.scripts || {}).forEach(([k, v]) => {
        if (k.includes('vite') || k.includes('build') || k.includes('island') || k.includes('dev')) {
            out.push(`  ${k}: ${v}`);
        }
    });
} catch(e) { out.push('  Error reading package.json: ' + e.message); }

// 6. Get record-lines.ejs structure (function names, key features)
out.push('\n=== RECORD-LINES.EJS KEY FUNCTIONS ===');
try {
    const rl = fs.readFileSync(path.join(root, 'views', 'record', 'partials', 'record-lines.ejs'), 'utf8');
    const lines = rl.split('\n');
    const fns = [];
    lines.forEach((l, i) => {
        const m = l.match(/^\s+(async\s+)?(\w+)\s*\(/);
        if (m && !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('if') && !l.trim().startsWith('for') && !l.trim().startsWith('return') && !l.trim().startsWith('const') && !l.trim().startsWith('let')) {
            fns.push(`  Line ${i+1}: ${m[0].trim()}`);
        }
    });
    // Deduplicate
    const unique = [...new Set(fns)];
    unique.forEach(f => out.push(f));
    out.push(`\n  Total lines: ${lines.length}`);
} catch(e) { out.push('  Error: ' + e.message); }

fs.writeFileSync(path.join(__dirname, 'debug-output.txt'), out.join('\n'));
console.log('Audit complete: ' + out.length + ' lines');

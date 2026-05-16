/**
 * Check if the React island bundle loads correctly
 */
const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'public', 'dist', 'recordsGrid.js');

if (!fs.existsSync(bundlePath)) {
    console.log('ERROR: Bundle file does not exist!');
    process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');
console.log('Bundle size:', content.length, 'bytes');
console.log('First 200 chars:', content.substring(0, 200));
console.log('Last 100 chars:', content.substring(content.length - 100));

// Check for common issues
if (content.includes('import ')) {
    console.log('WARNING: Bundle contains raw "import" statements - may not be properly bundled');
}
if (content.includes('require(')) {
    console.log('WARNING: Bundle contains "require()" calls - may not work in browser');
}
if (content.includes('process.env')) {
    console.log('WARNING: Bundle references process.env');
}

// Check if it exports/contains the island mount
if (content.includes('records-grid')) {
    console.log('OK: Bundle contains records-grid island mount');
} else {
    console.log('ERROR: Bundle does NOT contain records-grid island mount!');
}

if (content.includes('createRoot')) {
    console.log('OK: Bundle contains createRoot (React 18)');
} else {
    console.log('ERROR: Bundle does NOT contain createRoot!');
}

if (content.includes('RecordsGrid')) {
    console.log('OK: Bundle contains RecordsGrid component');
} else {
    console.log('ERROR: Bundle does NOT contain RecordsGrid!');
}

// Check for syntax errors by trying to parse (basic check)
try {
    // Just check if there's an obvious JSON parse issue or template literal issue
    if (content.includes('<%=') || content.includes('<%')) {
        console.log('ERROR: Bundle contains EJS template tags!');
    }
} catch (e) {
    console.log('Parse error:', e.message);
}

console.log('\n--- Checking if Vite config exists ---');
const viteConfig = path.join(__dirname, '..', 'vite.config.js');
if (fs.existsSync(viteConfig)) {
    console.log('Vite config exists');
    const vc = fs.readFileSync(viteConfig, 'utf8');
    console.log(vc);
} else {
    console.log('No vite.config.js found');
    // Check for vite.config.mjs or other variants
    const variants = ['vite.config.mjs', 'vite.config.ts', 'vite.config.cjs'];
    for (const v of variants) {
        if (fs.existsSync(path.join(__dirname, '..', v))) {
            console.log('Found:', v);
        }
    }
}

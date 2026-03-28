const fs = require('fs');
const content = fs.readFileSync('views/record/partials/record-lines.ejs', 'utf8');
const lines = content.split('\n');
const results = [];

results.push('=== "catalog" references ===');
lines.forEach((line, i) => {
    if (line.toLowerCase().includes('catalog')) {
        results.push((i + 1) + ': ' + line.trim().substring(0, 150));
    }
});

results.push('\n=== "suggestion" references ===');
lines.forEach((line, i) => {
    if (line.toLowerCase().includes('suggestion')) {
        results.push((i + 1) + ': ' + line.trim().substring(0, 150));
    }
});

results.push('\n=== "dropdown" references (after line 100) ===');
lines.forEach((line, i) => {
    if (i > 100 && line.toLowerCase().includes('dropdown')) {
        results.push((i + 1) + ': ' + line.trim().substring(0, 150));
    }
});

results.push('\n=== "search" references (in JS section, after line 3000) ===');
lines.forEach((line, i) => {
    if (i > 3000 && line.toLowerCase().includes('search')) {
        results.push((i + 1) + ': ' + line.trim().substring(0, 150));
    }
});

results.push('\n=== Function declarations (after line 3000) ===');
lines.forEach((line, i) => {
    if (i > 3000 && /^\s*(async\s+)?[\w]+\s*\(/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('if') && !line.trim().startsWith('for')) {
        results.push((i + 1) + ': ' + line.trim().substring(0, 150));
    }
});

fs.writeFileSync('tmp/catalog_search_results.txt', results.join('\n'), 'utf8');
console.log('Written to tmp/catalog_search_results.txt');

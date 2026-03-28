const fs = require('fs');
const content = fs.readFileSync('views/record/partials/record-lines.ejs', 'utf8');

function extractFunction(name) {
    const idx = content.indexOf(name + '(');
    if (idx === -1) return '// not found';
    
    // Find matching bracket
    let bracketCount = 0;
    let started = false;
    let endIdx = idx;
    
    for (let i = idx; i < content.length; i++) {
        if (content[i] === '{') {
            bracketCount++;
            started = true;
        } else if (content[i] === '}') {
            bracketCount--;
        }
        
        if (started && bracketCount === 0) {
            endIdx = i + 1;
            break;
        }
    }
    
    return content.substring(idx, endIdx);
}

const res = [
    '=== getVisibleColumnsForLine ===',
    extractFunction('getVisibleColumnsForLine'),
    '\n=== filterMsOptions ===',
    extractFunction('filterMsOptions'),
    '\n=== filterSelOptions ===',
    extractFunction('filterSelOptions')
].join('\n');

fs.writeFileSync('tmp/options_funcs.js', res, 'utf8');
console.log('done');

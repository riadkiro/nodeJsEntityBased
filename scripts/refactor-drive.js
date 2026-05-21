const fs = require('fs');
const path = require('path');

const filePath = path.join('c:/Users/pc/Documents/nodeJsProject/views/record/record-module.ejs');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find the CSS+JS section boundaries
// It starts with "    <% if (moduleName === 'drive') { %>" containing CSS/JS
// and ends with "    <% } %>" after the pdf.js includes

// First, undo the partial replacement that happened (lines were partially modified)
// Let me find line numbers by content

let cssJsStart = -1;
let cssJsEnd = -1;
let htmlStart = -1;
let htmlEnd = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Find the CSS+JS block: "<!-- Drive CSS, JS and PDF.js are now in partials/drive-shared.ejs -->"
    if (line === '<!-- Drive CSS, JS and PDF.js are now in partials/drive-shared.ejs -->') {
        // Go back to find the <% if start
        for (let j = i - 1; j >= 0; j--) {
            if (lines[j].trim() === "<% if (moduleName === 'drive') { %>") {
                cssJsStart = j;
                break;
            }
        }
    }
    
    // Find pdfjsLib workerSrc line (end of the old JS block that wasn't removed)
    if (line.includes("pdfjsLib") && line.includes("GlobalWorkerOptions.workerSrc")) {
        // The next <% } %> after this marks the end of the CSS+JS block
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() === '<% } %>') {
                cssJsEnd = j;
                break;
            }
        }
    }
    
    // Find the HTML block: starts with <% if (moduleName === 'drive') { %> followed by <div x-data="driveModule"
    if (line.includes('x-data="driveModule"') && line.includes('x-cloak')) {
        // Go back to find the <% if
        for (let j = i - 1; j >= 0; j--) {
            if (lines[j].trim() === "<% if (moduleName === 'drive') { %>") {
                htmlStart = j;
                break;
            }
        }
        // Find the closing <% } %> - search for it after the security warning modal
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() === '<% } %>' && j > i + 50) {
                // Verify this is the right one by checking context
                // It should be after </template> and </div> (end of driveModule div)
                const prev = lines[j - 1].trim();
                if (prev === '' || prev.includes('</div>') || lines[j-2]?.trim().includes('</div>')) {
                    htmlEnd = j;
                    break;
                }
            }
        }
    }
}

console.log('CSS+JS block:', cssJsStart, '-', cssJsEnd);
console.log('HTML block:', htmlStart, '-', htmlEnd);

// Now do the replacements
if (cssJsStart >= 0 && cssJsEnd >= 0 && htmlStart >= 0 && htmlEnd >= 0) {
    // Replace HTML block first (since it's later in the file)
    const newHtmlBlock = [
        "        <% if (moduleName === 'drive') { %>",
        "        <%- include('partials/drive-shared', { driveMode: 'record' }) %>",
        "        <% } %>"
    ];
    
    // Replace CSS+JS block
    const newCssJsBlock = [
        // Nothing needed - the CSS+JS is in the shared partial now
    ];
    
    // Build new lines array
    const result = [];
    for (let i = 0; i < lines.length; i++) {
        if (i >= htmlStart && i <= htmlEnd) {
            if (i === htmlStart) {
                result.push(...newHtmlBlock);
            }
            // Skip other lines in this range
            continue;
        }
        if (i >= cssJsStart && i <= cssJsEnd) {
            // Skip the old CSS+JS block entirely
            continue;
        }
        result.push(lines[i]);
    }
    
    fs.writeFileSync(filePath, result.join('\n'), 'utf8');
    console.log('Done! Removed', (cssJsEnd - cssJsStart + 1) + (htmlEnd - htmlStart + 1), 'lines');
    console.log('New file has', result.length, 'lines (was', lines.length, ')');
} else {
    console.log('ERROR: Could not find all block boundaries');
    // Debug: show what we found
    if (cssJsStart === -1) console.log('  Missing: CSS+JS start');
    if (cssJsEnd === -1) console.log('  Missing: CSS+JS end');
    if (htmlStart === -1) console.log('  Missing: HTML start');
    if (htmlEnd === -1) console.log('  Missing: HTML end');
}

const fs = require('fs');
const path = require('path');

// The correct checkbox HTML snippet
function makeCheckbox(indent) {
    return `${indent}<div style="width:22px;height:22px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;pointer-events:none;" :style="selectedFiles.includes(df.filename) ? 'background:#10b981;border:2px solid #10b981;' : 'background:#fff;border:2px solid #cbd5e1;'">\n${indent}    <template x-if="selectedFiles.includes(df.filename)"><svg viewBox="0 0 12 10" fill="none" style="width:10px;height:8px;display:block;"><path d="M1 5l3.5 3.5L11 1" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></template>\n${indent}</div>`;
}

const files = [
    path.join(__dirname, '..', 'views', 'record', 'record-module.ejs'),
    path.join(__dirname, '..', 'views', 'record', 'partials', 'ov-widget-fields.ejs'),
];

// Regex patterns to find existing bad checkboxes or old buttons
const patterns = [
    // Old button pattern
    /<button type="button" :style="selectedFiles\.includes\(df\.filename\)[^"]*"[^>]*x-text="selectedFiles\.includes\(df\.filename\)[^"]*"><\/button>/g,
    // Bad checkbox: border:2px solid; without color in static style
    /<div style="width:22px;height:22px;border-radius:6px;border:2px solid;[^"]*" :style="selectedFiles\.includes\(df\.filename\)[^"]*">\s*<svg x-show="[^"]*"[^>]*>[\s\S]*?<\/svg>\s*<\/div>/g,
];

for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let count = 0;

    // Fix old Choisir/Ajouté buttons
    content = content.replace(
        /<button type="button" :style="selectedFiles\.includes\(df\.filename\) \? 'background:#10b98115;color:#10b981;' : 'background:#4361ee10;color:#4361ee;'" style="border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0\.2s;" class="hover:bg-primary hover:text-white" x-text="selectedFiles\.includes\(df\.filename\) \? '✓ Ajouté' : 'Choisir'"><\/button>/g,
        (match, offset) => {
            count++;
            // Detect indentation from the line
            const lineStart = content.lastIndexOf('\n', offset) + 1;
            const indent = content.slice(lineStart, offset).match(/^\s*/)[0];
            return makeCheckbox(indent);
        }
    );

    // Fix bad checkbox with border:2px solid (no color in static style)
    content = content.replace(
        /<div style="width:22px;height:22px;border-radius:6px;border:2px solid;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0\.2s;pointer-events:none;" :style="selectedFiles\.includes\(df\.filename\) \? 'border-color:#10b981;background:#10b981;' : 'border-color:#cbd5e1;background:#fff;'">([\s\S]*?)<\/div>/g,
        (match, offset) => {
            count++;
            const lineStart = content.lastIndexOf('\n', offset) + 1;
            const indent = content.slice(lineStart, offset).match(/^\s*/)[0];
            return makeCheckbox(indent);
        }
    );

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${path.basename(filePath)}: ${count} replacement(s)`);
    } else {
        console.log(`ℹ️  No changes needed in ${path.basename(filePath)}`);
    }
}
console.log('Done!');

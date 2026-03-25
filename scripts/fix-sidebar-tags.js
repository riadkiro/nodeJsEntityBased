const fs = require('fs');
const path = 'C:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';
const content = fs.readFileSync(path, 'utf8');
const search = '</div><!-- end swActiveTab wrapper -->';
const replacement = '</div>\n                                             <% }) /* end allDtSchemas.forEach */ %>\n                                         </div><!-- end swActiveTab wrapper -->';

// Find the line with the search string
const lines = content.split(/\r?\n/);
let foundIdx = -1;
for (let i = 2190; i < 2210; i++) {
    if (lines[i] && lines[i].includes(search)) {
        foundIdx = i;
        break;
    }
}

if (foundIdx !== -1) {
    const originalLine = lines[foundIdx];
    // Preserve indentation of the original line
    const indent = originalLine.substring(0, originalLine.indexOf('</div>'));
    const finalReplacement = indent + '</div>\n' + indent + '    <% }) /* end allDtSchemas.forEach */ %>\n' + originalLine;
    
    lines[foundIdx] = finalReplacement;
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully fixed tags on line ' + (foundIdx + 1));
} else {
    console.log('Search string not found in range.');
}

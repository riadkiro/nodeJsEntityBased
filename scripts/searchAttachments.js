const fs = require('fs');

const content = fs.readFileSync('views/record/record-edit.ejs', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('_initialAttachments_') || lines[i].includes('attachments = []') || lines[i].includes('let _attachmentList') || lines[i].includes('const _attachmentList')) {
        console.log(`Line ${i+1}: ${lines[i].trim()}`);
    }
}

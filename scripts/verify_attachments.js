const fs = require('fs');
const content = fs.readFileSync('views/record/record-edit.ejs', 'utf8');
if (content.includes('_allDocumentsTabAttachments')) {
    console.log('SUCCESS: _allDocumentsTabAttachments is in the file.');
} else {
    console.log('FAILURE: _allDocumentsTabAttachments not found in the file.');
}

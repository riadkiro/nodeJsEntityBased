const fs = require('fs');
const content = fs.readFileSync('views/record/record-edit.ejs', 'utf8');

// The lines representing window['_initialAttachments_<%= String(record._id) %>'] = ...
// We will replace them to also include related records.

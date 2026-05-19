const fs = require('fs');
const files = [
    'views/record/record-module.ejs',
    'views/record/record-list.ejs',
    'views/record/record-list-view.ejs',
    'views/record/record-kanban.ejs',
    'views/record/record-edit.ejs',
    'views/record/partials/widget-picker.ejs'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf-8');
        content = content.replace(/alert\((.*?)\)/g, 'window.showMessage ? window.showMessage($1, \'danger\') : alert($1)');
        fs.writeFileSync(file, content);
        console.log(`Replaced alerts in ${file}`);
    }
}

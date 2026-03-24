const fs = require('fs');
const targetFile = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';

try {
    let content = fs.readFileSync(targetFile, 'utf8');

    // Make the delete button logic safer by preventing default and returning early if confirmed.
    // Also ensuring that account_number and entity._id are correctly passed for every sw loop iteration.
    
    const search = /@click="\$store\.widgetPicker\.deleteExistingWidget\([^)]+\)"/g;
    const replace = `@click.prevent.stop="$store.widgetPicker.deleteExistingWidget({ entityId: '<%= entity._id %>', accountNumber: '<%= account_number %>' }, '<%= sw._id %>')"`;
    
    content = content.replace(search, replace);

    fs.writeFileSync(targetFile, content);
    console.log('Successfully added .prevent.stop to delete button');
} catch (e) {
    console.error(e);
}

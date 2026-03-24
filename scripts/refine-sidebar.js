const fs = require('fs');
const targetFile = 'c:/Users/pc/Documents/nodeJsProject/views/record/partials/record-sidebar.ejs';

try {
    let content = fs.readFileSync(targetFile, 'utf8');

    // We want to replace the complex @click with something simpler or correctly escaped
    // The previous replacement attempt might have messed up the backslashes in the EJS tags.
    
    // Target the specific button and replace the whole @click attribute
    const regex = /<button type="button"\s+@click="\$store\.widgetPicker\.openEditWidget\([^"]+\)"/;
    
    // Let's use a simpler version for label: just sw.label but with single quote protection
    // EJS side: sw.label.replace(/'/g, "\\'")
    const replaceLabelEjs = "<%= (sw.label || '').replace(/'/g, \"\\\\'\") %>";
    
    const newClick = `<button type="button"
                                        @click="$store.widgetPicker.openEditWidget({ type: 'sidebar', entityId: '<%= entity._id %>', accountNumber: '<%= account_number %>' }, { _id: '<%= sw._id %>', type: '<%= sw.type %>', label: '${replaceLabelEjs}', icon: '<%= sw.icon %>', color: '<%= sw.color %>', config: JSON.parse(decodeURIComponent('<%= encodeURIComponent(JSON.stringify(sw.config || {})) %>')) })"`;

    if (regex.test(content)) {
        content = content.replace(regex, newClick);
        fs.writeFileSync(targetFile, content);
        console.log('Successfully refined editWidget call');
    } else {
        console.log('Failed to find the @click to refine');
        // Let's check what's actually there
        const lines = content.split('\n');
        for(let i=0; i<lines.length; i++) {
            if (lines[i].includes('$store.widgetPicker.openEditWidget')) {
                console.log('Line ' + (i+1) + ': ' + lines[i]);
            }
        }
    }

} catch (error) {
    console.error('Error:', error.message);
}

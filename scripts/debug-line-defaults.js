const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/saas_app_rb_9194');
    
    let out = '';
    
    // Find the view for entity Consultation
    const views = await mongoose.connection.db.collection('views').find({
        entityId: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd651')
    }).toArray();
    
    out += '=== VIEWS FOR CONSULTATION ENTITY ===\n';
    for (const v of views) {
        out += `  _id: ${v._id}  name: "${v.name}"  viewType: "${v.viewType}"\n`;
        // Check tab layout blocks for dynamic-table widgets
        if (v.tabLayout) {
            for (const [tabKey, tabData] of Object.entries(v.tabLayout)) {
                const rows = tabData.rows || [];
                for (const row of rows) {
                    for (const col of (row.columns || [])) {
                        for (const blockId of (col.blockIds || [])) {
                            const block = (tabData.blocks || []).find(b => b.id === blockId);
                            if (block && block.type === 'dynamic-table') {
                                out += `    Tab "${tabKey}" has dynamic-table widget: ${JSON.stringify(block)}\n`;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Also check the consultation record's own layout/view data
    const consult = await mongoose.connection.db.collection('records').findOne({
        _id: new mongoose.Types.ObjectId('69c232ce0fa7abd357abd6f3')
    });
    if (consult) {
        out += `\n=== CONSULTATION RECORD ===\n`;
        out += `  title: ${consult.title}\n`;
        // Check if it has any widget config
        if (consult.tabLayout) {
            out += `  Has tabLayout\n`;
            out += `  tabLayout: ${JSON.stringify(consult.tabLayout, null, 2)}\n`;
        }
    }
    
    // Get the edit view specifically
    const editView = await mongoose.connection.db.collection('views').findOne({
        entityId: new mongoose.Types.ObjectId('69c232cd0fa7abd357abd651'),
        viewType: 'edit'
    });
    if (editView) {
        out += `\n=== EDIT VIEW DETAILS ===\n`;
        out += `  _id: ${editView._id}\n`;
        if (editView.tabLayout) {
            out += `  Full tabLayout:\n${JSON.stringify(editView.tabLayout, null, 2)}\n`;
        }
    }
    
    fs.writeFileSync(path.join(__dirname, 'debug-output.txt'), out);
    console.log('Done');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

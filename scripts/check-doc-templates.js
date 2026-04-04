const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Get document templates
    const docs = await conn.db.collection('documents').find({ isTemplate: true }).toArray();
    console.log(`Found ${docs.length} template documents\n`);
    
    for (const doc of docs) {
        console.log(`=== ${doc.name} (${doc._id}) ===`);
        
        // Extract tokens from pages content
        if (doc.pages && doc.pages.length > 0) {
            for (let i = 0; i < doc.pages.length; i++) {
                const page = doc.pages[i];
                if (page.content) {
                    // Find {{...}} tokens
                    const textTokens = page.content.match(/\{\{([^}]+)\}\}/g);
                    if (textTokens) {
                        console.log(`  Page ${i+1} text tokens:`, textTokens);
                    }
                    // Find template-token spans
                    const spanTokens = page.content.match(/data-token="([^"]*)"/g);
                    if (spanTokens) {
                        for (const st of spanTokens) {
                            const decoded = st.replace('data-token="', '').replace('"', '')
                                .replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                            try {
                                const parsed = JSON.parse(decoded);
                                console.log(`  Page ${i+1} span token: path=${parsed.path}, label=${parsed.label}`);
                            } catch(e) {
                                console.log(`  Page ${i+1} span token raw:`, decoded);
                            }
                        }
                    }
                }
            }
        }
        console.log('');
    }

    // Also check SmartDocTemplates
    const smartDocs = await conn.db.collection('smartdoctemplates').find({}).toArray();
    console.log(`\nFound ${smartDocs.length} SmartDoc templates`);
    for (const sd of smartDocs) {
        console.log(`  SmartDoc: ${sd.name}, entityId: ${sd.entityId}, documentId: ${sd.documentId}`);
        if (sd.inputFields) {
            console.log(`    inputFields:`, JSON.stringify(sd.inputFields));
        }
    }

    // Check entity slug 
    const entities = await conn.db.collection('entities').find({}).project({name:1, slug:1}).toArray();
    console.log('\nEntities:');
    for (const e of entities) {
        console.log(`  ${e.name} -> slug: "${e.slug}"`);
    }

    await conn.close();
}

main().catch(console.error);

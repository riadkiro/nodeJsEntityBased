const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Find ALL attestation documents (templates AND drafts)
    const docs = await conn.db.collection('documents').find({ 
        name: { $regex: /attestation/i }
    }).toArray();

    console.log(`Found ${docs.length} attestation documents\n`);

    for (const doc of docs) {
        console.log(`=== ${doc.name} (${doc._id}) ===`);
        console.log(`  isTemplate: ${doc.isTemplate}, isDraft: ${doc.isDraft}, status: ${doc.status}`);
        console.log(`  createdAt: ${doc.createdAt}`);
        
        if (doc.pages && doc.pages[0] && doc.pages[0].content) {
            const tokens = doc.pages[0].content.match(/\{\{([^}]+)\}\}/g);
            console.log(`  tokens: ${tokens || 'none (all resolved)'}`);
            
            // Check if it has the styled content
            const hasStyled = doc.pages[0].content.includes('soussigné');
            console.log(`  styled template: ${hasStyled}`);
            
            // Check for patient name in content
            const hasPatientName = doc.pages[0].content.includes('Rayan') || doc.pages[0].content.includes('Chevalier');
            console.log(`  has patient data: ${hasPatientName}`);
            
            // Show snippet around patient
            if (doc.pages[0].content.includes('Né(e)') || doc.pages[0].content.includes('certifie')) {
                // Find the patient name area
                const content = doc.pages[0].content;
                const idx = content.indexOf('certifie');
                if (idx > -1) {
                    console.log(`  Content after 'certifie': ${content.substring(idx, idx + 300)}`);
                }
                const idx2 = content.indexOf('Né(e)');
                if (idx2 > -1) {
                    console.log(`  Content around 'Né(e)': ${content.substring(idx2 - 50, idx2 + 200)}`);
                }
            }
        }
        console.log('');
    }

    await conn.close();
}

main().catch(console.error);

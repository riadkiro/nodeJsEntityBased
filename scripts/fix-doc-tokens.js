const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_5001');
    await new Promise(r => conn.once('open', r));

    // Mapping of wrong token names to correct field names
    const replacements = [
        // patients direct fields (already fixed patients.patients -> patients)
        ['patients.dateNaissance', 'patients.date_naissance'],
        ['patients.groupeSanguin', 'patients.groupe_sanguin'],
        // consultations.patients relation fields
        ['consultations.patients.date_naissance', 'consultations.patients.date_naissance'], // already correct
        ['consultations.patients.dateNaissance', 'consultations.patients.date_naissance'],
        ['consultations.patients.numero_secu', 'consultations.patients.numero_secu'], // already correct
        // factures relation fields
        ['factures.patients.dateNaissance', 'factures.patients.date_naissance'],
        // Also fix patients.notes -> patients.notes is not a field, check what it should be
    ];

    const docs = await conn.db.collection('documents').find({ isTemplate: true }).toArray();
    let fixedCount = 0;

    for (const doc of docs) {
        let modified = false;
        const updatedPages = (doc.pages || []).map(page => {
            const updatedPage = { ...page };
            if (updatedPage.content) {
                for (const [from, to] of replacements) {
                    if (from !== to && updatedPage.content.includes(from)) {
                        updatedPage.content = updatedPage.content.split(from).join(to);
                        modified = true;
                        console.log(`  Replaced '${from}' -> '${to}' in ${doc.name}`);
                    }
                }
            }
            return updatedPage;
        });

        if (modified) {
            await conn.db.collection('documents').updateOne(
                { _id: doc._id },
                { $set: { pages: updatedPages } }
            );
            fixedCount++;
        }
    }

    console.log(`\nFixed ${fixedCount} documents`);

    // Run verification
    console.log('\n--- Verification ---');
    const allDocs = await conn.db.collection('documents').find({ isTemplate: true }).toArray();
    for (const doc of allDocs) {
        if (doc.pages && doc.pages[0] && doc.pages[0].content) {
            const tokens = doc.pages[0].content.match(/\{\{([^}]+)\}\}/g);
            if (tokens && tokens.length > 0) {
                console.log(`${doc.name}: ${tokens.join(', ')}`);
            }
        }
    }

    await conn.close();
}

main().catch(console.error);

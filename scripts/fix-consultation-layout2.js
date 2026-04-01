/**
 * Part 2: Fix remaining consultation issues for account 7846
 * 1. Remove EXAMENS relation from consultation formLayout  
 * 2. Remove examen_clinique field from consultation formLayout
 * 3. Verify gridSchemas are correctly configured
 */
const mongoose = require('mongoose');

async function main() {
    const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/saas_app_rb_7846');
    await new Promise(r => conn.once('open', r));
    console.log('✅ Connected');

    const db = conn.db;

    // Get consultation entity
    const consult = await db.collection('entities').findOne({ slug: 'consultations' });
    if (!consult) {
        console.log('❌ Consultation entity not found');
        await conn.close();
        process.exit(1);
    }

    console.log('\n=== Current Consultation Config ===');
    console.log('Relations:', (consult.relations || []).map(r => `${r.label} (key=${r.key})`));
    
    // Print formLayout fields
    const layout = consult.formLayout || consult.layout;
    if (layout?.fields) {
        console.log('\nFormLayout fields:');
        layout.fields.forEach((f, i) => {
            console.log(`  [${i}] fieldId=${f.fieldId}, width=${f.width}, id=${f.id}`);
        });
    }

    // Print gridSchemas
    console.log('\ngridSchemas:');
    (consult.gridSchemas || []).forEach((g, i) => {
        console.log(`  [${i}] label=${g.label}, schemaId=${g.schemaId}, position=${g.position}, order=${g.order}`);
    });

    // Print customFields (relation-type ones)
    const fieldIds = consult.customFields || [];
    if (fieldIds.length > 0) {
        const fields = await db.collection('fieldtemplates').find({ 
            _id: { $in: fieldIds.map(id => new mongoose.Types.ObjectId(id)) } 
        }).toArray();
        
        console.log('\nCustom fields:');
        fields.forEach(f => {
            console.log(`  ${f.name} (${f.type}) - ${f.label} - id=${f._id}`);
        });
        
        const examFields = fields.filter(f => 
            f.name?.includes('examen') || f.label?.includes('Examen') || f.label?.includes('examen')
        );
        if (examFields.length > 0) {
            console.log('\n🔍 Found examen-related fields:');
            examFields.forEach(f => console.log(`  ${f.name}: ${f.label} (${f._id})`));
        }
    }

    // Find the examens relation key
    const examensEntity = await db.collection('entities').findOne({ slug: 'examens' });
    let examRelKey = null;
    if (examensEntity) {
        const examRel = (consult.relations || []).find(r => 
            r.targetEntity?.toString() === examensEntity._id.toString()
        );
        if (examRel) {
            examRelKey = examRel.key;
            console.log(`\n🔍 Examens relation key: ${examRelKey}`);
        }
    }

    // =====================================
    // FIXES
    // =====================================
    
    // 1. Remove examen_clinique from formLayout AND examens relation
    if (layout?.fields) {
        const examenFields = await db.collection('fieldtemplates').find({
            name: { $in: ['examen_clinique'] }
        }).toArray();
        
        const examenFieldIds = examenFields.map(f => f._id.toString());
        const examRelKeys = examRelKey ? [examRelKey] : [];
        
        const cleanFields = layout.fields.filter(f => {
            if (examenFieldIds.includes(f.fieldId)) {
                console.log(`  ✅ Removing examen_clinique from layout: ${f.fieldId}`);
                return false;
            }
            if (examRelKeys.includes(f.fieldId)) {
                console.log(`  ✅ Removing examens relation from layout: ${f.fieldId}`);
                return false;
            }
            return true;
        });
        
        if (cleanFields.length < layout.fields.length) {
            await db.collection('entities').updateOne(
                { _id: consult._id },
                { 
                    $set: { 
                        'formLayout.fields': cleanFields,
                        'layout.fields': cleanFields 
                    }
                }
            );
            console.log(`\n✅ Removed ${layout.fields.length - cleanFields.length} fields from layout`);
        } else {
            console.log('\n⏭️  No examen fields found in layout to remove');
        }
    }

    // 2. Remove examen_clinique from customFields array 
    const examenField = await db.collection('fieldtemplates').findOne({ name: 'examen_clinique' });
    if (examenField) {
        const result = await db.collection('entities').updateOne(
            { _id: consult._id },
            { $pull: { customFields: examenField._id } }
        );
        if (result.modifiedCount > 0) {
            console.log(`✅ Removed examen_clinique from customFields`);
        } else {
            console.log('⏭️  examen_clinique not in customFields');
        }
    }

    // 3. Remove examens relation from entity.relations 
    if (examRelKey) {
        const result = await db.collection('entities').updateOne(
            { _id: consult._id },
            { $pull: { relations: { key: examRelKey } } }
        );
        if (result.modifiedCount > 0) {
            console.log(`✅ Removed examens relation from entity`);
        } else {
            console.log('⏭️  examens relation not in entity');
        }
    }

    // 4. Print final state
    const finalConsult = await db.collection('entities').findOne({ slug: 'consultations' });
    const finalLayout = finalConsult.formLayout || finalConsult.layout;
    console.log('\n=== Final Layout ===');
    if (finalLayout?.fields) {
        finalLayout.fields.forEach((f, i) => {
            console.log(`  [${i}] fieldId=${f.fieldId}, width=${f.width}`);
        });
    }
    console.log('\nFinal relations:', (finalConsult.relations || []).map(r => r.label));

    await conn.close();
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});

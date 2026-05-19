const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/routes/document.routes.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Update the GET templates query logic
content = content.replace(
    /\/\/ Get existing entity-scoped SmartDocTemplate entries[\s\S]*?if \(!existingEntityIds\.includes\(entityId\)\) \{/,
    `// Get ALL existing SmartDocTemplate entries for this document
                const allExistingTemplates = await SmartDocTemplate.find({ documentId: docId }).lean();
                
                // For auto-sync of generic entity links, we only care about 'entity' scoped ones to delete
                const existingTemplates = allExistingTemplates.filter(t => !t.scopeType || t.scopeType === 'entity');
                
                // To prevent creating duplicate 'entity' templates when a 'record' template already exists for that entity
                const allExistingEntityIds = allExistingTemplates.map(t => t.entityId.toString());

                if (isTemplate && linkedEntityIds.length > 0) {
                    // Create missing SmartDocTemplate entries
                    for (const entityId of linkedEntityIds) {
                        if (!allExistingEntityIds.includes(entityId)) {`
);

// 2. Fix the else-if blocks to use allExistingTemplates length
content = content.replace(
    /\} else if \(!isTemplate && existingTemplates\.length > 0\) \{[\s\S]*?\} else if \(isTemplate && linkedEntityIds\.length === 0 && existingTemplates\.length > 0\) \{[\s\S]*?\}/,
    `} else if (!isTemplate && allExistingTemplates.length > 0) {
                    // Template mode was disabled → remove all SmartDocTemplate entries
                    await SmartDocTemplate.deleteMany({ documentId: docId });
                    console.log(\`[SmartDoc] Template mode disabled → removed \${allExistingTemplates.length} SmartDocTemplate entries\`);
                } else if (isTemplate && linkedEntityIds.length === 0 && allExistingTemplates.length > 0) {
                    // Template has no linked entities → remove orphan SmartDocTemplate entries
                    await SmartDocTemplate.deleteMany({ documentId: docId });
                    console.log(\`[SmartDoc] Template unlinked from all entities → removed \${allExistingTemplates.length} SmartDocTemplate entries\`);
                }`
);

// 3. Fix the Delete document endpoint to cascade delete SmartDocTemplate
content = content.replace(
    /const document = await Document\.findByIdAndDelete\(req\.params\.id\);\s*if \(!document\) \{\s*return res\.status\(404\)\.json\(\{ success: false, error: 'Document non trouvé' \}\);\s*\}/,
    `const document = await Document.findByIdAndDelete(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document non trouvé' });
        }

        // --- Mission 8: Cascade delete SmartDocTemplates ---
        try {
            const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
            if (SmartDocTemplate) {
                await SmartDocTemplate.deleteMany({ documentId: req.params.id });
            }
        } catch (cascadeErr) {
            console.error('[SmartDoc] Error in cascade delete:', cascadeErr);
        }`
);

fs.writeFileSync(file, content);
console.log('Fixed document.routes.js');

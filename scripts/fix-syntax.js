const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/routes/document.routes.js';
let content = fs.readFileSync(file, 'utf8');

// The file currently has this around line 519:
//                 } else if (isTemplate && linkedEntityIds.length === 0 && allExistingTemplates.length > 0) {
//                     // Template has no linked entities → remove orphan SmartDocTemplate entries
//                     await SmartDocTemplate.deleteMany({ documentId: docId });
//                     console.log(`[SmartDoc] Template unlinked from all entities → removed ${allExistingTemplates.length} SmartDocTemplate entries`);
//                 });
//                     console.log(`[SmartDoc] Template unlinked from all entities → removed ${existingTemplates.length} SmartDocTemplate entries`);
//                 }

// I will just replace the exact block.
const badBlock = `                } else if (!isTemplate && allExistingTemplates.length > 0) {
                    // Template mode was disabled → remove all SmartDocTemplate entries
                    await SmartDocTemplate.deleteMany({ documentId: docId });
                    console.log(\`[SmartDoc] Template mode disabled → removed \${allExistingTemplates.length} SmartDocTemplate entries\`);
                } else if (isTemplate && linkedEntityIds.length === 0 && allExistingTemplates.length > 0) {
                    // Template has no linked entities → remove orphan SmartDocTemplate entries
                    await SmartDocTemplate.deleteMany({ documentId: docId });
                    console.log(\`[SmartDoc] Template unlinked from all entities → removed \${allExistingTemplates.length} SmartDocTemplate entries\`);
                });
                    console.log(\`[SmartDoc] Template unlinked from all entities → removed \${existingTemplates.length} SmartDocTemplate entries\`);
                }`;

const goodBlock = `                } else if (!isTemplate && allExistingTemplates.length > 0) {
                    // Template mode was disabled → remove all SmartDocTemplate entries
                    await SmartDocTemplate.deleteMany({ documentId: docId });
                    console.log(\`[SmartDoc] Template mode disabled → removed \${allExistingTemplates.length} SmartDocTemplate entries\`);
                } else if (isTemplate && linkedEntityIds.length === 0 && allExistingTemplates.length > 0) {
                    // Template has no linked entities → remove orphan SmartDocTemplate entries
                    await SmartDocTemplate.deleteMany({ documentId: docId });
                    console.log(\`[SmartDoc] Template unlinked from all entities → removed \${allExistingTemplates.length} SmartDocTemplate entries\`);
                }`;

content = content.replace(badBlock, goodBlock);

fs.writeFileSync(file, content);
console.log('Fixed syntax error');

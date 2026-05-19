const fs = require('fs');
const file = 'c:/Users/pc/Documents/nodeJsProject/routes/document.routes.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ Update name if changed\s*for \(const existing of existingTemplates\) \{\s*if \(linkedEntityIds\.includes\(existing\.entityId\.toString\(\)\) && existing\.name \!\=\= document\.name\) \{\s*await SmartDocTemplate\.findByIdAndUpdate\(existing\._id, \{ name: document\.name \}\);\s*\}\s*\}/m;

const replacement = `// Update name if changed (for all scopes: entity, record, relation)
                    for (const existing of allExistingTemplates) {
                        if (existing.name !== document.name) {
                            await SmartDocTemplate.findByIdAndUpdate(existing._id, { name: document.name });
                        }
                    }`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Fixed name sync');

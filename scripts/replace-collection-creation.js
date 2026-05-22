const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/nav/nav-sidebar.ejs');
const originalContent = fs.readFileSync(filePath, 'utf8');

const target = `                    alert('Simulation: Création de la collection "'+this.wizardNewName+'" avec IA.');`;

const replacement = `                    const accountNum = window.location.pathname.split('/')[2];
                    const parent = Alpine.store('sidebar').contextItem;
                    const parentId = parent ? parent.id : null;
                    const parentType = parent ? parent.type : null;
                    try {
                        const res = await fetch(\`/account/\${accountNum}/api/hierarchy/entity\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: this.wizardNewName,
                                nameSingular: this.wizardNewName,
                                namePlural: this.wizardNewPlural || (this.wizardNewName + 's'),
                                fields: this.wizardSuggestedFields || [],
                                parentId: parentId,
                                parentType: parentType,
                                viewType: 'list',
                                icon: this.wizardNewIcon || 'solar:database-bold',
                                color: this.wizardNewColor || ''
                            })
                        });
                        if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err?.error || \`HTTP \${res.status}\`);
                        }
                        this.showRecordsWizard = false;
                        await this.fetchHierarchy();
                    } catch (e) {
                        alert("Erreur de création: " + e.message);
                    }`;

if (originalContent.includes(target)) {
    const updatedContent = originalContent.replace(target, replacement);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('SUCCESS: Replaced the simulation alert with the dynamic API fetch request.');
} else {
    console.error('ERROR: Could not find target simulation alert string in the file.');
}

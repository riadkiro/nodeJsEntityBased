const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/nav/nav-sidebar.ejs');
const originalContent = fs.readFileSync(filePath, 'utf8');

const target = `              openRecordsWizard() {`;

const replacement = `              templatesList: [
                {
                  nameSingular: 'Projet',
                  namePlural: 'Projets',
                  icon: 'solar:checklist-bold-duotone',
                  color: '#4361ee',
                  description: 'Suivi de projets, jalons et budgets.',
                  fields: [
                    { name: 'Statut', type: 'select' },
                    { name: 'Date de début', type: 'date' },
                    { name: 'Date de fin', type: 'date' },
                    { name: 'Responsable', type: 'text' },
                    { name: 'Budget', type: 'number' }
                  ]
                },
                {
                  nameSingular: 'Voiture',
                  namePlural: 'Voitures',
                  icon: 'solar:wheel-bold-duotone',
                  color: '#e7515a',
                  description: 'Flotte automobile et véhicules.',
                  fields: [
                    { name: 'Marque', type: 'text' },
                    { name: 'Modèle', type: 'text' },
                    { name: 'Immatriculation', type: 'text' },
                    { name: 'Kilométrage', type: 'number' },
                    { name: 'Année', type: 'number' }
                  ]
                },
                {
                  nameSingular: 'Contact',
                  namePlural: 'Contacts',
                  icon: 'solar:users-group-two-rounded-bold-duotone',
                  color: '#e2a03f',
                  description: 'Annuaire de contacts et personnes.',
                  fields: [
                    { name: 'Email', type: 'text' },
                    { name: 'Téléphone', type: 'text' },
                    { name: 'Poste', type: 'text' },
                    { name: 'Entreprise', type: 'text' }
                  ]
                },
                {
                  nameSingular: 'Entreprise',
                  namePlural: 'Entreprises',
                  icon: 'solar:buildings-bold-duotone',
                  color: '#00ab55',
                  description: 'Fiches entreprises, clients B2B.',
                  fields: [
                    { name: 'Secteur', type: 'select' },
                    { name: 'Chiffre d\\\'affaires', type: 'number' },
                    { name: 'Site Web', type: 'text' },
                    { name: 'Adresse', type: 'text' }
                  ]
                },
                {
                  nameSingular: 'Tâche',
                  namePlural: 'Tâches',
                  icon: 'solar:notes-bold-duotone',
                  color: '#8b5cf6',
                  description: 'Suivi des tâches et actions.',
                  fields: [
                    { name: 'Priorité', type: 'select' },
                    { name: 'Date d\\\'échéance', type: 'date' },
                    { name: 'Assigné à', type: 'text' },
                    { name: 'Statut', type: 'select' }
                  ]
                }
              ],

              selectTemplate(tpl) {
                this.recordsWizardMode = 'new';
                this.recordsWizardStep = 2;
                this.wizardNewName = tpl.nameSingular;
                this.wizardNewPlural = tpl.namePlural;
                this.wizardNewIcon = tpl.icon;
                this.wizardNewColor = tpl.color;
                this.wizardSuggestedFields = JSON.parse(JSON.stringify(tpl.fields));
                
                // Dispatch event to select icon in react picker
                window.dispatchEvent(new CustomEvent('icon-selected', { detail: { icon: tpl.icon } }));
              },

              openRecordsWizard() {`;

if (originalContent.includes(target)) {
    const updatedContent = originalContent.replace(target, replacement);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('SUCCESS: Injected templatesList and selectTemplate logic into nav-sidebar.ejs.');
} else {
    console.error('ERROR: Could not find target openRecordsWizard line.');
}

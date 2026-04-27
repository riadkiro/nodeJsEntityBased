const fs = require('fs');
const path = require('path');

const modules = {
  docs: { icon: 'solar:document-text-bold-duotone', color: '#f59e0b', label: 'Documents', desc: 'Modèles et documents générés', items: [
    { icon: 'solar:file-text-bold-duotone', title: "Demande d'examen labo", date: '15/04/2026', status: 'Généré', statusColor: '#10b981' },
    { icon: 'solar:file-check-bold-duotone', title: 'Arrêt de travail', date: '12/04/2026', status: 'Signé', statusColor: '#0ea5e9' },
    { icon: 'solar:file-text-bold-duotone', title: 'Attestation de présence', date: '08/04/2026', status: 'Brouillon', statusColor: '#f59e0b' },
    { icon: 'solar:file-bold-duotone', title: 'Fiche patient résumé', date: '01/04/2026', status: 'Généré', statusColor: '#10b981' },
    { icon: 'solar:file-security-bold-duotone', title: 'Consentement éclairé', date: '28/03/2026', status: 'Signé', statusColor: '#0ea5e9' }
  ]},
  drive: { icon: 'solar:cloud-storage-bold-duotone', color: '#ec4899', label: 'Drive', desc: 'Fichiers et médias organisés', items: [
    { icon: 'solar:folder-bold-duotone', title: 'Imagerie médicale', date: '3 fichiers', status: 'Dossier', statusColor: '#ec4899' },
    { icon: 'solar:folder-bold-duotone', title: "Résultats d'analyses", date: '7 fichiers', status: 'Dossier', statusColor: '#ec4899' },
    { icon: 'solar:gallery-bold-duotone', title: 'Radio thorax - 15-04.jpg', date: '15/04/2026', status: '2.4 MB', statusColor: '#6b7280' },
    { icon: 'solar:document-bold-duotone', title: 'Bilan sanguin complet.pdf', date: '12/04/2026', status: '540 KB', statusColor: '#6b7280' },
    { icon: 'solar:document-bold-duotone', title: 'Compte-rendu IRM.pdf', date: '05/04/2026', status: '1.2 MB', statusColor: '#6b7280' }
  ]},
  tasks: { icon: 'solar:checklist-minimalistic-bold-duotone', color: '#10b981', label: 'Tâches', desc: 'Suivi des actions et rappels', items: [
    { icon: 'solar:round-double-alt-arrow-right-bold-duotone', title: 'Rappel contrôle HTA - 3 mois', date: '15/07/2026', status: 'En cours', statusColor: '#f59e0b' },
    { icon: 'solar:check-circle-bold-duotone', title: 'Envoyer résultats labo', date: '20/04/2026', status: 'Terminé', statusColor: '#10b981' },
    { icon: 'solar:alarm-bold-duotone', title: 'Renouveler ordonnance', date: '25/04/2026', status: 'Urgent', statusColor: '#ef4444' },
    { icon: 'solar:check-circle-bold-duotone', title: 'Vérifier allergie médicament', date: '18/04/2026', status: 'Terminé', statusColor: '#10b981' },
    { icon: 'solar:round-double-alt-arrow-right-bold-duotone', title: 'Planifier bilan annuel', date: '01/06/2026', status: 'Planifié', statusColor: '#0ea5e9' }
  ]},
  agenda: { icon: 'solar:calendar-bold-duotone', color: '#14b8a6', label: 'Agenda', desc: 'Rendez-vous et événements', items: [
    { icon: 'solar:calendar-mark-bold-duotone', title: 'Consultation de suivi', date: '28/04/2026 - 10:30', status: 'Confirmé', statusColor: '#10b981' },
    { icon: 'solar:calendar-mark-bold-duotone', title: 'Contrôle tension', date: '15/05/2026 - 09:00', status: 'Planifié', statusColor: '#0ea5e9' },
    { icon: 'solar:calendar-bold-duotone', title: 'Bilan annuel complet', date: '01/06/2026 - 14:00', status: 'Planifié', statusColor: '#0ea5e9' },
    { icon: 'solar:calendar-minimalistic-bold-duotone', title: 'Consultation initiale', date: '15/03/2026 - 11:00', status: 'Passé', statusColor: '#6b7280' },
    { icon: 'solar:calendar-minimalistic-bold-duotone', title: 'Contrôle HTA #75', date: '01/04/2026 - 10:00', status: 'Passé', statusColor: '#6b7280' }
  ]},
  chat: { icon: 'solar:chat-round-dots-bold-duotone', color: '#f97316', label: 'Chat', desc: 'Conversations et échanges', items: [
    { icon: 'solar:chat-round-bold-duotone', title: "Résultats d'analyses à discuter", date: 'Il y a 2h', status: '3 messages', statusColor: '#f97316' },
    { icon: 'solar:chat-round-bold-duotone', title: 'Question posologie traitement', date: 'Hier', status: '5 messages', statusColor: '#f97316' },
    { icon: 'solar:chat-round-bold-duotone', title: 'Suivi post-consultation', date: '22/04/2026', status: '2 messages', statusColor: '#6b7280' }
  ]},
  emails: { icon: 'solar:letter-bold-duotone', color: '#0ea5e9', label: 'Emails', desc: 'Correspondance liée', items: [
    { icon: 'solar:letter-opened-bold-duotone', title: 'Envoi résultats bilan sanguin', date: '20/04/2026', status: 'Envoyé', statusColor: '#10b981' },
    { icon: 'solar:letter-bold-duotone', title: 'Confirmation RDV 28/04', date: '18/04/2026', status: 'Envoyé', statusColor: '#10b981' },
    { icon: 'solar:letter-opened-bold-duotone', title: 'Rappel renouvellement ordonnance', date: '15/04/2026', status: 'Lu', statusColor: '#0ea5e9' },
    { icon: 'solar:letter-bold-duotone', title: 'Prescription spécialiste', date: '10/04/2026', status: 'Envoyé', statusColor: '#10b981' }
  ]},
  notes: { icon: 'solar:notebook-bold-duotone', color: '#8b5cf6', label: 'Notes', desc: 'Notes et observations', items: [
    { icon: 'solar:notebook-bookmark-bold-duotone', title: 'Observation clinique - Consultation 15/04', date: '15/04/2026', status: 'Récent', statusColor: '#8b5cf6' },
    { icon: 'solar:notebook-bold-duotone', title: 'Antécédents familiaux détaillés', date: '01/04/2026', status: 'Important', statusColor: '#ef4444' },
    { icon: 'solar:notebook-bold-duotone', title: 'Évolution traitement HTA', date: '28/03/2026', status: 'Suivi', statusColor: '#10b981' },
    { icon: 'solar:notebook-minimalistic-bold-duotone', title: 'Notes première consultation', date: '15/03/2026', status: 'Archivé', statusColor: '#6b7280' }
  ]}
};

function buildItems(mod) {
  return mod.items.map((item, i) => `
            <div class="rm-item" style="animation-delay:${i*60}ms">
                <div class="rm-item-icon" style="background:linear-gradient(135deg,${mod.color}15,${mod.color}08)">
                    <iconify-icon icon="${item.icon}" width="20" style="color:${mod.color}"></iconify-icon>
                </div>
                <div class="rm-item-body">
                    <div class="rm-item-title">${item.title}</div>
                    <div class="rm-item-date"><iconify-icon icon="solar:calendar-linear" width="12"></iconify-icon> ${item.date}</div>
                </div>
                <span class="rm-item-badge" style="background:${item.statusColor}15;color:${item.statusColor}">${item.status}</span>
                <button class="rm-item-action" title="Options"><iconify-icon icon="solar:menu-dots-bold" width="16"></iconify-icon></button>
            </div>`).join('\n');
}

function buildModuleBlocks() {
  let b = '';
  for (const [key, mod] of Object.entries(modules)) {
    b += `\n        <% if (moduleName === '${key}') { %>\n        <div class="rm-items-list">\n            ${buildItems(mod)}\n        </div>\n        <% } %>\n`;
  }
  return b;
}

const tpl = fs.readFileSync(path.join(__dirname, 'record-module-template.ejs'), 'utf8');
const final = tpl.replace('{{MODULE_BLOCKS}}', buildModuleBlocks());

const outPath = path.join(__dirname, '..', 'views', 'record', 'record-module.ejs');
fs.writeFileSync(outPath, final, 'utf8');
console.log('Created:', outPath, '(' + final.length + ' bytes)');

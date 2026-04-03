const fs = require('fs');
const content = fs.readFileSync('scripts/seed-cabinet-medical.js', 'utf8');
const lines = content.split(/\r?\n/);
lines.forEach((line, i) => {
    if (line.toLowerCase().includes('attestation') || line.toLowerCase().includes('arret') || line.toLowerCase().includes('consentement') || line.toLowerCase().includes('fiche patient') || line.toLowerCase().includes('demande') || line.toLowerCase().includes('lettre')) {
        console.log(`${i+1}: ${line.trim().substring(0, 120)}`);
    }
});

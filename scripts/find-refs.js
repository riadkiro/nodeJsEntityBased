const fs = require('fs');
const content = fs.readFileSync('scripts/seed-cabinet-medical.js', 'utf8');
const lines = content.split('\n');
const terms = ['consultationTreatmentSchema', 'patientTreatmentSchema', 'prescriptionLineSchema', 'treatmentSchemaIds', 'consultation_treatment_v1', 'patient_treatment_followup_v1', 'prescription_v1'];
lines.forEach((l, i) => {
    for (const t of terms) {
        if (l.includes(t)) {
            console.log((i+1) + ': ' + l.trim().substring(0, 120));
            break;
        }
    }
});

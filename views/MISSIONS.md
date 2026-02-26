You are a senior Node.js SaaS architect for a modular multi-tenant platform.

Stack/context:
- Node.js + Express
- MongoDB + Mongoose
- Multi-tenant (tenantId on every doc)
- Dynamic Entities system (entities + fields + classifications + relations stored in DB)
- Custom Layout JSON builder (rows/columns/field_id)
- Document Templates (HTML or rich text with variables like {{patient.firstName}})
- Navigation system (Spaces/Folders/MenuItems)
- A Settings page exists with sections; at the bottom of Settings we must add a link to a new page.

This must be available for any user, not only admin, so save it in the global database not tenant database.

IMPORTANT REQUIREMENTS (read carefully):
1) Seeds must be separated by métier:
   - seed-cabinet-medical.js (full + rich demo data)
   - seed-notaire.js (simple preset + light demo data)
   - seed-app-presets.js (register presets list + settings link + factory reset/install orchestration)
2) The Settings link MUST be added directly in code in the seed:
   - In the Settings page/menu, add at the bottom a link item:
     label: "Modèles prédéfinis d'app"
     slug: "app-presets"
     route: "/settings/app-presets" (or "/app-presets" if your routing requires it)
     icon: something like "sparkles" / "template"
     order: last
3) The "Modèles prédéfinis d'app" page must allow a FACTORY RESET to a chosen preset:
   - When user clicks "Installer Cabinet médical" it should:
     a) wipe/reset ONLY business configuration & demo records for that preset scope (tenant-scoped)
     b) then re-run the preset seed to rebuild menus/entities/layouts/templates/demo records
   - Implement this with a "PresetInstaller" concept in code: an installPreset({tenantId, presetSlug, mode:'factoryReset'})
   - Provide safe deletion rules: delete only docs created by presets (tag them with meta.createdByPreset = presetSlug)
   - Do NOT delete user accounts or auth; only tenant business data tagged as preset data.

NOW: Focus primarily on CABINET MEDICAL preset (complete). NOTAIRE can be simple.

A) CABINET MEDICAL (complete preset)
Create all of these in seed-cabinet-medical.js:
1) Spaces/Folders/MenuItems (professional structure):
   - Activité Clinique: Patients, Rendez-vous, Consultations, Prescriptions, Examens, Dossier médical (360)
   - Documents & Templates: Modèles, Documents patients
   - Facturation: Factures, Paiements, Assurances
   - Organisation: Staff, Planning, Rôles & permissions
   - Stock: Médicaments, Consommables
   - Reporting: KPI, Statistiques
2) Entities (minimum):
   - Patient
   - Appointment
   - Consultation
   - Prescription
   - Medication (a catalog of medications)
   - Invoice
   - Payment
   - Insurance
   - LabResult
   - MedicalDocument
   - TreatmentPlan (or Treatment)
   - Staff
   - StockItem
3) Fields:
   - Add realistic fields per entity (identity, contact, clinical info, vitals, diagnosis, notes, amounts, due dates, etc.)
   - Use types: text, number, date, boolean, select, textarea, relation, currency, richtext
   - Mark required fields properly
4) Classifications:
   - Appointment Status: Scheduled, Confirmed, Completed, Cancelled, No Show
   - Consultation Type: General, Emergency, Follow-up
   - Invoice Status: Draft, Sent, Paid, Overdue
   - Payment Method: Cash, Card, Transfer, Insurance
   - Staff Role: Doctor, Nurse, Secretary, Admin
   - Patient Tags: VIP, Chronic, AllergyRisk
   - Lab Result Type: Blood, Urine, Imaging, Other
5) Relations (minimum):
   - Appointment -> Patient (many-to-one)
   - Consultation -> Patient (many-to-one)
   - Consultation -> Appointment (optional)
   - Prescription -> Consultation (many-to-one)
   - Prescription -> Patient (many-to-one)
   - Prescription lines -> Medication (many-to-one per line)
   - Invoice -> Consultation (many-to-one)
   - Payment -> Invoice (many-to-one)
   - LabResult -> Patient (many-to-one)
   - MedicalDocument -> Patient (many-to-one)
   - TreatmentPlan -> Patient (many-to-one)
   - Staff assignment on Appointment/Consultation (optional)
6) Custom Layout JSON (at least 6 layouts):
   - Patient profile (with tabs/sections: identity, contact, medical history, allergies, timeline)
   - Consultation form (vitals + symptoms + diagnosis + plan)
   - Prescription editor (with medication lines)
   - Invoice view
   - Appointment scheduling
   - Dashboard/Cockpit layout config (widgets list)
   Layout format uses rows/columns/field_id, showLabels, etc.
7) Document Templates (at least 10 templates, stored as records):
   - Ordonnance (with repeated medication lines example)
   - Certificat médical
   - Compte rendu consultation
   - Lettre orientation spécialiste
   - Demande d’examen labo
   - Arrêt de travail
   - Attestation de présence
   - Fiche patient (résumé)
   - Facture PDF template (html)
   - Consentement éclairé
   Include:
   - Variables dictionary record that lists available variables for UI (patient.*, consultation.*, doctor.*, clinic.*)
8) Demo Records (rich dataset, all linked correctly):
   - 15 Patients (realistic names, DOB, phone, tags)
   - 12 Appointments
   - 12 Consultations (linked to patients, some linked to appointments)
   - 10 Prescriptions (linked to consultations + patients) with prescription lines
   - 20 Medications in catalog (name, form, dose, notes, stock thresholds)
   - 10 Invoices + 10 Payments (some partial, some paid, some overdue)
   - 10 LabResults
   - 10 MedicalDocuments
   - 6 TreatmentPlans
   - 4 Staff members
   - 20 StockItems (include medications + consumables)
   Ensure every entity has demo records (no empty entity).
9) Workflows (at least 3):
   - consultation.completed -> generate invoice draft + link it
   - invoice.overdue -> notify secretary + create task/reminder entity (or internal notification)
   - appointment.no_show -> tag patient + create follow-up task
10) Tag every created doc with:
   meta: { createdByPreset: "cabinet-medical", isDemo: true }
   so factory reset can delete safely.

B) NOTAIRE (simple preset)
In seed-notaire.js create:
- Spaces: Clients, Dossiers, Actes, Rendez-vous, Facturation, Documents
- Entities: Client, Dossier, Acte, Appointment, Invoice, Payment, Document
- Minimal fields + basic classifications
- Demo records: 5 clients, 5 dossiers, 5 actes, 4 appointments, 3 invoices, 3 payments, 5 documents
- Tag meta.createdByPreset = "notaire"

C) PRESETS PAGE + FACTORY RESET ORCHESTRATION
In seed-app-presets.js:
1) Register the presets list shown on "/settings/app-presets":
   - cabinet-medical (complete)
   - notaire (simple)
2) Add the Settings bottom link item (must be created/updated in code by seed).
3) Implement installPreset({tenantId, presetSlug, mode}) function:
   - If mode is factoryReset:
     - delete all docs across collections that match tenantId and meta.createdByPreset == presetSlug
     - then call the corresponding seed (seed-cabinet-medical or seed-notaire)
   - Provide safe guards (do not delete auth/users)
4) Exports:
   - module.exports = { seedAppPresets, installPreset }

CODE QUALITY RULES:
- Idempotent: use upsert/findOneAndUpdate with unique keys (tenantId + slug).
- Use async/await; clean structure; helper functions for upsert menu/entity/field/classification/template/record.
- Use in-memory map of created IDs to link relations.
- Add indexes where relevant.
- Output: Provide ONLY code, no explanation outside code.
- Return THREE separate code blocks, each representing one file:
  1) seed-app-presets.js
  2) seed-cabinet-medical.js
  3) seed-notaire.js

Start now.
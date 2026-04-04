/**
 * Seed a SmartDoc demo for the "Consultations" entity
 * 
 * Creates:
 * 1. A document template (isTemplate: true) with tokens
 * 2. A SmartDoc template linking the doc template to the Consultations entity
 * 
 * Usage: node scripts/seed-smartdoc-demo.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load models
require(path.join(__dirname, '../models/document.model.js'));
require(path.join(__dirname, '../models/smart-doc-template.model.js'));

const DB_URL = 'mongodb://127.0.0.1:27017/saas_app_rb_5001';

// Consultations entity ID (from the DB)
const CONSULTATIONS_ENTITY_ID = '6997902086a58861ddebefe7';
const USER_ID = '643c0b36fbde1ceb1bdc97bb';

async function seed() {
    await mongoose.connect(DB_URL);
    console.log('✅ Connected to DB');

    const db = mongoose.connection.db;

    // ──────────────────────────────────────────────
    // 1. Create a Document Template for "Compte-rendu de consultation"
    // ──────────────────────────────────────────────
    const docTemplateContent = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px;">
    <!-- Header -->
    <div style="text-align: center; border-bottom: 3px solid #4361ee; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #4361ee; margin: 0; font-size: 24px; font-weight: 700;">COMPTE-RENDU DE CONSULTATION</h1>
        <p style="color: #888; font-size: 12px; margin-top: 8px;">Document généré automatiquement le {{today}}</p>
    </div>

    <!-- Patient Info -->
    <div style="background: #f8f9ff; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #4361ee;">
        <h3 style="color: #4361ee; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Informations Patient</h3>
        <table style="width: 100%; border: none;">
            <tr>
                <td style="border: none; padding: 4px 0; color: #666; width: 140px; font-size: 13px;">Patient :</td>
                <td style="border: none; padding: 4px 0; font-weight: 600; font-size: 13px;">{{computedTitle}}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 4px 0; color: #666; font-size: 13px;">Date consultation :</td>
                <td style="border: none; padding: 4px 0; font-weight: 600; font-size: 13px;">{{Date}}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 4px 0; color: #666; font-size: 13px;">Médecin :</td>
                <td style="border: none; padding: 4px 0; font-weight: 600; font-size: 13px;">{{medecin}}</td>
            </tr>
        </table>
    </div>

    <!-- Diagnostic -->
    <div style="margin-bottom: 24px;">
        <h3 style="color: #333; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">🔬 Diagnostic</h3>
        <p style="font-size: 13px; line-height: 1.6; color: #444; padding: 8px 0;">{{Diagnostic}}</p>
    </div>

    <!-- Prescription -->
    <div style="margin-bottom: 24px;">
        <h3 style="color: #333; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">💊 Prescription</h3>
        <p style="font-size: 13px; line-height: 1.6; color: #444; padding: 8px 0;">{{Prescription}}</p>
    </div>

    <!-- Notes -->
    <div style="margin-bottom: 24px;">
        <h3 style="color: #333; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">📝 Notes complémentaires</h3>
        <p style="font-size: 13px; line-height: 1.6; color: #444; padding: 8px 0;">{{Notes}}</p>
    </div>

    <!-- Observations (SmartDoc input field) -->
    <div style="margin-bottom: 24px;">
        <h3 style="color: #333; font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">👁️ Observations du médecin</h3>
        <p style="font-size: 13px; line-height: 1.6; color: #444; padding: 8px 0;">{{observations}}</p>
    </div>

    <!-- Footer -->
    <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 40px; text-align: center;">
        <p style="color: #999; font-size: 10px; margin: 0;">Ce document a été généré automatiquement par SmartDoc — {{today}}</p>
        <p style="color: #999; font-size: 10px; margin: 4px 0;">Cabinet Médical — Tous droits réservés {{currentYear}}</p>
    </div>
</div>`;

    const docTemplate = {
        name: 'Compte-rendu de Consultation',
        isTemplate: true,
        entityId: new mongoose.Types.ObjectId(CONSULTATIONS_ENTITY_ID),
        format: 'A4',
        orientation: 'portrait',
        pages: [{
            content: docTemplateContent,
            elements: [],
            order: 0
        }],
        headerHtml: '',
        footerHtml: '',
        createdBy: new mongoose.Types.ObjectId(USER_ID),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    // Check if already exists
    const existingDoc = await db.collection('documents').findOne({
        name: 'Compte-rendu de Consultation',
        isTemplate: true
    });

    let docId;
    if (existingDoc) {
        docId = existingDoc._id;
        console.log('📄 Document template already exists:', docId);
    } else {
        const result = await db.collection('documents').insertOne(docTemplate);
        docId = result.insertedId;
        console.log('📄 Document template created:', docId);
    }

    // ──────────────────────────────────────────────
    // 2. Create SmartDoc Template
    // ──────────────────────────────────────────────
    const existingSmartDoc = await db.collection('smartdoctemplates').findOne({
        name: 'Compte-rendu de consultation',
        entityId: new mongoose.Types.ObjectId(CONSULTATIONS_ENTITY_ID)
    });

    if (existingSmartDoc) {
        console.log('✨ SmartDoc template already exists:', existingSmartDoc._id);
    } else {
        const smartDoc = {
            name: 'Compte-rendu de consultation',
            description: 'Génère un compte-rendu PDF de la consultation avec diagnostic, prescription et notes.',
            icon: 'solar:stethoscope-bold-duotone',
            color: '#4361ee',
            documentId: docId,
            entityId: new mongoose.Types.ObjectId(CONSULTATIONS_ENTITY_ID),
            inputFields: [],
            outputFormat: 'pdf',
            outputNameTemplate: 'Compte-rendu - {{recordTitle}} - {{today}}',
            order: 0,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('smartdoctemplates').insertOne(smartDoc);
        console.log('✨ SmartDoc template created:', result.insertedId);
    }

    // ──────────────────────────────────────────────
    // 3. Also create a simple 1-click SmartDoc (no inputs)
    // ──────────────────────────────────────────────
    const existingQuick = await db.collection('smartdoctemplates').findOne({
        name: 'Attestation de consultation',
        entityId: new mongoose.Types.ObjectId(CONSULTATIONS_ENTITY_ID)
    });

    if (!existingQuick) {
        // Create another doc template for attestation
        const attestationContent = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #10b981; font-size: 22px; margin: 0;">ATTESTATION DE CONSULTATION</h1>
        <div style="width: 60px; height: 3px; background: #10b981; margin: 12px auto;"></div>
    </div>

    <p style="font-size: 13px; line-height: 1.8; color: #333; text-align: justify;">
        Je soussigné(e), médecin traitant, certifie avoir reçu en consultation le patient 
        <strong>{{computedTitle}}</strong> en date du <strong>{{Date}}</strong>.
    </p>

    <p style="font-size: 13px; line-height: 1.8; color: #333; text-align: justify; margin-top: 16px;">
        La présente attestation est délivrée pour servir et valoir ce que de droit.
    </p>

    <div style="margin-top: 60px; text-align: right;">
        <p style="color: #666; font-size: 12px; margin: 0;">Fait le {{today}}</p>
        <p style="color: #666; font-size: 12px; margin: 4px 0 0 0;">Signature du médecin</p>
        <div style="width: 200px; height: 60px; border-bottom: 1px solid #ccc; margin-left: auto; margin-top: 20px;"></div>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 60px; text-align: center;">
        <p style="color: #aaa; font-size: 9px;">Document généré automatiquement — {{currentYear}}</p>
    </div>
</div>`;

        const attestDocResult = await db.collection('documents').insertOne({
            name: 'Attestation de Consultation',
            isTemplate: true,
            entityId: new mongoose.Types.ObjectId(CONSULTATIONS_ENTITY_ID),
            format: 'A4',
            orientation: 'portrait',
            pages: [{ content: attestationContent, elements: [], order: 0 }],
            headerHtml: '',
            footerHtml: '',
            createdBy: new mongoose.Types.ObjectId(USER_ID),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await db.collection('smartdoctemplates').insertOne({
            name: 'Attestation de consultation',
            description: 'Génère une attestation de consultation en 1 clic (sans champs supplémentaires).',
            icon: 'solar:diploma-verified-bold-duotone',
            color: '#10b981',
            documentId: attestDocResult.insertedId,
            entityId: new mongoose.Types.ObjectId(CONSULTATIONS_ENTITY_ID),
            inputFields: [],  // No inputs → 1-click generation
            outputFormat: 'pdf',
            outputNameTemplate: 'Attestation - {{recordTitle}} - {{today}}',
            order: 1,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✨ Quick SmartDoc (Attestation) created');
    } else {
        console.log('✨ Quick SmartDoc (Attestation) already exists');
    }

    console.log('\n🎉 Demo seed complete!');
    console.log('→ Go to a Consultations record to see SmartDoc buttons in the sidebar');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});

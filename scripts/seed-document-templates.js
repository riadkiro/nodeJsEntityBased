/**
 * Seed Document Templates
 * Creates professional document templates for the Studio
 * Usage: node scripts/seed-document-templates.js
 */
const mongoose = require('mongoose');

const TENANT_DB = 'saas_app_rb_5001';

// ============================================
// Template Content Definitions
// ============================================

const templates = [
    {
        name: 'Facture Professionnelle',
        format: 'A4',
        orientation: 'portrait',
        isTemplate: true,
        status: 'published',
        tags: ['facture', 'finance', 'professionnel'],
        metadata: {
            category: 'finance',
            description: 'Modèle de facture complet avec en-tête, tableau de produits et conditions',
            icon: 'tabler:file-invoice',
            color: '#1e40af'
        },
        pages: [{
            mode: 'edition',
            order: 0,
            background: { color: '#ffffff' },
            elements: [],
            rows: [],
            content: `
<div style="margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
        <div>
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e40af;">VOTRE ENTREPRISE</h2>
            <p style="margin:0;font-size:13px;color:#374151;">123 Rue de l'Entreprise</p>
            <p style="margin:0;font-size:13px;color:#374151;">75000 Paris, France</p>
            <p style="margin:4px 0 0;font-size:13px;color:#374151;">SIRET : 000 000 000 00000</p>
            <p style="margin:0;font-size:13px;color:#374151;">TVA : FR00 000000000</p>
        </div>
        <div style="text-align:right;">
            <h1 style="margin:0 0 8px;font-size:32px;font-weight:700;color:#374151;">FACTURE</h1>
            <p style="margin:0;font-size:13px;color:#6b7280;">N° : FAC-2026-001</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">Date : 13/02/2026</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">Échéance : 13/03/2026</p>
        </div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-weight:600;font-size:13px;color:#64748b;">FACTURER À :</p>
        <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">Nom du Client</p>
        <p style="margin:2px 0 0;font-size:13px;color:#475569;">Adresse du client</p>
        <p style="margin:0;font-size:13px;color:#475569;">Code postal, Ville</p>
        <p style="margin:4px 0 0;font-size:13px;color:#475569;">Email : client@email.com</p>
    </div>
</div>

<table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead><tr>
        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#1e40af;color:white;text-align:left;font-weight:600;font-size:14px;">Désignation</th>
        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#1e40af;color:white;text-align:center;font-weight:600;font-size:14px;width:80px;">Qté</th>
        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#1e40af;color:white;text-align:right;font-weight:600;font-size:14px;width:120px;">Prix unit. HT</th>
        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#1e40af;color:white;text-align:right;font-weight:600;font-size:14px;width:120px;">Total HT</th>
    </tr></thead>
    <tbody>
        <tr><td style="border:1px solid #d1d5db;padding:8px 14px;font-size:14px;">Prestation de service 1</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:center;font-size:14px;">1</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">500,00 €</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">500,00 €</td></tr>
        <tr><td style="border:1px solid #d1d5db;padding:8px 14px;font-size:14px;">Prestation de service 2</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:center;font-size:14px;">2</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">250,00 €</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">500,00 €</td></tr>
        <tr><td style="border:1px solid #d1d5db;padding:8px 14px;font-size:14px;">Produit / Article</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:center;font-size:14px;">5</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">100,00 €</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">500,00 €</td></tr>
    </tbody>
    <tfoot>
        <tr><td colspan="3" style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:600;font-size:14px;">Sous-total HT</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:600;font-size:14px;">1 500,00 €</td></tr>
        <tr><td colspan="3" style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">TVA (20%)</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">300,00 €</td></tr>
        <tr><td colspan="3" style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:700;font-size:15px;background:#f3f4f6;">Total TTC</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:700;font-size:15px;background:#f3f4f6;">1 800,00 €</td></tr>
    </tfoot>
</table>

<div style="margin-top:24px;">
    <p style="font-size:14px;font-weight:600;color:#374151;">Conditions de paiement :</p>
    <p style="font-size:13px;color:#6b7280;">Virement bancaire — IBAN : FR76 XXXX XXXX XXXX XXXX XXXX XXX — BIC : XXXXXXXX</p>
</div>

<div style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:48px;text-align:center;font-size:10px;color:#9ca3af;">
    <p style="margin:0;">Votre Entreprise — SIRET : 000 000 000 00000 — TVA : FR00 000000000</p>
    <p style="margin:4px 0 0;">123 Rue de l'Entreprise, 75000 Paris — Tél : 01 23 45 67 89 — contact@entreprise.fr</p>
</div>
            `.trim()
        }]
    },

    {
        name: 'Devis Commercial',
        format: 'A4',
        orientation: 'portrait',
        isTemplate: true,
        status: 'published',
        tags: ['devis', 'commercial', 'professionnel'],
        metadata: {
            category: 'commercial',
            description: 'Modèle de devis avec tableau détaillé et conditions de validité',
            icon: 'tabler:file-description',
            color: '#059669'
        },
        pages: [{
            mode: 'edition',
            order: 0,
            background: { color: '#ffffff' },
            elements: [],
            rows: [],
            content: `
<div style="margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
        <div>
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#059669;">VOTRE ENTREPRISE</h2>
            <p style="margin:0;font-size:13px;color:#374151;">123 Rue de l'Entreprise</p>
            <p style="margin:0;font-size:13px;color:#374151;">75000 Paris, France</p>
            <p style="margin:4px 0 0;font-size:13px;color:#374151;">contact@entreprise.fr</p>
        </div>
        <div style="text-align:right;">
            <h1 style="margin:0 0 8px;font-size:32px;font-weight:700;color:#374151;">DEVIS</h1>
            <p style="margin:0;font-size:13px;color:#6b7280;">Réf : DEV-2026-001</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">Date : 13/02/2026</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">Validité : 30 jours</p>
        </div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-weight:600;font-size:13px;color:#16a34a;">DESTINATAIRE :</p>
        <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">Nom du Client</p>
        <p style="margin:2px 0 0;font-size:13px;color:#475569;">Adresse du client</p>
        <p style="margin:0;font-size:13px;color:#475569;">Code postal, Ville</p>
    </div>
</div>

<p style="font-size:14px;margin-bottom:16px;color:#374151;">Madame, Monsieur,</p>
<p style="font-size:14px;margin-bottom:16px;color:#374151;">Suite à notre échange, nous avons le plaisir de vous adresser notre proposition commerciale pour le projet suivant :</p>

<h3 style="font-size:16px;font-weight:600;color:#059669;margin:24px 0 12px;">Détail de l'offre</h3>

<table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead><tr>
        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#059669;color:white;text-align:left;font-weight:600;font-size:14px;">Désignation</th>
        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#059669;color:white;text-align:center;font-weight:600;font-size:14px;width:80px;">Qté</th>
        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#059669;color:white;text-align:right;font-weight:600;font-size:14px;width:120px;">Prix unit.</th>
        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#059669;color:white;text-align:right;font-weight:600;font-size:14px;width:120px;">Total</th>
    </tr></thead>
    <tbody>
        <tr><td style="border:1px solid #d1d5db;padding:8px 14px;font-size:14px;">Phase 1 — Analyse et conception</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:center;font-size:14px;">1</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">2 000,00 €</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">2 000,00 €</td></tr>
        <tr><td style="border:1px solid #d1d5db;padding:8px 14px;font-size:14px;">Phase 2 — Développement</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:center;font-size:14px;">1</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">5 000,00 €</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">5 000,00 €</td></tr>
        <tr><td style="border:1px solid #d1d5db;padding:8px 14px;font-size:14px;">Phase 3 — Tests et déploiement</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:center;font-size:14px;">1</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">1 500,00 €</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">1 500,00 €</td></tr>
    </tbody>
    <tfoot>
        <tr><td colspan="3" style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:700;font-size:15px;background:#f0fdf4;">Total TTC</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:700;font-size:15px;background:#f0fdf4;">8 500,00 €</td></tr>
    </tfoot>
</table>

<p style="font-size:14px;margin:24px 0 8px;color:#374151;">Ce devis est valable 30 jours à compter de sa date d'émission.</p>
<p style="font-size:14px;color:#374151;">Nous restons à votre disposition pour toute question complémentaire.</p>

<div style="margin:48px 0 16px;">
    <div style="display:flex;justify-content:space-between;gap:40px;">
        <div style="flex:1;">
            <p style="margin:0 0 4px;font-weight:600;font-size:13px;color:#374151;">Bon pour accord</p>
            <div style="border-bottom:1px solid #9ca3af;margin-bottom:8px;min-height:60px;"></div>
            <p style="margin:0;font-size:12px;color:#6b7280;">Signature du client</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Date : ___/___/______</p>
        </div>
        <div style="flex:1;">
            <p style="margin:0 0 4px;font-weight:600;font-size:13px;color:#374151;">L'entreprise</p>
            <div style="border-bottom:1px solid #9ca3af;margin-bottom:8px;min-height:60px;"></div>
            <p style="margin:0;font-size:12px;color:#6b7280;">Signature</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Date : ___/___/______</p>
        </div>
    </div>
</div>
            `.trim()
        }]
    },

    {
        name: 'Compte-Rendu de Réunion',
        format: 'A4',
        orientation: 'portrait',
        isTemplate: true,
        status: 'published',
        tags: ['reunion', 'notes', 'professionnel'],
        metadata: {
            category: 'notes',
            description: 'Modèle de compte-rendu de réunion avec participants, ordre du jour et actions',
            icon: 'tabler:notebook',
            color: '#7c3aed'
        },
        pages: [{
            mode: 'edition',
            order: 0,
            background: { color: '#ffffff' },
            elements: [],
            rows: [],
            content: `
<div style="border-bottom:3px solid #7c3aed;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#374151;">Compte-Rendu de Réunion</h1>
    <p style="margin:0;font-size:14px;color:#6b7280;">Date : 13/02/2026 — Heure : 14h00 - 15h30</p>
    <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">Lieu : Salle de conférence A / Visioconférence</p>
</div>

<div style="display:flex;gap:24px;margin-bottom:24px;">
    <div style="flex:1;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;color:#7c3aed;">Participants présents</p>
        <ul style="margin:0;padding-left:1.2em;font-size:13px;color:#374151;">
            <li style="margin-bottom:4px;">Jean Dupont — Directeur de projet</li>
            <li style="margin-bottom:4px;">Marie Martin — Responsable technique</li>
            <li style="margin-bottom:4px;">Pierre Durand — Chef de produit</li>
            <li style="margin-bottom:4px;">Sophie Bernard — Designer UX</li>
        </ul>
    </div>
    <div style="flex:1;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;color:#92400e;">Excusés</p>
        <ul style="margin:0;padding-left:1.2em;font-size:13px;color:#374151;">
            <li style="margin-bottom:4px;">Lucas Robert — Marketing</li>
        </ul>
        <p style="margin:12px 0 4px;font-weight:600;font-size:14px;color:#92400e;">Rédacteur du CR</p>
        <p style="margin:0;font-size:13px;color:#374151;">Marie Martin</p>
    </div>
</div>

<h2 style="font-size:18px;font-weight:600;color:#7c3aed;margin:24px 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">1. Ordre du jour</h2>
<ol style="padding-left:1.5em;font-size:14px;color:#374151;line-height:1.8;">
    <li>Revue de l'avancement du projet</li>
    <li>Discussion sur les blocages techniques</li>
    <li>Planning de la prochaine itération</li>
    <li>Questions diverses</li>
</ol>

<h2 style="font-size:18px;font-weight:600;color:#7c3aed;margin:24px 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">2. Résumé des discussions</h2>

<h3 style="font-size:15px;font-weight:600;color:#374151;margin:16px 0 8px;">2.1 Avancement du projet</h3>
<p style="font-size:14px;color:#374151;line-height:1.6;">Le projet est avancé à 65%. Les livrables de la phase 2 sont en cours de finalisation. Le calendrier initial est respecté avec un léger décalage de 3 jours sur le module de paiement.</p>

<h3 style="font-size:15px;font-weight:600;color:#374151;margin:16px 0 8px;">2.2 Blocages identifiés</h3>
<div style="margin:8px 0;padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
    <p style="margin:0;font-size:14px;color:#991b1b;">🔴 Intégration API tierce en attente de clés — Responsable : Pierre Durand</p>
</div>
<div style="margin:8px 0;padding:12px 16px;background:#fffbeb;border:1px solid #fed7aa;border-radius:8px;">
    <p style="margin:0;font-size:14px;color:#92400e;">🟡 Tests de performance à planifier — Responsable : Marie Martin</p>
</div>

<h2 style="font-size:18px;font-weight:600;color:#7c3aed;margin:24px 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">3. Actions à suivre</h2>

<table style="width:100%;border-collapse:collapse;margin:8px 0;">
    <thead><tr>
        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#7c3aed;color:white;text-align:left;font-size:13px;font-weight:600;">Action</th>
        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#7c3aed;color:white;text-align:left;font-size:13px;font-weight:600;width:140px;">Responsable</th>
        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#7c3aed;color:white;text-align:center;font-size:13px;font-weight:600;width:100px;">Échéance</th>
    </tr></thead>
    <tbody>
        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Obtenir les clés API</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Pierre D.</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:center;font-size:13px;">15/02</td></tr>
        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Planifier les tests de charge</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Marie M.</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:center;font-size:13px;">17/02</td></tr>
        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Valider les maquettes v2</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Sophie B.</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:center;font-size:13px;">14/02</td></tr>
    </tbody>
</table>

<h2 style="font-size:18px;font-weight:600;color:#7c3aed;margin:24px 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">4. Prochaine réunion</h2>
<p style="font-size:14px;color:#374151;"><strong>Date :</strong> 20/02/2026 à 14h00 — <strong>Lieu :</strong> Salle B / Visioconférence</p>
            `.trim()
        }]
    },

    {
        name: 'Lettre Professionnelle',
        format: 'A4',
        orientation: 'portrait',
        isTemplate: true,
        status: 'published',
        tags: ['lettre', 'courrier', 'professionnel'],
        metadata: {
            category: 'courrier',
            description: 'Modèle de lettre commerciale ou administrative formelle',
            icon: 'tabler:mail',
            color: '#dc2626'
        },
        pages: [{
            mode: 'edition',
            order: 0,
            background: { color: '#ffffff' },
            elements: [],
            rows: [],
            content: `
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;">
    <div>
        <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">Votre Entreprise</p>
        <p style="margin:2px 0;font-size:13px;color:#64748b;">123 Rue de l'Entreprise</p>
        <p style="margin:2px 0;font-size:13px;color:#64748b;">75000 Paris</p>
        <p style="margin:2px 0;font-size:13px;color:#64748b;">Tél : 01 23 45 67 89</p>
        <p style="margin:2px 0;font-size:13px;color:#64748b;">contact@entreprise.fr</p>
    </div>
    <div style="text-align:right;">
        <p style="margin:0;font-size:13px;color:#64748b;">Paris, le 13 février 2026</p>
    </div>
</div>

<div style="margin-bottom:32px;">
    <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">M. / Mme Destinataire</p>
    <p style="margin:2px 0;font-size:13px;color:#64748b;">Fonction / Titre</p>
    <p style="margin:2px 0;font-size:13px;color:#64748b;">Société</p>
    <p style="margin:2px 0;font-size:13px;color:#64748b;">Adresse</p>
    <p style="margin:2px 0;font-size:13px;color:#64748b;">Code postal, Ville</p>
</div>

<p style="font-size:14px;color:#374151;margin-bottom:8px;"><strong>Objet :</strong> Objet de la lettre</p>
<p style="font-size:14px;color:#374151;margin-bottom:8px;"><strong>Réf :</strong> Référence</p>

<br>

<p style="font-size:14px;color:#374151;line-height:1.6;">Madame, Monsieur,</p>

<p style="font-size:14px;color:#374151;line-height:1.6;text-indent:2em;">Nous avons le plaisir de vous contacter au sujet de [objet]. Après examen attentif de votre demande, nous souhaitons vous informer de notre position.</p>

<p style="font-size:14px;color:#374151;line-height:1.6;text-indent:2em;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>

<p style="font-size:14px;color:#374151;line-height:1.6;text-indent:2em;">Nous vous prions de bien vouloir trouver ci-joint les documents relatifs à cette affaire. N'hésitez pas à nous contacter pour toute information complémentaire.</p>

<p style="font-size:14px;color:#374151;line-height:1.6;text-indent:2em;">Dans l'attente de votre retour, nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.</p>

<br><br>

<div style="text-align:right;margin-top:32px;">
    <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">Prénom NOM</p>
    <p style="margin:4px 0;font-size:13px;color:#64748b;">Fonction / Titre</p>
    <div style="border-bottom:1px solid #e5e7eb;width:200px;margin:16px 0 8px auto;min-height:40px;"></div>
    <p style="margin:0;font-size:11px;color:#9ca3af;">Signature</p>
</div>
            `.trim()
        }]
    },

    {
        name: 'Rapport d\'Activité',
        format: 'A4',
        orientation: 'portrait',
        isTemplate: true,
        status: 'published',
        tags: ['rapport', 'activite', 'professionnel'],
        metadata: {
            category: 'rapport',
            description: 'Modèle de rapport d\'activité mensuel ou trimestriel avec KPIs et graphiques',
            icon: 'tabler:chart-bar',
            color: '#0891b2'
        },
        pages: [{
            mode: 'edition',
            order: 0,
            background: { color: '#ffffff' },
            elements: [],
            rows: [],
            content: `
<div style="text-align:center;margin-bottom:32px;padding:32px 0;border-bottom:3px double #0891b2;">
    <h1 style="margin:0 0 8px;font-size:32px;font-weight:700;color:#0891b2;">Rapport d'Activité</h1>
    <p style="margin:0;font-size:16px;color:#6b7280;">Période : Janvier 2026</p>
    <p style="margin:8px 0 0;font-size:14px;color:#9ca3af;">Préparé par : Direction Générale</p>
</div>

<h2 style="font-size:20px;font-weight:600;color:#0891b2;margin:24px 0 16px;">1. Indicateurs clés de performance</h2>

<div style="display:flex;gap:16px;margin-bottom:24px;">
    <div style="flex:1;background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:700;color:#0d9488;">+15%</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Chiffre d'affaires</p>
    </div>
    <div style="flex:1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:700;color:#2563eb;">142</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Nouveaux clients</p>
    </div>
    <div style="flex:1;background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:700;color:#7c3aed;">98%</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Satisfaction client</p>
    </div>
    <div style="flex:1;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:700;color:#dc2626;">3</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Incidents critiques</p>
    </div>
</div>

<h2 style="font-size:20px;font-weight:600;color:#0891b2;margin:24px 0 16px;">2. Résumé des activités</h2>

<h3 style="font-size:16px;font-weight:600;color:#374151;margin:16px 0 8px;">2.1 Développement commercial</h3>
<p style="font-size:14px;color:#374151;line-height:1.6;">Le mois de janvier a été marqué par une forte activité commerciale avec la signature de 12 nouveaux contrats pour un montant total de 450 000 €. Le pipeline de prospection s'est enrichi de 85 nouvelles opportunités qualifiées.</p>

<h3 style="font-size:16px;font-weight:600;color:#374151;margin:16px 0 8px;">2.2 Opérations</h3>
<p style="font-size:14px;color:#374151;line-height:1.6;">La production a maintenu un taux de livraison à temps de 94%, en amélioration de 2 points par rapport au mois précédent. Les temps de traitement moyens ont été réduits de 15%.</p>

<h3 style="font-size:16px;font-weight:600;color:#374151;margin:16px 0 8px;">2.3 Ressources humaines</h3>
<p style="font-size:14px;color:#374151;line-height:1.6;">3 nouveaux collaborateurs ont rejoint l'équipe. Le taux de turnover reste stable à 8% annualisé. Le programme de formation a été déployé auprès de 25 employés.</p>

<h2 style="font-size:20px;font-weight:600;color:#0891b2;margin:24px 0 16px;">3. Résultats financiers</h2>

<table style="width:100%;border-collapse:collapse;margin:8px 0;">
    <thead><tr>
        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#0891b2;color:white;text-align:left;font-size:13px;">Indicateur</th>
        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#0891b2;color:white;text-align:right;font-size:13px;">Réalisé</th>
        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#0891b2;color:white;text-align:right;font-size:13px;">Budget</th>
        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#0891b2;color:white;text-align:right;font-size:13px;">Écart</th>
    </tr></thead>
    <tbody>
        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Chiffre d'affaires</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;">850 000 €</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;">750 000 €</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;color:#16a34a;">+13,3%</td></tr>
        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Marge brute</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;">340 000 €</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;">300 000 €</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;color:#16a34a;">+13,3%</td></tr>
        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;">Charges d'exploitation</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;">280 000 €</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;">260 000 €</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;color:#dc2626;">+7,7%</td></tr>
        <tr style="background:#f0fdfa;"><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;font-weight:700;">Résultat net</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;font-weight:700;">60 000 €</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;font-weight:700;">40 000 €</td><td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;font-weight:700;color:#16a34a;">+50%</td></tr>
    </tbody>
</table>

<h2 style="font-size:20px;font-weight:600;color:#0891b2;margin:24px 0 16px;">4. Priorités pour le mois suivant</h2>
<ol style="padding-left:1.5em;font-size:14px;color:#374151;line-height:2;">
    <li>Lancement de la campagne marketing Q1</li>
    <li>Finalisation du projet client Alpha</li>
    <li>Recrutement de 2 développeurs seniors</li>
    <li>Migration infrastructure cloud</li>
</ol>
            `.trim()
        }]
    }
];

// ============================================
// Main Seed Function
// ============================================

async function seedTemplates() {
    console.log('🔧 Connecting to database:', TENANT_DB);

    const conn = mongoose.createConnection(`mongodb://127.0.0.1:27017/${TENANT_DB}`);
    await new Promise((resolve, reject) => {
        conn.once('open', resolve);
        conn.once('error', reject);
    });

    console.log('✅ Connected');

    const db = conn.db;
    const collection = db.collection('documents');

    // Check how many templates already exist
    const existingCount = await collection.countDocuments({ isTemplate: true });
    console.log(`📊 Existing templates: ${existingCount}`);

    if (existingCount >= templates.length) {
        console.log('⚠️  Templates already seeded. Skipping.');
        await conn.close();
        return;
    }

    // Delete existing templates to re-seed
    if (existingCount > 0) {
        console.log('🗑️  Removing existing templates...');
        await collection.deleteMany({ isTemplate: true });
    }

    // Get a user from the CENTRAL saasDemo database (users are stored centrally, not per tenant)
    const centralConn = mongoose.createConnection('mongodb://127.0.0.1:27017/saasDemo');
    await new Promise((resolve, reject) => {
        centralConn.once('open', resolve);
        centralConn.once('error', reject);
    });

    const usersCollection = centralConn.db.collection('users');
    const user = await usersCollection.findOne({});

    if (!user) {
        console.error('❌ No user found in central database. Cannot seed templates.');
        await centralConn.close();
        await conn.close();
        return;
    }

    console.log(`👤 Using user: ${user.email || user._id}`);

    // Insert templates
    const docsToInsert = templates.map(t => ({
        ...t,
        createdBy: user._id,
        dimensions: { width: 794, height: 1123 },
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    const result = await collection.insertMany(docsToInsert);
    console.log(`✅ Inserted ${result.insertedCount} templates:`);

    templates.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name} (${t.metadata.category})`);
    });

    await centralConn.close();
    await conn.close();
    console.log('✅ Done. Database connections closed.');
}

seedTemplates().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});

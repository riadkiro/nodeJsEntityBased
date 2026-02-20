/**
 * Demo records for each entity template slug.
 * Used by seed-space-templates.js and applySpaceTemplate controller.
 * Production-ready data with realistic French business context.
 */
module.exports = {
    // ══════════════════════════════════════
    // CRM — CONTACTS (15 records)
    // ══════════════════════════════════════
    'tpl-contacts': [
        { title: 'Sophie Martin', customFieldValues: { email: 'sophie.martin@techvision.fr', phone: '+33 6 12 34 56 78', company: 'TechVision SAS', position: 'Directrice Marketing', address: '15 Rue de Rivoli, 75001 Paris', notes: 'Intéressée par notre offre Premium. Rappeler en mars.' }, classificationValues: { status: 'client', source: 'referral' } },
        { title: 'Thomas Dubois', customFieldValues: { email: 'thomas.dubois@innovatech.com', phone: '+33 6 98 76 54 32', company: 'InnovaTech', position: 'CTO', address: '42 Avenue des Champs-Élysées, 75008 Paris', notes: 'Rencontré au salon VivaTech 2025.' }, classificationValues: { status: 'qualified', source: 'event' } },
        { title: 'Marie Lefebvre', customFieldValues: { email: 'marie.lefebvre@greenco.fr', phone: '+33 6 55 44 33 22', company: 'GreenCo', position: 'CEO', address: '8 Place Bellecour, 69002 Lyon', notes: 'PME en forte croissance, 50 employés.' }, classificationValues: { status: 'contacted', source: 'website' } },
        { title: 'Pierre Moreau', customFieldValues: { email: 'pierre.moreau@dataflow.io', phone: '+33 7 11 22 33 44', company: 'DataFlow', position: 'Lead Developer', address: '23 Rue du Faubourg Saint-Honoré, 75008 Paris', notes: 'Cherche solution de gestion de projet.' }, classificationValues: { status: 'new', source: 'social' } },
        { title: 'Camille Bernard', customFieldValues: { email: 'camille.bernard@luxemode.com', phone: '+33 6 77 88 99 00', company: 'LuxeMode', position: 'Responsable Achats', address: '5 Rue de la Paix, 75002 Paris', notes: 'Budget validé pour Q2 2026.' }, classificationValues: { status: 'client', source: 'referral' } },
        { title: 'Julien Petit', customFieldValues: { email: 'julien.petit@cloudnine.fr', phone: '+33 6 33 22 11 00', company: 'CloudNine', position: 'Directeur Commercial', address: '12 Quai de la Daurade, 31000 Toulouse', notes: 'Prospect chaud, démo planifiée.' }, classificationValues: { status: 'qualified', source: 'website' } },
        { title: 'Émilie Roux', customFieldValues: { email: 'emilie.roux@biotech-lab.fr', phone: '+33 6 44 55 66 77', company: 'BioTech Lab', position: 'Directrice R&D', address: '28 Avenue Pasteur, 33000 Bordeaux', notes: 'Secteur pharma, besoin de conformité RGPD.' }, classificationValues: { status: 'contacted', source: 'event' } },
        { title: 'Alexandre Leroy', customFieldValues: { email: 'a.leroy@financeplus.fr', phone: '+33 7 88 77 66 55', company: 'Finance Plus', position: 'Gérant', address: '3 Boulevard Haussmann, 75009 Paris', notes: 'Cabinet comptable, 15 collaborateurs.' }, classificationValues: { status: 'new', source: 'social' } },
        { title: 'Nathalie Mercier', customFieldValues: { email: 'n.mercier@atelier-digital.fr', phone: '+33 6 91 82 73 64', company: 'Atelier Digital', position: 'Fondatrice', address: '17 Rue Sainte-Catherine, 33000 Bordeaux', notes: 'Agence web 25 personnes. Cherche outil de collaboration.' }, classificationValues: { status: 'client', source: 'website' } },
        { title: 'François Girard', customFieldValues: { email: 'f.girard@eurolog.com', phone: '+33 6 15 26 37 48', company: 'EuroLog', position: 'Directeur Logistique', address: '45 Zone Industrielle, 59650 Villeneuve-d\'Ascq', notes: 'Gros volume, besoin de licence 200+ users.' }, classificationValues: { status: 'qualified', source: 'event' } },
        { title: 'Claire Dupuis', customFieldValues: { email: 'claire.dupuis@mediasphere.fr', phone: '+33 6 72 83 94 05', company: 'MediaSphere', position: 'Directrice de Production', address: '120 Avenue de France, 75013 Paris', notes: 'Production audiovisuelle. A besoin de suivi de projets complexes.' }, classificationValues: { status: 'contacted', source: 'referral' } },
        { title: 'Maxime Faure', customFieldValues: { email: 'maxime.faure@nextstep.io', phone: '+33 7 56 43 21 09', company: 'NextStep', position: 'Product Manager', address: '6 Rue de la République, 13001 Marseille', notes: 'Startup IA série A. Budget limité mais fort potentiel.' }, classificationValues: { status: 'new', source: 'social' } },
        { title: 'Isabelle Chevalier', customFieldValues: { email: 'i.chevalier@cabinetrc.fr', phone: '+33 6 34 56 78 90', company: 'Cabinet RC Avocats', position: 'Associée', address: '10 Place Vendôme, 75001 Paris', notes: 'Cabinet d\'avocats, besoin de gestion documentaire sécurisée.' }, classificationValues: { status: 'client', source: 'referral' } },
        { title: 'Rachid Benali', customFieldValues: { email: 'r.benali@construcplus.fr', phone: '+33 6 67 89 01 23', company: 'ConstrucPlus', position: 'Directeur Général', address: '88 Avenue Jean Jaurès, 69007 Lyon', notes: 'BTP 120 employés. Besoin urgent de digitalisation des processus.' }, classificationValues: { status: 'qualified', source: 'website' } },
        { title: 'Valérie Fontaine', customFieldValues: { email: 'v.fontaine@santeclair.fr', phone: '+33 6 45 67 89 01', company: 'SantéClair', position: 'Responsable SI', address: '3 Rue du Docteur Roux, 75015 Paris', notes: 'Réseau de cliniques. Évaluation en cours.' }, classificationValues: { status: 'contacted', source: 'event' } }
    ],

    // ══════════════════════════════════════
    // CRM — OPPORTUNITÉS (12 records)
    // ══════════════════════════════════════
    'tpl-opportunities': [
        { title: 'Contrat TechVision - Licence Enterprise', customFieldValues: { amount: 45000, expected_close: '2026-04-15', probability: 85, description: 'Migration vers notre suite Enterprise pour 200 utilisateurs.' }, classificationValues: { pipeline: 'negotiation' } },
        { title: 'Projet InnovaTech - Intégration API', customFieldValues: { amount: 18500, expected_close: '2026-03-20', probability: 60, description: 'Intégration de notre API dans leur plateforme SaaS existante.' }, classificationValues: { pipeline: 'proposal' } },
        { title: 'GreenCo - Pack PME', customFieldValues: { amount: 12000, expected_close: '2026-05-01', probability: 40, description: 'Offre PME 50 licences + formation sur site.' }, classificationValues: { pipeline: 'qualification' } },
        { title: 'LuxeMode - Renouvellement annuel', customFieldValues: { amount: 36000, expected_close: '2026-06-30', probability: 95, description: 'Renouvellement du contrat annuel + ajout de 30 licences.' }, classificationValues: { pipeline: 'won' } },
        { title: 'CloudNine - POC Data Analytics', customFieldValues: { amount: 8500, expected_close: '2026-03-30', probability: 50, description: 'Proof of concept module analytics sur 3 mois.' }, classificationValues: { pipeline: 'proposal' } },
        { title: 'DataFlow - Licence Startup', customFieldValues: { amount: 5000, expected_close: '2026-02-28', probability: 20, description: 'Évaluation en cours, budget serré.' }, classificationValues: { pipeline: 'prospecting' } },
        { title: 'Atelier Digital - Suite Collaboration', customFieldValues: { amount: 22000, expected_close: '2026-05-15', probability: 70, description: 'Déploiement complet suite collaboration pour 25 utilisateurs + SSO.' }, classificationValues: { pipeline: 'negotiation' } },
        { title: 'EuroLog - Déploiement Logistique', customFieldValues: { amount: 85000, expected_close: '2026-07-01', probability: 55, description: 'Projet de déploiement sur 3 sites, 200+ utilisateurs, intégration SAP.' }, classificationValues: { pipeline: 'qualification' } },
        { title: 'Cabinet RC - Gestion Dossiers', customFieldValues: { amount: 15000, expected_close: '2026-04-01', probability: 80, description: 'Module juridique personnalisé + formation avocats.' }, classificationValues: { pipeline: 'proposal' } },
        { title: 'ConstrucPlus - Transformation Digitale', customFieldValues: { amount: 62000, expected_close: '2026-09-01', probability: 35, description: 'Programme de digitalisation : terrain, chantiers, facturation.' }, classificationValues: { pipeline: 'qualification' } },
        { title: 'MediaSphere - Workflow Production', customFieldValues: { amount: 28000, expected_close: '2026-04-30', probability: 65, description: 'Workflow automatisé de production vidéo avec validations multi-niveaux.' }, classificationValues: { pipeline: 'proposal' } },
        { title: 'NextStep - Offre perdue Q1', customFieldValues: { amount: 9000, expected_close: '2026-02-15', probability: 0, description: 'Budget insuffisant. Parti sur concurrent open-source.' }, classificationValues: { pipeline: 'lost' } }
    ],

    // ══════════════════════════════════════
    // COMPTABILITÉ — FACTURES (12 records)
    // ══════════════════════════════════════
    'tpl-invoices': [
        { title: 'Facture TechVision Q1', customFieldValues: { invoice_number: 'FAC-2026-001', client: 'TechVision SAS', amount_ht: 37500, tax_rate: 20, amount_ttc: 45000, due_date: '2026-03-15', payment_date: '2026-03-10' }, classificationValues: { status: 'paid', type: 'invoice' } },
        { title: 'Facture LuxeMode Annuelle', customFieldValues: { invoice_number: 'FAC-2026-002', client: 'LuxeMode', amount_ht: 30000, tax_rate: 20, amount_ttc: 36000, due_date: '2026-04-01' }, classificationValues: { status: 'sent', type: 'invoice' } },
        { title: 'Devis InnovaTech API', customFieldValues: { invoice_number: 'DEV-2026-003', client: 'InnovaTech', amount_ht: 15416.67, tax_rate: 20, amount_ttc: 18500, due_date: '2026-03-20' }, classificationValues: { status: 'draft', type: 'quote' } },
        { title: 'Facture CloudNine POC', customFieldValues: { invoice_number: 'FAC-2026-004', client: 'CloudNine', amount_ht: 7083.33, tax_rate: 20, amount_ttc: 8500, due_date: '2026-02-28' }, classificationValues: { status: 'overdue', type: 'invoice' } },
        { title: 'Avoir TechVision Remise', customFieldValues: { invoice_number: 'AV-2026-001', client: 'TechVision SAS', amount_ht: -2500, tax_rate: 20, amount_ttc: -3000 }, classificationValues: { status: 'paid', type: 'credit_note' } },
        { title: 'Facture Atelier Digital - Setup', customFieldValues: { invoice_number: 'FAC-2026-005', client: 'Atelier Digital', amount_ht: 8333.33, tax_rate: 20, amount_ttc: 10000, due_date: '2026-03-30', payment_date: '2026-03-28' }, classificationValues: { status: 'paid', type: 'invoice' } },
        { title: 'Acompte ConstrucPlus 30%', customFieldValues: { invoice_number: 'FAC-2026-006', client: 'ConstrucPlus', amount_ht: 15500, tax_rate: 20, amount_ttc: 18600, due_date: '2026-04-15' }, classificationValues: { status: 'sent', type: 'deposit' } },
        { title: 'Devis EuroLog Phase 1', customFieldValues: { invoice_number: 'DEV-2026-007', client: 'EuroLog', amount_ht: 35000, tax_rate: 20, amount_ttc: 42000, due_date: '2026-05-01' }, classificationValues: { status: 'sent', type: 'quote' } },
        { title: 'Facture Cabinet RC Avocats', customFieldValues: { invoice_number: 'FAC-2026-008', client: 'Cabinet RC Avocats', amount_ht: 12500, tax_rate: 20, amount_ttc: 15000, due_date: '2026-04-10' }, classificationValues: { status: 'draft', type: 'invoice' } },
        { title: 'Facture MediaSphere Février', customFieldValues: { invoice_number: 'FAC-2026-009', client: 'MediaSphere', amount_ht: 4166.67, tax_rate: 20, amount_ttc: 5000, due_date: '2026-03-01', payment_date: '2026-02-27' }, classificationValues: { status: 'paid', type: 'invoice' } },
        { title: 'Devis SantéClair Pilote', customFieldValues: { invoice_number: 'DEV-2026-010', client: 'SantéClair', amount_ht: 20000, tax_rate: 20, amount_ttc: 24000, due_date: '2026-05-15' }, classificationValues: { status: 'draft', type: 'quote' } },
        { title: 'Facture GreenCo Formation', customFieldValues: { invoice_number: 'FAC-2026-011', client: 'GreenCo', amount_ht: 3000, tax_rate: 20, amount_ttc: 3600, due_date: '2026-03-05' }, classificationValues: { status: 'overdue', type: 'invoice' } }
    ],

    // ══════════════════════════════════════
    // COMPTABILITÉ — DÉPENSES (12 records)
    // ══════════════════════════════════════
    'tpl-expenses': [
        { title: 'Loyer bureau Paris - Février', customFieldValues: { amount: 4500, date: '2026-02-01', vendor: 'SCI Immobilier Paris', description: 'Loyer mensuel bureau 120m² Paris 9e' }, classificationValues: { category: 'rent' } },
        { title: 'Licences Adobe Creative Cloud', customFieldValues: { amount: 899, date: '2026-02-05', vendor: 'Adobe Systems', description: 'Renouvellement abonnement annuel 15 postes' }, classificationValues: { category: 'supplies' } },
        { title: 'Déplacement client Lyon', customFieldValues: { amount: 345, date: '2026-02-10', vendor: 'SNCF / AccorHotels', description: 'TGV A/R + 1 nuit hôtel pour RDV GreenCo' }, classificationValues: { category: 'transport' } },
        { title: 'Déjeuner équipe commerciale', customFieldValues: { amount: 187, date: '2026-02-12', vendor: 'Restaurant Le Bouillon', description: 'Déjeuner de travail équipe ventes (6 pers.)' }, classificationValues: { category: 'meals' } },
        { title: 'Abonnement téléphonie pro', customFieldValues: { amount: 420, date: '2026-02-15', vendor: 'Orange Business', description: 'Forfaits mobiles x7 collaborateurs' }, classificationValues: { category: 'telecom' } },
        { title: 'Fournitures bureau', customFieldValues: { amount: 156, date: '2026-02-18', vendor: 'Bureau Vallée', description: 'Papier, cartouches, petit matériel' }, classificationValues: { category: 'supplies' } },
        { title: 'Loyer bureau Paris - Mars', customFieldValues: { amount: 4500, date: '2026-03-01', vendor: 'SCI Immobilier Paris', description: 'Loyer mensuel bureau 120m² Paris 9e' }, classificationValues: { category: 'rent' } },
        { title: 'Hébergement Cloud AWS', customFieldValues: { amount: 1890, date: '2026-02-28', vendor: 'Amazon Web Services', description: 'Serveurs prod + staging + CDN, février 2026' }, classificationValues: { category: 'telecom' } },
        { title: 'Déplacement salon VivaTech', customFieldValues: { amount: 1250, date: '2026-02-20', vendor: 'Hôtel Pullman / Uber', description: 'Stand salon + hébergement 3 nuits + déplacement 4 personnes' }, classificationValues: { category: 'transport' } },
        { title: 'Assurance RC Pro annuelle', customFieldValues: { amount: 2400, date: '2026-01-15', vendor: 'AXA Entreprises', description: 'Assurance responsabilité civile professionnelle annuelle' }, classificationValues: { category: 'other' } },
        { title: 'Séminaire team building', customFieldValues: { amount: 3200, date: '2026-02-22', vendor: 'Escape Game Paris', description: 'Activité team building + restaurant équipe complète (14 pers.)' }, classificationValues: { category: 'meals' } },
        { title: 'Licence Figma Enterprise', customFieldValues: { amount: 540, date: '2026-02-01', vendor: 'Figma Inc.', description: 'Abonnement Enterprise 3 designers, annuel' }, classificationValues: { category: 'supplies' } }
    ],

    // ══════════════════════════════════════
    // PROJET — TÂCHES (15 records)
    // ══════════════════════════════════════
    'tpl-tasks': [
        { title: 'Refonte de la page d\'accueil', customFieldValues: { description: 'Redesign complet de la landing page avec nouveau branding.', assignee: 'Marie Lefebvre', due_date: '2026-03-01', estimated_hours: 24 }, classificationValues: { status: 'in_progress', priority: 'high' } },
        { title: 'Intégration API paiement Stripe', customFieldValues: { description: 'Connecter le module de facturation à Stripe pour les paiements automatiques.', assignee: 'Thomas Dubois', due_date: '2026-03-15', estimated_hours: 40 }, classificationValues: { status: 'todo', priority: 'critical' } },
        { title: 'Rédaction documentation technique', customFieldValues: { description: 'Documenter les endpoints API v2 avec exemples Postman.', assignee: 'Pierre Moreau', due_date: '2026-03-10', estimated_hours: 16 }, classificationValues: { status: 'in_progress', priority: 'normal' } },
        { title: 'Tests de charge serveur', customFieldValues: { description: 'Effectuer des tests de performance sur le serveur de production.', assignee: 'Julien Petit', due_date: '2026-02-28', estimated_hours: 8 }, classificationValues: { status: 'review', priority: 'high' } },
        { title: 'Migration base de données v3', customFieldValues: { description: 'Migrer les collections MongoDB vers le nouveau schéma v3.', assignee: 'Thomas Dubois', due_date: '2026-04-01', estimated_hours: 32 }, classificationValues: { status: 'todo', priority: 'critical' } },
        { title: 'Mise à jour dépendances npm', customFieldValues: { description: 'Mettre à jour toutes les dépendances avec audit de sécurité.', assignee: 'Pierre Moreau', due_date: '2026-02-25', estimated_hours: 4 }, classificationValues: { status: 'done', priority: 'normal' } },
        { title: 'Design maquettes mobile', customFieldValues: { description: 'Créer les maquettes Figma pour l\'app mobile iOS/Android.', assignee: 'Marie Lefebvre', due_date: '2026-03-20', estimated_hours: 48 }, classificationValues: { status: 'todo', priority: 'high' } },
        { title: 'Configuration CI/CD pipeline', customFieldValues: { description: 'Mettre en place le pipeline GitLab CI avec déploiement staging automatique.', assignee: 'Julien Petit', due_date: '2026-03-05', estimated_hours: 12 }, classificationValues: { status: 'blocked', priority: 'normal' } },
        { title: 'Implémentation SSO SAML', customFieldValues: { description: 'Ajouter le support SSO via SAML 2.0 pour les clients Enterprise.', assignee: 'Thomas Dubois', due_date: '2026-04-15', estimated_hours: 36 }, classificationValues: { status: 'todo', priority: 'high' } },
        { title: 'Optimisation SEO pages marketing', customFieldValues: { description: 'Audit SEO + implémentation des recommandations (meta, schema, vitesse).', assignee: 'Marie Lefebvre', due_date: '2026-03-25', estimated_hours: 12 }, classificationValues: { status: 'in_progress', priority: 'normal' } },
        { title: 'Module export PDF rapports', customFieldValues: { description: 'Permettre l\'export PDF des tableaux de bord et rapports personnalisés.', assignee: 'Pierre Moreau', due_date: '2026-04-10', estimated_hours: 20 }, classificationValues: { status: 'todo', priority: 'normal' } },
        { title: 'Correction bug pagination DataGrid', customFieldValues: { description: 'La pagination saute de la page 2 à la page 4 quand on filtre par statut.', assignee: 'Thomas Dubois', due_date: '2026-02-22', estimated_hours: 3 }, classificationValues: { status: 'done', priority: 'high' } },
        { title: 'Audit accessibilité WCAG 2.1', customFieldValues: { description: 'Vérifier la conformité WCAG AA sur toutes les pages publiques.', assignee: 'Marie Lefebvre', due_date: '2026-05-01', estimated_hours: 24 }, classificationValues: { status: 'todo', priority: 'low' } },
        { title: 'Notifications push mobile', customFieldValues: { description: 'Intégrer Firebase Cloud Messaging pour les notifications push.', assignee: 'Julien Petit', due_date: '2026-04-20', estimated_hours: 16 }, classificationValues: { status: 'todo', priority: 'normal' } },
        { title: 'Revue de code module facturation', customFieldValues: { description: 'Relecture complète du module facturation avant release. Focus sécurité.', assignee: 'Pierre Moreau', due_date: '2026-03-08', estimated_hours: 8 }, classificationValues: { status: 'review', priority: 'critical' } }
    ],

    // ══════════════════════════════════════
    // PROJET — JALONS (6 records)
    // ══════════════════════════════════════
    'tpl-milestones': [
        { title: 'MVP - Version Beta', customFieldValues: { description: 'Lancement de la version beta avec les fonctionnalités core.', target_date: '2026-03-31', progress: 75 }, classificationValues: { status: 'in_progress' } },
        { title: 'Lancement officiel v1.0', customFieldValues: { description: 'Release publique avec documentation et support client.', target_date: '2026-06-01', progress: 30 }, classificationValues: { status: 'planned' } },
        { title: 'Intégration marketplace', customFieldValues: { description: 'Publication sur les marketplaces partenaires.', target_date: '2026-09-01', progress: 10 }, classificationValues: { status: 'planned' } },
        { title: 'Certification sécurité ISO 27001', customFieldValues: { description: 'Obtention certification sécurité pour clients enterprise.', target_date: '2026-12-01', progress: 5 }, classificationValues: { status: 'planned' } },
        { title: 'Application mobile v1', customFieldValues: { description: 'Publication première version iOS et Android sur les stores.', target_date: '2026-08-01', progress: 15 }, classificationValues: { status: 'in_progress' } },
        { title: 'Ouverture API publique', customFieldValues: { description: 'Mise à disposition de l\'API publique avec portail développeur et documentation.', target_date: '2026-07-15', progress: 40 }, classificationValues: { status: 'in_progress' } }
    ],

    // ══════════════════════════════════════
    // RH — EMPLOYÉS (12 records)
    // ══════════════════════════════════════
    'tpl-employees': [
        { title: 'Sophie Martin', customFieldValues: { email: 'sophie.martin@company.fr', phone: '+33 6 12 34 56 78', department: 'Marketing', position: 'Directrice Marketing', start_date: '2022-03-15', salary: 5800 }, classificationValues: { status: 'active', contract_type: 'cdi' } },
        { title: 'Thomas Dubois', customFieldValues: { email: 'thomas.dubois@company.fr', phone: '+33 6 98 76 54 32', department: 'Technique', position: 'Lead Developer', start_date: '2021-09-01', salary: 5200 }, classificationValues: { status: 'active', contract_type: 'cdi' } },
        { title: 'Marie Lefebvre', customFieldValues: { email: 'marie.lefebvre@company.fr', phone: '+33 6 55 44 33 22', department: 'Design', position: 'UX Designer Senior', start_date: '2023-01-10', salary: 4500 }, classificationValues: { status: 'active', contract_type: 'cdi' } },
        { title: 'Pierre Moreau', customFieldValues: { email: 'pierre.moreau@company.fr', phone: '+33 7 11 22 33 44', department: 'Technique', position: 'Développeur Backend', start_date: '2024-06-01', salary: 3800 }, classificationValues: { status: 'active', contract_type: 'cdi' } },
        { title: 'Camille Bernard', customFieldValues: { email: 'camille.bernard@company.fr', phone: '+33 6 77 88 99 00', department: 'Commercial', position: 'Account Manager', start_date: '2023-09-15', salary: 4200 }, classificationValues: { status: 'on_leave', contract_type: 'cdi' } },
        { title: 'Lucas Durand', customFieldValues: { email: 'lucas.durand@company.fr', phone: '+33 6 66 55 44 33', department: 'Technique', position: 'Stagiaire DevOps', start_date: '2026-01-15', salary: 1200 }, classificationValues: { status: 'trial', contract_type: 'internship' } },
        { title: 'Emma Girard', customFieldValues: { email: 'emma.girard@company.fr', phone: '+33 7 22 33 44 55', department: 'RH', position: 'Responsable RH', start_date: '2020-11-01', salary: 5000 }, classificationValues: { status: 'active', contract_type: 'cdi' } },
        { title: 'Antoine Marchand', customFieldValues: { email: 'antoine.marchand@company.fr', phone: '+33 6 82 93 04 15', department: 'Technique', position: 'Développeur Frontend', start_date: '2024-09-01', salary: 3600 }, classificationValues: { status: 'active', contract_type: 'cdi' } },
        { title: 'Laura Petit', customFieldValues: { email: 'laura.petit@company.fr', phone: '+33 6 51 62 73 84', department: 'Commercial', position: 'Business Developer', start_date: '2025-03-01', salary: 3400 }, classificationValues: { status: 'active', contract_type: 'cdi' } },
        { title: 'Youssef Amrani', customFieldValues: { email: 'youssef.amrani@company.fr', phone: '+33 7 41 52 63 74', department: 'Technique', position: 'Ingénieur QA', start_date: '2025-06-15', salary: 3900 }, classificationValues: { status: 'trial', contract_type: 'cdd' } },
        { title: 'Charlotte Blanc', customFieldValues: { email: 'charlotte.blanc@company.fr', phone: '+33 6 95 06 17 28', department: 'Marketing', position: 'Community Manager', start_date: '2025-01-10', salary: 2800 }, classificationValues: { status: 'active', contract_type: 'cdi' } },
        { title: 'David Chen', customFieldValues: { email: 'david.chen@company.fr', phone: '+33 7 63 74 85 96', department: 'Technique', position: 'DevOps Engineer', start_date: '2023-06-01', salary: 4800 }, classificationValues: { status: 'active', contract_type: 'cdi' } }
    ],

    // ══════════════════════════════════════
    // RH — CONGÉS (10 records)
    // ══════════════════════════════════════
    'tpl-leave-requests': [
        { title: 'Congé Camille Bernard - Février', customFieldValues: { start_date: '2026-02-17', end_date: '2026-02-28', days_count: 10, reason: 'Vacances familiales au ski' }, classificationValues: { status: 'approved', leave_type: 'paid' } },
        { title: 'Congé Thomas Dubois - Mars', customFieldValues: { start_date: '2026-03-10', end_date: '2026-03-14', days_count: 5, reason: 'Repos personnel' }, classificationValues: { status: 'pending', leave_type: 'paid' } },
        { title: 'Arrêt maladie Pierre Moreau', customFieldValues: { start_date: '2026-02-20', end_date: '2026-02-21', days_count: 2, reason: 'Grippe saisonnière' }, classificationValues: { status: 'approved', leave_type: 'sick' } },
        { title: 'Congé exceptionnel Emma Girard', customFieldValues: { start_date: '2026-04-05', end_date: '2026-04-07', days_count: 3, reason: 'Mariage' }, classificationValues: { status: 'approved', leave_type: 'special' } },
        { title: 'Congé Sophie Martin - Avril', customFieldValues: { start_date: '2026-04-14', end_date: '2026-04-25', days_count: 10, reason: 'Voyage au Japon planifié depuis longtemps' }, classificationValues: { status: 'approved', leave_type: 'paid' } },
        { title: 'Congé sans solde Lucas Durand', customFieldValues: { start_date: '2026-05-05', end_date: '2026-05-09', days_count: 5, reason: 'Projet personnel - concours' }, classificationValues: { status: 'pending', leave_type: 'unpaid' } },
        { title: 'Arrêt maladie Marie Lefebvre', customFieldValues: { start_date: '2026-03-03', end_date: '2026-03-05', days_count: 3, reason: 'Angine + fièvre' }, classificationValues: { status: 'approved', leave_type: 'sick' } },
        { title: 'Congé Antoine Marchand - Mars', customFieldValues: { start_date: '2026-03-24', end_date: '2026-03-28', days_count: 5, reason: 'Vacances familiales' }, classificationValues: { status: 'pending', leave_type: 'paid' } },
        { title: 'Congé Laura Petit - Été', customFieldValues: { start_date: '2026-07-14', end_date: '2026-07-25', days_count: 10, reason: 'Vacances été, Corse' }, classificationValues: { status: 'pending', leave_type: 'paid' } },
        { title: 'Congé David Chen refusé', customFieldValues: { start_date: '2026-03-17', end_date: '2026-03-21', days_count: 5, reason: 'Voyage personnel' }, classificationValues: { status: 'refused', leave_type: 'paid' } }
    ],

    // ══════════════════════════════════════
    // MÉDICAL — PATIENTS (10 records)
    // ══════════════════════════════════════
    'tpl-patients': [
        { title: 'Jean-Pierre Dupont', customFieldValues: { birth_date: '1965-08-12', phone: '+33 6 12 45 78 90', email: 'jp.dupont@email.fr', address: '10 Rue de la Santé, 75013 Paris', blood_type: 'A+', allergies: 'Pénicilline', medical_notes: 'Hypertension traitée, suivi mensuel.' }, classificationValues: { status: 'active' } },
        { title: 'Isabelle Fournier', customFieldValues: { birth_date: '1978-03-22', phone: '+33 6 98 12 34 56', email: 'i.fournier@email.fr', address: '5 Avenue Victor Hugo, 69006 Lyon', blood_type: 'O-', allergies: 'Aucune connue', medical_notes: 'Suivi diabète type 2. HbA1c trimestrielle.' }, classificationValues: { status: 'in_treatment' } },
        { title: 'Marc Lecomte', customFieldValues: { birth_date: '1990-11-05', phone: '+33 7 22 33 44 55', email: 'marc.lecomte@email.fr', address: '18 Rue Gambetta, 33000 Bordeaux', blood_type: 'B+', allergies: 'Aspirine, Latex', medical_notes: 'Sportif, entorse récurrente genou droit.' }, classificationValues: { status: 'active' } },
        { title: 'Élise Morel', customFieldValues: { birth_date: '1955-06-30', phone: '+33 6 44 55 66 77', email: 'elise.morel@email.fr', address: '7 Place du Capitole, 31000 Toulouse', blood_type: 'AB+', allergies: 'Sulfamides', medical_notes: 'Arthrose cervicale et lombaire. Traitement anti-inflammatoire.' }, classificationValues: { status: 'active' } },
        { title: 'Nicolas Garnier', customFieldValues: { birth_date: '1982-01-17', phone: '+33 6 88 77 66 55', email: 'n.garnier@email.fr', address: '22 Boulevard de la Liberté, 59000 Lille', blood_type: 'A-', allergies: 'Aucune connue', medical_notes: 'Bilan annuel à programmer.' }, classificationValues: { status: 'active' } },
        { title: 'Catherine Lambert', customFieldValues: { birth_date: '1970-09-14', phone: '+33 6 31 42 53 64', email: 'c.lambert@email.fr', address: '3 Rue Pasteur, 13008 Marseille', blood_type: 'O+', allergies: 'Iode, fruits de mer', medical_notes: 'Asthme chronique. Suivi pneumologue annuel. Ventoline en cas de crise.' }, classificationValues: { status: 'in_treatment' } },
        { title: 'Philippe Rousseau', customFieldValues: { birth_date: '1948-12-03', phone: '+33 6 75 86 97 08', email: 'p.rousseau@email.fr', address: '14 Rue de la Mairie, 44000 Nantes', blood_type: 'A+', allergies: 'Codéine', medical_notes: 'Post-opération hanche gauche (déc. 2025). Rééducation en cours.' }, classificationValues: { status: 'in_treatment' } },
        { title: 'Amina Benali', customFieldValues: { birth_date: '1995-04-28', phone: '+33 7 19 28 37 46', email: 'a.benali@email.fr', address: '9 Avenue de la Gare, 67000 Strasbourg', blood_type: 'B-', allergies: 'Aucune connue', medical_notes: 'Grossesse 6 mois. Suivi mensuel normal. Échographie prévue mars.' }, classificationValues: { status: 'active' } },
        { title: 'Robert Mercier', customFieldValues: { birth_date: '1940-02-15', phone: '+33 6 52 63 74 85', email: 'r.mercier@email.fr', address: '6 Place de la République, 35000 Rennes', blood_type: 'AB-', allergies: 'Pénicilline, Morphine', medical_notes: 'Insuffisance cardiaque stade II. Traitement digitaline + diurétiques.' }, classificationValues: { status: 'in_treatment' } },
        { title: 'Julie Perrin', customFieldValues: { birth_date: '2010-07-21', phone: '+33 6 63 74 85 96', email: 'parents.perrin@email.fr', address: '11 Rue des Écoles, 75005 Paris', blood_type: 'O+', allergies: 'Arachides', medical_notes: 'Patiente mineure. Allergie sévère arachides - stylo Epipen prescrit. Vaccins à jour.' }, classificationValues: { status: 'active' } }
    ],

    // ══════════════════════════════════════
    // MÉDICAL — CONSULTATIONS (12 records)
    // ══════════════════════════════════════
    'tpl-consultations': [
        { title: 'Consultation Dupont - Contrôle tension', customFieldValues: { date: '2026-02-18', diagnosis: 'Tension artérielle stabilisée à 13/8. Continuer traitement actuel.', prescription: 'Amlodipine 5mg 1/jour, contrôle dans 1 mois.', notes: 'Patient en bonne forme générale.' }, classificationValues: { type: 'followup' } },
        { title: 'Consultation Fournier - Suivi diabète', customFieldValues: { date: '2026-02-15', diagnosis: 'HbA1c à 7.2%, légère amélioration. Ajustement Metformine.', prescription: 'Metformine 1000mg 2/jour, bilan sanguin dans 3 mois.', notes: 'Revoir régime alimentaire. Orienter vers diététicienne.' }, classificationValues: { type: 'followup' } },
        { title: 'Consultation Lecomte - Douleur genou', customFieldValues: { date: '2026-02-19', diagnosis: 'Entorse bénigne du LLE genou droit. Pas de rupture ligamentaire.', prescription: 'Ibuprofène 400mg si douleur, attelle 2 semaines, kinésithérapie x10.', notes: 'IRM si pas d\'amélioration sous 3 semaines.' }, classificationValues: { type: 'consultation' } },
        { title: 'Urgence Morel - Douleur abdominale', customFieldValues: { date: '2026-02-17', diagnosis: 'Colite aiguë. Pas de signe de gravité.', prescription: 'Spasfon 3/jour, régime sans résidu 5 jours.', notes: 'Orientation gastro-entérologue si récidive.' }, classificationValues: { type: 'emergency' } },
        { title: 'Consultation Lambert - Bilan asthme', customFieldValues: { date: '2026-02-20', diagnosis: 'Asthme stable sous traitement. DEP 85%. Pas de crise ce mois.', prescription: 'Seretide 250 2/jour, Ventoline si besoin. Renouvellement 6 mois.', notes: 'Prochaine spirométrie dans 6 mois chez le pneumologue.' }, classificationValues: { type: 'checkup' } },
        { title: 'Suivi Rousseau - Rééducation hanche', customFieldValues: { date: '2026-02-14', diagnosis: 'Bonne récupération post-PTH. Mobilité en amélioration. Marche avec 1 canne.', prescription: 'Kinésithérapie 3/semaine, Doliprane 1g si douleur. Contrôle radio mars.', notes: 'Retrait de la canne prévu dans 4 semaines si progression continue.' }, classificationValues: { type: 'followup' } },
        { title: 'Consultation Benali - Suivi grossesse M6', customFieldValues: { date: '2026-02-12', diagnosis: 'Grossesse 26 SA, évolution normale. Prise de poids +8kg. Tension 11/7.', prescription: 'Acide folique, fer Tardyfer 80mg 1/jour. Écho morpho à programmer.', notes: 'Tout est normal. Prochaine consultation dans 4 semaines.' }, classificationValues: { type: 'followup' } },
        { title: 'Urgence Perrin - Réaction allergique', customFieldValues: { date: '2026-02-16', diagnosis: 'Réaction allergique modérée (urticaire généralisé) après contact arachides.', prescription: 'Cétirizine 10mg 1/jour 5 jours, Prednisolone 20mg 3 jours. Vérifier Epipen.', notes: 'Rappel aux parents : éviction stricte arachides. PAI scolaire à renouveler.' }, classificationValues: { type: 'emergency' } },
        { title: 'Consultation Mercier - Contrôle cardiaque', customFieldValues: { date: '2026-02-10', diagnosis: 'Insuffisance cardiaque stable. Pas d\'œdèmes. Poids stable.', prescription: 'Digitaline, Furosémide 40mg, Ramipril 5mg. ECG de contrôle dans 2 mois.', notes: 'Surveiller le poids quotidiennement. Consulter si prise >2kg en 3 jours.' }, classificationValues: { type: 'followup' } },
        { title: 'Consultation Garnier - Bilan annuel', customFieldValues: { date: '2026-02-21', diagnosis: 'Bilan général satisfaisant. Légère surcharge pondérale (IMC 27).', prescription: 'Bilan sanguin complet (NFS, lipides, glycémie, thyroïde). RDV diététicienne.', notes: 'Conseils hygiène de vie : activité physique 3x/semaine, réduction sucres.' }, classificationValues: { type: 'checkup' } },
        { title: 'Consultation Dupont - Renouvellement', customFieldValues: { date: '2026-01-15', diagnosis: 'Tension 14/9, légèrement élevée. Stress professionnel rapporté.', prescription: 'Amlodipine 5mg. Ajout Lexomil 6mg si anxiété. Contrôle dans 1 mois.', notes: 'Discuter gestion du stress au prochain RDV.' }, classificationValues: { type: 'consultation' } },
        { title: 'Consultation Morel - Contrôle post-colite', customFieldValues: { date: '2026-03-01', diagnosis: 'Résolution complète de la colite. Transit normalisé.', prescription: 'Pas de traitement. Reprendre alimentation normale progressivement.', notes: 'Pas de récidive. Dossier clos sauf nouvel épisode.' }, classificationValues: { type: 'checkup' } }
    ],

    // ══════════════════════════════════════
    // LOGISTIQUE — PRODUITS (12 records)
    // ══════════════════════════════════════
    'tpl-products': [
        { title: 'MacBook Pro 14" M3 Pro', customFieldValues: { sku: 'TECH-MBP14-001', price: 2499, stock: 25, description: 'MacBook Pro 14 pouces, puce M3 Pro, 18Go RAM, 512Go SSD', weight: 1.6 }, classificationValues: { status: 'available' } },
        { title: 'Écran Dell UltraSharp 27"', customFieldValues: { sku: 'TECH-DU27-002', price: 649, stock: 42, description: 'Moniteur 4K USB-C, calibré usine, pivot/rotation', weight: 6.8 }, classificationValues: { status: 'available' } },
        { title: 'Clavier Logitech MX Keys', customFieldValues: { sku: 'ACC-LKMX-003', price: 119, stock: 8, description: 'Clavier sans fil rétroéclairé, multi-device, rechargeable', weight: 0.8 }, classificationValues: { status: 'low_stock' } },
        { title: 'Souris Logitech MX Master 3S', customFieldValues: { sku: 'ACC-LMM3-004', price: 99, stock: 0, description: 'Souris ergonomique sans fil, capteur 8000 DPI, USB-C', weight: 0.14 }, classificationValues: { status: 'out_of_stock' } },
        { title: 'Câble USB-C Thunderbolt 4', customFieldValues: { sku: 'ACC-TB4C-005', price: 35, stock: 150, description: 'Câble Thunderbolt 4, 1m, 40Gbps, charge 100W', weight: 0.05 }, classificationValues: { status: 'available' } },
        { title: 'Station d\'accueil CalDigit TS4', customFieldValues: { sku: 'ACC-CDTS-006', price: 399, stock: 3, description: 'Dock Thunderbolt 4, 18 ports, charge 98W', weight: 0.65 }, classificationValues: { status: 'low_stock' } },
        { title: 'iPhone 15 Pro 256Go', customFieldValues: { sku: 'TECH-IP15P-007', price: 1329, stock: 18, description: 'iPhone 15 Pro, titane naturel, 256Go, puce A17 Pro', weight: 0.19 }, classificationValues: { status: 'available' } },
        { title: 'iPad Air M2 11"', customFieldValues: { sku: 'TECH-IPA2-008', price: 699, stock: 12, description: 'iPad Air 11 pouces, puce M2, 128Go, Wi-Fi', weight: 0.46 }, classificationValues: { status: 'available' } },
        { title: 'Casque Sony WH-1000XM5', customFieldValues: { sku: 'AUD-SNXM-009', price: 349, stock: 5, description: 'Casque Bluetooth ANC, 30h autonomie, multipoint', weight: 0.25 }, classificationValues: { status: 'low_stock' } },
        { title: 'Webcam Logitech Brio 4K', customFieldValues: { sku: 'ACC-LBRI-010', price: 199, stock: 0, description: 'Webcam 4K HDR, autofocus, Windows Hello, clip universel', weight: 0.06 }, classificationValues: { status: 'out_of_stock' } },
        { title: 'Chaise ergonomique Herman Miller', customFieldValues: { sku: 'MOB-HMAE-011', price: 1590, stock: 4, description: 'Aeron Remastered, taille B, graphite, garantie 12 ans', weight: 13.6 }, classificationValues: { status: 'available' } },
        { title: 'Bureau assis-debout Flexispot E7', customFieldValues: { sku: 'MOB-FLE7-012', price: 579, stock: 0, description: 'Bureau motorisé 140x70cm, mémoire 4 positions, charge 125kg', weight: 32.5 }, classificationValues: { status: 'discontinued' } }
    ],

    // ══════════════════════════════════════
    // LOGISTIQUE — COMMANDES (10 records)
    // ══════════════════════════════════════
    'tpl-orders': [
        { title: 'Commande TechVision - Équipement bureau', customFieldValues: { order_number: 'CMD-2026-001', client: 'TechVision SAS', total: 15890, order_date: '2026-02-10', delivery_date: '2026-02-18', shipping_address: '15 Rue de Rivoli, 75001 Paris' }, classificationValues: { status: 'delivered' } },
        { title: 'Commande GreenCo - Postes développeurs', customFieldValues: { order_number: 'CMD-2026-002', client: 'GreenCo', total: 8745, order_date: '2026-02-15', delivery_date: '2026-02-25', shipping_address: '8 Place Bellecour, 69002 Lyon' }, classificationValues: { status: 'shipped' } },
        { title: 'Commande InnovaTech - Accessoires', customFieldValues: { order_number: 'CMD-2026-003', client: 'InnovaTech', total: 2340, order_date: '2026-02-18', delivery_date: '2026-02-28', shipping_address: '42 Av. Champs-Élysées, 75008 Paris' }, classificationValues: { status: 'preparing' } },
        { title: 'Commande LuxeMode - Moniteurs', customFieldValues: { order_number: 'CMD-2026-004', client: 'LuxeMode', total: 3894, order_date: '2026-02-19', shipping_address: '5 Rue de la Paix, 75002 Paris' }, classificationValues: { status: 'received' } },
        { title: 'Retour DataFlow - Clavier défectueux', customFieldValues: { order_number: 'CMD-2026-R01', client: 'DataFlow', total: -119, order_date: '2026-02-12', shipping_address: '23 Rue du Fg St-Honoré, 75008 Paris' }, classificationValues: { status: 'returned' } },
        { title: 'Commande EuroLog - Mobilier complet', customFieldValues: { order_number: 'CMD-2026-005', client: 'EuroLog', total: 28450, order_date: '2026-02-20', delivery_date: '2026-03-10', shipping_address: '45 Zone Industrielle, 59650 Villeneuve-d\'Ascq' }, classificationValues: { status: 'preparing' } },
        { title: 'Commande Atelier Digital - iMac x5', customFieldValues: { order_number: 'CMD-2026-006', client: 'Atelier Digital', total: 12495, order_date: '2026-02-22', delivery_date: '2026-03-01', shipping_address: '17 Rue Sainte-Catherine, 33000 Bordeaux' }, classificationValues: { status: 'shipped' } },
        { title: 'Commande Cabinet RC - iPads', customFieldValues: { order_number: 'CMD-2026-007', client: 'Cabinet RC Avocats', total: 4194, order_date: '2026-02-25', delivery_date: '2026-03-05', shipping_address: '10 Place Vendôme, 75001 Paris' }, classificationValues: { status: 'delivered' } },
        { title: 'Commande ConstrucPlus - Rugged', customFieldValues: { order_number: 'CMD-2026-008', client: 'ConstrucPlus', total: 9870, order_date: '2026-03-01', shipping_address: '88 Avenue Jean Jaurès, 69007 Lyon' }, classificationValues: { status: 'received' } },
        { title: 'Commande MediaSphere - Audio/Vidéo', customFieldValues: { order_number: 'CMD-2026-009', client: 'MediaSphere', total: 6540, order_date: '2026-02-28', delivery_date: '2026-03-08', shipping_address: '120 Avenue de France, 75013 Paris' }, classificationValues: { status: 'shipped' } }
    ]
};

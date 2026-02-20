/**
 * Demo record relation links.
 * Maps source record titles → target record titles for cross-entity relations.
 * Used by applySpaceTemplate to populate Record.relations after all demo records are created.
 *
 * Format:
 *   'source-entity-template-slug': [
 *     { title: 'Record Title', links: { relationFieldName: 'Target Record Title' | ['Title1', 'Title2'] } }
 *   ]
 */
module.exports = {
    // ═══════════════════════════════════════
    // CRM: Opportunités → Contacts
    // ═══════════════════════════════════════
    'tpl-opportunities': [
        { title: 'Contrat TechVision - Licence Enterprise', links: { contact: 'Sophie Martin' } },
        { title: 'Projet InnovaTech - Intégration API', links: { contact: 'Thomas Dubois' } },
        { title: 'GreenCo - Pack PME', links: { contact: 'Marie Lefebvre' } },
        { title: 'LuxeMode - Renouvellement annuel', links: { contact: 'Camille Bernard' } },
        { title: 'CloudNine - POC Data Analytics', links: { contact: 'Julien Petit' } },
        { title: 'DataFlow - Licence Startup', links: { contact: 'Pierre Moreau' } },
        { title: 'Atelier Digital - Suite Collaboration', links: { contact: 'Nathalie Mercier' } },
        { title: 'EuroLog - Déploiement Logistique', links: { contact: 'François Girard' } },
        { title: 'Cabinet RC - Gestion Dossiers', links: { contact: 'Isabelle Chevalier' } },
        { title: 'ConstrucPlus - Transformation Digitale', links: { contact: 'Rachid Benali' } },
        { title: 'MediaSphere - Workflow Production', links: { contact: 'Claire Dupuis' } },
        { title: 'NextStep - Offre perdue Q1', links: { contact: 'Maxime Faure' } }
    ],

    // ═══════════════════════════════════════
    // Projet: Tâches → Jalons
    // ═══════════════════════════════════════
    'tpl-tasks': [
        { title: 'Refonte de la page d\'accueil', links: { milestone: 'MVP - Version Beta' } },
        { title: 'Intégration API paiement Stripe', links: { milestone: 'MVP - Version Beta' } },
        { title: 'Rédaction documentation technique', links: { milestone: 'Ouverture API publique' } },
        { title: 'Tests de charge serveur', links: { milestone: 'MVP - Version Beta' } },
        { title: 'Migration base de données v3', links: { milestone: 'Lancement officiel v1.0' } },
        { title: 'Mise à jour dépendances npm', links: { milestone: 'MVP - Version Beta' } },
        { title: 'Design maquettes mobile', links: { milestone: 'Application mobile v1' } },
        { title: 'Configuration CI/CD pipeline', links: { milestone: 'MVP - Version Beta' } },
        { title: 'Implémentation SSO SAML', links: { milestone: 'Lancement officiel v1.0' } },
        { title: 'Optimisation SEO pages marketing', links: { milestone: 'Lancement officiel v1.0' } },
        { title: 'Module export PDF rapports', links: { milestone: 'Lancement officiel v1.0' } },
        { title: 'Correction bug pagination DataGrid', links: { milestone: 'MVP - Version Beta' } },
        { title: 'Audit accessibilité WCAG 2.1', links: { milestone: 'Certification sécurité ISO 27001' } },
        { title: 'Notifications push mobile', links: { milestone: 'Application mobile v1' } },
        { title: 'Revue de code module facturation', links: { milestone: 'MVP - Version Beta' } }
    ],

    // ═══════════════════════════════════════
    // RH: Congés → Employés
    // ═══════════════════════════════════════
    'tpl-leave-requests': [
        { title: 'Congé Camille Bernard - Février', links: { employee: 'Camille Bernard' } },
        { title: 'Congé Thomas Dubois - Mars', links: { employee: 'Thomas Dubois' } },
        { title: 'Arrêt maladie Pierre Moreau', links: { employee: 'Pierre Moreau' } },
        { title: 'Congé exceptionnel Emma Girard', links: { employee: 'Emma Girard' } },
        { title: 'Congé Sophie Martin - Avril', links: { employee: 'Sophie Martin' } },
        { title: 'Congé sans solde Lucas Durand', links: { employee: 'Lucas Durand' } },
        { title: 'Arrêt maladie Marie Lefebvre', links: { employee: 'Marie Lefebvre' } },
        { title: 'Congé Antoine Marchand - Mars', links: { employee: 'Antoine Marchand' } },
        { title: 'Congé Laura Petit - Été', links: { employee: 'Laura Petit' } },
        { title: 'Congé David Chen refusé', links: { employee: 'David Chen' } }
    ],

    // ═══════════════════════════════════════
    // Médical: Consultations → Patients
    // ═══════════════════════════════════════
    'tpl-consultations': [
        { title: 'Consultation Dupont - Contrôle tension', links: { patient: 'Jean-Pierre Dupont' } },
        { title: 'Consultation Fournier - Suivi diabète', links: { patient: 'Isabelle Fournier' } },
        { title: 'Consultation Lecomte - Douleur genou', links: { patient: 'Marc Lecomte' } },
        { title: 'Urgence Morel - Douleur abdominale', links: { patient: 'Élise Morel' } },
        { title: 'Consultation Lambert - Bilan asthme', links: { patient: 'Catherine Lambert' } },
        { title: 'Suivi Rousseau - Rééducation hanche', links: { patient: 'Philippe Rousseau' } },
        { title: 'Consultation Benali - Suivi grossesse M6', links: { patient: 'Amina Benali' } },
        { title: 'Urgence Perrin - Réaction allergique', links: { patient: 'Julie Perrin' } },
        { title: 'Consultation Mercier - Contrôle cardiaque', links: { patient: 'Robert Mercier' } },
        { title: 'Consultation Garnier - Bilan annuel', links: { patient: 'Nicolas Garnier' } },
        { title: 'Consultation Dupont - Renouvellement', links: { patient: 'Jean-Pierre Dupont' } },
        { title: 'Consultation Morel - Contrôle post-colite', links: { patient: 'Élise Morel' } }
    ],

    // ═══════════════════════════════════════
    // Logistique: Commandes → Produits (many-to-many)
    // ═══════════════════════════════════════
    'tpl-orders': [
        { title: 'Commande TechVision - Équipement bureau', links: { products: ['MacBook Pro 14" M3 Pro', 'Écran Dell UltraSharp 27"', 'Clavier Logitech MX Keys'] } },
        { title: 'Commande GreenCo - Postes développeurs', links: { products: ['MacBook Pro 14" M3 Pro', 'Écran Dell UltraSharp 27"'] } },
        { title: 'Commande InnovaTech - Accessoires', links: { products: ['Clavier Logitech MX Keys', 'Souris Logitech MX Master 3S', 'Câble USB-C Thunderbolt 4'] } },
        { title: 'Commande LuxeMode - Moniteurs', links: { products: ['Écran Dell UltraSharp 27"'] } },
        { title: 'Retour DataFlow - Clavier défectueux', links: { products: ['Clavier Logitech MX Keys'] } },
        { title: 'Commande EuroLog - Mobilier complet', links: { products: ['Chaise ergonomique Herman Miller', 'Bureau assis-debout Flexispot E7'] } },
        { title: 'Commande Atelier Digital - iMac x5', links: { products: ['MacBook Pro 14" M3 Pro', 'Écran Dell UltraSharp 27"'] } },
        { title: 'Commande Cabinet RC - iPads', links: { products: ['iPad Air M2 11"'] } },
        { title: 'Commande ConstrucPlus - Rugged', links: { products: ['iPhone 15 Pro 256Go', 'Station d\'accueil CalDigit TS4'] } },
        { title: 'Commande MediaSphere - Audio/Vidéo', links: { products: ['Casque Sony WH-1000XM5', 'Webcam Logitech Brio 4K'] } }
    ]
};

/**
 * Timeline Demo API Router
 * 
 * Provides seed data for timeline widget variants and widget catalog.
 * All data is demo/seed data for testing the timeline React Islands.
 */

const express = require('express');
const router = express.Router();

// ============================================================================
// Timeline Seed Data
// ============================================================================

const PROFILE_ITEMS = [
    {
        label: "Aujourd'hui",
        entries: [
            {
                id: 'p1',
                name: 'Dr. Sarah Martin',
                avatar: '/assets/images/user-profile.jpeg',
                time: 'il y a 5 min',
                icon: 'globe',
                title: 'Nouvelle consultation créée',
                description: 'Consultation de suivi programmée pour le patient Dupont. Bilan sanguin à prévoir avant la prochaine visite.',
                thumbnails: ['/assets/images/user-profile.jpeg', '/assets/images/profile-1.jpeg', '/assets/images/profile-2.jpeg', '/assets/images/profile-3.jpeg'],
                thumbnailType: 'avatar',
            },
            {
                id: 'p2',
                name: 'Jean-Pierre Moreau',
                avatar: '/assets/images/profile-1.jpeg',
                time: 'il y a 45 min',
                icon: 'image',
                title: 'Photos ajoutées au dossier',
                description: 'Radiographies thoraciques et IRM cérébrale ajoutées au dossier patient. Interprétation en cours par le Dr. Lemoine.',
                thumbnails: ['/assets/images/carousel1.jpeg', '/assets/images/carousel2.jpeg', '/assets/images/carousel3.jpeg'],
                thumbnailType: 'grid',
            },
            {
                id: 'p3',
                name: 'Marie Dubois',
                avatar: '/assets/images/profile-2.jpeg',
                time: 'il y a 2h',
                icon: 'file',
                title: 'Ordonnance générée',
                description: 'Ordonnance de renouvellement pour traitement chronique. Médicaments : Metformine 1000mg, Atorvastatine 20mg.',
                thumbnails: ['/assets/images/user-profile.jpeg', '/assets/images/profile-3.jpeg', '/assets/images/profile-4.jpeg', '/assets/images/profile-1.jpeg', '/assets/images/profile-2.jpeg'],
                thumbnailType: 'avatar',
            },
        ]
    },
    {
        label: 'Hier',
        entries: [
            {
                id: 'p4',
                name: 'Ahmed Benali',
                avatar: '/assets/images/profile-3.jpeg',
                time: 'hier à 16h30',
                icon: 'globe',
                title: 'Téléconsultation terminée',
                description: 'Suivi post-opératoire effectué par visioconférence. Patient en bonne voie de récupération.',
                thumbnails: ['/assets/images/profile-4.jpeg', '/assets/images/user-profile.jpeg'],
                thumbnailType: 'avatar',
            },
        ]
    }
];

const MODERN_ITEMS = [
    {
        id: 'm1',
        title: 'Consultation créée',
        description: 'Nouveau patient enregistré dans le système. Dossier médical initialisé avec les antécédents familiaux et les allergies connues.',
        image: '/assets/images/carousel1.jpeg',
        color: 'info',
        actionLabel: 'Voir le dossier',
    },
    {
        id: 'm2',
        title: 'Prescription envoyée',
        description: 'Ordonnance électronique transmise à la pharmacie du quartier. Le patient sera notifié par SMS de la disponibilité.',
        image: '/assets/images/carousel2.jpeg',
        color: 'primary',
        actionLabel: 'Détails',
    },
    {
        id: 'm3',
        title: 'Résultats labo reçus',
        description: 'Bilan hématologique complet disponible. Tous les marqueurs dans les normes, hémoglobine à 14.2 g/dL.',
        image: '/assets/images/carousel3.jpeg',
        color: 'success',
        actionLabel: 'Consulter',
    },
    {
        id: 'm4',
        title: 'Alerte médicament',
        description: 'Interaction médicamenteuse détectée entre Warfarine et Aspirine. Vérification nécessaire avant validation.',
        image: '/assets/images/carousel1.jpeg',
        color: 'danger',
        actionLabel: 'Traiter',
    },
];

const BASIC_ITEMS = [
    { id: 'b1', time: '08:00', title: 'Ouverture du cabinet', relative: 'il y a 4h', color: 'primary' },
    { id: 'b2', time: '09:15', title: 'Consultation — Mme Dupont (suivi diabète)', relative: 'il y a 3h', color: 'secondary' },
    { id: 'b3', time: '10:30', title: 'Résultats labo reçus — M. Bernard', relative: 'il y a 2h', color: 'success' },
    { id: 'b4', time: '11:45', title: 'Urgence — Patient en salle d\'attente', relative: 'il y a 1h', color: 'danger' },
    { id: 'b5', time: '13:00', title: 'Pause déjeuner', relative: 'il y a 30 min', color: 'warning' },
    { id: 'b6', time: '14:30', title: 'Téléconsultation — Dr. Ramirez', relative: 'il y a 15 min', color: 'info' },
];

const IMAGES_ITEMS = [
    { id: 'i1', time: '09:00', name: 'Dr. Martin', avatar: '/assets/images/user-profile.jpeg', relative: 'il y a 3h', title: 'Réunion staff matinale — planning de la journée.' },
    { id: 'i2', time: '10:00', name: 'Sophie Lemaire', avatar: '/assets/images/profile-1.jpeg', relative: 'il y a 2h', title: 'Dossier patient mis à jour avec les nouveaux résultats.' },
    { id: 'i3', time: '11:00', name: 'Marc Petit', avatar: '/assets/images/profile-2.jpeg', relative: 'il y a 1h30', title: 'Validation de l\'ordonnance électronique.' },
    { id: 'i4', time: '12:00', name: 'Julie Moreau', avatar: '/assets/images/profile-3.jpeg', relative: 'il y a 1h', title: 'Documents collectés auprès du patient.' },
    { id: 'i5', time: '13:00', name: 'Pierre Duval', avatar: '/assets/images/profile-4.jpeg', relative: 'il y a 30 min', title: 'Export PDF du compte-rendu terminé.' },
];

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * GET /api/demo/timeline-data
 * Returns seed data for timeline widget variants
 * Query param: variant (profile|modern|basic|images)
 */
router.get('/timeline-data', (req, res) => {
    const variant = req.query.variant || 'basic';

    const dataMap = {
        profile: PROFILE_ITEMS,
        modern: MODERN_ITEMS,
        basic: BASIC_ITEMS,
        images: IMAGES_ITEMS,
    };

    const items = dataMap[variant] || dataMap.basic;

    res.json({ items, variant, total: Array.isArray(items[0]?.entries) ? items.reduce((acc, g) => acc + g.entries.length, 0) : items.length });
});

/**
 * GET /api/demo/widget-catalog
 * Returns the full widget catalog for the Widget Library
 */
router.get('/widget-catalog', (req, res) => {
    // The widget catalog is defined client-side in WidgetLibrary.jsx
    // This endpoint provides server-side augmentation (e.g., custom widgets per tenant)
    res.json({
        customWidgets: [],
        message: 'Widget catalog is client-side. This endpoint is for tenant-specific augmentation.'
    });
});

module.exports = router;

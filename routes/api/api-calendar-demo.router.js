/**
 * Calendar Demo API Router
 * 
 * Provides seed data for the calendar widget React Island.
 * All data is demo/seed data for testing the calendar component.
 */

const express = require('express');
const router = express.Router();

// ============================================================================
// Calendar Seed Data Generator
// ============================================================================

function generateCalendarEvents() {
    const now = new Date();
    const y = now.getFullYear();
    const getMonth = (dt, add = 0) => {
        let month = dt.getMonth() + 1 + add;
        return month < 10 ? '0' + month : '' + month;
    };
    const m = getMonth(now);
    const mPrev = getMonth(now, -1);
    const mNext = getMonth(now, 1);

    return [
        {
            id: 1,
            title: 'Consultation Dr. Martin',
            start: `${y}-${m}-01T14:30:00`,
            end: `${y}-${m}-02T14:30:00`,
            className: 'danger',
            description: 'Consultation de suivi — bilan hématologique à vérifier. Résultats du labo attendus.'
        },
        {
            id: 2,
            title: 'Visite domicile',
            start: `${y}-${m}-07T19:30:00`,
            end: `${y}-${m}-08T14:30:00`,
            className: 'primary',
            description: 'Visite chez Mme Dupont pour suivi post-opératoire. Préparer les documents de sortie.'
        },
        {
            id: 3,
            title: 'Formation médicale continue',
            start: `${y}-${m}-17T14:30:00`,
            end: `${y}-${m}-18T14:30:00`,
            className: 'info',
            description: 'Formation continue en cardiologie interventionnelle — nouvelles techniques de stenting.'
        },
        {
            id: 4,
            title: 'Réunion staff hebdomadaire',
            start: `${y}-${m}-12T10:30:00`,
            end: `${y}-${m}-13T10:30:00`,
            className: 'danger',
            description: 'Réunion hebdomadaire du service — point sur les cas complexes et planning de la semaine.'
        },
        {
            id: 5,
            title: 'Déjeuner équipe soignante',
            start: `${y}-${m}-12T15:00:00`,
            end: `${y}-${m}-13T15:00:00`,
            className: 'info',
            description: 'Déjeuner d\'équipe au restaurant Le Botanic — team building trimestriel.'
        },
        {
            id: 6,
            title: 'Conférence cardiologie',
            start: `${y}-${m}-12T21:30:00`,
            end: `${y}-${m}-13T21:30:00`,
            className: 'success',
            description: 'Conférence annuelle de cardiologie — nouvelles recommandations HAS 2026.'
        },
        {
            id: 7,
            title: 'Garde de nuit CHU',
            start: `${y}-${m}-12T05:30:00`,
            end: `${y}-${m}-13T05:30:00`,
            className: 'info',
            description: 'Garde de nuit aux urgences du CHU — relève à 6h00.'
        },
        {
            id: 8,
            title: 'Gala annuel médecins',
            start: `${y}-${m}-12T20:00:00`,
            end: `${y}-${m}-13T20:00:00`,
            className: 'danger',
            description: 'Gala annuel de l\'Ordre des médecins — cérémonie de remise des prix.'
        },
        {
            id: 9,
            title: 'Départ retraite Dr. Moreau',
            start: `${y}-${m}-27T20:00:00`,
            end: `${y}-${m}-28T20:00:00`,
            className: 'success',
            description: 'Célébration du départ en retraite du Dr. Moreau — 35 ans de service.'
        },
        {
            id: 10,
            title: 'Séminaire IA & Médecine',
            start: `${y}-${mNext}-24T08:12:14`,
            end: `${y}-${mNext}-27T22:20:20`,
            className: 'danger',
            description: 'Séminaire sur l\'intelligence artificielle en diagnostic médical — outils et perspectives.'
        },
        {
            id: 11,
            title: 'Audit qualité cabinet',
            start: `${y}-${mPrev}-13T08:12:14`,
            end: `${y}-${mPrev}-16T22:20:20`,
            className: 'primary',
            description: 'Audit qualité annuel du cabinet — préparation des dossiers et revue des procédures.'
        },
        {
            id: 12,
            title: 'Congrès national médecine',
            start: `${y}-${mNext}-15T08:12:14`,
            end: `${y}-${mNext}-18T22:20:20`,
            className: 'primary',
            description: 'Congrès national de médecine générale — présentation poster et stand d\'exposition.'
        },
    ];
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * GET /api/demo/calendar-events
 * Returns seed data for the calendar widget
 */
router.get('/calendar-events', (req, res) => {
    const events = generateCalendarEvents();
    res.json({ events, total: events.length });
});

module.exports = router;

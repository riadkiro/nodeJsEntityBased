/**
 * Demo API Router - Cockpit Builder v1
 * 
 * Provides demo endpoints for the consultation cockpit
 */

const express = require('express');
const router = express.Router();

// ============================================================================
// In-Memory Demo Data Store
// ============================================================================

const demoData = {
    consultations: [],
    messages: [],
    activities: [],
    requests: []
};

// Initialize demo data
function initDemoData(accountNumber) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Reset
    demoData.consultations = [
        // Done
        { id: 'c1', patientId: 'p1', patient: 'M. Saidi', initials: 'MS', time: '08:00', motif: 'Consultation générale', status: 'done', priority: 'normal', room: 'Salle 1', context: { type: 'consultation', id: 'c1', patientId: 'p1' } },
        { id: 'c2', patientId: 'p2', patient: 'A. Hassan', initials: 'AH', time: '09:00', motif: 'Suivi diabète', status: 'done', priority: 'normal', room: 'Salle 1', context: { type: 'consultation', id: 'c2', patientId: 'p2' } },
        // In progress
        { id: 'c3', patientId: 'p3', patient: 'S. El Amrani', initials: 'SE', time: '09:40', motif: 'Douleur thoracique', status: 'in_progress', priority: 'urgent', room: 'Salle 1', vitals: { tension: '140/90', temperature: '38.2°C', pulse: '72 bpm', spo2: '98%' }, allergies: ['Pénicilline', 'Aspirine'], context: { type: 'consultation', id: 'c3', patientId: 'p3' } },
        // Waiting
        { id: 'c4', patientId: 'p4', patient: 'K. Benjelloun', initials: 'KB', time: '10:30', motif: 'Suivi tension artérielle', status: 'waiting', priority: 'normal', room: null, context: { type: 'consultation', id: 'c4', patientId: 'p4' } },
        { id: 'c5', patientId: 'p5', patient: 'L. Hamdani', initials: 'LH', time: '11:00', motif: 'Douleurs articulaires', status: 'waiting', priority: 'normal', room: null, context: { type: 'consultation', id: 'c5', patientId: 'p5' } },
        { id: 'c6', patientId: 'p6', patient: 'F. Tazi', initials: 'FT', time: '11:30', motif: 'Renouvellement ordonnance', status: 'waiting', priority: 'normal', room: null, context: { type: 'consultation', id: 'c6', patientId: 'p6' } },
        { id: 'c7', patientId: 'p7', patient: 'R. Alaoui', initials: 'RA', time: '12:00', motif: 'Bilan sanguin', status: 'waiting', priority: 'urgent', room: null, context: { type: 'consultation', id: 'c7', patientId: 'p7' } },
        { id: 'c8', patientId: 'p8', patient: 'N. Berrada', initials: 'NB', time: '14:00', motif: 'Vaccination', status: 'waiting', priority: 'normal', room: null, context: { type: 'consultation', id: 'c8', patientId: 'p8' } },
        { id: 'c9', patientId: 'p9', patient: 'Y. Kadiri', initials: 'YK', time: '14:30', motif: 'Contrôle annuel', status: 'waiting', priority: 'normal', room: null, context: { type: 'consultation', id: 'c9', patientId: 'p9' } }
    ];

    demoData.messages = [
        { id: 'm1', author: 'Système', text: 'Sarah a terminé la prise de RDV', time: 'il y a 25 min', type: 'success', icon: '✓', context: null },
        { id: 'm2', author: 'Dr', text: 'Patient suivant svp', time: 'il y a 15 min', type: 'primary', context: null },
        { id: 'm3', author: 'Système', text: 'Résultat labo critique reçu', time: 'il y a 12 min', type: 'warning', icon: '!', badge: 'URGENT', context: { type: 'lab', id: 'lab1' } },
        { id: 'm4', author: 'Fatima', text: 'Ordonnance de M. Saidi prête', time: 'il y a 5 min', type: 'success', icon: '✓', context: { type: 'consultation', id: 'c1' } }
    ];

    demoData.activities = [
        { id: 'a1', text: 'Consultation terminée - M. Saidi', time: 'il y a 45 min', author: 'Dr', type: 'success', context: { type: 'consultation', id: 'c1' } },
        { id: 'a2', text: 'Consultation terminée - A. Hassan', time: 'il y a 20 min', author: 'Dr', type: 'success', context: { type: 'consultation', id: 'c2' } },
        { id: 'a3', text: 'Consultation démarrée - S. El Amrani', time: 'il y a 10 min', author: 'Dr', type: 'primary', context: { type: 'consultation', id: 'c3' } },
        { id: 'a4', text: 'Résultat labo reçu - URGENT', time: 'il y a 12 min', author: 'Système', type: 'warning', context: { type: 'lab', id: 'lab1' } },
        { id: 'a5', text: 'RDV programmé - Mme Chraibi', time: 'il y a 30 min', author: 'Sarah', type: 'info', context: null }
    ];

    demoData.requests = [
        { id: 'r1', action: 'prepare_prescription', status: 'done', time: 'il y a 40 min', context: { type: 'consultation', id: 'c1' } }
    ];
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * GET /api/demo/consultation-cockpit
 * Returns full cockpit data
 */
router.get('/consultation-cockpit', (req, res) => {
    initDemoData(req.account_number);

    const consultations = demoData.consultations;
    const done = consultations.filter(c => c.status === 'done');
    const inProgress = consultations.filter(c => c.status === 'in_progress');
    const waiting = consultations.filter(c => c.status === 'waiting');
    const urgent = consultations.filter(c => c.priority === 'urgent');

    // Find next consultation (first waiting by time)
    const nextConsultation = inProgress[0] || waiting[0] || null;

    res.json({
        kpis: {
            totalToday: consultations.length,
            seen: done.length,
            remaining: waiting.length + inProgress.length,
            avgWait: 12,
            urgentCount: urgent.length,
            delay: '+12m',
            progress: Math.round((done.length / consultations.length) * 100)
        },
        waitingRoom: consultations,
        nextConsultation: nextConsultation ? {
            ...nextConsultation,
            waitTime: '23 min',
            visitType: 'Contrôle'
        } : null,
        activities: demoData.activities,
        messages: demoData.messages,
        requests: demoData.requests.filter(r => r.status !== 'done'),
        secretaries: [
            { id: 'fatima', name: 'Fatima', initial: 'F', online: true, color: 'success' },
            { id: 'sarah', name: 'Sarah', initial: 'S', online: true, color: 'info' }
        ]
    });
});

/**
 * POST /api/demo/consultations/:id/transition
 * Change consultation status
 */
router.post('/consultations/:id/transition', (req, res) => {
    const { id } = req.params;
    const { to } = req.body;

    const consultation = demoData.consultations.find(c => c.id === id);
    if (!consultation) {
        return res.status(404).json({ error: 'Consultation not found' });
    }

    const oldStatus = consultation.status;
    consultation.status = to;

    // Log activity
    const statusLabels = {
        waiting: 'En attente',
        in_progress: 'En cours',
        done: 'Terminée',
        blocked: 'Bloquée'
    };

    demoData.activities.unshift({
        id: `a${Date.now()}`,
        text: `Consultation ${statusLabels[to]} - ${consultation.patient}`,
        time: "à l'instant",
        author: 'Dr',
        type: to === 'done' ? 'success' : to === 'in_progress' ? 'primary' : 'info',
        context: consultation.context
    });

    res.json({ success: true, consultation, oldStatus, newStatus: to });
});

/**
 * POST /api/demo/comms/message
 * Send a chat message
 */
router.post('/comms/message', (req, res) => {
    const { recipient, text, context } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Message text required' });
    }

    const message = {
        id: `m${Date.now()}`,
        author: 'Dr',
        text: text.trim(),
        time: "à l'instant",
        type: 'primary',
        recipient,
        context
    };

    demoData.messages.push(message);

    res.json({ success: true, message });
});

/**
 * POST /api/demo/comms/quick-action
 * Execute a quick action
 */
router.post('/comms/quick-action', (req, res) => {
    const { actionKey, context, input } = req.body;

    // Create activity
    const activityTexts = {
        call_patient: 'Patient appelé',
        come_here: `Demande présence ${input?.room || ''}`,
        prepare_prescription: 'Demande préparation ordonnance',
        request_lab: 'Demande résultats labo',
        schedule_followup: `Demande RDV suivi ${input?.delay || ''}`,
        flag_urgent: 'Marqué URGENT'
    };

    const activity = {
        id: `a${Date.now()}`,
        text: activityTexts[actionKey] || actionKey,
        time: "à l'instant",
        author: 'Dr',
        type: actionKey === 'flag_urgent' ? 'danger' : 'info',
        context
    };

    demoData.activities.unshift(activity);

    // Create request if applicable
    let request = null;
    if (['prepare_prescription', 'request_lab', 'schedule_followup'].includes(actionKey)) {
        request = {
            id: `r${Date.now()}`,
            action: actionKey,
            status: 'pending',
            time: "à l'instant",
            context,
            input
        };
        demoData.requests.unshift(request);
    }

    // Handle flag_urgent
    if (actionKey === 'flag_urgent' && context?.id) {
        const consultation = demoData.consultations.find(c => c.id === context.id);
        if (consultation) {
            consultation.priority = 'urgent';
        }
    }

    // Handle call_patient (transition next waiting to in_progress)
    if (actionKey === 'call_patient') {
        const nextWaiting = demoData.consultations.find(c => c.status === 'waiting');
        if (nextWaiting) {
            nextWaiting.status = 'in_progress';
            activity.text = `Patient appelé - ${nextWaiting.patient}`;
            activity.context = nextWaiting.context;
        }
    }

    res.json({ success: true, activity, request });
});

module.exports = router;

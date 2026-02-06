import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatPanelIsland from './ChatPanelIsland';

/**
 * Entry point for the Chat Panel React Island
 * 
 * Usage in EJS:
 * <div id="chat-panel-island" data-config='<%= JSON.stringify(chatConfig) %>'></div>
 * <script type="module" src="/dist/islands/chat-panel.js"></script>
 */

// Default demo data matching the doctor dashboard
const defaultTeamMembers = [
    {
        id: 'fatima',
        name: 'Fatima',
        initial: 'F',
        color: 'success',
        gradient: 'linear-gradient(135deg, #00ab55 0%, #059669 100%)',
        isOnline: true
    },
    {
        id: 'sarah',
        name: 'Sarah',
        initial: 'S',
        color: 'info',
        gradient: 'linear-gradient(135deg, #2196f3 0%, #0284c7 100%)',
        isOnline: true
    }
];

const defaultActivities = [
    { id: 1, author: 'Système', title: 'Sarah a terminé la prise de RDV', time: 'il y a 25 min', type: 'success', icon: '✓' },
    { id: 2, author: 'Dr', title: 'Dr a demandé patient suivant', time: 'il y a 15 min', type: 'primary' },
    { id: 3, author: 'Système', title: 'Résultat labo critique reçu', time: 'il y a 12 min', type: 'warning', icon: '!', badge: 'URGENT' },
    { id: 4, author: 'Système', title: 'Fatima a terminé l\'ordonnance', time: 'il y a 5 min', type: 'success', icon: '✓' }
];

const defaultQuickActions = [
    {
        id: 'next_patient',
        label: 'Suivant',
        type: 'primary',
        bgColor: 'rgba(67, 97, 238, 0.15)',
        icon: '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>'
    },
    {
        id: 'rdv_3m',
        label: '3 mois',
        type: 'info',
        bgColor: 'rgba(33, 150, 243, 0.15)',
        icon: '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
    },
    {
        id: 'rdv_6m',
        label: '6 mois',
        type: 'info',
        bgColor: 'rgba(33, 150, 243, 0.15)',
        icon: '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
    },
    {
        id: 'control_15d',
        label: '15j',
        type: 'warning',
        bgColor: 'rgba(226, 160, 63, 0.15)',
        icon: '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
    },
    {
        id: 'come_now',
        label: 'Urgent',
        type: 'danger',
        bgColor: 'rgba(231, 81, 90, 0.15)',
        icon: '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    }
];

// Mount function
function mount() {
    console.log('ChatPanelIsland: Mount function called');
    const container = document.getElementById('chat-panel-island');
    if (!container) {
        console.log('ChatPanelIsland: Container #chat-panel-island NOT found');
        return;
    }
    console.log('ChatPanelIsland: Container found, mounting...');

    // Parse config from data attribute
    let config = {};
    try {
        const configAttr = container.getAttribute('data-config');
        if (configAttr) {
            config = JSON.parse(configAttr);
        }
    } catch (e) {
        console.warn('ChatPanelIsland: Failed to parse config', e);
    }

    // Merge with defaults
    const props = {
        title: config.title || "Coordination — Secrétariat",
        teamMembers: config.teamMembers || defaultTeamMembers,
        activities: config.activities || defaultActivities,
        quickActions: config.quickActions || defaultQuickActions,
        onSendMessage: (message) => {
            console.log('ChatPanelIsland: Send message', message);
            // Emit custom event for parent to handle
            container.dispatchEvent(new CustomEvent('chat:send', { detail: { message } }));
        },
        onQuickAction: (actionId) => {
            console.log('ChatPanelIsland: Quick action', actionId);
            container.dispatchEvent(new CustomEvent('chat:quickaction', { detail: { actionId } }));
        },
        onFilterChange: (filterId) => {
            console.log('ChatPanelIsland: Filter change', filterId);
            container.dispatchEvent(new CustomEvent('chat:filter', { detail: { filterId } }));
        }
    };

    const root = createRoot(container);
    root.render(<ChatPanelIsland {...props} />);
}

// Auto-mount on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}

export { ChatPanelIsland, mount };

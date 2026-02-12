/**
 * React Island Entry: Calendar Widget
 * Mounts on elements with data-island="calendar-widget"
 * Full calendar with month/week/day views, event CRUD, color-coded badges
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import CalendarWidget from './CalendarWidget'

function mountIslands() {
    document.querySelectorAll('[data-island="calendar-widget"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            apiUrl: container.dataset.apiUrl || '',
            events: container.dataset.events ? JSON.parse(container.dataset.events) : null,
            editable: container.dataset.editable !== 'false',
            compact: container.dataset.compact === 'true',
        }

        console.log('[CalendarWidget Island] Mounting:', props)

        createRoot(container).render(
            <React.StrictMode>
                <CalendarWidget {...props} />
            </React.StrictMode>
        )
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

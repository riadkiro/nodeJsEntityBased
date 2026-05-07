/**
 * React Island Entry: Record Agenda
 * Mounts on elements with data-island="record-agenda"
 * Full calendar/timeline/list views with event CRUD, drag & drop, dark mode
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import RecordAgenda from './RecordAgenda'

function mountIslands() {
    document.querySelectorAll('[data-island="record-agenda"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            recordId: container.dataset.recordId,
            entitySlug: container.dataset.entitySlug,
        }

        console.log('[RecordAgenda Island] Mounting:', props)

        createRoot(container).render(
            <React.StrictMode>
                <RecordAgenda {...props} />
            </React.StrictMode>
        )
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

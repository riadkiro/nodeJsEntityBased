import React from 'react'
import { createRoot } from 'react-dom/client'
import RecordAI from './RecordAI'

function mountIslands() {
    document.querySelectorAll('[data-island="record-ai"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            recordId: container.dataset.recordId,
            entitySlug: container.dataset.entitySlug,
            recordTitle: container.dataset.recordTitle || 'Sans titre',
        }

        createRoot(container).render(
            <React.StrictMode>
                <RecordAI {...props} />
            </React.StrictMode>
        )
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

const observer = new MutationObserver(mountIslands)
observer.observe(document.body, { childList: true, subtree: true })

/**
 * React Island Entry: Card Builder
 * Mounts on elements with data-island="card-builder"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import CardBuilder from './CardBuilder'

function mountIslands() {
    document.querySelectorAll('[data-island="card-builder"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            entityId: container.dataset.entityId,
            entityName: container.dataset.entityName || '',
            entitySlug: container.dataset.entitySlug || '',
            entityIcon: container.dataset.entityIcon || '',
            entityColor: container.dataset.entityColor || '',
            fieldsJson: decodeURIComponent(container.dataset.fieldsJson || '[]'),
        }

        console.log('[CardBuilder Island] Mounting:', props)
        createRoot(container).render(
            <React.StrictMode>
                <CardBuilder {...props} />
            </React.StrictMode>
        )
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

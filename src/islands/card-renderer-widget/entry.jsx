/**
 * React Island Entry: Card Renderer Widget (Sidebar)
 * Mounts on elements with data-island="card-renderer-widget"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import CardRenderer from '../shared/CardRenderer'

function mountIslands() {
    document.querySelectorAll('[data-island="card-renderer-widget"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        try {
            const accountNumber = container.dataset.accountNumber
            const entitySlug = container.dataset.entitySlug || ''
            const cardTemplate = JSON.parse(decodeURIComponent(container.dataset.cardTemplate || '{}'))
            const record = JSON.parse(decodeURIComponent(container.dataset.record || '{}'))
            const entityFields = JSON.parse(decodeURIComponent(container.dataset.entityFields || '[]'))

            // Build entityData for CardRenderer
            const entityData = {
                fields: entityFields,
                customFields: entityFields,
            }

            createRoot(container).render(
                <CardRenderer
                    record={record}
                    cardTemplate={cardTemplate}
                    context="universal"
                    entityData={entityData}
                    accountNumber={accountNumber}
                    entitySlug={entitySlug}
                    style={{
                        background: 'transparent',
                        boxShadow: 'none',
                        borderRadius: 0,
                    }}
                />
            )
        } catch (err) {
            console.error('[CardRendererWidget] Mount error:', err)
        }
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

/**
 * React Island Entry: Timeline Widget
 * Mounts on elements with data-island="timeline-widget"
 * Supports variants: profile, modern, basic, images
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import TimelineWidget from './TimelineWidget'

function mountIslands() {
    document.querySelectorAll('[data-island="timeline-widget"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            variant: container.dataset.variant || 'basic',
            apiUrl: container.dataset.apiUrl || '',
            items: container.dataset.items ? JSON.parse(container.dataset.items) : null,
            maxItems: parseInt(container.dataset.maxItems) || 0,
            compact: container.dataset.compact === 'true',
        }

        console.log('[TimelineWidget Island] Mounting:', props)

        createRoot(container).render(
            <React.StrictMode>
                <TimelineWidget {...props} />
            </React.StrictMode>
        )
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

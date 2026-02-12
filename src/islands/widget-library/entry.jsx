/**
 * React Island Entry: Widget Library
 * Mounts on elements with data-island="widget-library"
 * Provides a browsable, searchable catalog of widgets 
 * that can be dragged into Page Builder / Cockpit Builder
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import WidgetLibrary from './WidgetLibrary'

function mountIslands() {
    document.querySelectorAll('[data-island="widget-library"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            apiUrl: container.dataset.apiUrl || '',
        }

        console.log('[WidgetLibrary Island] Mounting:', props)

        createRoot(container).render(
            <React.StrictMode>
                <WidgetLibrary {...props} />
            </React.StrictMode>
        )
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

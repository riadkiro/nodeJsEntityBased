/**
 * React Island Entry: Records Grid
 * Mounts on elements with data-island="records-grid"
 * Prevents double-mount with data-mounted="1"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import RecordsGrid from './RecordsGrid'

// Auto-mount on all containers with data-island="records-grid"
function mountIslands() {
    document.querySelectorAll('[data-island="records-grid"]').forEach(container => {
        // Prevent double-mount
        if (container.dataset.mounted === '1') {
            return
        }
        container.dataset.mounted = '1'

        // Read props from data attributes
        const props = {
            accountId: container.dataset.accountId,
            accountNumber: container.dataset.accountNumber,
            entityId: container.dataset.entityId,
            viewId: container.dataset.viewId,
            entityName: container.dataset.entityName || 'Records',
            entitySlug: container.dataset.entitySlug || 'records',
        }

        console.log('[RecordsGrid Island] Mounting:', props)

        createRoot(container).render(
            <React.StrictMode>
                <RecordsGrid {...props} />
            </React.StrictMode>
        )
    })
}

// Mount when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

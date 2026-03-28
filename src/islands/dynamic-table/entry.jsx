/**
 * Dynamic Table Island Entry Point
 * Mounts DynamicTable React component on elements with data-island="dynamic-table"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import DynamicTable from './DynamicTable'

function mountIslands() {
    document.querySelectorAll('[data-island="dynamic-table"]').forEach(container => {
        // Prevent double-mount
        if (container.dataset.mounted === '1') return

        // Wait for essential data (recordId must be present from EJS)
        if (!container.dataset.recordId) return

        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            recordId: container.dataset.recordId,
            entityId: container.dataset.entityId,
            schemaFilter: container.dataset.schemaFilter || '',
            compact: container.dataset.compact !== 'false'
        }

        console.log('[DynamicTable Island] Mounting with props:', props)

        createRoot(container).render(
            <React.StrictMode>
                <DynamicTable {...props} />
            </React.StrictMode>
        )
    })
}

// Mount when DOM is ready — slight delay to let Alpine process x-if templates
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(mountIslands, 100))
} else {
    setTimeout(mountIslands, 100)
}

// Watch for dynamically added islands (Alpine x-if, HTMX swaps)
const observer = new MutationObserver(() => {
    // Small delay to let Alpine finish attribute bindings
    setTimeout(mountIslands, 50)
})
observer.observe(document.body, { childList: true, subtree: true })

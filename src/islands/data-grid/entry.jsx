/**
 * DataGrid Island Entry Point
 * Mounts DataGrid React component on elements with data-island="data-grid"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import DataGrid from './DataGrid'

function mountIslands() {
    document.querySelectorAll('[data-island="data-grid"]').forEach(container => {
        // Prevent double-mount
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            gridId: container.dataset.gridId || 'default',
            dataUrl: container.dataset.dataUrl,
            title: container.dataset.title || 'Data',
            icon: container.dataset.icon || 'solar:list-bold-duotone',
            addUrl: container.dataset.addUrl || null,
            addLabel: container.dataset.addLabel || 'Ajouter',
            addAction: container.dataset.addAction || null,
            rowClickUrl: container.dataset.rowClickUrl || null,
            showSidebar: container.dataset.showSidebar === 'true',
            initialDensity: container.dataset.density || 'comfortable',
            initialPageSize: parseInt(container.dataset.pageSize || '10', 10)
        }

        console.log('[DataGrid Island] Mounting:', props)

        createRoot(container).render(
            <React.StrictMode>
                <DataGrid {...props} />
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

// Watch for dynamically added islands (HTMX swaps)
const observer = new MutationObserver(mountIslands)
observer.observe(document.body, { childList: true, subtree: true })

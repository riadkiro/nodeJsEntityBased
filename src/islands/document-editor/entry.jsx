/**
 * React Island Entry: Document Editor
 * Mounts on elements with data-island="document-editor"
 * Prevents double-mount with data-mounted="1"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import DocumentEditorIsland from './DocumentEditorIsland'

// Auto-mount on all containers with data-island="document-editor"
function mountIslands() {
    document.querySelectorAll('[data-island="document-editor"]').forEach(container => {
        // Prevent double-mount
        if (container.dataset.mounted === '1') {
            return
        }
        container.dataset.mounted = '1'

        // Read props from data attributes
        // Parse document JSON from data-document attribute
        let initialDocument = null
        try {
            if (container.dataset.document) {
                initialDocument = JSON.parse(container.dataset.document)
            }
        } catch (e) {
            console.error('[DocumentEditor Island] Failed to parse document data:', e)
        }

        const props = {
            accountNumber: container.dataset.accountNumber,
            initialDocument: initialDocument,
            isNew: container.dataset.isNew === 'true'
        }

        console.log('[DocumentEditor Island] Mounting:', {
            accountNumber: props.accountNumber,
            isNew: props.isNew,
            docId: props.initialDocument?._id
        })

        createRoot(container).render(
            <React.StrictMode>
                <DocumentEditorIsland {...props} />
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

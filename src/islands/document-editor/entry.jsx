/**
 * React Island Entry: Document Editor
 * Mounts on elements with data-island="document-editor"
 * Prevents double-mount with data-mounted="1"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import DocumentEditorIsland from './DocumentEditorIsland'

// Inject CSS for AI selection locking to prevent spelling highlights from changing the locked element's style
const injectAISelectionStyles = () => {
    if (document.getElementById('ai-selection-styles')) return

    const style = document.createElement('style')
    style.id = 'ai-selection-styles'
    style.textContent = `
        /* Selection lock highlight - wraps the selected text directly */
        span.ai-selection-locked {
            background: rgba(245, 158, 11, 0.2);
            border-bottom: 2px dashed rgba(245, 158, 11, 0.6);
            padding: 1px 0;
            border-radius: 2px;
        }
        
        /* AI spelling highlights inside locked selection should remain visible but muted */
        span.ai-selection-locked .ai-highlight {
            background: rgba(254, 240, 138, 0.5) !important;
        }
    `
    document.head.appendChild(style)
}

// Auto-mount on all containers with data-island="document-editor"
function mountIslands() {
    // Inject CSS for AI selection locking (once)
    injectAISelectionStyles()

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

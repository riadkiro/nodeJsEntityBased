/**
 * React Island Entry: Document Editor
 * Mounts on elements with data-island="document-editor"
 * Prevents double-mount with data-mounted="1"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import DocumentEditorIsland from './DocumentEditorIsland'

// Inject CSS for selection locking
const injectAISelectionStyles = () => {
    if (document.getElementById('ai-selection-styles')) return

    const style = document.createElement('style')
    style.id = 'ai-selection-styles'
    style.textContent = `
        /* Selection lock highlight - applies ONLY when .selection-locked class is present */
        .selection-locked {
            background: rgba(245, 158, 11, 0.15);
            border-left: 3px solid rgba(245, 158, 11, 0.8);
            padding-left: 8px;
            margin-left: -11px;
        }
        
        /* Highlights inside locked selection should remain visible but muted */
        .selection-locked .ai-highlight {
            background: rgba(254, 240, 138, 0.5) !important;
        }

        /* Preview active - showing new AI content */
        .ai-preview-active {
            border-left: 3px solid rgba(34, 197, 94, 0.8) !important;
            padding-left: 8px;
            margin-left: -11px;
            background: rgba(34, 197, 94, 0.12) !important;
            transition: all 0.15s ease;
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
        // Parse document JSON from data-document attribute (base64 encoded with UTF-8)
        let initialDocument = null
        try {
            if (container.dataset.document) {
                // Decode base64 to binary, then use TextDecoder for proper UTF-8 handling
                const binaryString = atob(container.dataset.document)
                const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0))
                const jsonString = new TextDecoder('utf-8').decode(bytes)
                initialDocument = JSON.parse(jsonString)
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

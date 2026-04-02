/**
 * React Island Entry: Document Generate Wizard
 * Mounts on elements with data-island="doc-generate-wizard"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import DocGenerateWizard from './DocGenerateWizard'

function mountIslands() {
    document.querySelectorAll('[data-island="doc-generate-wizard"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        // Parse base64-encoded JSON props
        const parseB64 = (str) => {
            if (!str) return null
            try {
                const bin = atob(str)
                const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
                return JSON.parse(new TextDecoder('utf-8').decode(bytes))
            } catch (e) {
                console.error('[DocGenerateWizard] Parse error:', e)
                return null
            }
        }

        const props = {
            accountNumber: container.dataset.accountNumber,
            template: parseB64(container.dataset.template),
            entities: parseB64(container.dataset.entities) || [],
            smartDocTemplate: parseB64(container.dataset.smartDocTemplate),
        }

        console.log('[DocGenerateWizard] Mounting:', {
            accountNumber: props.accountNumber,
            templateName: props.template?.name,
            entityCount: props.entities.length
        })

        createRoot(container).render(
            <React.StrictMode>
                <DocGenerateWizard {...props} />
            </React.StrictMode>
        )
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

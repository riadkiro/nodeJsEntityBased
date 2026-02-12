/**
 * AI Assistant Island Entry Point
 * Mounts the floating AI chat widget on every page via data-island="ai-assistant"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import AIAssistant from './AIAssistant'

function mountIslands() {
    document.querySelectorAll('[data-island="ai-assistant"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            accountNumber: container.dataset.accountNumber,
            userId: container.dataset.userId,
            userName: container.dataset.userName,
            userAvatar: container.dataset.userAvatar || null,
            currentPath: window.location.pathname,
        }

        createRoot(container).render(
            <React.StrictMode>
                <AIAssistant {...props} />
            </React.StrictMode>
        )
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

const observer = new MutationObserver(mountIslands)
observer.observe(document.body, { childList: true, subtree: true })

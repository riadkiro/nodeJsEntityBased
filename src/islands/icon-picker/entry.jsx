/**
 * IconPicker Island Entry Point
 * Mounts IconPicker React component on elements with data-island="icon-picker"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import IconPickerIsland from './IconPickerIsland'

function mountIslands() {
    document.querySelectorAll('[data-island="icon-picker"]').forEach(container => {
        // Prevent double-mount
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        const props = {
            name: container.dataset.name || 'icon',
            value: container.dataset.value || '',
            onSelect: container.dataset.onSelect || null
        }

        // If there's a global callback registered
        const callbackName = container.dataset.callback
        if (callbackName && typeof window[callbackName] === 'function') {
            props.externalCallback = window[callbackName]
        }

        const root = createRoot(container)
        root.render(
            <React.StrictMode>
                <IconPickerIsland {...props} />
            </React.StrictMode>
        )

        // Expose API on the container element for external access
        container._iconPickerRoot = root
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

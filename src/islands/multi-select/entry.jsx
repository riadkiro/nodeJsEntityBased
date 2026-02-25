/**
 * MultiSelect Island Entry Point
 * Mounts MultiSelect React component on elements with data-island="multi-select"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import MultiSelectIsland from './MultiSelectIsland'

function mountIslands() {
    document.querySelectorAll('[data-island="multi-select"]').forEach(container => {
        if (container.dataset.mounted === '1') return
        container.dataset.mounted = '1'

        // Parse props from data attributes
        let options = []
        try { options = JSON.parse(container.dataset.options || '[]') } catch (e) { }

        let selected = []
        try { selected = JSON.parse(container.dataset.selected || '[]') } catch (e) { }

        const props = {
            name: container.dataset.name || 'tags',
            options,
            selected,
            placeholder: container.dataset.placeholder || 'Rechercher ou ajouter...',
            createUrl: container.dataset.createUrl || '',
            deleteUrl: container.dataset.deleteUrl || '',
            updateUrl: container.dataset.updateUrl || '',
            accountNumber: container.dataset.accountNumber || '',
            classificationId: container.dataset.classificationId || '',
            multiple: container.dataset.multiple !== 'false', // default true
            creatable: container.dataset.creatable !== 'false', // default true
            editable: container.dataset.editable !== 'false', // default true
            colors: container.dataset.colors !== 'false', // default true
            onChange: null,
        }

        // External callback
        const callbackName = container.dataset.callback
        if (callbackName && typeof window[callbackName] === 'function') {
            props.onChange = window[callbackName]
        }

        const root = createRoot(container)
        root.render(
            <React.StrictMode>
                <MultiSelectIsland {...props} containerEl={container} />
            </React.StrictMode>
        )

        container._multiSelectRoot = root
    })
}

// Mount when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountIslands)
} else {
    mountIslands()
}

// Watch for dynamically added islands (HTMX swaps)
const observer = new MutationObserver(mountIslands)
observer.observe(document.body, { childList: true, subtree: true })

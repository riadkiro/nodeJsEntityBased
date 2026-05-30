/**
 * Dynamic Table Island Entry Point
 * Mounts DynamicTable React component on elements with data-island="dynamic-table"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import DynamicTable from './DynamicTable'
import CreateDynamicTableModal from './components/CreateDynamicTableModal'

function GlobalCreateDynamicTableModalHost() {
    const [state, setState] = React.useState({
        open: false,
        accountNumber: '',
        entityId: '',
        requestId: ''
    })

    React.useEffect(() => {
        const openModal = (detail = {}) => {
            setState({
                open: true,
                accountNumber: detail.accountNumber || '',
                entityId: detail.entityId || '',
                requestId: detail.requestId || ''
            })
        }

        const onOpen = (event) => openModal(event.detail || {})
        window.openDynamicTableCreateModal = openModal
        window.addEventListener('open-dynamic-table-create-modal', onOpen)

        return () => {
            window.removeEventListener('open-dynamic-table-create-modal', onOpen)
            if (window.openDynamicTableCreateModal === openModal) delete window.openDynamicTableCreateModal
        }
    }, [])

    const close = React.useCallback(() => {
        setState(prev => ({ ...prev, open: false }))
    }, [])

    const handleCreated = React.useCallback((schema) => {
        window.dispatchEvent(new CustomEvent('dynamic-table-schema-created', {
            detail: {
                schema,
                requestId: state.requestId,
                accountNumber: state.accountNumber,
                entityId: state.entityId
            }
        }))
        close()
    }, [state.requestId, state.accountNumber, state.entityId, close])

    return (
        <CreateDynamicTableModal
            open={state.open}
            accountNumber={state.accountNumber}
            entityId={state.entityId}
            onClose={close}
            onCreated={handleCreated}
        />
    )
}

function mountGlobalCreateModalHost() {
    if (document.getElementById('dynamic-table-create-modal-host')) return
    const host = document.createElement('div')
    host.id = 'dynamic-table-create-modal-host'
    document.body.appendChild(host)

    createRoot(host).render(
        <React.StrictMode>
            <GlobalCreateDynamicTableModalHost />
        </React.StrictMode>
    )
}

function mountIslands() {
    mountGlobalCreateModalHost()

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

/**
 * Dynamic Table Island Entry Point
 * Mounts DynamicTable React component on elements with data-island="dynamic-table"
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
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

function GlobalEditDynamicTableModalHost() {
    const [state, setState] = React.useState({
        open: false,
        accountNumber: '',
        entityId: '',
        schemaId: '',
        schema: null,
        loading: false
    })

    React.useEffect(() => {
        const openModal = async (detail = {}) => {
            const accountNumber = detail.accountNumber || ''
            const schemaId = detail.schemaId || ''
            const entityId = detail.entityId || ''
            if (!accountNumber || !schemaId) return

            setState({
                open: true,
                accountNumber,
                entityId,
                schemaId,
                schema: null,
                loading: true
            })

            try {
                const res = await fetch(`/account/${accountNumber}/api/line-schemas/${schemaId}`, {
                    credentials: 'include'
                })
                const data = await res.json()
                const schema = data?.data || data
                if (schema && schema._id) {
                    setState(prev => ({ ...prev, schema, loading: false }))
                } else {
                    throw new Error('Schema introuvable')
                }
            } catch (err) {
                console.error('[DynamicTable] Failed to load schema for edit:', err)
                setState(prev => ({ ...prev, open: false, loading: false }))
                if (window.showMessage) {
                    window.showMessage('Impossible de charger le schéma pour modification.', 'error')
                }
            }
        }

        const onOpen = (event) => openModal(event.detail || {})
        window.openDynamicTableEditModal = openModal
        window.addEventListener('open-dynamic-table-edit-modal', onOpen)

        return () => {
            window.removeEventListener('open-dynamic-table-edit-modal', onOpen)
            if (window.openDynamicTableEditModal === openModal) delete window.openDynamicTableEditModal
        }
    }, [])

    const close = React.useCallback(() => {
        setState(prev => ({ ...prev, open: false, schema: null }))
    }, [])

    const handleUpdated = React.useCallback((updatedSchema) => {
        if (window.showMessage) {
            window.showMessage('Tableau mis à jour avec succès.', 'success')
        }
        close()
    }, [close])

    if (state.loading && state.open) {
        return createPortal(
            <div style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: 'rgba(15,23,42,0.38)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{
                    background: '#fff', borderRadius: 14, padding: 32,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
                }}>
                    <iconify-icon icon="svg-spinners:ring-resize" width="24" style={{ color: '#4361ee' }}></iconify-icon>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Chargement du tableau...</span>
                </div>
            </div>,
            document.body
        )
    }

    if (!state.schema) return null

    return (
        <CreateDynamicTableModal
            open={state.open}
            accountNumber={state.accountNumber}
            entityId={state.entityId}
            onClose={close}
            editSchema={state.schema}
            onUpdated={handleUpdated}
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
            <GlobalEditDynamicTableModalHost />
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

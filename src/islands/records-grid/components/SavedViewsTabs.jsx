/**
 * SavedViewsTabs - Horizontal tabs bar for saved filter views
 * Shows saved views as tabs with add button, context menu for rename/delete
 */
import React, { useState, useRef, useEffect } from 'react'

// Color presets for views
const VIEW_COLORS = [
    '#4361ee', '#e7515a', '#00ab55', '#e2a03f', '#8b5cf6',
    '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#6366f1'
]

// Short operator labels for display
function getOperatorShortLabel(op) {
    const labels = {
        contains: '⊃',
        not_contains: '⊅',
        equals: '=',
        not_equals: '≠',
        starts_with: 'A…',
        ends_with: '…Z',
        gt: '>',
        gte: '≥',
        lt: '<',
        lte: '≤',
        between: '↔',
        is_empty: '∅',
        is_not_empty: '∃',
    }
    return labels[op] || op
}

export default function SavedViewsTabs({
    savedViews = [],
    activeViewId,
    onSelectView,
    onCreateView,
    onDeleteView,
    onRenameView,
    onUpdateViewFilters,
    hasActiveFilters = false,
    activeFilters = {},
    fieldFilters = [],
    sidebarFilters = [],
    externalOpenCreate = false,
    onCloseExternalCreate,
}) {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [newViewName, setNewViewName] = useState('')
    const [newViewColor, setNewViewColor] = useState('#4361ee')
    const [contextMenu, setContextMenu] = useState(null) // { viewId, x, y }
    const [editingViewId, setEditingViewId] = useState(null)
    const [editingName, setEditingName] = useState('')
    const contextMenuRef = useRef(null)
    const createInputRef = useRef(null)
    const editInputRef = useRef(null)

    // Close context menu on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setContextMenu(null)
            }
        }
        if (contextMenu) {
            document.addEventListener('mousedown', handleClick)
        }
        return () => document.removeEventListener('mousedown', handleClick)
    }, [contextMenu])

    // Focus input on modal open
    useEffect(() => {
        if (showCreateModal && createInputRef.current) {
            setTimeout(() => createInputRef.current?.focus(), 100)
        }
    }, [showCreateModal])

    // Sync externalOpenCreate prop with internal state
    useEffect(() => {
        if (externalOpenCreate) {
            setShowCreateModal(true)
            onCloseExternalCreate?.()
        }
    }, [externalOpenCreate])

    // Focus inline edit input
    useEffect(() => {
        if (editingViewId && editInputRef.current) {
            editInputRef.current.focus()
            editInputRef.current.select()
        }
    }, [editingViewId])

    const handleContextMenu = (e, viewId) => {
        e.preventDefault()
        setContextMenu({ viewId, x: e.clientX, y: e.clientY })
    }

    const handleCreate = () => {
        if (!newViewName.trim()) return
        onCreateView({
            name: newViewName.trim(),
            color: newViewColor,
            filters: activeFilters,
            fieldFilters: fieldFilters
        })
        setNewViewName('')
        setNewViewColor('#4361ee')
        setShowCreateModal(false)
    }

    const handleStartRename = (viewId) => {
        const view = savedViews.find(v => v._id === viewId)
        if (view) {
            setEditingViewId(viewId)
            setEditingName(view.name)
        }
        setContextMenu(null)
    }

    const handleFinishRename = () => {
        if (editingViewId && editingName.trim()) {
            onRenameView(editingViewId, editingName.trim())
        }
        setEditingViewId(null)
        setEditingName('')
    }

    const handleDelete = (viewId) => {
        onDeleteView(viewId)
        setContextMenu(null)
    }

    const handleUpdateFilters = (viewId) => {
        onUpdateViewFilters(viewId, activeFilters, fieldFilters)
        setContextMenu(null)
    }

    // Get count of active filter conditions for a view
    const getFilterCount = (view) => {
        let count = 0
        if (view.filters) {
            count += Object.keys(view.filters).filter(k => k !== '__favourites').length
        }
        if (view.fieldFilters?.length) {
            count += view.fieldFilters.length
        }
        return count
    }

    return (
        <>
            <div className="saved-views-tabs">
                {/* "All" tab - default with no filters */}
                <button
                    type="button"
                    className={`saved-view-tab ${!activeViewId ? 'saved-view-tab--active' : ''}`}
                    onClick={() => onSelectView(null)}
                >
                    <svg className="saved-view-tab-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 8H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 16H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Tout
                </button>

                {/* Saved view tabs */}
                {savedViews.map(view => (
                    <button
                        key={view._id}
                        type="button"
                        className={`saved-view-tab ${activeViewId === view._id ? 'saved-view-tab--active' : ''}`}
                        style={{
                            '--tab-color': view.color || '#4361ee'
                        }}
                        onClick={() => onSelectView(view._id)}
                        onContextMenu={(e) => handleContextMenu(e, view._id)}
                    >
                        {editingViewId === view._id ? (
                            <input
                                ref={editInputRef}
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={handleFinishRename}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFinishRename()
                                    if (e.key === 'Escape') {
                                        setEditingViewId(null)
                                        setEditingName('')
                                    }
                                }}
                                className="saved-view-tab-edit-input"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <>
                                <span
                                    className="saved-view-tab-dot"
                                    style={{ backgroundColor: view.color || '#4361ee' }}
                                />
                                <span className="saved-view-tab-name">{view.name}</span>
                                {getFilterCount(view) > 0 && (
                                    <span className="saved-view-tab-badge">
                                        {getFilterCount(view)}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                ))}

                {/* Add tab button */}
                <button
                    type="button"
                    className="saved-view-tab saved-view-tab--add"
                    onClick={() => setShowCreateModal(true)}
                    title="Enregistrer une vue"
                >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="saved-view-context-menu"
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        zIndex: 10001
                    }}
                >
                    <button
                        className="saved-view-context-item"
                        onClick={() => handleStartRename(contextMenu.viewId)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path d="M13.9027 6.37027L17.6297 10.0973M4 20.0001H8L18.5 9.50006C18.9978 9.00236 19.2786 8.32622 19.2786 7.62142C19.2786 6.91661 18.9978 6.24047 18.5 5.74277C18.0023 5.24508 17.3261 4.96426 16.6213 4.96426C15.9165 4.96426 15.2404 5.24508 14.7427 5.74277L4 16.0001V20.0001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Renommer
                    </button>
                    <button
                        className="saved-view-context-item"
                        onClick={() => handleUpdateFilters(contextMenu.viewId)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 7H19V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 17H5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Mettre à jour les filtres
                    </button>
                    <div className="saved-view-context-separator" />
                    <button
                        className="saved-view-context-item saved-view-context-item--danger"
                        onClick={() => handleDelete(contextMenu.viewId)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                            <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        Supprimer
                    </button>
                </div>
            )}

            {/* Create View Modal */}
            {showCreateModal && (
                <div className="saved-view-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="saved-view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="saved-view-modal-header">
                            <h3>Enregistrer la vue</h3>
                            <button
                                type="button"
                                className="saved-view-modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="saved-view-modal-body">
                            {/* View name */}
                            <div className="saved-view-form-group">
                                <label className="saved-view-form-label">Nom de la vue</label>
                                <input
                                    ref={createInputRef}
                                    type="text"
                                    value={newViewName}
                                    onChange={(e) => setNewViewName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                                    placeholder="Ex: Hôtels, Clients VIP..."
                                    className="saved-view-form-input"
                                />
                            </div>

                            {/* Color picker */}
                            <div className="saved-view-form-group">
                                <label className="saved-view-form-label">Couleur</label>
                                <div className="saved-view-color-grid">
                                    {VIEW_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`saved-view-color-swatch ${newViewColor === color ? 'saved-view-color-swatch--active' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewViewColor(color)}
                                        >
                                            {newViewColor === color && (
                                                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                                                    <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active filters summary */}
                            <div className="saved-view-form-group">
                                <label className="saved-view-form-label">Filtres actifs</label>
                                {(Object.keys(activeFilters).filter(k => k !== '__favourites').length > 0 || fieldFilters.length > 0) ? (
                                    <div className="saved-view-filter-summary">
                                        {Object.keys(activeFilters).filter(k => k !== '__favourites').map(classifId => {
                                            const filterGroup = sidebarFilters.find(f => f.id === classifId)
                                            const selectedOptions = activeFilters[classifId] || []
                                            return (
                                                <div key={classifId} className="saved-view-filter-group">
                                                    <span className="saved-view-filter-group-label">
                                                        {filterGroup?.name || 'Filtre'}:
                                                    </span>
                                                    <div className="saved-view-filter-tags">
                                                        {selectedOptions.map(optId => {
                                                            const option = filterGroup?.options?.find(o => o.id === optId)
                                                            return (
                                                                <span
                                                                    key={optId}
                                                                    className="saved-view-filter-tag"
                                                                    style={{
                                                                        borderColor: option?.color || '#9ca3af',
                                                                        color: option?.color || '#9ca3af'
                                                                    }}
                                                                >
                                                                    {option?.label || optId}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {/* Field-based advanced filters */}
                                        {fieldFilters.length > 0 && (
                                            <div className="saved-view-filter-group">
                                                <span className="saved-view-filter-group-label">Filtres avancés:</span>
                                                <div className="saved-view-filter-tags">
                                                    {fieldFilters.map((f, i) => (
                                                        <span key={i} className="saved-view-filter-tag" style={{ borderColor: '#4361ee', color: '#4361ee' }}>
                                                            {f.fieldName} {getOperatorShortLabel(f.operator)} {f.value || ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="saved-view-no-filters">
                                        Aucun filtre actif. Utilisez la sidebar pour filtrer d'abord.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="saved-view-modal-footer">
                            <button
                                type="button"
                                className="saved-view-btn saved-view-btn--cancel"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className="saved-view-btn saved-view-btn--save"
                                onClick={handleCreate}
                                disabled={!newViewName.trim()}
                            >
                                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* ── Saved Views Tabs Bar ──────────────────────── */
                .saved-views-tabs {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 0 2px;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .saved-views-tabs::-webkit-scrollbar { display: none; }

                .saved-view-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 14px;
                    border-radius: 20px;
                    font-size: 12.5px;
                    font-weight: 500;
                    white-space: nowrap;
                    cursor: pointer;
                    border: 1.5px solid transparent;
                    background: rgba(0,0,0,0.03);
                    color: #64748b;
                    transition: all 0.2s ease;
                    line-height: 1.4;
                }
                .dark .saved-view-tab {
                    background: rgba(255,255,255,0.04);
                    color: #94a3b8;
                }
                .saved-view-tab:hover {
                    background: rgba(0,0,0,0.06);
                    color: #334155;
                }
                .dark .saved-view-tab:hover {
                    background: rgba(255,255,255,0.08);
                    color: #cbd5e1;
                }

                .saved-view-tab--active {
                    background: var(--tab-color, #4361ee) !important;
                    color: #fff !important;
                    border-color: var(--tab-color, #4361ee) !important;
                    box-shadow: 0 2px 8px rgba(67, 97, 238, 0.3);
                    font-weight: 600;
                }
                .saved-view-tab--active:first-child {
                    --tab-color: #4361ee;
                }

                .saved-view-tab--add {
                    padding: 5px 10px;
                    border: 1.5px dashed #cbd5e1;
                    background: transparent;
                    color: #94a3b8;
                }
                .dark .saved-view-tab--add {
                    border-color: #475569;
                    color: #64748b;
                }
                .saved-view-tab--add:hover {
                    border-color: #4361ee;
                    color: #4361ee;
                    background: rgba(67, 97, 238, 0.05);
                }

                .saved-view-tab-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }

                .saved-view-tab-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .saved-view-tab-name {
                    max-width: 140px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .saved-view-tab-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 16px;
                    height: 16px;
                    padding: 0 4px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 700;
                    background: rgba(0,0,0,0.1);
                    color: inherit;
                }
                .saved-view-tab--active .saved-view-tab-badge {
                    background: rgba(255,255,255,0.25);
                }

                .saved-view-tab-edit-input {
                    width: 100px;
                    padding: 0 4px;
                    border: none;
                    border-bottom: 1.5px solid #4361ee;
                    background: transparent;
                    color: inherit;
                    font-size: 12.5px;
                    font-weight: 500;
                    outline: none;
                }

                /* ── Context Menu ──────────────────────── */
                .saved-view-context-menu {
                    min-width: 180px;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 4px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                    animation: svContextSlide 0.12s ease-out;
                }
                .dark .saved-view-context-menu {
                    background: #0e1726;
                    border-color: rgba(255,255,255,0.1);
                }
                @keyframes svContextSlide {
                    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .saved-view-context-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 8px 12px;
                    border: none;
                    background: none;
                    font-size: 13px;
                    color: #475569;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.15s;
                }
                .dark .saved-view-context-item {
                    color: #cbd5e1;
                }
                .saved-view-context-item:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }
                .dark .saved-view-context-item:hover {
                    background: rgba(255,255,255,0.06);
                    color: #f1f5f9;
                }
                .saved-view-context-item--danger:hover {
                    background: #fef2f2;
                    color: #dc2626;
                }
                .dark .saved-view-context-item--danger:hover {
                    background: rgba(220,38,38,0.1);
                    color: #ef4444;
                }
                .saved-view-context-separator {
                    height: 1px;
                    background: #e2e8f0;
                    margin: 4px 8px;
                }
                .dark .saved-view-context-separator {
                    background: rgba(255,255,255,0.08);
                }

                /* ── Modal ──────────────────────── */
                .saved-view-modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.45);
                    backdrop-filter: blur(4px);
                    animation: svFadeIn 0.2s ease;
                }
                @keyframes svFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .saved-view-modal {
                    width: 440px;
                    max-width: 90vw;
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.2);
                    overflow: hidden;
                    animation: svModalSlide 0.25s ease-out;
                }
                .dark .saved-view-modal {
                    background: #0e1726;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.5);
                }
                @keyframes svModalSlide {
                    from { opacity: 0; transform: translateY(12px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .saved-view-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .dark .saved-view-modal-header {
                    border-color: rgba(255,255,255,0.08);
                }
                .saved-view-modal-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                }
                .dark .saved-view-modal-header h3 {
                    color: #f1f5f9;
                }
                .saved-view-modal-close {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: none;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .saved-view-modal-close:hover {
                    background: #f1f5f9;
                    color: #475569;
                }
                .dark .saved-view-modal-close:hover {
                    background: rgba(255,255,255,0.06);
                    color: #cbd5e1;
                }
                .saved-view-modal-body {
                    padding: 20px 24px;
                }
                .saved-view-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px 24px;
                    border-top: 1px solid #e2e8f0;
                }
                .dark .saved-view-modal-footer {
                    border-color: rgba(255,255,255,0.08);
                }

                /* ── Form elements ──────────────────────── */
                .saved-view-form-group {
                    margin-bottom: 16px;
                }
                .saved-view-form-group:last-child {
                    margin-bottom: 0;
                }
                .saved-view-form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .dark .saved-view-form-label {
                    color: #94a3b8;
                }
                .saved-view-form-input {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 14px;
                    color: #1e293b;
                    background: #fff;
                    transition: all 0.2s;
                    outline: none;
                }
                .dark .saved-view-form-input {
                    background: #1b2e4b;
                    border-color: rgba(255,255,255,0.1);
                    color: #f1f5f9;
                }
                .saved-view-form-input:focus {
                    border-color: #4361ee;
                    box-shadow: 0 0 0 3px rgba(67,97,238,0.1);
                }
                .saved-view-form-input::placeholder {
                    color: #94a3b8;
                }

                .saved-view-color-grid {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .saved-view-color-swatch {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2.5px solid transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .saved-view-color-swatch:hover {
                    transform: scale(1.15);
                }
                .saved-view-color-swatch--active {
                    border-color: #1e293b;
                    transform: scale(1.1);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                .dark .saved-view-color-swatch--active {
                    border-color: #fff;
                }

                .saved-view-filter-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }
                .dark .saved-view-filter-summary {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.06);
                }
                .saved-view-filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .saved-view-filter-group-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .dark .saved-view-filter-group-label {
                    color: #94a3b8;
                }
                .saved-view-filter-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                .saved-view-filter-tag {
                    display: inline-flex;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 500;
                    border: 1.5px solid;
                }
                .saved-view-no-filters {
                    font-size: 13px;
                    color: #94a3b8;
                    font-style: italic;
                    margin: 0;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 10px;
                    text-align: center;
                }
                .dark .saved-view-no-filters {
                    background: rgba(255,255,255,0.03);
                    color: #64748b;
                }

                /* ── Buttons ──────────────────────── */
                .saved-view-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 18px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .saved-view-btn--cancel {
                    background: #f1f5f9;
                    color: #475569;
                }
                .dark .saved-view-btn--cancel {
                    background: rgba(255,255,255,0.06);
                    color: #94a3b8;
                }
                .saved-view-btn--cancel:hover {
                    background: #e2e8f0;
                }
                .dark .saved-view-btn--cancel:hover {
                    background: rgba(255,255,255,0.1);
                }
                .saved-view-btn--save {
                    background: #4361ee;
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(67,97,238,0.3);
                }
                .saved-view-btn--save:hover {
                    background: #3b54d4;
                    box-shadow: 0 4px 12px rgba(67,97,238,0.4);
                    transform: translateY(-1px);
                }
                .saved-view-btn--save:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
            `}</style>
        </>
    )
}

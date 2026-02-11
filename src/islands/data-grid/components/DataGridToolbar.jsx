/**
 * DataGridToolbar - Generic toolbar for DataGrid
 * Pixel-perfect reproduction of RecordsToolbar design
 */
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function DataGridToolbar({
    title,
    icon,
    searchQuery,
    onSearch,
    columns,
    preferences,
    onPreferencesChange,
    loading,
    accountNumber,
    gridId,
    addUrl,
    addLabel,
    addAction
}) {
    const [displayPopover, setDisplayPopover] = useState(false)
    const [sortPopover, setSortPopover] = useState(false)
    const [columnsPopover, setColumnsPopover] = useState(false)
    const [columnSearch, setColumnSearch] = useState('')

    const displayBtnRef = useRef(null)
    const sortBtnRef = useRef(null)
    const columnsBtnRef = useRef(null)
    const displayPanelRef = useRef(null)
    const sortPanelRef = useRef(null)
    const columnsPanelRef = useRef(null)

    const closeAll = () => {
        setDisplayPopover(false)
        setSortPopover(false)
        setColumnsPopover(false)
    }

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') closeAll() }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    const useOutsideClick = (popoverState, panelRef, btnRef, setPopover) => {
        useEffect(() => {
            const handleClick = (e) => {
                if (popoverState &&
                    panelRef.current && !panelRef.current.contains(e.target) &&
                    btnRef.current && !btnRef.current.contains(e.target)) {
                    setPopover(false)
                }
            }
            if (popoverState) {
                setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
            }
            return () => document.removeEventListener('mousedown', handleClick)
        }, [popoverState])
    }

    useOutsideClick(displayPopover, displayPanelRef, displayBtnRef, setDisplayPopover)
    useOutsideClick(sortPopover, sortPanelRef, sortBtnRef, setSortPopover)
    useOutsideClick(columnsPopover, columnsPanelRef, columnsBtnRef, setColumnsPopover)

    const toggleColumn = (columnId) => {
        const exists = preferences.columns.some(col => col.id === columnId)
        let newColumns
        if (exists) {
            newColumns = preferences.columns.map(col =>
                col.id === columnId ? { ...col, visible: !col.visible } : col
            )
        } else {
            newColumns = [...preferences.columns, { id: columnId, visible: false }]
        }
        onPreferencesChange('columns', newColumns)
    }

    const getPosition = (btnRef) => {
        if (!btnRef?.current) return { top: 0, right: 0 }
        const rect = btnRef.current.getBoundingClientRect()
        return {
            top: rect.bottom + 8,
            right: window.innerWidth - rect.right
        }
    }

    const filteredColumns = columnSearch.trim()
        ? columns.filter(col => col.name.toLowerCase().includes(columnSearch.toLowerCase()))
        : columns

    const handleAddClick = () => {
        if (addAction) {
            window.dispatchEvent(new CustomEvent(addAction))
        } else if (addUrl) {
            window.location.href = addUrl
        }
    }

    return (
        <div className="dataTable-top flex items-center mb-0 justify-between gap-2">
            {/* Left: Add + Search */}
            <div className="flex items-center gap-2">
                {/* Add button */}
                {(addUrl || addAction) && (
                    addUrl ? (
                        <a
                            href={addUrl}
                            className="btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                            title={addLabel || 'Ajouter'}
                        >
                            <svg className="btn-add-icon" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                            <span className="btn-add-label">{addLabel || 'Ajouter'}</span>
                        </a>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddClick}
                            className="btn-add-expandable block rounded-full p-2 bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                            title={addLabel || 'Ajouter'}
                        >
                            <svg className="btn-add-icon" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                            <span className="btn-add-label">{addLabel || 'Ajouter'}</span>
                        </button>
                    )
                )}

                {/* Search input */}
                <div className="dataTable-search relative w-64" style={{ marginLeft: 0 }}>
                    <svg className="absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="dataTable-input form-input w-full pl-11 pr-10"
                        style={{ paddingLeft: '33px' }}
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Icon buttons */}
            <div className="flex items-center gap-2">
                {/* Sort */}
                {(() => {
                    const defaultSort = preferences.sort?.field || ''
                    const isSortActive = defaultSort && defaultSort !== 'name'
                    return (
                        <button
                            ref={sortBtnRef}
                            type="button"
                            onClick={() => { setSortPopover(!sortPopover); setDisplayPopover(false); setColumnsPopover(false) }}
                            className={`block rounded-full p-2 transition-all ${sortPopover || isSortActive
                                ? 'bg-primary/20 text-primary'
                                : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'}`}
                            title="Trier"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <path d="M16 18L16 6M16 6L20 10M16 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 6L8 18M8 18L12 14M8 18L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )
                })()}

                {/* Display */}
                <button
                    ref={displayBtnRef}
                    type="button"
                    onClick={() => { setDisplayPopover(!displayPopover); setSortPopover(false); setColumnsPopover(false) }}
                    className={`block rounded-full p-2 transition-all ${displayPopover
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'}`}
                    title="Mode d'affichage"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M10 17H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Columns */}
                <button
                    ref={columnsBtnRef}
                    type="button"
                    onClick={() => { setColumnsPopover(!columnsPopover); setDisplayPopover(false); setSortPopover(false) }}
                    className={`block rounded-full p-2 transition-all ${columnsPopover
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'}`}
                    title="Colonnes visibles"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path d="M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
            </div>

            {/* Sort Popover */}
            {sortPopover && createPortal(
                <>
                    <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setSortPopover(false)} />
                    <div
                        ref={sortPanelRef}
                        className="fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10"
                        style={{ zIndex: 9999, top: getPosition(sortBtnRef).top, right: getPosition(sortBtnRef).right, animation: 'popoverSlide 0.15s ease-out' }}
                    >
                        <div className="text-xs font-medium text-gray-500 dark:text-white-dark mb-2">Trier par</div>
                        <div className="flex gap-2">
                            <select
                                value={preferences.sort?.field || ''}
                                onChange={(e) => onPreferencesChange('sort', { ...preferences.sort, field: e.target.value })}
                                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                            >
                                {columns.filter(c => c.id !== 'actions').map(col => (
                                    <option key={col.id} value={col.id}>{col.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => onPreferencesChange('sort', { ...preferences.sort, direction: preferences.sort?.direction === 'asc' ? 'desc' : 'asc' })}
                                className="p-1.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253b5c] transition-all"
                                title={preferences.sort?.direction === 'asc' ? 'Croissant' : 'Décroissant'}
                            >
                                <svg className={`h-4 w-4 text-gray-600 dark:text-white transition-transform ${preferences.sort?.direction === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}

            {/* Display Popover */}
            {displayPopover && createPortal(
                <>
                    <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setDisplayPopover(false)} />
                    <div
                        ref={displayPanelRef}
                        className="fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10"
                        style={{ zIndex: 9999, top: getPosition(displayBtnRef).top, right: getPosition(displayBtnRef).right, animation: 'popoverSlide 0.15s ease-out' }}
                    >
                        <div className="mb-4">
                            <div className="text-xs font-medium text-gray-500 dark:text-white-dark mb-2">Densité</div>
                            <div className="flex gap-1">
                                {['compact', 'normal', 'comfortable'].map(d => (
                                    <button key={d} onClick={() => onPreferencesChange('density', d)}
                                        className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${preferences.density === d
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60'}`}
                                    >
                                        {d === 'compact' ? 'Compact' : d === 'normal' ? 'Normal' : 'Confort'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="text-xs font-medium text-gray-500 dark:text-white-dark mb-2">Lignes par page</div>
                            <div className="flex gap-1">
                                {[10, 25, 50, 100].map(size => (
                                    <button key={size} onClick={() => onPreferencesChange('pageSize', size)}
                                        className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${preferences.pageSize === size
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-dark/40 text-gray-600 dark:text-white-dark/70 hover:bg-gray-200 dark:hover:bg-dark/60'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}

            {/* Columns Popover */}
            {columnsPopover && createPortal(
                <>
                    <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setColumnsPopover(false)} />
                    <div
                        ref={columnsPanelRef}
                        className="fixed rounded-xl shadow-xl p-4 w-64 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10"
                        style={{ zIndex: 9999, top: getPosition(columnsBtnRef).top, right: getPosition(columnsBtnRef).right, animation: 'popoverSlide 0.15s ease-out' }}
                    >
                        <div className="text-xs font-medium text-gray-500 dark:text-white-dark mb-2">Colonnes visibles</div>
                        <div className="relative mb-2">
                            <input
                                type="text" value={columnSearch}
                                onChange={(e) => setColumnSearch(e.target.value)}
                                placeholder="Filtrer..."
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1b2e4b] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-0.5 max-h-48 overflow-y-auto">
                            {filteredColumns.map(col => {
                                const pref = preferences.columns.find(p => p.id === col.id)
                                const isVisible = pref ? pref.visible !== false : true
                                return (
                                    <label key={col.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg">
                                        <input type="checkbox" checked={isVisible} onChange={() => toggleColumn(col.id)} className="form-checkbox text-primary w-3.5 h-3.5 rounded" />
                                        <span className="text-xs text-gray-700 dark:text-gray-300">{col.name}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                </>,
                document.body
            )}

            <style>{`
                @keyframes popoverSlide {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .btn-add-expandable {
                    display: inline-flex;
                    align-items: center;
                    gap: 0;
                    height: 34px;
                    padding: 0 9px;
                    cursor: pointer;
                    text-decoration: none;
                    overflow: hidden;
                    white-space: nowrap;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                }
                .btn-add-expandable:hover {
                    gap: 6px;
                    height: 34px;
                    padding: 0 16px;
                    background-color: #22bce9 !important;
                    color: #fff !important;
                    box-shadow: 0 4px 12px rgba(34, 188, 233, 0.4);
                    transform: translateY(-1px);
                }
                .btn-add-icon {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }
                .btn-add-label {
                    max-width: 0;
                    opacity: 0;
                    overflow: hidden;
                    transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
                }
                .btn-add-expandable:hover .btn-add-label {
                    max-width: 120px;
                    opacity: 1;
                }
            `}</style>
        </div>
    )
}

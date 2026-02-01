/**
 * RecordsToolbar - Clean minimalist toolbar
 * Search + Icon buttons for settings
 */
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function RecordsToolbar({
    searchQuery,
    onSearch,
    columns,
    preferences,
    onPreferencesChange,
    loading,
    accountNumber,
    entitySlug,
    viewId
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

    // Close all popovers
    const closeAll = () => {
        setDisplayPopover(false)
        setSortPopover(false)
        setColumnsPopover(false)
    }

    // Close popovers on ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeAll()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    // Generic outside click handler
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

    // Toggle column visibility
    const toggleColumn = (columnId) => {
        const newColumns = preferences.columns.map(col =>
            col.id === columnId ? { ...col, visible: !col.visible } : col
        )
        onPreferencesChange('columns', newColumns)
    }

    // Get popover position
    const getPosition = (btnRef) => {
        if (!btnRef?.current) return { top: 0, right: 0 }
        const rect = btnRef.current.getBoundingClientRect()
        return {
            top: rect.bottom + 8,
            right: window.innerWidth - rect.right
        }
    }

    // Filtered columns for search
    const filteredColumns = columnSearch.trim()
        ? columns.filter(col => col.name.toLowerCase().includes(columnSearch.toLowerCase()))
        : columns

    return (
        <div className="dataTable-top flex items-center mb-0 justify-between gap-2">
            {/* Search input - LEFT */}
            <div className="dataTable-search relative w-64" style={{ marginLeft: 0 }}>
                <svg
                    className="absolute left-4 top-1/2 ml-2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="dataTable-input form-input w-full pl-11 pr-10"
                    style={{ "padding-left": "33px" }}
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                )}
            </div>
            {/* Icons group - RIGHT */}
            <div className="flex items-center gap-2">
                {/* View switcher - Kanban */}
                <a
                    href={`/account/${accountNumber}/test-progressive/${entitySlug}?viewType=kanban`}
                    className="p-2 rounded-lg border transition-all border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary/50"
                    title="Vue Kanban"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="9.5" y="3" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="16" y="3" width="5" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </a>

                {/* Sort button */}
                {(() => {
                    const isSortActive = preferences.sort?.field !== 'createdAt' || preferences.sort?.direction !== 'desc'
                    return (
                        <button
                            ref={sortBtnRef}
                            type="button"
                            onClick={() => { setSortPopover(!sortPopover); setDisplayPopover(false); setColumnsPopover(false) }}
                            className={`p-2 rounded-lg border transition-all ${sortPopover || isSortActive
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary/50'}`}
                            title="Trier"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <path d="M16 18L16 6M16 6L20 10M16 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 6L8 18M8 18L12 14M8 18L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )
                })()}

                {/* Display settings button (density + pageSize) */}
                <button
                    ref={displayBtnRef}
                    type="button"
                    onClick={() => { setDisplayPopover(!displayPopover); setSortPopover(false); setColumnsPopover(false) }}
                    className={`p-2 rounded-lg border transition-all ${displayPopover
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary/50'}`}
                    title="Mode d'affichage"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M10 17H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Columns visibility button */}
                <button
                    ref={columnsBtnRef}
                    type="button"
                    onClick={() => { setColumnsPopover(!columnsPopover); setDisplayPopover(false); setSortPopover(false) }}
                    className={`p-2 rounded-lg border transition-all ${columnsPopover
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary/50'}`}
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
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 9998 }}
                        onClick={() => setSortPopover(false)}
                    />
                    <div
                        ref={sortPanelRef}
                        className="fixed bg-white dark:bg-[#1b2e4b] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72"
                        style={{
                            zIndex: 9999,
                            top: getPosition(sortBtnRef).top,
                            right: getPosition(sortBtnRef).right,
                            animation: 'popoverSlide 0.15s ease-out'
                        }}
                    >
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Trier par</div>
                        <div className="flex gap-2">
                            {/* Column selector */}
                            <select
                                value={preferences.sort?.field || 'createdAt'}
                                onChange={(e) => onPreferencesChange('sort', {
                                    ...preferences.sort,
                                    field: e.target.value
                                })}
                                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            >
                                <option value="createdAt">Date de création</option>
                                <option value="title">Titre</option>
                                {columns.filter(c => c.id !== 'title' && c.id !== 'actions').map(col => (
                                    <option key={col.id} value={col.id}>{col.name}</option>
                                ))}
                            </select>

                            {/* Direction toggle */}
                            <button
                                onClick={() => onPreferencesChange('sort', {
                                    ...preferences.sort,
                                    direction: preferences.sort?.direction === 'asc' ? 'desc' : 'asc'
                                })}
                                className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                title={preferences.sort?.direction === 'asc' ? 'Croissant' : 'Décroissant'}
                            >
                                <svg
                                    className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform ${preferences.sort?.direction === 'asc' ? 'rotate-180' : ''}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {/* Reset sort */}
                            <button
                                onClick={() => onPreferencesChange('sort', { field: 'createdAt', direction: 'desc' })}
                                className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-red-50 hover:border-red-300 hover:text-red-500 dark:hover:bg-red-900/20 transition-all"
                                title="Réinitialiser le tri"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.49944 20 7.26681 18.8527 5.79984 17.0558" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15 7H19V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 17H5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 9998 }}
                        onClick={() => setDisplayPopover(false)}
                    />
                    <div
                        ref={displayPanelRef}
                        className="fixed bg-white dark:bg-[#1b2e4b] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72"
                        style={{
                            zIndex: 9999,
                            top: getPosition(displayBtnRef).top,
                            right: getPosition(displayBtnRef).right,
                            animation: 'popoverSlide 0.15s ease-out'
                        }}
                    >
                        {/* Density */}
                        <div className="mb-4">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Densité</div>
                            <div className="flex gap-1">
                                {['compact', 'normal', 'comfortable'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => onPreferencesChange('density', d)}
                                        className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${preferences.density === d
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        {d === 'compact' ? 'Compact' : d === 'normal' ? 'Normal' : 'Confort'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Page Size */}
                        <div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Lignes par page</div>
                            <div className="flex gap-1">
                                {[10, 25, 50, 100].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => onPreferencesChange('pageSize', size)}
                                        className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${preferences.pageSize === size
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                            }`}
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
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 9998 }}
                        onClick={() => setColumnsPopover(false)}
                    />
                    <div
                        ref={columnsPanelRef}
                        className="fixed bg-white dark:bg-[#1b2e4b] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64"
                        style={{
                            zIndex: 9999,
                            top: getPosition(columnsBtnRef).top,
                            right: getPosition(columnsBtnRef).right,
                            animation: 'popoverSlide 0.15s ease-out'
                        }}
                    >
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Colonnes visibles</div>

                        {/* Search */}
                        <div className="relative mb-2">
                            <input
                                type="text"
                                value={columnSearch}
                                onChange={(e) => setColumnSearch(e.target.value)}
                                placeholder="Filtrer..."
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>

                        {/* Column list */}
                        <div className="space-y-0.5 max-h-48 overflow-y-auto">
                            {filteredColumns.map(col => {
                                const pref = preferences.columns.find(p => p.id === col.id)
                                const isVisible = pref ? pref.visible !== false : true
                                return (
                                    <label
                                        key={col.id}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isVisible}
                                            onChange={() => toggleColumn(col.id)}
                                            className="form-checkbox text-primary w-3.5 h-3.5 rounded"
                                        />
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
            `}</style>
        </div>
    )
}

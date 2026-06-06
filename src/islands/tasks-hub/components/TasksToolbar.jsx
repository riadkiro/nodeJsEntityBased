/**
 * TasksToolbar — Toolbar with integrated View Switcher
 * 
 * Contains:
 * - Add button (expandable pill)
 * - Search input
 * - View mode switcher (table, kanban, checklist, calendar, timeline)
 * - Settings popover (density, page size)
 * - Sort popover
 * - Columns popover
 * - Sidebar toggle
 * 
 * The view switcher shows icon-only buttons that switch views instantly.
 */
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

// ─── View definitions with icons ────────────────────────────────────
const VIEW_MODES = [
    {
        id: 'table',
        label: 'Tableau',
        // Table/list icon
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M3 7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 17H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 'kanban',
        label: 'Kanban',
        // Board/columns icon
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <rect x="3" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10" y="3" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="17" y="3" width="4" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: 'checklist',
        label: 'Checklist',
        // Checklist icon
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 15L6 17L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 7H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 15H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 'calendar',
        label: 'Calendrier',
        // Calendar icon
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 'timeline',
        label: 'Timeline',
        // Timeline/gantt icon
        icon: (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <rect x="4" y="5" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="8" y="11" width="10" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="6" y="17" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
]

export default function TasksToolbar({
    title,
    icon,
    activeView,
    onViewChange,
    searchQuery,
    onSearch,
    columns,
    preferences,
    onPreferencesChange,
    loading,
    showSidebar,
    onToggleSidebar,
    addUrl,
    addLabel,
    totalCount,
}) {
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [sortOpen, setSortOpen] = useState(false)
    const [columnsOpen, setColumnsOpen] = useState(false)
    const [columnSearch, setColumnSearch] = useState('')

    const settingsBtnRef = useRef(null)
    const sortBtnRef = useRef(null)
    const columnsBtnRef = useRef(null)
    const settingsPanelRef = useRef(null)
    const sortPanelRef = useRef(null)
    const columnsPanelRef = useRef(null)

    // Close all popovers
    const closeAll = () => {
        setSettingsOpen(false)
        setSortOpen(false)
        setColumnsOpen(false)
    }

    // Escape key handler
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') closeAll() }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    // Outside click handler hook
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

    useOutsideClick(settingsOpen, settingsPanelRef, settingsBtnRef, setSettingsOpen)
    useOutsideClick(sortOpen, sortPanelRef, sortBtnRef, setSortOpen)
    useOutsideClick(columnsOpen, columnsPanelRef, columnsBtnRef, setColumnsOpen)

    // Toggle column visibility
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

    // Popover positioning helper
    const getPosition = (btnRef) => {
        if (!btnRef?.current) return { top: 0, right: 0 }
        const rect = btnRef.current.getBoundingClientRect()
        return {
            top: rect.bottom + 8,
            right: window.innerWidth - rect.right,
        }
    }

    const filteredColumns = columnSearch.trim()
        ? columns.filter(col => col.name.toLowerCase().includes(columnSearch.toLowerCase()))
        : columns

    return (
        <div className="dataTable-top flex flex-col items-stretch justify-between gap-2 mb-0 sm:flex-row sm:items-center">
            {/* Left: Add + Search */}
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                {/* Add button */}
                {addUrl && (
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
                )}

                {/* Search */}
                <div className="dataTable-search relative min-w-[180px] flex-1 sm:w-64 sm:flex-none" style={{ marginLeft: 0 }}>
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

                {/* Record count badge */}
                <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums whitespace-nowrap">
                    {totalCount} tâche{totalCount !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Center: View Switcher */}
            <div className="flex w-full items-center overflow-x-auto bg-gray-100 dark:bg-[#1b2e4b] rounded-xl p-1 gap-0.5 sm:w-auto">
                {VIEW_MODES.map(mode => (
                    <button
                        key={mode.id}
                        type="button"
                        onClick={() => onViewChange(mode.id)}
                        title={mode.label}
                        className={`
                            relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 
                            ${activeView === mode.id
                                ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                            }
                        `}
                    >
                        {mode.icon}
                        {/* Active indicator dot */}
                        {activeView === mode.id && (
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary dark:bg-white" />
                        )}
                    </button>
                ))}
            </div>

            {/* Right: Settings buttons */}
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                {/* Sidebar toggle */}
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className={`btn-sidebar-toggle block rounded-full p-2 transition-all ${showSidebar
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'}`}
                    title={showSidebar ? 'Masquer le panneau' : 'Afficher le panneau'}
                >
                    <svg className="btn-sidebar-icon h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path d="M3 4H21V20H3V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M9 4V20" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span className="btn-sidebar-label">{showSidebar ? 'Masquer' : 'Panneau'}</span>
                </button>

                {/* Sort (only for table/checklist) */}
                {(activeView === 'table' || activeView === 'checklist') && (
                    <button
                        ref={sortBtnRef}
                        type="button"
                        onClick={() => { setSortOpen(!sortOpen); setSettingsOpen(false); setColumnsOpen(false) }}
                        className={`block rounded-full p-2 transition-all ${sortOpen
                            ? 'bg-primary/20 text-primary'
                            : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'}`}
                        title="Trier"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M16 18L16 6M16 6L20 10M16 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 6L8 18M8 18L12 14M8 18L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}

                {/* Settings (density + page size) */}
                <button
                    ref={settingsBtnRef}
                    type="button"
                    onClick={() => { setSettingsOpen(!settingsOpen); setSortOpen(false); setColumnsOpen(false) }}
                    className={`block rounded-full p-2 transition-all ${settingsOpen
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'}`}
                    title="Affichage"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M2 12.88V11.12C2 10.08 2.85 9.22 3.9 9.22C5.71 9.22 6.45 7.94 5.54 6.37C5.02 5.47 5.33 4.3 6.24 3.78L7.97 2.79C8.76 2.32 9.78 2.6 10.25 3.39L10.36 3.58C11.26 5.15 12.74 5.15 13.65 3.58L13.76 3.39C14.23 2.6 15.25 2.32 16.04 2.79L17.77 3.78C18.68 4.3 18.99 5.47 18.47 6.37C17.56 7.94 18.3 9.22 20.11 9.22C21.15 9.22 22.01 10.08 22.01 11.12V12.88C22.01 13.92 21.16 14.78 20.11 14.78C18.3 14.78 17.56 16.06 18.47 17.63C18.99 18.54 18.68 19.7 17.77 20.22L16.04 21.21C15.25 21.68 14.23 21.4 13.76 20.61L13.65 20.42C12.75 18.85 11.27 18.85 10.36 20.42L10.25 20.61C9.78 21.4 8.76 21.68 7.97 21.21L6.24 20.22C5.33 19.7 5.02 18.53 5.54 17.63C6.45 16.06 5.71 14.78 3.9 14.78C2.85 14.78 2 13.92 2 12.88Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Columns (only for table) */}
                {activeView === 'table' && (
                    <button
                        ref={columnsBtnRef}
                        type="button"
                        onClick={() => { setColumnsOpen(!columnsOpen); setSettingsOpen(false); setSortOpen(false) }}
                        className={`block rounded-full p-2 transition-all ${columnsOpen
                            ? 'bg-primary/20 text-primary'
                            : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'}`}
                        title="Colonnes"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Sort Popover ── */}
            {sortOpen && createPortal(
                <>
                    <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setSortOpen(false)} />
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

            {/* ── Settings Popover ── */}
            {settingsOpen && createPortal(
                <>
                    <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setSettingsOpen(false)} />
                    <div
                        ref={settingsPanelRef}
                        className="fixed rounded-xl shadow-xl p-4 w-72 bg-white dark:bg-[#0e1726] border border-gray-100 dark:border-white/10"
                        style={{ zIndex: 9999, top: getPosition(settingsBtnRef).top, right: getPosition(settingsBtnRef).right, animation: 'popoverSlide 0.15s ease-out' }}
                    >
                        {/* Density */}
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
                        {/* Page size */}
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

            {/* ── Columns Popover ── */}
            {columnsOpen && createPortal(
                <>
                    <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setColumnsOpen(false)} />
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

            {/* ── Styles ── */}
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
                    max-width: 150px;
                    opacity: 1;
                }
                .btn-sidebar-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 0;
                    height: 34px;
                    padding: 0 9px;
                    cursor: pointer;
                    overflow: hidden;
                    white-space: nowrap;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                }
                .btn-sidebar-toggle:hover {
                    gap: 6px;
                    padding: 0 16px;
                }
                .btn-sidebar-icon {
                    flex-shrink: 0;
                }
                .btn-sidebar-label {
                    max-width: 0;
                    opacity: 0;
                    overflow: hidden;
                    transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
                }
                .btn-sidebar-toggle:hover .btn-sidebar-label {
                    max-width: 100px;
                    opacity: 1;
                }
            `}</style>
        </div>
    )
}

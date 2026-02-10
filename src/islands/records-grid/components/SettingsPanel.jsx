/**
 * SettingsPanel - Floating Popover (Portal Rendered)
 * Professional SaaS-grade UX with smooth animations
 * Uses createPortal to escape stacking context issues
 */
import React, { useEffect, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function SettingsPanel({
    open,
    onClose,
    columns,
    preferences,
    onPreferencesChange,
    triggerRef // Reference to the button that opened this popover
}) {
    const panelRef = useRef(null)
    const [columnSearch, setColumnSearch] = useState('')
    const [position, setPosition] = useState({ top: 0, right: 0 })

    // Calculate position based on trigger button
    useEffect(() => {
        if (open && triggerRef?.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 8, // 8px gap below button
                right: window.innerWidth - rect.right // Align right edge
            })
        }
    }, [open, triggerRef])

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && open) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [open, onClose])

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                open &&
                panelRef.current &&
                !panelRef.current.contains(event.target) &&
                triggerRef?.current &&
                !triggerRef.current.contains(event.target)
            ) {
                onClose()
            }
        }

        if (open) {
            // Delay to avoid immediate close on open click
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside)
            }, 0)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [open, onClose, triggerRef])

    // Toggle column visibility
    const toggleColumn = useCallback((columnId) => {
        const newColumns = preferences.columns.map(col =>
            col.id === columnId ? { ...col, visible: !col.visible } : col
        )
        onPreferencesChange('columns', newColumns)
    }, [preferences.columns, onPreferencesChange])

    // Handle page size change
    const handlePageSizeChange = useCallback((size) => {
        onPreferencesChange('pageSize', size)
    }, [onPreferencesChange])

    // Handle density change
    const handleDensityChange = useCallback((density) => {
        onPreferencesChange('density', density)
    }, [onPreferencesChange])

    // Filter columns based on search
    const filteredColumns = columnSearch.trim()
        ? columns.filter(col =>
            col.name.toLowerCase().includes(columnSearch.toLowerCase())
        )
        : columns

    if (!open) return null

    // Use createPortal to render directly in body, escaping all stacking contexts
    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40 transition-opacity duration-200"
                style={{
                    zIndex: 9998,
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={onClose}
            />

            {/* Floating Popover Panel - Anchored to button */}
            <div
                ref={panelRef}
                className="fixed w-[360px] max-w-[calc(100vw-32px)] bg-white dark:bg-[#0e1726] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                style={{
                    zIndex: 9999,
                    top: `${position.top}px`,
                    right: `${position.right}px`,
                    animation: 'popoverEntry 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxHeight: 'calc(100vh - 80px)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Paramètres d'affichage
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Fermer"
                    >
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                    <div className="p-4 space-y-5">
                        {/* Density */}
                        <div>
                            <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Densité
                            </div>
                            <div className="flex gap-2">
                                {['compact', 'normal', 'comfortable'].map(density => (
                                    <button
                                        key={density}
                                        onClick={() => handleDensityChange(density)}
                                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${preferences.density === density
                                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                            : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {density === 'compact' ? 'Compact' : density === 'normal' ? 'Normal' : 'Confort'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Page Size */}
                        <div>
                            <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Lignes par page
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[10, 25, 50, 100].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => handlePageSizeChange(size)}
                                        className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${preferences.pageSize === size
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Columns */}
                        <div>
                            <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                Colonnes visibles
                            </div>

                            {/* Column search */}
                            <div className="relative mb-2">
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <input
                                    type="text"
                                    value={columnSearch}
                                    onChange={(e) => setColumnSearch(e.target.value)}
                                    placeholder="Filtrer colonnes..."
                                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            {/* Column list */}
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                {filteredColumns.length === 0 ? (
                                    <div className="text-xs text-gray-500 text-center py-4">
                                        Aucune colonne trouvée
                                    </div>
                                ) : (
                                    filteredColumns.map(col => {
                                        const pref = preferences.columns.find(p => p.id === col.id)
                                        const isVisible = pref ? pref.visible !== false : true

                                        return (
                                            <label
                                                key={col.id}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-2 rounded-lg transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isVisible}
                                                    onChange={() => toggleColumn(col.id)}
                                                    className="form-checkbox text-primary w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                                                />
                                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                                    {col.name}
                                                </span>
                                            </label>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popoverEntry {
                    from {
                        opacity: 0;
                        transform: translateY(-8px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </>,
        document.body
    )
}

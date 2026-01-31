/**
 * SettingsPanel - Canva-style slide-out panel
 * Pixel-perfect reproduction of existing HTMX settings panel styling
 */
import React, { useEffect, useCallback } from 'react'

export default function SettingsPanel({
    open,
    onClose,
    columns,
    preferences,
    onPreferencesChange
}) {
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

    if (!open) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                onClick={onClose}
                data-datatable-target="settingsBackdrop"
            />

            {/* Panel */}
            <div
                className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-[#0e1726] shadow-xl z-50 transform transition-transform translate-x-0"
                data-datatable-target="settingsPanel"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Paramètres d'affichage
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6 overflow-y-auto" style={{ height: 'calc(100% - 65px)' }}>
                    {/* Density */}
                    <div>
                        <div className="text-xs font-semibold mb-3 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Densité
                        </div>
                        <div className="flex gap-2">
                            {['compact', 'normal', 'comfortable'].map(density => (
                                <button
                                    key={density}
                                    onClick={() => handleDensityChange(density)}
                                    className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${preferences.density === density
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/50'
                                        }`}
                                >
                                    {density === 'compact' ? 'Compact' : density === 'normal' ? 'Normal' : 'Confort'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Page Size */}
                    <div>
                        <div className="text-xs font-semibold mb-3 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Lignes par page
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[10, 25, 50, 100].map(size => (
                                <button
                                    key={size}
                                    onClick={() => handlePageSizeChange(size)}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${preferences.pageSize === size
                                        ? 'bg-primary text-white'
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
                        <div className="text-xs font-semibold mb-3 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Colonnes visibles
                        </div>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                            {columns.map(col => {
                                const pref = preferences.columns.find(p => p.id === col.id)
                                const isVisible = pref ? pref.visible !== false : true

                                return (
                                    <label
                                        key={col.id}
                                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-2 rounded-md"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isVisible}
                                            onChange={() => toggleColumn(col.id)}
                                            className="form-checkbox text-primary w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {col.name}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

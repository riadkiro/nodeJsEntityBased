/**
 * TasksSidebar — Filter panel for tasks
 * 
 * Displays classification-based filters (status, priority, tags)
 * with counts per option and multi-select toggles.
 * Also shows total/filtered count summary.
 */
import React, { useState } from 'react'

export default function TasksSidebar({
    title,
    icon,
    filters,
    activeFilters,
    onFilterChange,
    showSidebar,
    addUrl,
    addLabel,
    accountNumber,
    totalCount,
    filteredCount,
}) {
    const [collapsedGroups, setCollapsedGroups] = useState({})

    if (!showSidebar) return null

    // Toggle a filter option on/off
    const toggleFilterOption = (filterId, optionId) => {
        const current = activeFilters[filterId] || []
        const isActive = current.includes(optionId)
        const updated = isActive
            ? current.filter(id => id !== optionId)
            : [...current, optionId]

        const newFilters = { ...activeFilters }
        if (updated.length === 0) {
            delete newFilters[filterId]
        } else {
            newFilters[filterId] = updated
        }
        onFilterChange(newFilters)
    }

    // Clear all filters for a group
    const clearGroup = (filterId) => {
        const newFilters = { ...activeFilters }
        delete newFilters[filterId]
        onFilterChange(newFilters)
    }

    // Toggle group collapse
    const toggleGroup = (filterId) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [filterId]: !prev[filterId]
        }))
    }

    // Check if any filters are active
    const hasActiveFilters = Object.keys(activeFilters).length > 0

    return (
        <div className="panel p-4 w-64 flex-shrink-0 flex flex-col overflow-hidden h-full" style={{ minWidth: '240px' }}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b dark:border-gray-800">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none">
                        <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 15L6 17L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13 7H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M13 15H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
                    <p className="text-xs text-gray-400">
                        {hasActiveFilters
                            ? `${filteredCount} sur ${totalCount}`
                            : `${totalCount} tâche${totalCount !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>
            </div>

            {/* Clear all filters */}
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={() => onFilterChange({})}
                    className="text-xs text-primary hover:text-primary/80 mb-3 flex items-center gap-1"
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Effacer tous les filtres
                </button>
            )}

            {/* Filter groups */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {filters.map(filter => {
                    const isCollapsed = collapsedGroups[filter.id]
                    const activeCount = (activeFilters[filter.id] || []).length

                    return (
                        <div key={filter.id} className="rounded-lg">
                            {/* Group header */}
                            <button
                                type="button"
                                onClick={() => toggleGroup(filter.id)}
                                className="w-full flex items-center justify-between py-1.5 px-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                            >
                                <span className="flex items-center gap-1.5">
                                    {filter.name}
                                    {activeCount > 0 && (
                                        <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                            {activeCount}
                                        </span>
                                    )}
                                </span>
                                <svg
                                    className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                                    viewBox="0 0 24 24" fill="none"
                                >
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>

                            {/* Options */}
                            {!isCollapsed && (
                                <div className="space-y-0.5 mt-1">
                                    {filter.options.map(opt => {
                                        const isActive = (activeFilters[filter.id] || []).includes(opt.id)
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => toggleFilterOption(filter.id, opt.id)}
                                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${isActive
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {/* Color dot */}
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: opt.color || '#9ca3af' }}
                                                />
                                                <span className="flex-1 text-left truncate">{opt.label}</span>
                                                <span className="text-[10px] text-gray-400 tabular-nums">{opt.count}</span>
                                            </button>
                                        )
                                    })}
                                    {activeCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => clearGroup(filter.id)}
                                            className="text-[10px] text-gray-400 hover:text-primary px-2 py-1"
                                        >
                                            Effacer
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

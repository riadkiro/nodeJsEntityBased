/**
 * TasksSidebar — Task Lists + Classification Filters
 * 
 * Primary navigation: task lists (from the 'task_list' classification)
 * Secondary: classification-based filters (status, priority, tags)
 */
import React, { useState, useMemo } from 'react'

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
    rows,
    activeList,
    onListChange,
}) {
    const [collapsedGroups, setCollapsedGroups] = useState({})

    if (!showSidebar) return null

    // Extract the "list" filter from filters (to render as primary nav)
    const listFilter = filters.find(f => f.field === 'list')
    const otherFilters = filters.filter(f => f.field !== 'list')

    // Count tasks per list
    const listCounts = useMemo(() => {
        const counts = {}
        ;(rows || []).forEach(row => {
            const listName = row.list || 'Sans liste'
            counts[listName] = (counts[listName] || 0) + 1
        })
        return counts
    }, [rows])

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
        <div className="panel p-0 w-64 flex-shrink-0 flex flex-col overflow-hidden h-full" style={{ minWidth: '240px' }}>
            {/* ─── Header ─── */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4361ee15' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: '#4361ee' }}>
                        <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 15L6 17L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13 7H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M13 15H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
                    <p className="text-[11px] text-gray-400 tabular-nums">
                        {hasActiveFilters || activeList
                            ? `${filteredCount} sur ${totalCount}`
                            : `${totalCount} tâche${totalCount !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>
            </div>

            {/* ─── Task Lists (Primary Nav) ─── */}
            <div className="px-2 mb-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1.5">Listes</div>

                {/* "Toutes" */}
                <button
                    type="button"
                    onClick={() => onListChange(null)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{
                        backgroundColor: !activeList ? '#4361ee10' : 'transparent',
                        color: !activeList ? '#4361ee' : '#6b7280',
                    }}
                >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M3 17H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="flex-1 text-left truncate">Toutes</span>
                    <span className="text-[11px] font-semibold tabular-nums opacity-60">{totalCount}</span>
                </button>

                {/* List items from classification */}
                {listFilter && listFilter.options.map(opt => {
                    const isActive = activeList === opt.label
                    const count = listCounts[opt.label] || 0
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onListChange(isActive ? null : opt.label)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                            style={{
                                backgroundColor: isActive ? (opt.color || '#4361ee') + '12' : 'transparent',
                                color: isActive ? (opt.color || '#4361ee') : '#6b7280',
                            }}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-md flex-shrink-0"
                                style={{ backgroundColor: opt.color || '#9ca3af' }}
                            />
                            <span className="flex-1 text-left truncate">{opt.label}</span>
                            {count > 0 && (
                                <span className="text-[11px] font-semibold tabular-nums opacity-60">{count}</span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ─── Divider ─── */}
            <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '4px 16px 8px' }} className="dark:!bg-gray-800" />

            {/* ─── Classification Filters ─── */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-2">
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={() => onFilterChange({})}
                        className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1"
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Effacer les filtres
                    </button>
                )}

                {otherFilters.map(filter => {
                    const isCollapsed = collapsedGroups[filter.id]
                    const activeCount = (activeFilters[filter.id] || []).length

                    return (
                        <div key={filter.id}>
                            {/* Group header */}
                            <button
                                type="button"
                                onClick={() => toggleGroup(filter.id)}
                                className="w-full flex items-center justify-between py-1.5 px-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white uppercase tracking-wider"
                            >
                                <span className="flex items-center gap-1.5">
                                    {filter.name}
                                    {activeCount > 0 && (
                                        <span className="bg-primary text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center normal-case">
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
                                <div className="flex flex-wrap gap-1 mt-1 px-1">
                                    {filter.options.map(opt => {
                                        const isActive = (activeFilters[filter.id] || []).includes(opt.id)
                                        const tagColor = opt.color || '#9ca3af'
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => toggleFilterOption(filter.id, opt.id)}
                                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-200"
                                                style={{
                                                    backgroundColor: isActive ? tagColor + '20' : 'transparent',
                                                    color: isActive ? tagColor : '#6b7280',
                                                    border: `1.5px solid ${isActive ? tagColor + '60' : '#e5e7eb'}`,
                                                }}
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: tagColor }}
                                                />
                                                {opt.label}
                                                <span className="text-[10px] tabular-nums font-semibold" style={{ opacity: 0.5 }}>
                                                    {opt.count}
                                                </span>
                                            </button>
                                        )
                                    })}
                                    {activeCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => clearGroup(filter.id)}
                                            className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-full text-[10px] text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none">
                                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
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

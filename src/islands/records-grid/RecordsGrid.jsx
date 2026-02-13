/**
 * RecordsGrid - React Island Component
 * Virtual scrolling DataTable for large datasets (>5k rows)
 * Pixel-perfect reproduction of existing HTMX DataTable styling
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import RecordsToolbar from './components/RecordsToolbar'
import RecordsTable from './components/RecordsTable'
import RecordsKanban from './components/RecordsKanban'
import RecordsNotes from './components/RecordsNotes'
import RecordsSidebar from './components/RecordsSidebar'

export default function RecordsGrid({
    accountId,
    accountNumber,
    entityId,
    viewId,
    entityName,
    entityNamePlural,
    entitySlug
}) {
    // State - CLIENT-SIDE SEARCH
    const [allRecords, setAllRecords] = useState([])  // All fetched records (immutable after load)
    const [filteredRecords, setFilteredRecords] = useState([])  // After search + classification filter
    const [displayRecords, setDisplayRecords] = useState([])  // Current page slice
    const [columns, setColumns] = useState([])
    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeView, setActiveView] = useState('table')
    const [entityIcon, setEntityIcon] = useState('')

    // Filter state (classification-based)
    const [sidebarFilters, setSidebarFilters] = useState([])
    const [activeFilters, setActiveFilters] = useState({})

    // Preferences state
    const [preferences, setPreferences] = useState({
        columns: [],
        sort: { field: 'createdAt', direction: 'desc' },
        density: 'normal',
        pageSize: 10,
        titleDisplay: 'avatar',
        showSidebar: true,
        viewMode: null,
        enabledViews: ['table', 'kanban', 'notes']
    })

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    })

    // Refs
    const parentRef = useRef(null)

    // Fetch ALL records once (CLIENT-SIDE SEARCH)
    const fetchRecords = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams({
                limit: 10000,  // Fetch all records
                sort: `${preferences.sort.field}:${preferences.sort.direction}`
            })

            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/views/${viewId}/records?${queryParams}`,
                { credentials: 'include' }
            )

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }

            const data = await res.json()

            setAllRecords(data.records || [])
            setFilteredRecords(data.records || [])

            // Store entity icon
            if (data.entity?.icon) {
                setEntityIcon(data.entity.icon)
            }

            // Store sidebar filters from API
            if (data.filters) {
                setSidebarFilters(data.filters)
            }

            // Merge server preferences with local
            if (data.preferences) {
                setPreferences(prev => ({
                    ...prev,
                    ...data.preferences,
                    columns: data.preferences.columns?.length
                        ? data.preferences.columns
                        : data.columns?.map(c => ({ id: c.id, visible: true })) || []
                }))
                // Sync pagination.limit with saved pageSize
                if (data.preferences.pageSize) {
                    setPagination(prev => ({ ...prev, limit: data.preferences.pageSize }))
                }
                // Restore saved view mode (Mission 2)
                if (data.preferences.viewMode) {
                    setActiveView(data.preferences.viewMode)
                }

                // Reorder columns based on saved preferences order
                if (data.preferences.columns?.length && data.columns?.length) {
                    const orderedColumns = []
                    // First add columns in the order they appear in preferences
                    data.preferences.columns.forEach(pref => {
                        const col = data.columns.find(c => c.id === pref.id)
                        if (col) orderedColumns.push(col)
                    })
                    // Then add any new columns that aren't in preferences yet
                    data.columns.forEach(col => {
                        if (!orderedColumns.find(c => c.id === col.id)) {
                            orderedColumns.push(col)
                        }
                    })
                    setColumns(orderedColumns)
                } else {
                    setColumns(data.columns || [])
                }
            } else if (data.columns) {
                setColumns(data.columns || [])
                setPreferences(prev => ({
                    ...prev,
                    columns: data.columns.map(c => ({ id: c.id, visible: true }))
                }))
            }

        } catch (err) {
            console.error('[RecordsGrid] Fetch error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [accountNumber, entityId, viewId, preferences.sort])

    // Initial fetch
    useEffect(() => {
        fetchRecords()
    }, []) // Only on mount

    // CLIENT-SIDE SORTING - Sort allRecords when sort preferences change
    const sortedRecords = useMemo(() => {
        if (!allRecords.length) return []

        const { field, direction } = preferences.sort
        const multiplier = direction === 'asc' ? 1 : -1

        return [...allRecords].sort((a, b) => {
            let valA, valB

            // Handle built-in fields
            if (field === 'title') {
                valA = (a.referenceTitle || a.title || '').toLowerCase()
                valB = (b.referenceTitle || b.title || '').toLowerCase()
            } else if (field === 'createdAt' || field === 'updatedAt') {
                valA = new Date(a[field] || 0).getTime()
                valB = new Date(b[field] || 0).getTime()
            } else {
                // Custom field - find by field_id
                const cfA = (a.customFields || []).find(cf => {
                    const cfId = cf.field_id?._id || cf.field_id
                    return cfId?.toString() === field
                })
                const cfB = (b.customFields || []).find(cf => {
                    const cfId = cf.field_id?._id || cf.field_id
                    return cfId?.toString() === field
                })
                valA = (cfA?.value || '').toString().toLowerCase()
                valB = (cfB?.value || '').toString().toLowerCase()
            }

            // Compare
            if (valA < valB) return -1 * multiplier
            if (valA > valB) return 1 * multiplier
            return 0
        })
    }, [allRecords, preferences.sort.field, preferences.sort.direction])

    // Pre-compute search index for performance
    const recordsWithSearchIndex = useMemo(() => {
        return sortedRecords.map(record => ({
            ...record,
            _searchIndex: [
                record.title || '',
                record.referenceTitle || '',
                record.computedTitle || '',
                ...(record.customFields || []).map(cf => cf.value || '')
            ].join(' ').toLowerCase()
        }))
    }, [sortedRecords])

    // CLIENT-SIDE SEARCH + CLASSIFICATION FILTER
    const applyFilters = useCallback((records, query, classifFilters) => {
        let result = records

        // Apply search
        if (query && query.trim()) {
            const lowerQuery = query.toLowerCase()
            result = result.filter(record =>
                record._searchIndex.includes(lowerQuery)
            )
        }

        // Apply classification filters
        const filterKeys = Object.keys(classifFilters).filter(k => k !== '__favourites')
        if (filterKeys.length > 0) {
            result = result.filter(record => {
                const cvs = record.classificationValues || []
                // Record must match ALL active filter groups (AND between groups)
                return filterKeys.every(classifId => {
                    const selectedOptionIds = classifFilters[classifId]
                    if (!selectedOptionIds || selectedOptionIds.length === 0) return true
                    // Record must match ANY selected option within a group (OR within group)
                    return cvs.some(cv =>
                        cv.classificationId?.toString() === classifId &&
                        selectedOptionIds.includes(cv.optionId?.toString())
                    )
                })
            })
        }

        return result
    }, [])

    // Handle search
    const handleSearch = useCallback((queryOrEvent) => {
        const query = typeof queryOrEvent === 'string'
            ? queryOrEvent
            : queryOrEvent?.target?.value || ''

        setSearchQuery(query)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])

    // Handle classification filter change
    const handleFilterChange = useCallback((newFilters) => {
        setActiveFilters(newFilters)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])

    // Recompute filtered records when search or filters change
    useEffect(() => {
        const filtered = applyFilters(recordsWithSearchIndex, searchQuery, activeFilters)
        setFilteredRecords(filtered)
    }, [recordsWithSearchIndex, searchQuery, activeFilters, applyFilters])

    // LOCAL PAGINATION - Slice filtered records
    useEffect(() => {
        const start = (pagination.page - 1) * pagination.limit
        const end = start + pagination.limit
        const slice = filteredRecords.slice(start, end)
        setDisplayRecords(slice)

        // Update pagination metadata
        setPagination(prev => ({
            ...prev,
            total: filteredRecords.length,
            pages: Math.ceil(filteredRecords.length / pagination.limit)
        }))
    }, [filteredRecords, pagination.page, pagination.limit])

    // Save preferences to server
    const savePreferences = useCallback(async (newPrefs) => {
        try {
            await fetch(`/account/${accountNumber}/api/user/view-preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    viewId,
                    preferences: newPrefs
                })
            })
        } catch (err) {
            console.error('[RecordsGrid] Save preferences error:', err)
        }
    }, [accountNumber, viewId])

    // Handle preference changes
    const handlePreferencesChange = useCallback((key, value) => {
        const newPrefs = { ...preferences, [key]: value }
        setPreferences(newPrefs)
        savePreferences(newPrefs)

        // pageSize change updates pagination limit
        if (key === 'pageSize') {
            setPagination(prev => ({ ...prev, limit: value, page: 1 }))
        }
        // Sort changes are handled by useEffect
    }, [preferences, savePreferences])

    // Handle view change (Mission 2 - persist viewMode)
    const handleViewChange = useCallback((newView) => {
        setActiveView(newView)
        // Save viewMode to preferences - use functional update to avoid stale closure
        setPreferences(prev => {
            const newPrefs = { ...prev, viewMode: newView }
            savePreferences(newPrefs)
            return newPrefs
        })
    }, [savePreferences])

    // Handle page change
    const handlePageChange = useCallback((newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }, [])

    // Handle column reorder - receives column IDs from visible columns
    const handleColumnReorder = useCallback((fromColumnId, toColumnId) => {
        setColumns(prevColumns => {
            const fromIndex = prevColumns.findIndex(c => c.id === fromColumnId)
            const toIndex = prevColumns.findIndex(c => c.id === toColumnId)

            if (fromIndex === -1 || toIndex === -1) return prevColumns

            const newColumns = [...prevColumns]
            const [movedColumn] = newColumns.splice(fromIndex, 1)
            newColumns.splice(toIndex, 0, movedColumn)

            // Update preferences with new column order
            const newColumnPrefs = newColumns.map(col => {
                const existingPref = preferences.columns.find(p => p.id === col.id)
                return existingPref || { id: col.id, visible: true }
            })
            handlePreferencesChange('columns', newColumnPrefs)

            return newColumns
        })
    }, [preferences.columns, handlePreferencesChange])

    // Virtual row height based on density
    const rowHeight = useMemo(() => {
        switch (preferences.density) {
            case 'compact': return 36
            case 'comfortable': return 56
            default: return 44  // normal
        }
    }, [preferences.density])

    // Virtual scrolling - update count to use displayRecords
    const virtualizer = useVirtualizer({
        count: displayRecords.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 10
    })

    // Force virtualizer recalculation when density changes
    useEffect(() => {
        virtualizer.measure()
    }, [rowHeight, virtualizer])

    // Visible columns — actions always last
    const visibleColumns = useMemo(() => {
        let cols
        if (!preferences.columns?.length) {
            cols = columns
        } else {
            cols = columns.filter(col => {
                const pref = preferences.columns.find(p => p.id === col.id)
                return pref ? pref.visible !== false : true
            })
        }
        // Force actions to end
        const actionsIdx = cols.findIndex(c => c.id === 'actions')
        if (actionsIdx > -1 && actionsIdx < cols.length - 1) {
            const [actionsCol] = cols.splice(actionsIdx, 1)
            cols = [...cols, actionsCol]
        }
        return cols
    }, [columns, preferences.columns])

    // Loading state
    if (loading && displayRecords.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Error state
    if (error && displayRecords.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-danger">
                <span>Erreur: {error}</span>
            </div>
        )
    }

    return (
        <div className="relative flex h-full gap-5 sm:min-h-0">
            {/* Sidebar */}
            <RecordsSidebar
                entityName={entityName}
                entityNamePlural={entityNamePlural}
                entityIcon={entityIcon}
                accountNumber={accountNumber}
                entitySlug={entitySlug}
                showSidebar={preferences.showSidebar !== false}
                onToggleSidebar={() => handlePreferencesChange('showSidebar', !preferences.showSidebar)}
                filters={sidebarFilters}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
            />

            {/* Main content panel */}
            <div className="panel p-4 flex-1 flex flex-col overflow-hidden h-full">
                {/* Toolbar */}
                <RecordsToolbar
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    columns={columns}
                    preferences={preferences}
                    onPreferencesChange={handlePreferencesChange}
                    loading={loading}
                    accountNumber={accountNumber}
                    entitySlug={entitySlug}
                    viewId={viewId}
                    showSidebar={preferences.showSidebar !== false}
                    onToggleSidebar={() => handlePreferencesChange('showSidebar', !preferences.showSidebar)}
                    activeView={activeView}
                    onViewChange={handleViewChange}
                    enabledViews={preferences.enabledViews || ['table', 'kanban', 'notes']}
                    onEnabledViewsChange={(views) => handlePreferencesChange('enabledViews', views)}
                />

                {/* View content */}
                <div className="flex-1 flex flex-col overflow-hidden mt-4">
                    {activeView === 'kanban' ? (
                        <RecordsKanban
                            records={filteredRecords}
                            columns={columns}
                            accountNumber={accountNumber}
                            entitySlug={entitySlug}
                            viewId={viewId}
                        />
                    ) : activeView === 'notes' ? (
                        <RecordsNotes
                            records={filteredRecords}
                            accountNumber={accountNumber}
                            entitySlug={entitySlug}
                        />
                    ) : (
                        <div className="dataTable-wrapper flex-1 flex flex-col overflow-hidden">
                            {/* Table container with virtual scrolling */}
                            <div
                                className="dataTable-container flex-1 overflow-auto"
                                ref={parentRef}
                            >
                                <RecordsTable
                                    records={displayRecords}
                                    columns={visibleColumns}
                                    virtualizer={virtualizer}
                                    sort={preferences.sort}
                                    onSort={(field) => {
                                        const direction = preferences.sort.field === field && preferences.sort.direction === 'asc'
                                            ? 'desc'
                                            : 'asc'
                                        handlePreferencesChange('sort', { field, direction })
                                    }}
                                    onColumnReorder={handleColumnReorder}
                                    density={preferences.density}
                                    titleDisplay={preferences.titleDisplay || 'avatar'}
                                    entityIcon={entityIcon}
                                    accountNumber={accountNumber}
                                    entitySlug={entitySlug}
                                />
                            </div>

                            {/* Pagination footer */}
                            <div className="dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800">
                                <div className="dataTable-info text-gray-500 dark:text-gray-400">
                                    Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}
                                </div>
                                <nav className="dataTable-pagination">
                                    <ul className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                                        <li>
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page <= 1}
                                                className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50"
                                            >
                                                &laquo;
                                            </button>
                                        </li>
                                        {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                            let pageNum
                                            if (pagination.pages <= 5) {
                                                pageNum = i + 1
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1
                                            } else if (pagination.page >= pagination.pages - 2) {
                                                pageNum = pagination.pages - 4 + i
                                            } else {
                                                pageNum = pagination.page - 2 + i
                                            }
                                            return (
                                                <li key={pageNum}>
                                                    <button
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${pageNum === pagination.page
                                                            ? 'bg-primary text-white dark:bg-primary dark:text-white-light'
                                                            : 'bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            )
                                        })}
                                        <li>
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page >= pagination.pages}
                                                className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50"
                                            >
                                                &raquo;
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

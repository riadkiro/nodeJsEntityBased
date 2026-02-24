/**
 * DataGrid - Generic Reusable React Island
 * Pixel-perfect reproduction of RecordsGrid design for ANY data source
 * Works for: entities, tasks, records, or any other collection
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import DataGridToolbar from './components/DataGridToolbar'
import DataGridTable from './components/DataGridTable'
import DataGridSidebar from './components/DataGridSidebar'

export default function DataGrid({
    accountNumber,
    gridId,          // unique ID for preferences (e.g., 'entity-list', 'tasks')
    dataUrl,         // API endpoint to fetch data
    title,           // Grid title (e.g., 'Collections')
    icon,            // Grid title icon (e.g., 'solar:box-bold-duotone')
    addUrl,          // URL for "Add" button (null to hide)
    addLabel,        // Label for add button
    addAction,       // Alternative: JS action instead of URL (e.g., 'open-create-modal')
    quickAddAction,  // Quick Add action (opens modal)
    quickAddLabel,   // Label for quick add button
    rowClickUrl,     // URL pattern for row click, use {id} for record ID
    showSidebar: initialShowSidebar = false,
    initialDensity = 'comfortable',
    initialPageSize = 10
}) {
    // State
    const [allRows, setAllRows] = useState([])
    const [filteredRows, setFilteredRows] = useState([])
    const [displayRows, setDisplayRows] = useState([])
    const [columns, setColumns] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sidebarVisible, setSidebarVisible] = useState(initialShowSidebar)
    const [filters, setFilters] = useState([])
    const [activeFilters, setActiveFilters] = useState({})
    const [entityMeta, setEntityMeta] = useState({})
    const [searchQuery, setSearchQuery] = useState('')

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [bulkDeleting, setBulkDeleting] = useState(false)

    // Preferences state
    const [preferences, setPreferences] = useState({
        columns: [],
        sort: { field: '', direction: 'asc' },
        density: initialDensity,
        pageSize: initialPageSize
    })

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: initialPageSize,
        total: 0,
        pages: 0
    })

    const parentRef = useRef(null)
    const [sidebarWidth, setSidebarWidth] = useState(280)

    // Fetch data from API
    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch(dataUrl, { credentials: 'include' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            const data = await res.json()

            setAllRows(data.rows || [])
            setFilteredRows(data.rows || [])

            // Load filters from API response
            if (data.filters) {
                setFilters(data.filters)
            }
            // Entity metadata
            if (data.entitySlug || data.entityId) {
                setEntityMeta({ slug: data.entitySlug, id: data.entityId })
            }

            // Load columns from API response
            if (data.columns) {
                setColumns(data.columns)
                setPreferences(prev => ({
                    ...prev,
                    columns: data.columns.map(c => ({ id: c.id, visible: true })),
                    sort: data.defaultSort || prev.sort || { field: data.columns[0]?.id || '', direction: 'asc' }
                }))
            }

            // Load saved preferences
            if (data.preferences) {
                setPreferences(prev => ({
                    ...prev,
                    ...data.preferences,
                    columns: data.preferences.columns?.length
                        ? data.preferences.columns
                        : prev.columns
                }))
                if (data.preferences.pageSize) {
                    setPagination(prev => ({ ...prev, limit: data.preferences.pageSize }))
                }
                // Reorder columns based on preferences
                if (data.preferences.columns?.length && data.columns?.length) {
                    const orderedColumns = []
                    data.preferences.columns.forEach(pref => {
                        const col = data.columns.find(c => c.id === pref.id)
                        if (col) orderedColumns.push(col)
                    })
                    data.columns.forEach(col => {
                        if (!orderedColumns.find(c => c.id === col.id)) orderedColumns.push(col)
                    })
                    setColumns(orderedColumns)
                }
            }

        } catch (err) {
            console.error('[DataGrid] Fetch error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [dataUrl])

    useEffect(() => { fetchData() }, [])

    // Client-side sorting
    const sortedRows = useMemo(() => {
        if (!allRows.length || !preferences.sort.field) return allRows

        const { field, direction } = preferences.sort
        const multiplier = direction === 'asc' ? 1 : -1

        return [...allRows].sort((a, b) => {
            let valA = a[field] ?? ''
            let valB = b[field] ?? ''

            // Handle date fields
            if (field === 'createdAt' || field === 'updatedAt' || field.includes('Date') || field.includes('date')) {
                valA = new Date(valA || 0).getTime()
                valB = new Date(valB || 0).getTime()
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase()
                valB = (valB || '').toString().toLowerCase()
            }

            if (valA < valB) return -1 * multiplier
            if (valA > valB) return 1 * multiplier
            return 0
        })
    }, [allRows, preferences.sort.field, preferences.sort.direction])

    // Pre-compute search index
    const rowsWithSearchIndex = useMemo(() => {
        return sortedRows.map(row => ({
            ...row,
            _searchIndex: Object.values(row)
                .filter(v => typeof v === 'string' || typeof v === 'number')
                .join(' ')
                .toLowerCase()
        }))
    }, [sortedRows])

    // Apply sidebar filters to rows
    const applyFilters = useCallback((rows, filterState) => {
        if (!filterState || Object.keys(filterState).length === 0) return rows

        return rows.filter(row => {
            return Object.entries(filterState).every(([filterId, selectedOptions]) => {
                if (!selectedOptions || selectedOptions.length === 0) return true

                // Find the filter definition to know which row field to check
                const filterDef = filters.find(f => f.id === filterId)
                if (!filterDef) return true

                const rowField = filterDef.field
                const rowValue = row[rowField] || ''

                // For multi-value fields (tags), check if any selected option matches
                if (filterDef.type === 'tags') {
                    const selectedLabels = selectedOptions.map(optId => {
                        const opt = filterDef.options.find(o => o.id === optId)
                        return opt ? opt.label.toLowerCase() : ''
                    })
                    const rowTags = rowValue.toLowerCase().split(',').map(t => t.trim())
                    return selectedLabels.some(label => rowTags.includes(label))
                }

                // For single-value fields (status, priority), check label match
                const selectedLabels = selectedOptions.map(optId => {
                    const opt = filterDef.options.find(o => o.id === optId)
                    return opt ? opt.label : ''
                })
                return selectedLabels.includes(rowValue)
            })
        })
    }, [filters])

    // Client-side search
    const handleSearch = useCallback((queryOrEvent) => {
        const query = typeof queryOrEvent === 'string'
            ? queryOrEvent
            : queryOrEvent?.target?.value || ''

        setSearchQuery(query)
        setPagination(prev => ({ ...prev, page: 1 }))

        let result = rowsWithSearchIndex
        if (query.trim()) {
            const lowerQuery = query.toLowerCase()
            result = result.filter(row => row._searchIndex.includes(lowerQuery))
        }
        result = applyFilters(result, activeFilters)
        setFilteredRows(result)
    }, [rowsWithSearchIndex, activeFilters, applyFilters])

    // Handle sidebar filter changes
    const handleFilterChange = useCallback((newFilters) => {
        setActiveFilters(newFilters)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])

    // Update filtered when sort, search, or filters change
    useEffect(() => {
        let result = rowsWithSearchIndex
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(row => row._searchIndex.includes(lowerQuery))
        }
        result = applyFilters(result, activeFilters)
        setFilteredRows(result)
    }, [rowsWithSearchIndex, activeFilters, applyFilters])

    // Pagination
    useEffect(() => {
        const start = (pagination.page - 1) * pagination.limit
        const end = start + pagination.limit
        setDisplayRows(filteredRows.slice(start, end))
        setPagination(prev => ({
            ...prev,
            total: filteredRows.length,
            pages: Math.ceil(filteredRows.length / pagination.limit)
        }))
    }, [filteredRows, pagination.page, pagination.limit])

    // Save preferences to server
    const savePreferences = useCallback(async (newPrefs) => {
        try {
            await fetch(`/account/${accountNumber}/api/user/view-preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    viewId: gridId,
                    preferences: newPrefs
                })
            })
        } catch (err) {
            console.error('[DataGrid] Save preferences error:', err)
        }
    }, [accountNumber, gridId])

    const handlePreferencesChange = useCallback((key, value) => {
        const newPrefs = { ...preferences, [key]: value }
        setPreferences(newPrefs)
        savePreferences(newPrefs)
        if (key === 'pageSize') {
            setPagination(prev => ({ ...prev, limit: value, page: 1 }))
        }
    }, [preferences, savePreferences])

    const handlePageChange = useCallback((newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }, [])

    // Bulk selection handlers
    const handleToggleSelectRow = useCallback((rowId) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(rowId)) next.delete(rowId)
            else next.add(rowId)
            return next
        })
    }, [])

    const handleSelectAllOnPage = useCallback((checked) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            displayRows.forEach(row => {
                if (checked) next.add(row._id)
                else next.delete(row._id)
            })
            return next
        })
    }, [displayRows])

    const handleClearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    // Bulk delete handler
    const handleBulkDelete = useCallback(async () => {
        if (selectedIds.size === 0) return
        setBulkDeleting(true)
        try {
            const deleteUrl = dataUrl.replace('/api/datagrid/', '/api/').replace(/\/[^/]+$/, '')
            const promises = [...selectedIds].map(id =>
                fetch(`/account/${accountNumber}/entity/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
            )
            await Promise.all(promises)
            setSelectedIds(new Set())
            fetchData()
        } catch (err) {
            console.error('[DataGrid] Bulk delete error:', err)
        } finally {
            setBulkDeleting(false)
        }
    }, [selectedIds, accountNumber, fetchData, dataUrl])

    const handleColumnReorder = useCallback((fromColumnId, toColumnId) => {
        setColumns(prevColumns => {
            const fromIndex = prevColumns.findIndex(c => c.id === fromColumnId)
            const toIndex = prevColumns.findIndex(c => c.id === toColumnId)
            if (fromIndex === -1 || toIndex === -1) return prevColumns
            const newColumns = [...prevColumns]
            const [movedColumn] = newColumns.splice(fromIndex, 1)
            newColumns.splice(toIndex, 0, movedColumn)
            const newColumnPrefs = newColumns.map(col => {
                const existingPref = preferences.columns.find(p => p.id === col.id)
                return existingPref || { id: col.id, visible: true }
            })
            handlePreferencesChange('columns', newColumnPrefs)
            return newColumns
        })
    }, [preferences.columns, handlePreferencesChange])

    // Virtual row height
    const rowHeight = useMemo(() => {
        switch (preferences.density) {
            case 'compact': return 36
            case 'comfortable': return 56
            default: return 44
        }
    }, [preferences.density])

    const virtualizer = useVirtualizer({
        count: displayRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 10
    })

    useEffect(() => { virtualizer.measure() }, [rowHeight, virtualizer])

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
        const actionsIdx = cols.findIndex(c => c.id === 'actions')
        if (actionsIdx > -1 && actionsIdx < cols.length - 1) {
            const [actionsCol] = cols.splice(actionsIdx, 1)
            cols = [...cols, actionsCol]
        }
        return cols
    }, [columns, preferences.columns])

    // Loading state
    if (loading && displayRows.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error && displayRows.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-danger">
                <span>Erreur: {error}</span>
            </div>
        )
    }

    return (
        <div className="flex h-full gap-4">
            {/* Sidebar */}
            {initialShowSidebar && (
                <DataGridSidebar
                    title={title}
                    titlePlural={title}
                    icon={icon}
                    accountNumber={accountNumber}
                    entitySlug={entityMeta.slug}
                    filters={filters}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    showSidebar={sidebarVisible}
                    addUrl={addUrl}
                    addLabel={addLabel}
                    sidebarWidth={sidebarWidth}
                    onWidthChange={setSidebarWidth}
                />
            )}

            <div className="panel p-4 flex-1 flex flex-col overflow-hidden h-full">
                {/* Toolbar */}
                <DataGridToolbar
                    title={title}
                    icon={icon}
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    columns={columns}
                    preferences={preferences}
                    onPreferencesChange={handlePreferencesChange}
                    loading={loading}
                    accountNumber={accountNumber}
                    gridId={gridId}
                    addUrl={addUrl}
                    addLabel={addLabel}
                    addAction={addAction}
                    quickAddAction={quickAddAction}
                    quickAddLabel={quickAddLabel}
                    showSidebar={sidebarVisible}
                    onToggleSidebar={initialShowSidebar ? () => setSidebarVisible(v => !v) : undefined}
                    selectedCount={selectedIds.size}
                    onClearSelection={handleClearSelection}
                    onBulkDelete={handleBulkDelete}
                    bulkDeleting={bulkDeleting}
                />

                {/* Table wrapper */}
                <div className="dataTable-wrapper flex-1 flex flex-col overflow-hidden mt-4">
                    <div
                        className="dataTable-container flex-1 overflow-auto"
                        ref={parentRef}
                    >
                        <DataGridTable
                            rows={displayRows}
                            columns={visibleColumns}
                            virtualizer={virtualizer}
                            sort={preferences.sort}
                            onSort={(field) => {
                                const direction = preferences.sort.field === field && preferences.sort.direction === 'asc'
                                    ? 'desc' : 'asc'
                                handlePreferencesChange('sort', { field, direction })
                            }}
                            onColumnReorder={handleColumnReorder}
                            density={preferences.density}
                            accountNumber={accountNumber}
                            rowClickUrl={rowClickUrl}
                            selectedIds={selectedIds}
                            onToggleSelectRow={handleToggleSelectRow}
                            onSelectAllOnPage={handleSelectAllOnPage}
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
                                    if (pagination.pages <= 5) pageNum = i + 1
                                    else if (pagination.page <= 3) pageNum = i + 1
                                    else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                                    else pageNum = pagination.page - 2 + i
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
            </div>
        </div>
    )
}

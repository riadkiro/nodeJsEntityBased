/**
 * DataGrid - Generic Reusable React Island
 * Pixel-perfect reproduction of RecordsGrid design for ANY data source
 * Works for: entities, tasks, records, or any other collection
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import DataGridToolbar from './components/DataGridToolbar'
import DataGridTable from './components/DataGridTable'

export default function DataGrid({
    accountNumber,
    gridId,          // unique ID for preferences (e.g., 'entity-list', 'tasks')
    dataUrl,         // API endpoint to fetch data
    title,           // Grid title (e.g., 'Collections')
    icon,            // Grid title icon (e.g., 'solar:box-bold-duotone')
    addUrl,          // URL for "Add" button (null to hide)
    addLabel,        // Label for add button
    addAction,       // Alternative: JS action instead of URL (e.g., 'open-create-modal')
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
    const [searchQuery, setSearchQuery] = useState('')

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

    // Client-side search
    const handleSearch = useCallback((queryOrEvent) => {
        const query = typeof queryOrEvent === 'string'
            ? queryOrEvent
            : queryOrEvent?.target?.value || ''

        setSearchQuery(query)
        setPagination(prev => ({ ...prev, page: 1 }))

        if (!query.trim()) {
            setFilteredRows(rowsWithSearchIndex)
            return
        }

        const lowerQuery = query.toLowerCase()
        const filtered = rowsWithSearchIndex.filter(row =>
            row._searchIndex.includes(lowerQuery)
        )
        setFilteredRows(filtered)
    }, [rowsWithSearchIndex])

    // Update filtered when sort changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredRows(rowsWithSearchIndex)
        } else {
            const lowerQuery = searchQuery.toLowerCase()
            setFilteredRows(rowsWithSearchIndex.filter(row =>
                row._searchIndex.includes(lowerQuery)
            ))
        }
    }, [rowsWithSearchIndex])

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
    )
}

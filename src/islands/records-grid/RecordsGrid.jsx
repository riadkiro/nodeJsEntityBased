/**
 * RecordsGrid - React Island Component
 * Virtual scrolling DataTable for large datasets (>5k rows)
 * Pixel-perfect reproduction of existing HTMX DataTable styling
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import RecordsToolbar from './components/RecordsToolbar'
import RecordsTable from './components/RecordsTable'

export default function RecordsGrid({
    accountId,
    accountNumber,
    entityId,
    viewId,
    entityName,
    entitySlug
}) {
    // State - CLIENT-SIDE SEARCH
    const [allRecords, setAllRecords] = useState([])  // All fetched records (immutable after load)
    const [filteredRecords, setFilteredRecords] = useState([])  // After search filter
    const [displayRecords, setDisplayRecords] = useState([])  // Current page slice
    const [columns, setColumns] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Preferences state
    const [preferences, setPreferences] = useState({
        columns: [],
        sort: { field: 'createdAt', direction: 'desc' },
        density: 'normal',
        pageSize: 10
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
                ...(record.customFields || []).map(cf => cf.value || '')
            ].join(' ').toLowerCase()
        }))
    }, [sortedRecords])

    // CLIENT-SIDE SEARCH - Instant local filtering
    const handleSearch = useCallback((queryOrEvent) => {
        const query = typeof queryOrEvent === 'string'
            ? queryOrEvent
            : queryOrEvent?.target?.value || ''

        setSearchQuery(query)
        setPagination(prev => ({ ...prev, page: 1 }))  // Reset to page 1

        if (!query.trim()) {
            setFilteredRecords(recordsWithSearchIndex)
            return
        }

        const lowerQuery = query.toLowerCase()
        const filtered = recordsWithSearchIndex.filter(record =>
            record._searchIndex.includes(lowerQuery)
        )
        setFilteredRecords(filtered)
    }, [recordsWithSearchIndex])

    // Update filteredRecords when sort changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredRecords(recordsWithSearchIndex)
        } else {
            const lowerQuery = searchQuery.toLowerCase()
            const filtered = recordsWithSearchIndex.filter(record =>
                record._searchIndex.includes(lowerQuery)
            )
            setFilteredRecords(filtered)
        }
    }, [recordsWithSearchIndex])

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

    // Visible columns
    const visibleColumns = useMemo(() => {
        if (!preferences.columns?.length) return columns
        return columns.filter(col => {
            const pref = preferences.columns.find(p => p.id === col.id)
            return pref ? pref.visible !== false : true
        })
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
        <div className="h-full flex flex-col">
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
            />

            {/* Table wrapper with proper spacing */}
            <div className="dataTable-wrapper flex-1 flex flex-col overflow-hidden mt-4">
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
                        accountNumber={accountNumber}
                        entitySlug={entitySlug}
                    />
                </div>

                {/* Pagination footer */}
                <div className="dataTable-bottom mt-4 flex items-center justify-between border-t pt-4 dark:border-gray-700">
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
        </div>
    )
}

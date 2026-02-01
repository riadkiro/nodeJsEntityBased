/**
 * RecordsGrid - React Island Component
 * Virtual scrolling DataTable for large datasets (>5k rows)
 * Pixel-perfect reproduction of existing HTMX DataTable styling
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import RecordsToolbar from './components/RecordsToolbar'
import RecordsTable from './components/RecordsTable'
import SettingsPanel from './components/SettingsPanel'

export default function RecordsGrid({
    accountId,
    accountNumber,
    entityId,
    viewId,
    entityName,
    entitySlug
}) {
    // State
    const [records, setRecords] = useState([])
    const [columns, setColumns] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [settingsOpen, setSettingsOpen] = useState(false)

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
    const searchTimeoutRef = useRef(null)

    // Fetch records from JSON API
    const fetchRecords = useCallback(async (params = {}) => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams({
                page: params.page || pagination.page,
                limit: params.limit || preferences.pageSize,
                sort: `${preferences.sort.field}:${preferences.sort.direction}`,
                q: params.q !== undefined ? params.q : searchQuery
            })

            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/views/${viewId}/records?${queryParams}`,
                { credentials: 'include' }
            )

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }

            const data = await res.json()

            setRecords(data.records || [])
            setColumns(data.columns || [])
            setPagination(data.pagination || pagination)

            // Merge server preferences with local
            if (data.preferences) {
                setPreferences(prev => ({
                    ...prev,
                    ...data.preferences,
                    columns: data.preferences.columns?.length
                        ? data.preferences.columns
                        : data.columns?.map(c => ({ id: c.id, visible: true })) || []
                }))
            } else if (data.columns) {
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
    }, [accountNumber, entityId, viewId, pagination.page, preferences.pageSize, preferences.sort, searchQuery])

    // Initial fetch
    useEffect(() => {
        fetchRecords()
    }, []) // Only on mount

    // Debounced search - direct API call to avoid stale closure
    const handleSearch = (query) => {
        console.log('[RecordsGrid] handleSearch called with:', query)
        setSearchQuery(query)

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                setLoading(true)
                const queryParams = new URLSearchParams({
                    page: 1,
                    limit: preferences.pageSize,
                    sort: `${preferences.sort.field}:${preferences.sort.direction}`,
                    q: query
                })
                console.log('[RecordsGrid] Fetching with params:', queryParams.toString())

                const res = await fetch(
                    `/account/${accountNumber}/api/entity/${entityId}/views/${viewId}/records?${queryParams}`,
                    { credentials: 'include' }
                )

                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const data = await res.json()
                console.log('[RecordsGrid] Search results:', data.records?.length, 'records')
                setRecords(data.records || [])
                setPagination(data.pagination || pagination)
            } catch (err) {
                console.error('[RecordsGrid] Search error:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }, 300)
    }

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

        // Refetch if sort or pageSize changed
        if (key === 'sort' || key === 'pageSize') {
            fetchRecords({
                page: 1,
                limit: key === 'pageSize' ? value : preferences.pageSize
            })
        }
    }, [preferences, savePreferences, fetchRecords])

    // Handle page change
    const handlePageChange = useCallback((newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }))
        fetchRecords({ page: newPage })
    }, [fetchRecords])

    // Virtual row height based on density
    const rowHeight = useMemo(() => {
        switch (preferences.density) {
            case 'compact': return 32
            case 'comfortable': return 56
            default: return 44
        }
    }, [preferences.density])

    // Virtual scrolling
    const virtualizer = useVirtualizer({
        count: records.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 10
    })

    // Visible columns
    const visibleColumns = useMemo(() => {
        if (!preferences.columns?.length) return columns
        return columns.filter(col => {
            const pref = preferences.columns.find(p => p.id === col.id)
            return pref ? pref.visible !== false : true
        })
    }, [columns, preferences.columns])

    // Loading state
    if (loading && records.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Error state
    if (error && records.length === 0) {
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
                onSettingsOpen={() => setSettingsOpen(true)}
                loading={loading}
            />

            {/* Table wrapper with proper spacing */}
            <div className="dataTable-wrapper flex-1 flex flex-col overflow-hidden mt-4">
                {/* Table container with virtual scrolling */}
                <div
                    className="dataTable-container flex-1 overflow-auto"
                    ref={parentRef}
                >
                    <RecordsTable
                        records={records}
                        columns={visibleColumns}
                        virtualizer={virtualizer}
                        sort={preferences.sort}
                        onSort={(field) => {
                            const direction = preferences.sort.field === field && preferences.sort.direction === 'asc'
                                ? 'desc'
                                : 'asc'
                            handlePreferencesChange('sort', { field, direction })
                        }}
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

            {/* Settings Panel */}
            <SettingsPanel
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                columns={columns}
                preferences={preferences}
                onPreferencesChange={handlePreferencesChange}
            />
        </div>
    )
}

/**
 * TasksHub — Multi-View Tasks Manager
 * 
 * Main orchestrator component that:
 * 1. Fetches task data from the API once
 * 2. Provides a view switcher toolbar
 * 3. Renders the active view component with shared data
 * 4. Persists the selected view mode in user preferences (server-side)
 * 
 * Available views: table, kanban, checklist, calendar, timeline
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import TasksToolbar from './components/TasksToolbar'
import TasksTable from './components/TasksTable'
import TasksChecklist from './components/TasksChecklist'
import TasksCalendar from './components/TasksCalendar'
import TasksTimeline from './components/TasksTimeline'
import TasksKanban from './components/TasksKanban'
import TasksSidebar from './components/TasksSidebar'

export default function TasksHub({
    accountNumber,
    dataUrl,
    title,
    icon,
    addUrl,
    addLabel,
    initialView = 'table',
    entitySlug,
}) {
    // ─── State ──────────────────────────────────────────────────────
    const [activeView, setActiveView] = useState(initialView)
    const [allRows, setAllRows] = useState([])
    const [columns, setColumns] = useState([])
    const [filters, setFilters] = useState([])
    const [activeFilters, setActiveFilters] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [entityMeta, setEntityMeta] = useState({})
    const [sidebarVisible, setSidebarVisible] = useState(true)

    // Preferences (sort, density, pageSize, viewMode)
    const [preferences, setPreferences] = useState({
        columns: [],
        sort: { field: 'createdAt', direction: 'desc' },
        density: 'comfortable',
        pageSize: 25,
        viewMode: initialView,
    })

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        pages: 0,
    })

    // ─── Fetch Data ─────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch(dataUrl, { credentials: 'include' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()

            setAllRows(data.rows || [])
            if (data.filters) setFilters(data.filters)
            if (data.entitySlug || data.entityId) {
                setEntityMeta({ slug: data.entitySlug, id: data.entityId })
            }
            if (data.columns) {
                setColumns(data.columns)
                setPreferences(prev => ({
                    ...prev,
                    columns: data.columns.map(c => ({ id: c.id, visible: true })),
                    sort: data.defaultSort || prev.sort,
                }))
            }
            // Load saved prefs
            if (data.preferences) {
                setPreferences(prev => ({
                    ...prev,
                    ...data.preferences,
                    columns: data.preferences.columns?.length
                        ? data.preferences.columns
                        : prev.columns,
                }))
                if (data.preferences.pageSize) {
                    setPagination(prev => ({ ...prev, limit: data.preferences.pageSize }))
                }
                if (data.preferences.viewMode) {
                    setActiveView(data.preferences.viewMode)
                }
                // Reorder columns from prefs
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
            console.error('[TasksHub] Fetch error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [dataUrl])

    useEffect(() => { fetchData() }, [])

    // ─── Sorting ────────────────────────────────────────────────────
    const sortedRows = useMemo(() => {
        if (!allRows.length || !preferences.sort.field) return allRows
        const { field, direction } = preferences.sort
        const multiplier = direction === 'asc' ? 1 : -1

        return [...allRows].sort((a, b) => {
            let valA = a[field] ?? ''
            let valB = b[field] ?? ''
            if (field.includes('Date') || field.includes('date') || field === 'createdAt' || field === 'dueDate') {
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

    // ─── Search index ───────────────────────────────────────────────
    const rowsWithSearchIndex = useMemo(() => {
        return sortedRows.map(row => ({
            ...row,
            _searchIndex: Object.values(row)
                .filter(v => typeof v === 'string' || typeof v === 'number')
                .join(' ')
                .toLowerCase()
        }))
    }, [sortedRows])

    // ─── Sidebar filter logic ───────────────────────────────────────
    const applyFilters = useCallback((rows, filterState) => {
        if (!filterState || Object.keys(filterState).length === 0) return rows
        return rows.filter(row => {
            return Object.entries(filterState).every(([filterId, selectedOptions]) => {
                if (!selectedOptions || selectedOptions.length === 0) return true
                const filterDef = filters.find(f => f.id === filterId)
                if (!filterDef) return true
                const rowField = filterDef.field
                const rowValue = row[rowField] || ''
                if (filterDef.type === 'tags') {
                    const selectedLabels = selectedOptions.map(optId => {
                        const opt = filterDef.options.find(o => o.id === optId)
                        return opt ? opt.label.toLowerCase() : ''
                    })
                    const rowTags = rowValue.toLowerCase().split(',').map(t => t.trim())
                    return selectedLabels.some(label => rowTags.includes(label))
                }
                const selectedLabels = selectedOptions.map(optId => {
                    const opt = filterDef.options.find(o => o.id === optId)
                    return opt ? opt.label : ''
                })
                return selectedLabels.includes(rowValue)
            })
        })
    }, [filters])

    // ─── Filtered rows (search + sidebar filters) ───────────────────
    const filteredRows = useMemo(() => {
        let result = rowsWithSearchIndex
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(row => row._searchIndex.includes(lowerQuery))
        }
        result = applyFilters(result, activeFilters)
        return result
    }, [rowsWithSearchIndex, searchQuery, activeFilters, applyFilters])

    // ─── Paginated rows (for table view only) ───────────────────────
    const displayRows = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit
        return filteredRows.slice(start, start + pagination.limit)
    }, [filteredRows, pagination.page, pagination.limit])

    // Update pagination total when filtered rows change
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            total: filteredRows.length,
            pages: Math.ceil(filteredRows.length / pagination.limit),
        }))
    }, [filteredRows.length, pagination.limit])

    // ─── Save preferences ───────────────────────────────────────────
    const savePreferences = useCallback(async (newPrefs) => {
        try {
            await fetch(`/account/${accountNumber}/api/user/view-preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    viewId: 'tasks-list',
                    preferences: newPrefs,
                }),
            })
        } catch (err) {
            console.error('[TasksHub] Save preferences error:', err)
        }
    }, [accountNumber])

    const handlePreferencesChange = useCallback((key, value) => {
        const newPrefs = { ...preferences, [key]: value }
        setPreferences(newPrefs)
        savePreferences(newPrefs)
        if (key === 'pageSize') {
            setPagination(prev => ({ ...prev, limit: value, page: 1 }))
        }
    }, [preferences, savePreferences])

    // ─── View switch handler ────────────────────────────────────────
    const handleViewChange = useCallback((view) => {
        setActiveView(view)
        // Persist to server
        const newPrefs = { ...preferences, viewMode: view }
        setPreferences(newPrefs)
        savePreferences(newPrefs)
    }, [preferences, savePreferences])

    // ─── Handlers ───────────────────────────────────────────────────
    const handleSearch = useCallback((query) => {
        setSearchQuery(query)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])

    const handleFilterChange = useCallback((newFilters) => {
        setActiveFilters(newFilters)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])

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

    // ─── Visible columns ────────────────────────────────────────────
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

    // ─── Task toggle (checklist) ────────────────────────────────────
    const handleToggleTask = useCallback(async (taskId) => {
        // Toggle the task's status between "Terminée" and its previous status
        const row = allRows.find(r => r._id === taskId)
        if (!row) return

        const isCompleted = row.status === 'Terminé' || row.status === 'Terminée'
        const newStatus = isCompleted ? 'À faire' : 'Terminé'

        // Optimistic update
        setAllRows(prev => prev.map(r =>
            r._id === taskId ? { ...r, status: newStatus } : r
        ))

        // Persist to API
        try {
            await fetch(`/account/${accountNumber}/api/tasks/${taskId}/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            })
        } catch (err) {
            console.error('[TasksHub] Toggle task error:', err)
            // Revert on error
            setAllRows(prev => prev.map(r =>
                r._id === taskId ? { ...r, status: row.status } : r
            ))
        }
    }, [allRows, accountNumber])

    // ─── Loading / Error states ─────────────────────────────────────
    if (loading && allRows.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }
    if (error && allRows.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-danger">
                <span>Erreur: {error}</span>
            </div>
        )
    }

    // ─── View Components Map ────────────────────────────────────────
    // Prefer the API-returned slug over the hardcoded EJS prop
    const resolvedSlug = entityMeta.slug || entitySlug
    const viewComponents = {
        table: (
            <TasksTable
                rows={displayRows}
                columns={visibleColumns}
                sort={preferences.sort}
                onSort={(field) => {
                    const direction = preferences.sort.field === field && preferences.sort.direction === 'asc'
                        ? 'desc' : 'asc'
                    handlePreferencesChange('sort', { field, direction })
                }}
                onColumnReorder={handleColumnReorder}
                density={preferences.density}
                accountNumber={accountNumber}
                entitySlug={resolvedSlug}
                pagination={pagination}
                onPageChange={handlePageChange}
            />
        ),
        kanban: (
            <TasksKanban
                rows={filteredRows}
                filters={filters}
                accountNumber={accountNumber}
                entitySlug={resolvedSlug}
                entityId={entityMeta.id}
            />
        ),
        checklist: (
            <TasksChecklist
                rows={filteredRows}
                onToggle={handleToggleTask}
                accountNumber={accountNumber}
                entitySlug={resolvedSlug}
            />
        ),
        calendar: (
            <TasksCalendar
                rows={filteredRows}
                accountNumber={accountNumber}
                entitySlug={resolvedSlug}
            />
        ),
        timeline: (
            <TasksTimeline
                rows={filteredRows}
                accountNumber={accountNumber}
                entitySlug={resolvedSlug}
            />
        ),
    }

    return (
        <div className="flex h-full gap-4">
            {/* Sidebar */}
            <TasksSidebar
                title={title}
                icon={icon}
                filters={filters}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                showSidebar={sidebarVisible}
                addUrl={addUrl}
                addLabel={addLabel}
                accountNumber={accountNumber}
                totalCount={allRows.length}
                filteredCount={filteredRows.length}
            />

            {/* Main content */}
            <div className="panel p-4 flex-1 flex flex-col overflow-hidden h-full">
                {/* Toolbar with view switcher */}
                <TasksToolbar
                    title={title}
                    icon={icon}
                    activeView={activeView}
                    onViewChange={handleViewChange}
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    columns={columns}
                    preferences={preferences}
                    onPreferencesChange={handlePreferencesChange}
                    loading={loading}
                    showSidebar={sidebarVisible}
                    onToggleSidebar={() => setSidebarVisible(v => !v)}
                    addUrl={addUrl}
                    addLabel={addLabel}
                    totalCount={filteredRows.length}
                />

                {/* Active view */}
                <div className="flex-1 overflow-hidden mt-4">
                    {viewComponents[activeView] || viewComponents.table}
                </div>
            </div>
        </div>
    )
}

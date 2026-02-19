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
import SavedViewsTabs from './components/SavedViewsTabs'

// ─── Helper: Extract the value of a field from a record ───
function getRecordFieldValue(record, fieldId) {
    // Built-in fields
    if (fieldId === 'title') return record.referenceTitle || record.computedTitle || record.title || ''
    if (fieldId === 'createdAt') return record.createdAt || ''
    if (fieldId === 'updatedAt') return record.updatedAt || ''

    // Relation fields (rel:key)
    if (fieldId.startsWith('rel:')) {
        const relKey = fieldId.replace('rel:', '')
        // Check denormalized relations first (most reliable)
        const denormRelations = record._denorm?.relations || []
        const denormRel = denormRelations.find(dr => dr.relationKey === relKey)
        if (denormRel?.records?.length > 0) {
            return denormRel.records.map(r => r.title || r.computedTitle || '').join(', ')
        }
        // Fallback: direct relations array
        const rel = (record.relations || []).find(r => r.key === relKey || r.relationKey === relKey)
        if (rel) return rel.title || rel.computedTitle || rel.value || ''
        // Fallback: legacy denorm by key
        const denorm = record._denorm?.[relKey]
        if (denorm) return denorm.title || denorm.computedTitle || ''
        return ''
    }

    // Classification fields (classif:id)
    if (fieldId.startsWith('classif:')) {
        const classifId = fieldId.replace('classif:', '')
        const cvs = record.classificationValues || []
        const matched = cvs.filter(cv => cv.classificationId?.toString() === classifId)
        return matched.map(cv => cv.label || cv.optionLabel || '').join(', ')
    }

    // Custom fields (by field _id)
    const cf = (record.customFields || []).find(f =>
        f.field_id?._id?.toString() === fieldId ||
        f.field_id?.toString() === fieldId
    )
    return cf?.value ?? ''
}

// ─── Helper: Check if a record field matches a filter condition ───
function matchFieldFilter(rawValue, filter) {
    const { operator, value, value2, fieldType } = filter
    const isNumeric = ['number', 'currency', 'percent'].includes(fieldType)
    const isDate = ['date', 'datetime'].includes(fieldType)

    // Normalize
    const strValue = String(rawValue ?? '').trim()
    const lowerValue = strValue.toLowerCase()
    const lowerFilter = String(value ?? '').trim().toLowerCase()

    switch (operator) {
        case 'contains':
            return lowerValue.includes(lowerFilter)
        case 'not_contains':
            return !lowerValue.includes(lowerFilter)
        case 'equals':
            if (isNumeric) return parseFloat(strValue) === parseFloat(value)
            return lowerValue === lowerFilter
        case 'not_equals':
            if (isNumeric) return parseFloat(strValue) !== parseFloat(value)
            return lowerValue !== lowerFilter
        case 'starts_with':
            return lowerValue.startsWith(lowerFilter)
        case 'ends_with':
            return lowerValue.endsWith(lowerFilter)
        case 'gt': {
            if (isDate) return new Date(rawValue) > new Date(value)
            return parseFloat(strValue) > parseFloat(value)
        }
        case 'gte': {
            if (isDate) return new Date(rawValue) >= new Date(value)
            return parseFloat(strValue) >= parseFloat(value)
        }
        case 'lt': {
            if (isDate) return new Date(rawValue) < new Date(value)
            return parseFloat(strValue) < parseFloat(value)
        }
        case 'lte': {
            if (isDate) return new Date(rawValue) <= new Date(value)
            return parseFloat(strValue) <= parseFloat(value)
        }
        case 'between': {
            if (isDate) {
                const d = new Date(rawValue)
                return d >= new Date(value) && d <= new Date(value2)
            }
            const n = parseFloat(strValue)
            return n >= parseFloat(value) && n <= parseFloat(value2)
        }
        case 'is_empty':
            return strValue === '' || rawValue == null
        case 'is_not_empty':
            return strValue !== '' && rawValue != null
        default:
            return true
    }
}


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
    const [entityData, setEntityData] = useState(null)

    // Filter state (classification-based)
    const [sidebarFilters, setSidebarFilters] = useState([])
    const [activeFilters, setActiveFilters] = useState({})
    // Field-based advanced filters
    const [fieldFilters, setFieldFilters] = useState([])

    // Saved views state
    const [savedViews, setSavedViews] = useState([])
    const [activeSavedViewId, setActiveSavedViewId] = useState(null)
    const [showSaveViewModal, setShowSaveViewModal] = useState(false)

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

            // Store entity data for Kanban classification columns
            if (data.entity) {
                setEntityData(data.entity)
                if (data.entity.icon) {
                    setEntityIcon(data.entity.icon)
                }
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

    // Fetch saved views
    const fetchSavedViews = useCallback(async () => {
        try {
            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/saved-views`,
                { credentials: 'include' }
            )
            if (res.ok) {
                const data = await res.json()
                setSavedViews(data.views || [])
            }
        } catch (err) {
            console.error('[RecordsGrid] Fetch saved views error:', err)
        }
    }, [accountNumber, entityId])

    // Create a saved view
    const handleCreateSavedView = useCallback(async ({ name, color, filters, fieldFilters }) => {
        try {
            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/saved-views`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name, color, filters, fieldFilters })
                }
            )
            if (res.ok) {
                const data = await res.json()
                setSavedViews(prev => [...prev, data.view])
                // Auto-select the newly created view
                setActiveSavedViewId(data.view._id)
            }
        } catch (err) {
            console.error('[RecordsGrid] Create saved view error:', err)
        }
    }, [accountNumber, entityId])

    // Delete a saved view
    const handleDeleteSavedView = useCallback(async (viewIdToDelete) => {
        try {
            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/saved-views/${viewIdToDelete}`,
                { method: 'DELETE', credentials: 'include' }
            )
            if (res.ok) {
                setSavedViews(prev => prev.filter(v => v._id !== viewIdToDelete))
                // If we deleted the active view, go back to "All"
                if (activeSavedViewId === viewIdToDelete) {
                    setActiveSavedViewId(null)
                    setActiveFilters({})
                    setPagination(prev => ({ ...prev, page: 1 }))
                }
            }
        } catch (err) {
            console.error('[RecordsGrid] Delete saved view error:', err)
        }
    }, [accountNumber, entityId, activeSavedViewId])

    // Rename a saved view
    const handleRenameSavedView = useCallback(async (viewIdToRename, newName) => {
        try {
            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/saved-views/${viewIdToRename}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name: newName })
                }
            )
            if (res.ok) {
                setSavedViews(prev => prev.map(v =>
                    v._id === viewIdToRename ? { ...v, name: newName } : v
                ))
            }
        } catch (err) {
            console.error('[RecordsGrid] Rename saved view error:', err)
        }
    }, [accountNumber, entityId])

    // Update a saved view's filters with current active filters
    const handleUpdateViewFilters = useCallback(async (viewIdToUpdate, newFilters, newFieldFilters) => {
        try {
            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/saved-views/${viewIdToUpdate}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ filters: newFilters, fieldFilters: newFieldFilters || [] })
                }
            )
            if (res.ok) {
                setSavedViews(prev => prev.map(v =>
                    v._id === viewIdToUpdate ? { ...v, filters: newFilters, fieldFilters: newFieldFilters || [] } : v
                ))
            }
        } catch (err) {
            console.error('[RecordsGrid] Update saved view filters error:', err)
        }
    }, [accountNumber, entityId])

    // Select a saved view (apply its filters)
    const handleSelectSavedView = useCallback((savedViewId) => {
        if (!savedViewId) {
            // "All" tab - clear filters
            setActiveSavedViewId(null)
            setActiveFilters({})
            setFieldFilters([])
            setPagination(prev => ({ ...prev, page: 1 }))
            return
        }

        const view = savedViews.find(v => v._id === savedViewId)
        if (!view) return

        setActiveSavedViewId(savedViewId)
        setActiveFilters(view.filters || {})
        setFieldFilters(view.fieldFilters || [])
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [savedViews])

    // Initial fetch
    useEffect(() => {
        fetchRecords()
        fetchSavedViews()
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

    // CLIENT-SIDE SEARCH + CLASSIFICATION FILTER + FIELD FILTERS
    const applyFilters = useCallback((records, query, classifFilters, advancedFilters) => {
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

        // Apply advanced field filters with per-filter AND/OR logic
        // Each filter (except first) has its own logic (AND/OR) connector
        // Evaluation: group consecutive AND filters, OR creates new groups
        // Record passes if it matches ANY group (OR between groups)
        // Within a group, ALL filters must match (AND within group)
        if (advancedFilters && advancedFilters.length > 0) {
            result = result.filter(record => {
                // Build groups of filters connected by AND
                // OR boundaries create new groups
                const groups = [[advancedFilters[0]]]
                for (let i = 1; i < advancedFilters.length; i++) {
                    const filterLogic = advancedFilters[i].logic || 'AND'
                    if (filterLogic === 'OR') {
                        groups.push([advancedFilters[i]])
                    } else {
                        groups[groups.length - 1].push(advancedFilters[i])
                    }
                }
                // Record passes if it matches ANY group
                return groups.some(group =>
                    // Within a group, ALL filters must match
                    group.every(filter => {
                        const fieldValue = getRecordFieldValue(record, filter.fieldId)
                        return matchFieldFilter(fieldValue, filter)
                    })
                )
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

    // Handle field filter change
    const handleFieldFiltersChange = useCallback((newFieldFilters) => {
        setFieldFilters(newFieldFilters)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])

    // Recompute filtered records when search, classification filters, or field filters change
    useEffect(() => {
        const filtered = applyFilters(recordsWithSearchIndex, searchQuery, activeFilters, fieldFilters)
        setFilteredRecords(filtered)
    }, [recordsWithSearchIndex, searchQuery, activeFilters, fieldFilters, applyFilters])

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
                columns={columns}
                fieldFilters={fieldFilters}
                onFieldFiltersChange={handleFieldFiltersChange}
                allRecords={allRecords}
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
                    hasActiveFilters={Object.keys(activeFilters).filter(k => k !== '__favourites').length > 0 || fieldFilters.length > 0}
                    onOpenSaveView={() => setShowSaveViewModal(true)}
                />

                {/* Saved Views Tabs */}
                <SavedViewsTabs
                    savedViews={savedViews}
                    activeViewId={activeSavedViewId}
                    onSelectView={handleSelectSavedView}
                    onCreateView={handleCreateSavedView}
                    onDeleteView={handleDeleteSavedView}
                    onRenameView={handleRenameSavedView}
                    onUpdateViewFilters={handleUpdateViewFilters}
                    hasActiveFilters={Object.keys(activeFilters).filter(k => k !== '__favourites').length > 0 || fieldFilters.length > 0}
                    activeFilters={activeFilters}
                    fieldFilters={fieldFilters}
                    sidebarFilters={sidebarFilters}
                    columns={columns}
                    externalOpenCreate={showSaveViewModal}
                    onCloseExternalCreate={() => setShowSaveViewModal(false)}
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
                            entityData={entityData}
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

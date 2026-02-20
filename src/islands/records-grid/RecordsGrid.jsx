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

    // Bulk select state
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [bulkLoading, setBulkLoading] = useState(false)
    const lastClickedIndexRef = useRef(null)  // for shift+click range select

    // Filter state (classification-based)
    const [sidebarFilters, setSidebarFilters] = useState([])
    const [activeFilters, setActiveFilters] = useState({})
    // Field-based advanced filters
    const [fieldFilters, setFieldFilters] = useState([])

    // Saved views state
    const [savedViews, setSavedViews] = useState([])
    const [activeSavedViewId, setActiveSavedViewId] = useState(null)
    const [showSaveViewModal, setShowSaveViewModal] = useState(false)
    const [toast, setToast] = useState(null) // { message, type: 'success'|'error' }
    const toastTimerRef = useRef(null)

    // Show a temporary toast notification
    const showToast = useCallback((message, type = 'success') => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        setToast({ message, type })
        toastTimerRef.current = setTimeout(() => setToast(null), 2500)
    }, [])

    // Preferences state
    const [preferences, setPreferences] = useState({
        columns: [],
        sort: { field: 'createdAt', direction: 'desc' },
        density: 'normal',
        pageSize: 10,
        titleDisplay: 'avatar',
        showSidebar: true,
        sidebarWidth: 280,
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

    // Update a saved view (name, color, filters)
    const handleUpdateViewFilters = useCallback(async (viewIdToUpdate, newFilters, newFieldFilters, newName, newColor) => {
        try {
            const updatePayload = { filters: newFilters, fieldFilters: newFieldFilters || [] }
            if (newName) updatePayload.name = newName
            if (newColor) updatePayload.color = newColor

            const res = await fetch(
                `/account/${accountNumber}/api/entity/${entityId}/saved-views/${viewIdToUpdate}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(updatePayload)
                }
            )
            if (res.ok) {
                // Deep clone to break reference equality — ensures React detects changes when re-selecting
                const clonedFilters = JSON.parse(JSON.stringify(newFilters || {}))
                const clonedFieldFilters = JSON.parse(JSON.stringify(newFieldFilters || []))
                setSavedViews(prev => prev.map(v => {
                    if (v._id !== viewIdToUpdate) return v
                    const updated = { ...v, filters: clonedFilters, fieldFilters: clonedFieldFilters }
                    if (newName) updated.name = newName
                    if (newColor) updated.color = newColor
                    return updated
                }))
                const displayName = newName || savedViews.find(v => v._id === viewIdToUpdate)?.name || 'Vue'
                showToast(`Vue "${displayName}" mise à jour`)
            } else {
                showToast('Erreur lors de la mise à jour', 'error')
            }
        } catch (err) {
            console.error('[RecordsGrid] Update saved view error:', err)
            showToast('Erreur lors de la mise à jour', 'error')
        }
    }, [accountNumber, entityId, savedViews, showToast])

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
        // Deep clone to ensure React detects the change even if same data
        setActiveFilters(JSON.parse(JSON.stringify(view.filters || {})))
        setFieldFilters(JSON.parse(JSON.stringify(view.fieldFilters || [])))
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

    // ═══════════════════════════════════════════════════════
    // BULK SELECT handlers
    // ═══════════════════════════════════════════════════════
    const handleToggleSelect = useCallback((recordId, rowIndex, shiftKey) => {
        if (shiftKey && lastClickedIndexRef.current !== null && lastClickedIndexRef.current !== rowIndex) {
            // Shift+Click → range select
            const start = Math.min(lastClickedIndexRef.current, rowIndex)
            const end = Math.max(lastClickedIndexRef.current, rowIndex)
            setSelectedIds(prev => {
                const next = new Set(prev)
                for (let i = start; i <= end; i++) {
                    if (displayRecords[i]) {
                        next.add(displayRecords[i]._id)
                    }
                }
                return next
            })
        } else {
            // Normal click → toggle single
            setSelectedIds(prev => {
                const next = new Set(prev)
                if (next.has(recordId)) {
                    next.delete(recordId)
                } else {
                    next.add(recordId)
                }
                return next
            })
        }
        lastClickedIndexRef.current = rowIndex
    }, [displayRecords])

    const handleSelectAllPage = useCallback(() => {
        setSelectedIds(prev => {
            const pageIds = displayRecords.map(r => r._id)
            const allSelected = pageIds.every(id => prev.has(id))
            const next = new Set(prev)
            if (allSelected) {
                // Deselect page
                pageIds.forEach(id => next.delete(id))
            } else {
                // Select all on page
                pageIds.forEach(id => next.add(id))
            }
            return next
        })
    }, [displayRecords])

    const handleSelectAll = useCallback(() => {
        setSelectedIds(prev => {
            const allIds = filteredRecords.map(r => r._id)
            if (prev.size === allIds.length) {
                return new Set()
            }
            return new Set(allIds)
        })
    }, [filteredRecords])

    const handleClearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    // All records on current page selected?
    const allPageSelected = useMemo(() => {
        if (displayRecords.length === 0) return false
        return displayRecords.every(r => selectedIds.has(r._id))
    }, [displayRecords, selectedIds])

    // Bulk delete
    const handleBulkDelete = useCallback(async () => {
        if (selectedIds.size === 0) return

        // Use SweetAlert if available, else confirm
        const doDelete = typeof Swal !== 'undefined'
            ? await Swal.fire({
                title: 'Confirmer la suppression',
                html: `<p>Vous allez supprimer <strong>${selectedIds.size}</strong> enregistrement(s).</p><p style="color:#e7515a;font-size:13px;margin-top:8px;">Cette action est irréversible.</p>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e7515a',
                cancelButtonText: 'Annuler',
                confirmButtonText: 'Supprimer',
            }).then(r => r.isConfirmed)
            : confirm(`Supprimer ${selectedIds.size} enregistrement(s) ?`)

        if (!doDelete) return

        setBulkLoading(true)
        try {
            const res = await fetch(`/account/${accountNumber}/record/api/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ids: [...selectedIds] })
            })
            const data = await res.json()
            if (data.success) {
                // Remove deleted records from local data
                setAllRecords(prev => prev.filter(r => !selectedIds.has(r._id)))
                setSelectedIds(new Set())
                showToast(`${data.deletedCount} enregistrement(s) supprimé(s)`)
            } else {
                showToast(data.error || 'Erreur lors de la suppression', 'error')
            }
        } catch (err) {
            console.error('[RecordsGrid] Bulk delete error:', err)
            showToast('Erreur lors de la suppression', 'error')
        } finally {
            setBulkLoading(false)
        }
    }, [selectedIds, accountNumber, showToast])

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
                sidebarWidth={preferences.sidebarWidth}
                onSidebarWidthChange={(w) => handlePreferencesChange('sidebarWidth', w)}
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
                                    selectedIds={selectedIds}
                                    onToggleSelect={handleToggleSelect}
                                    onSelectAll={handleSelectAllPage}
                                    allPageSelected={allPageSelected}
                                    showCheckboxes={preferences.showCheckboxes !== false}
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

            {/* ═══════ BULK ACTION BAR ═══════ */}
            {selectedIds.size > 0 && (
                <div className="bulk-action-bar" style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1b2e4b 0%, #0e1726 100%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(67,97,238,0.2)',
                    animation: 'bulkBarSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
                    backdropFilter: 'blur(12px)',
                }}>
                    {/* Selection info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '8px',
                            background: 'rgba(67,97,238,0.2)', color: '#4361ee',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700
                        }}>
                            {selectedIds.size}
                        </div>
                        <span style={{ color: '#e0e6ed', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            sélectionné{selectedIds.size > 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Separator */}
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }}></div>

                    {/* Select all filtered */}
                    {selectedIds.size < filteredRecords.length && (
                        <button
                            onClick={handleSelectAll}
                            style={{
                                padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(67,97,238,0.3)',
                                background: 'rgba(67,97,238,0.1)', color: '#93b4fd',
                                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.15s', whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => { e.target.style.background = 'rgba(67,97,238,0.2)'; e.target.style.color = '#b8cffe' }}
                            onMouseLeave={e => { e.target.style.background = 'rgba(67,97,238,0.1)'; e.target.style.color = '#93b4fd' }}
                        >
                            Tout sélectionner ({filteredRecords.length})
                        </button>
                    )}

                    {/* Separator */}
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }}></div>

                    {/* Delete action */}
                    <button
                        onClick={handleBulkDelete}
                        disabled={bulkLoading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '8px', border: 'none',
                            background: 'rgba(231,81,90,0.15)', color: '#ff6b6b',
                            fontSize: '12px', fontWeight: 600, cursor: bulkLoading ? 'wait' : 'pointer',
                            transition: 'all 0.15s', whiteSpace: 'nowrap',
                            opacity: bulkLoading ? 0.6 : 1
                        }}
                        onMouseEnter={e => { if (!bulkLoading) { e.target.style.background = 'rgba(231,81,90,0.25)'; e.target.style.color = '#ff8a8a' } }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(231,81,90,0.15)'; e.target.style.color = '#ff6b6b' }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
                            <path d="M20.5 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {bulkLoading ? 'Suppression...' : 'Supprimer'}
                    </button>

                    {/* Separator */}
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }}></div>

                    {/* Close / deselect */}
                    <button
                        onClick={handleClearSelection}
                        style={{
                            width: 28, height: 28, borderRadius: '8px', border: 'none',
                            background: 'rgba(255,255,255,0.08)', color: '#888ea8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.color = '#e0e6ed' }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = '#888ea8' }}
                        title="Désélectionner tout"
                    >
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Toast notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: selectedIds.size > 0 ? '80px' : '24px',
                    right: '24px',
                    zIndex: 99999,
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#fff',
                    background: toast.type === 'error' ? '#e7515a' : '#00ab55',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    animation: 'toastSlideIn 0.25s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'bottom 0.3s ease',
                }}>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                        {toast.type === 'error' ? (
                            <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        ) : (
                            <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                    </svg>
                    {toast.message}
                </div>
            )}
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bulkBarSlideUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                /* Bulk select checkboxes */
                .bulk-checkbox-wrapper {
                    position: relative;
                    cursor: pointer;
                    user-select: none;
                }
                .bulk-checkbox {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .bulk-checkbox-custom {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    border: 2px solid #d1d5db;
                    background: #fff;
                    transition: all 0.15s ease;
                    position: relative;
                }
                .dark .bulk-checkbox-custom {
                    border-color: #4b5563;
                    background: #1f2937;
                }
                .bulk-checkbox:checked + .bulk-checkbox-custom {
                    background: #4361ee;
                    border-color: #4361ee;
                }
                .bulk-checkbox:checked + .bulk-checkbox-custom::after {
                    content: '';
                    position: absolute;
                    left: 4px;
                    top: 1px;
                    width: 5px;
                    height: 9px;
                    border: solid #fff;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
                .bulk-checkbox-wrapper:hover .bulk-checkbox-custom {
                    border-color: #4361ee;
                }
                .bulk-row-selected {
                    background: rgba(67, 97, 238, 0.04) !important;
                }
                .bulk-row-selected td {
                    background: rgba(67, 97, 238, 0.04) !important;
                }
                .dark .bulk-row-selected {
                    background: rgba(67, 97, 238, 0.08) !important;
                }
                .dark .bulk-row-selected td {
                    background: rgba(67, 97, 238, 0.08) !important;
                }
            `}</style>
        </div>
    )
}

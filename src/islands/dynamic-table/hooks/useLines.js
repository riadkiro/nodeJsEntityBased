/**
 * useLines — CRUD operations on document lines for a record
 * Handles loading, saving, adding, removing lines per schema
 */
import { useState, useEffect, useCallback, useRef } from 'react'

export default function useLines({ accountNumber, recordId, schemas, activeSchemaId }) {
    const [linesMap, setLinesMap] = useState({})     // { schemaId: [lines] }
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState({})          // { schemaId: boolean }
    const saveTimerRef = useRef({})
    const linesMapRef = useRef(linesMap)  // Always track latest linesMap

    // Load all lines from API and distribute by schemaId
    const loadLines = useCallback(async () => {
        if (!accountNumber || !recordId || !schemas.length) return
        try {
            setLoading(true)
            const res = await fetch(`/account/${accountNumber}/api/document-lines/${recordId}`, {
                credentials: 'include'
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            const allLines = (data.data || []).map(l => ({
                ...l,
                values: l.values || {},
                computed: l.computed || {},
                _tempId: l._id || ('tmp_' + Date.now() + '_' + Math.random())
            }))

            const newMap = {}
            for (const s of schemas) {
                newMap[s._id] = allLines.filter(l =>
                    l.schemaId === s._id ||
                    (l.schemaId && l.schemaId.toString() === s._id.toString())
                )
            }

            // Orphan lines → first schema
            const orphanLines = allLines.filter(l => !l.schemaId)
            if (orphanLines.length > 0 && schemas.length > 0) {
                newMap[schemas[0]._id] = [
                    ...(newMap[schemas[0]._id] || []),
                    ...orphanLines
                ]
            }

            // Seed empty rows for schemas with no data
            for (const s of schemas) {
                if ((newMap[s._id] || []).length === 0) {
                    const emptyRows = []
                    for (let i = 0; i < 3; i++) {
                        emptyRows.push({
                            _tempId: 'tmp_' + Date.now() + '_' + Math.random() + '_' + i,
                            schemaId: s._id,
                            lineType: s.defaultLineType || s.lineTypes?.[0] || 'default',
                            values: {},
                            computed: {},
                            order: i
                        })
                    }
                    newMap[s._id] = emptyRows
                }
            }

            setLinesMap(newMap)
            linesMapRef.current = newMap
        } catch (e) {
            console.error('[DynamicTable] Load lines error:', e)
        } finally {
            setLoading(false)
        }
    }, [accountNumber, recordId, schemas])

    useEffect(() => {
        if (schemas.length > 0) loadLines()
    }, [schemas, loadLines])

    // Get lines for a specific schema
    const getSchemaLines = useCallback((schemaId) => {
        return linesMap[schemaId] || []
    }, [linesMap])

    // Update a specific line's values
    const updateLineValue = useCallback((schemaId, lineIdx, key, value) => {
        setLinesMap(prev => {
            const newMap = { ...prev }
            const lines = [...(newMap[schemaId] || [])]
            if (lines[lineIdx]) {
                lines[lineIdx] = {
                    ...lines[lineIdx],
                    values: { ...lines[lineIdx].values, [key]: value }
                }
                newMap[schemaId] = lines
            }
            linesMapRef.current = newMap
            return newMap
        })
    }, [])

    // Update multiple values on a line at once (for lineDefaults)
    const updateLineValues = useCallback((schemaId, lineIdx, updates) => {
        setLinesMap(prev => {
            const newMap = { ...prev }
            const lines = [...(newMap[schemaId] || [])]
            if (lines[lineIdx]) {
                const newValues = { ...lines[lineIdx].values }
                for (const [key, val] of Object.entries(updates)) {
                    if (val !== null && val !== undefined && val !== '') {
                        newValues[key] = val
                    }
                }
                lines[lineIdx] = { ...lines[lineIdx], values: newValues }
                newMap[schemaId] = lines
            }
            linesMapRef.current = newMap
            return newMap
        })
    }, [])

    // Set extra metadata on a line (availableOptions, excludedColumns)
    const setLineMeta = useCallback((schemaId, lineIdx, meta) => {
        setLinesMap(prev => {
            const newMap = { ...prev }
            const lines = [...(newMap[schemaId] || [])]
            if (lines[lineIdx]) {
                lines[lineIdx] = { ...lines[lineIdx], ...meta }
                newMap[schemaId] = lines
            }
            linesMapRef.current = newMap
            return newMap
        })
    }, [])

    // Add an empty line to a schema
    const addLine = useCallback((schemaId, schema) => {
        setLinesMap(prev => {
            const newMap = { ...prev }
            const lines = [...(newMap[schemaId] || [])]
            lines.push({
                _tempId: 'tmp_' + Date.now() + '_' + Math.random(),
                schemaId,
                lineType: schema?.defaultLineType || schema?.lineTypes?.[0] || 'default',
                values: {},
                computed: {},
                order: lines.length
            })
            newMap[schemaId] = lines
            linesMapRef.current = newMap
            return newMap
        })
    }, [])

    // Remove a line
    const removeLine = useCallback((schemaId, lineIdx) => {
        setLinesMap(prev => {
            const newMap = { ...prev }
            const lines = [...(newMap[schemaId] || [])]
            lines.splice(lineIdx, 1)
            // Ensure at least one empty row
            if (lines.length === 0) {
                lines.push({
                    _tempId: 'tmp_' + Date.now() + '_' + Math.random(),
                    schemaId,
                    lineType: 'default',
                    values: {},
                    computed: {},
                    order: 0
                })
            }
            newMap[schemaId] = lines
            linesMapRef.current = newMap
            return newMap
        })
    }, [])

    // Reorder after selection: filled lines first, then empties, ensure ≥1 empty
    const reorderLines = useCallback((schemaId, schema) => {
        setLinesMap(prev => {
            const newMap = { ...prev }
            const allLines = [...(newMap[schemaId] || [])]
            const filledLines = allLines.filter(l => {
                if (!l.values) return false
                return Object.values(l.values).some(v =>
                    v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
                )
            })
            const emptyLines = allLines.filter(l => {
                if (!l.values) return true
                return !Object.values(l.values).some(v =>
                    v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
                )
            })
            if (emptyLines.length === 0) {
                emptyLines.push({
                    _tempId: 'tmp_' + Date.now() + '_' + Math.random(),
                    schemaId,
                    lineType: schema?.defaultLineType || schema?.lineTypes?.[0] || 'default',
                    values: {},
                    computed: {},
                    order: filledLines.length
                })
            }
            newMap[schemaId] = [...filledLines, ...emptyLines]
            linesMapRef.current = newMap
            return newMap
        })
    }, [])

    // Reorder by drag and drop indices
    const moveLine = useCallback((schemaId, oldIndex, newIndex) => {
        setLinesMap(prev => {
            const current = prev[schemaId] || []
            if (oldIndex === newIndex) return prev
            if (oldIndex < 0 || newIndex < 0) return prev
            if (oldIndex >= current.length || newIndex >= current.length) return prev

            const newMap = { ...prev }
            const lines = [...current]
            const [moved] = lines.splice(oldIndex, 1)
            if (!moved) return prev
            lines.splice(newIndex, 0, moved)

            newMap[schemaId] = lines.map((line, idx) => ({
                ...line,
                order: idx
            }))
            linesMapRef.current = newMap
            return newMap
        })
    }, [])

    // Reorder from a full ordered list of line ids (most robust with drag/drop)
    const reorderLinesByIds = useCallback((schemaId, orderedIds) => {
        setLinesMap(prev => {
            const current = prev[schemaId] || []
            if (!Array.isArray(orderedIds) || orderedIds.length === 0 || current.length === 0) return prev

            const getId = (line, idx) => String(line?._id || line?._tempId || idx)
            const byId = new Map(current.map((line, idx) => [getId(line, idx), line]))
            const next = []
            const seen = new Set()

            for (const rawId of orderedIds) {
                const id = String(rawId || '')
                const line = byId.get(id)
                if (!line || seen.has(id)) continue
                next.push(line)
                seen.add(id)
            }

            // Keep any non-rendered residual lines at the end
            for (let i = 0; i < current.length; i++) {
                const line = current[i]
                const id = getId(line, i)
                if (seen.has(id)) continue
                next.push(line)
                seen.add(id)
            }

            if (next.length !== current.length) return prev

            const newMap = { ...prev }
            newMap[schemaId] = next.map((line, idx) => ({
                ...line,
                order: idx
            }))
            linesMapRef.current = newMap
            return newMap
        })
    }, [])

    // Debounced save for a schema
    const debouncedSave = useCallback((schemaId) => {
        if (saveTimerRef.current[schemaId]) {
            clearTimeout(saveTimerRef.current[schemaId])
        }
        saveTimerRef.current[schemaId] = setTimeout(() => {
            saveLinesForSchema(schemaId)
        }, 800)
    }, [])

    // Save lines for a specific schema to the server
    // Uses linesMapRef to avoid stale closure (see react-implementation.md rules)
    const saveLinesForSchema = useCallback(async (schemaId) => {
        const currentMap = linesMapRef.current
        const lines = currentMap[schemaId] || []
        const filledLines = lines.filter(l => {
            if (!l.values) return false
            return Object.values(l.values).some(v =>
                v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
            )
        })

        try {
            setSaving(prev => ({ ...prev, [schemaId]: true }))
            const res = await fetch(`/account/${accountNumber}/api/document-lines/${recordId}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    schemaId,
                    lines: filledLines.map((l, i) => ({
                        _id: l._id || undefined,
                        schemaId,
                        lineType: l.lineType || 'default',
                        values: l.values,
                        order: i
                    }))
                })
            })
            if (!res.ok) console.error('[DynamicTable] Save failed:', res.status)
            else console.log('[DynamicTable] Saved', filledLines.length, 'lines for schema', schemaId)
        } catch (e) {
            console.error('[DynamicTable] Save error:', e)
        } finally {
            setSaving(prev => ({ ...prev, [schemaId]: false }))
        }
    }, [accountNumber, recordId])

    return {
        linesMap,
        setLinesMap,
        linesMapRef,
        loading,
        saving,
        getSchemaLines,
        updateLineValue,
        updateLineValues,
        setLineMeta,
        addLine,
        removeLine,
        reorderLines,
        moveLine,
        reorderLinesByIds,
        debouncedSave,
        saveLinesForSchema,
        reload: loadLines
    }
}

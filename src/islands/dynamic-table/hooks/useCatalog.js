/**
 * useCatalog — Catalog search & lineDefaults application
 * Handles the relation column search and auto-populating defaults
 */
import { useState, useCallback, useRef } from 'react'

export default function useCatalog({ accountNumber }) {
    const [searchState, setSearchState] = useState({
        open: false,
        loading: false,
        lineIdx: -1,
        colKey: '',
        query: '',
        results: []
    })
    const searchTimerRef = useRef(null)

    // Open search for a specific line/column
    const openSearch = useCallback((lineIdx, colKey) => {
        setSearchState(prev => ({
            ...prev,
            open: true,
            lineIdx,
            colKey,
            query: '',
            results: [],
            loading: false
        }))
    }, [])

    // Close search
    const closeSearch = useCallback(() => {
        setSearchState(prev => ({ ...prev, open: false, results: [] }))
    }, [])

    // Search catalog
    // entityId = the target entity (from col.config.targetEntity or schema.sourceEntityId)
    // searchFields = array of fields to search on (from col.config.searchFields)
    const search = useCallback((lineIdx, colKey, query, entityId, searchFields) => {
        setSearchState(prev => ({ ...prev, lineIdx, colKey, query }))

        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)

        if (!query || query.length < 1) {
            setSearchState(prev => ({ ...prev, results: [], loading: false }))
            return
        }

        if (!entityId) {
            return
        }

        searchTimerRef.current = setTimeout(async () => {
            try {
                setSearchState(prev => ({ ...prev, loading: true }))
                const fields = (searchFields || ['title']).join(',')
                const url = `/account/${accountNumber}/api/catalog-search?entityId=${entityId}&q=${encodeURIComponent(query)}&searchFields=${fields}`
                const res = await fetch(url, { credentials: 'include' })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                setSearchState(prev => ({
                    ...prev,
                    results: data.data || [],
                    loading: false
                }))
            } catch (e) {
                console.error('[DynamicTable] Catalog search error:', e)
                setSearchState(prev => ({ ...prev, loading: false, results: [] }))
            }
        }, 300)
    }, [accountNumber])

    /**
     * Apply lineDefaults from a catalog item to a line
     * This is the KEY function that was broken in the Alpine version.
     * 
     * @param {Object} item - The catalog item with lineDefaults[]
     * @param {string} schemaId - The CORRECT schema ID (resolved from the column)
     * @returns {{ defaults: Object, availableOptions: Object, excludedColumns: string[] }}
     */
    const resolveLineDefaults = useCallback((item, schemaId) => {
        if (!item || !schemaId) return null

        const lineDefaults = item.lineDefaults
        if (!lineDefaults) return null

        // Handle both array and object formats
        let match = null
        if (Array.isArray(lineDefaults)) {
            match = lineDefaults.find(ld =>
                ld.schemaId && ld.schemaId.toString() === schemaId.toString()
            )
        } else if (typeof lineDefaults === 'object' && lineDefaults.schemaId) {
            // Single object format
            if (lineDefaults.schemaId.toString() === schemaId.toString()) {
                match = lineDefaults
            }
        }

        if (!match) {
            // FALLBACK: If there's no match but there's exactly one lineDefaults config, use it.
            if (Array.isArray(lineDefaults) && lineDefaults.length > 0) {
                match = lineDefaults[0]
            } else if (typeof lineDefaults === 'object' && lineDefaults.defaults) {
                match = lineDefaults
            }
        }

        if (!match) {
            return null
        }

        return {
            defaults: match.defaults || {},
            availableOptions: match.availableOptions || {},
            excludedColumns: match.excludedColumns || []
        }
    }, [])

    /**
     * Apply applyDefaults from column config (hybrid mode)
     * Maps customFields from the catalog item to line values
     */
    const resolveApplyDefaults = useCallback((col, item) => {
        if (!col?.config?.applyDefaults || !item) return {}

        const result = {}
        for (const [targetKey, sourceExpr] of Object.entries(col.config.applyDefaults)) {
            let val
            if (sourceExpr.startsWith('cf.')) {
                const cfId = sourceExpr.substring(3)
                val = item.customFields[cfId]
            } else {
                val = item[sourceExpr]
            }
            if (val !== undefined && val !== null) {
                result[targetKey] = val
            }
        }
        return result
    }, [])

    return {
        searchState,
        openSearch,
        closeSearch,
        search,
        resolveLineDefaults,
        resolveApplyDefaults
    }
}

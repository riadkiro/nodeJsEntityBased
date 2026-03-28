/**
 * useSchemas — Loads line schemas from the API for a given entity
 */
import { useState, useEffect, useCallback } from 'react'

export default function useSchemas({ accountNumber, entityId, schemaFilter }) {
    const [schemas, setSchemas] = useState([])
    const [activeSchemaId, setActiveSchemaId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadSchemas = useCallback(async () => {
        if (!accountNumber || !entityId) return
        try {
            setLoading(true)
            const url = `/account/${accountNumber}/api/line-schemas/by-context?entityId=${entityId}`
            const res = await fetch(url, { credentials: 'include' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            let list = data.data || []

            // Apply schema filter(s) if set (single id or comma-separated ids)
            if (schemaFilter) {
                const ids = String(schemaFilter)
                    .split(',')
                    .map(x => x.trim())
                    .filter(Boolean)
                if (ids.length > 0) {
                    const order = new Map(ids.map((id, i) => [id, i]))
                    list = list
                        .filter(s => ids.includes(s._id?.toString?.() || String(s._id || '')))
                        .sort((a, b) => {
                            const ai = order.get(a._id?.toString?.() || String(a._id || '')) ?? 9999
                            const bi = order.get(b._id?.toString?.() || String(b._id || '')) ?? 9999
                            return ai - bi
                        })
                }
            }

            setSchemas(list)
            if (list.length > 0) {
                setActiveSchemaId(list[0]._id)
            }
        } catch (e) {
            console.error('[DynamicTable] Load schemas error:', e)
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [accountNumber, entityId, schemaFilter])

    useEffect(() => { loadSchemas() }, [loadSchemas])

    const activeSchema = schemas.find(s => s._id === activeSchemaId) || null

    return {
        schemas,
        activeSchemaId,
        setActiveSchemaId,
        activeSchema,
        loading,
        error,
        reload: loadSchemas
    }
}

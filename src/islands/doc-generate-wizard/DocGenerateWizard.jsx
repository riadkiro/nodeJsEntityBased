/**
 * DocGenerateWizard — Context-free document generation wizard
 * 
 * Flow:
 * 1. Analyze template's entity graph to determine the entry point
 * 2. User searches and picks a record (e.g. Patient) 
 * 3. System resolves related context (e.g. Consultations for that patient)
 * 4. User picks or skips the context record
 * 5. Generate draft and redirect to editor
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'

// ─── Utility ───────────────────────────────────────────────────────
const formatDate = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Main Component ────────────────────────────────────────────────
export default function DocGenerateWizard({ accountNumber, template, entities, smartDocTemplate }) {
    const [step, setStep] = useState(1) // 1: pick record, 2: resolve context, 3: generating
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [selectedEntityId, setSelectedEntityId] = useState(null)
    const [contextData, setContextData] = useState(null)
    const [selectedContext, setSelectedContext] = useState(null) // the consultation/parent record
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState(null)

    const baseUrl = `/account/${accountNumber}/documents`

    // ─── Analyze the entity graph to determine entry points ─────────
    const entryPoints = useMemo(() => {
        if (!entities || entities.length === 0) return []

        const primaryEntity = entities[0]
        if (!primaryEntity.relations || primaryEntity.relations.length === 0) {
            // Template is directly linked to an entity with no relations
            // Entry point IS the primary entity itself
            return [{
                type: 'direct',
                entityId: primaryEntity._id,
                entityName: primaryEntity.name,
                entityIcon: primaryEntity.icon || 'solar:layers-bold-duotone',
                entitySlug: primaryEntity.slug,
                label: primaryEntity.name,
                description: `Sélectionnez un(e) ${primaryEntity.name.toLowerCase()}`
            }]
        }

        // Find relations that point to "entry-point" entities
        // Priority: many-to-one relations (e.g. Consultation → Patient)
        const points = []
        for (const rel of primaryEntity.relations) {
            const target = rel.targetEntity
            if (!target || typeof target !== 'object') continue

            if (rel.cardinality === 'many-to-one' || rel.cardinality === 'one-to-one') {
                points.push({
                    type: 'relation',
                    entityId: target._id?.toString() || target.toString(),
                    entityName: target.name,
                    entityIcon: target.icon || 'solar:user-bold-duotone',
                    entitySlug: target.slug,
                    entityColor: target.color,
                    label: rel.label || target.name,
                    description: `Sélectionnez un(e) ${(rel.label || target.name).toLowerCase()}`,
                    relationKey: rel.key,
                    cardinality: rel.cardinality,
                    primaryEntityName: primaryEntity.name
                })
            }
        }

        // If no many-to-one relations found, fallback to direct selection
        if (points.length === 0) {
            points.push({
                type: 'direct',
                entityId: primaryEntity._id,
                entityName: primaryEntity.name,
                entityIcon: primaryEntity.icon || 'solar:layers-bold-duotone',
                entitySlug: primaryEntity.slug,
                label: primaryEntity.name,
                description: `Sélectionnez un(e) ${primaryEntity.name.toLowerCase()}`
            })
        }

        return points
    }, [entities])

    // Default to first entry point
    const activeEntryPoint = useMemo(() => {
        if (entryPoints.length === 0) return null
        if (selectedEntityId) return entryPoints.find(p => p.entityId === selectedEntityId) || entryPoints[0]
        return entryPoints[0]
    }, [entryPoints, selectedEntityId])

    // ─── Handle record selection (step 1 → step 2) ──────────────────
    const handleRecordSelected = useCallback(async (record, entryPoint) => {
        setSelectedRecord(record)
        setSelectedEntityId(entryPoint.entityId)
        setError(null)

        if (entryPoint.type === 'direct') {
            // Direct selection — no context resolution needed
            setStep(3)
            await generateDraft(record._id)
            return
        }

        // Relation type — resolve context
        setStep(2)
        try {
            const url = `${baseUrl}/api/${template._id}/resolve-context?entityId=${entryPoint.entityId}&recordId=${record._id}`
            const resp = await fetch(url, { credentials: 'include' })
            const data = await resp.json()

            if (!data.success) {
                setError(data.error || 'Erreur lors de la résolution du contexte')
                return
            }

            setContextData(data)

            // Auto-select last context if only one exists
            if (data.contexts && data.contexts.length === 1) {
                setSelectedContext(data.contexts[0])
            } else if (data.contexts && data.contexts.length > 0) {
                setSelectedContext(data.contexts[0]) // pre-select latest
            }
        } catch (err) {
            setError('Erreur réseau: ' + err.message)
        }
    }, [baseUrl, template])

    // ─── Generate draft document ────────────────────────────────────
    const generateDraft = useCallback(async (recordId) => {
        setGenerating(true)
        setError(null)

        try {
            if (!smartDocTemplate?._id) {
                setError('SmartDocTemplate non trouvé pour ce template')
                setGenerating(false)
                return
            }

            const resp = await fetch(`/account/${accountNumber}/api/smartdoc/generate-draft/${smartDocTemplate._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ recordId })
            })

            const data = await resp.json()

            if (!data.success) {
                setError(data.error || 'Erreur lors de la génération')
                setGenerating(false)
                return
            }

            // Redirect to editor
            window.location.href = `${baseUrl}/${data.draftDocumentId}/edit-react`
        } catch (err) {
            setError('Erreur réseau: ' + err.message)
            setGenerating(false)
        }
    }, [accountNumber, baseUrl, smartDocTemplate])

    // ─── Handle context confirmation (step 2 → generate) ────────────
    const handleContextConfirmed = useCallback(async () => {
        if (!selectedContext) {
            setError('Veuillez sélectionner un enregistrement ou générer sans contexte')
            return
        }
        setStep(3)
        await generateDraft(selectedContext._id)
    }, [selectedContext, generateDraft])

    // ─── Generate without context (empty ordonnance) ────────────────
    const handleGenerateEmpty = useCallback(async () => {
        if (!selectedRecord) return

        setStep(3)
        setGenerating(true)
        setError(null)

        try {
            // Create a new consultation record for this patient then generate
            // OR just generate with a dummy context
            // For now, we'll skip context and just redirect to editor with empty doc
            // The user asked for "ordonnance vide" option
            if (!smartDocTemplate?._id) {
                setError('SmartDocTemplate non trouvé pour ce template')
                setGenerating(false)
                return
            }

            // Since generate-draft needs a recordId, and we need a consultation,
            // we create a quick consultation for this patient first
            const quickAddResp = await fetch(`/account/${accountNumber}/api/entity/${entities[0]._id}/records/quick-add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: `Ordonnance - ${selectedRecord.title} - ${formatDate(new Date())}`,
                    relations: activeEntryPoint ? [{
                        relationKey: activeEntryPoint.relationKey,
                        value: selectedRecord._id
                    }] : []
                })
            })

            const quickData = await quickAddResp.json()
            if (!quickData.success && !quickData.record?._id) {
                setError('Erreur lors de la création du contexte')
                setGenerating(false)
                return
            }

            const newRecordId = quickData.record?._id || quickData._id
            await generateDraft(newRecordId)
        } catch (err) {
            setError('Erreur: ' + err.message)
            setGenerating(false)
        }
    }, [selectedRecord, smartDocTemplate, accountNumber, entities, activeEntryPoint, generateDraft])

    // ─── Render ─────────────────────────────────────────────────────
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
            fontFamily: "'Inter', -apple-system, sans-serif"
        }}>
            {/* Header */}
            <WizardHeader
                template={template}
                step={step}
                accountNumber={accountNumber}
            />

            {/* Content */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '32px 24px'
            }}>
                {step === 1 && activeEntryPoint && (
                    <StepPickRecord
                        entryPoint={activeEntryPoint}
                        entryPoints={entryPoints}
                        accountNumber={accountNumber}
                        templateId={template._id}
                        onSelect={handleRecordSelected}
                        onEntityChange={setSelectedEntityId}
                    />
                )}

                {step === 2 && (
                    <StepResolveContext
                        selectedRecord={selectedRecord}
                        contextData={contextData}
                        selectedContext={selectedContext}
                        onContextSelect={setSelectedContext}
                        onConfirm={handleContextConfirmed}
                        onGenerateEmpty={handleGenerateEmpty}
                        onBack={() => { setStep(1); setContextData(null); setSelectedContext(null) }}
                        primaryEntityName={activeEntryPoint?.primaryEntityName || entities[0]?.name}
                        error={error}
                    />
                )}

                {step === 3 && (
                    <StepGenerating
                        templateName={template.name}
                        generating={generating}
                        error={error}
                        onRetry={() => { setStep(1); setGenerating(false); setError(null) }}
                    />
                )}
            </div>
        </div>
    )
}

// ─── Wizard Header ─────────────────────────────────────────────────
function WizardHeader({ template, step, accountNumber }) {
    const steps = [
        { num: 1, label: 'Sélection' },
        { num: 2, label: 'Contexte' },
        { num: 3, label: 'Génération' }
    ]

    return (
        <div style={{
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexShrink: 0
        }}>
            {/* Left: Back + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <a
                    href={`/account/${accountNumber}/documents`}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: '#f1f5f9', color: '#64748b', textDecoration: 'none',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9' }}
                >
                    <iconify-icon icon="solar:arrow-left-linear" width="18"></iconify-icon>
                </a>
                <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Nouveau document
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b' }}>
                        {template?.name || 'Document'}
                    </div>
                </div>
            </div>

            {/* Center: Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {steps.map((s, i) => (
                    <React.Fragment key={s.num}>
                        {i > 0 && (
                            <div style={{
                                width: '32px', height: '2px',
                                background: step > s.num - 1 ? '#4f46e5' : '#e2e8f0',
                                borderRadius: '1px',
                                transition: 'background 0.3s'
                            }} />
                        )}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '20px',
                            background: step === s.num ? '#eef2ff' : 'transparent',
                            transition: 'all 0.3s'
                        }}>
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 600,
                                background: step >= s.num ? '#4f46e5' : '#e2e8f0',
                                color: step >= s.num ? '#fff' : '#94a3b8',
                                transition: 'all 0.3s'
                            }}>
                                {step > s.num ? (
                                    <iconify-icon icon="solar:check-read-linear" width="13"></iconify-icon>
                                ) : s.num}
                            </div>
                            <span style={{
                                fontSize: '12px', fontWeight: 500,
                                color: step === s.num ? '#4f46e5' : '#94a3b8',
                                transition: 'color 0.3s'
                            }}>
                                {s.label}
                            </span>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* Right: spacer */}
            <div style={{ width: '100px' }} />
        </div>
    )
}

// ─── Step 1: Pick Record ───────────────────────────────────────────
function StepPickRecord({ entryPoint, entryPoints, accountNumber, templateId, onSelect, onEntityChange }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const inputRef = useRef(null)
    const debounceRef = useRef(null)
    const baseUrl = `/account/${accountNumber}/documents`

    // Auto-load recent records on mount
    useEffect(() => {
        loadRecords('')
    }, [entryPoint.entityId])

    const loadRecords = useCallback(async (q) => {
        setLoading(true)
        try {
            const url = `${baseUrl}/api/${templateId}/search-records?entityId=${entryPoint.entityId}&q=${encodeURIComponent(q)}&limit=12`
            const resp = await fetch(url, { credentials: 'include' })
            const data = await resp.json()
            if (data.success) {
                setResults(data.records || [])
            }
        } catch (e) {
            console.error('[DocGenWizard] Search error:', e)
        }
        setLoading(false)
    }, [baseUrl, templateId, entryPoint.entityId])

    const handleSearchChange = useCallback((e) => {
        const val = e.target.value
        setQuery(val)
        setShowResults(true)

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => loadRecords(val), 250)
    }, [loadRecords])

    const handleSelect = useCallback((record) => {
        setShowResults(false)
        onSelect(record, entryPoint)
    }, [onSelect, entryPoint])

    return (
        <div style={{
            width: '100%', maxWidth: '540px',
            animation: 'fadeInUp 0.3s ease-out'
        }}>
            {/* Entry point selector (if multiple) */}
            {entryPoints.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
                    {entryPoints.map(ep => (
                        <button
                            key={ep.entityId}
                            onClick={() => { onEntityChange(ep.entityId); setQuery(''); setResults([]) }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', borderRadius: '10px',
                                border: ep.entityId === entryPoint.entityId ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                background: ep.entityId === entryPoint.entityId ? '#eef2ff' : '#fff',
                                color: ep.entityId === entryPoint.entityId ? '#4f46e5' : '#64748b',
                                cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                                transition: 'all 0.15s'
                            }}
                        >
                            <iconify-icon icon={ep.entityIcon} width="16"></iconify-icon>
                            {ep.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Card */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
                overflow: 'hidden'
            }}>
                {/* Card header */}
                <div style={{
                    padding: '28px 28px 20px',
                    borderBottom: '1px solid #f1f5f9'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        marginBottom: '6px'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: entryPoint.entityColor ? `${entryPoint.entityColor}15` : '#eef2ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: entryPoint.entityColor || '#4f46e5'
                        }}>
                            <iconify-icon icon={entryPoint.entityIcon} width="22"></iconify-icon>
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                                {entryPoint.description}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                Recherchez par nom ou parcourez les résultats récents
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Input */}
                <div style={{ padding: '16px 28px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                        onFocus={() => setShowResults(true)}
                    >
                        <iconify-icon
                            icon={loading ? "svg-spinners:ring-resize" : "solar:magnifer-linear"}
                            width="18"
                            style={{ color: '#94a3b8', flexShrink: 0 }}
                        ></iconify-icon>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleSearchChange}
                            onFocus={() => setShowResults(true)}
                            placeholder={`Rechercher un(e) ${entryPoint.label.toLowerCase()}...`}
                            style={{
                                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                                fontSize: '14px', color: '#1e293b',
                                fontFamily: "'Inter', sans-serif"
                            }}
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(''); loadRecords('') }}
                                style={{
                                    border: 'none', background: 'none', cursor: 'pointer',
                                    color: '#94a3b8', display: 'flex', padding: '2px'
                                }}
                            >
                                <iconify-icon icon="solar:close-circle-bold" width="16"></iconify-icon>
                            </button>
                        )}
                    </div>
                </div>

                {/* Results list */}
                <div style={{
                    padding: '0 16px 16px',
                    maxHeight: '380px',
                    overflowY: 'auto'
                }}>
                    {results.length === 0 && !loading && (
                        <div style={{
                            textAlign: 'center', padding: '32px 16px',
                            color: '#94a3b8', fontSize: '13px'
                        }}>
                            <iconify-icon icon="solar:magnifer-broken" width="32" style={{ marginBottom: '8px', opacity: 0.5 }}></iconify-icon>
                            <div>Aucun résultat trouvé</div>
                        </div>
                    )}

                    {results.map((record, idx) => (
                        <button
                            key={record._id}
                            onClick={() => handleSelect(record)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 14px', borderRadius: '10px',
                                border: 'none', background: 'transparent',
                                cursor: 'pointer', textAlign: 'left',
                                transition: 'background 0.1s',
                                animation: `fadeInUp 0.2s ease-out ${idx * 0.03}s both`
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: entryPoint.entityColor ? `${entryPoint.entityColor}12` : '#eef2ff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: entryPoint.entityColor || '#4f46e5',
                                flexShrink: 0
                            }}>
                                <iconify-icon icon={entryPoint.entityIcon} width="18"></iconify-icon>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '14px', fontWeight: 500, color: '#1e293b',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {record.title}
                                </div>
                                {record.createdAt && (
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                        {formatDate(record.createdAt)}
                                    </div>
                                )}
                            </div>
                            <iconify-icon icon="solar:arrow-right-linear" width="16" style={{ color: '#cbd5e1' }}></iconify-icon>
                        </button>
                    ))}
                </div>
            </div>

            {/* CSS animations */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

// ─── Step 2: Resolve Context ───────────────────────────────────────
function StepResolveContext({ selectedRecord, contextData, selectedContext, onContextSelect, onConfirm, onGenerateEmpty, onBack, primaryEntityName, error }) {
    if (!contextData) {
        return (
            <div style={{
                width: '100%', maxWidth: '540px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '60px 24px'
            }}>
                <iconify-icon icon="svg-spinners:ring-resize" width="32" style={{ color: '#4f46e5' }}></iconify-icon>
                <div style={{ marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
                    Recherche des données liées...
                </div>
            </div>
        )
    }

    const hasContexts = contextData.contexts && contextData.contexts.length > 0

    return (
        <div style={{
            width: '100%', maxWidth: '540px',
            animation: 'fadeInUp 0.3s ease-out'
        }}>
            {/* Selected record banner */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                marginBottom: '16px'
            }}>
                <div style={{
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    borderBottom: '1px solid #f1f5f9'
                }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#16a34a'
                    }}>
                        <iconify-icon icon="solar:check-circle-bold" width="20"></iconify-icon>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Sélectionné
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                            {selectedRecord?.title || 'Sans titre'}
                        </div>
                    </div>
                    <button
                        onClick={onBack}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '8px',
                            border: '1px solid #e2e8f0', background: '#fff',
                            color: '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 500
                        }}
                    >
                        <iconify-icon icon="solar:pen-2-linear" width="13"></iconify-icon>
                        Changer
                    </button>
                </div>
            </div>

            {/* Context resolution card */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '24px 24px 16px',
                    borderBottom: '1px solid #f1f5f9'
                }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                        {hasContexts
                            ? `${primaryEntityName || 'Enregistrement'}s liés`
                            : `Aucun(e) ${(primaryEntityName || 'enregistrement').toLowerCase()} trouvé(e)`
                        }
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {hasContexts
                            ? `Sélectionnez un(e) ${(primaryEntityName || '').toLowerCase()} pour récupérer les données associées`
                            : `Vous pouvez créer un document vide pour ${selectedRecord?.title || 'ce patient'}`
                        }
                    </div>
                </div>

                {/* Context list */}
                {hasContexts && (
                    <div style={{ padding: '8px 12px', maxHeight: '280px', overflowY: 'auto' }}>
                        {contextData.contexts.map((ctx, idx) => {
                            const isSelected = selectedContext?._id === ctx._id
                            return (
                                <button
                                    key={ctx._id}
                                    onClick={() => onContextSelect(ctx)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 14px', borderRadius: '10px',
                                        border: isSelected ? '2px solid #4f46e5' : '2px solid transparent',
                                        background: isSelected ? '#eef2ff' : 'transparent',
                                        cursor: 'pointer', textAlign: 'left',
                                        transition: 'all 0.15s',
                                        animation: `fadeInUp 0.2s ease-out ${idx * 0.04}s both`
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: isSelected ? '#4f46e515' : '#f1f5f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isSelected ? '#4f46e5' : '#94a3b8',
                                        flexShrink: 0, transition: 'all 0.15s'
                                    }}>
                                        <iconify-icon
                                            icon={contextData.primaryEntity?.icon || 'solar:document-bold-duotone'}
                                            width="18"
                                        ></iconify-icon>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '14px', fontWeight: 500,
                                            color: isSelected ? '#4f46e5' : '#1e293b',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>
                                            {ctx.title}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                            {formatDate(ctx.createdAt)} à {formatTime(ctx.createdAt)}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <iconify-icon icon="solar:check-read-bold" width="12" style={{ color: '#fff' }}></iconify-icon>
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        margin: '0 16px 12px', padding: '10px 14px',
                        borderRadius: '8px', background: '#fef2f2',
                        color: '#dc2626', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <iconify-icon icon="solar:danger-triangle-bold" width="16"></iconify-icon>
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    justifyContent: 'space-between'
                }}>
                    <button
                        onClick={onGenerateEmpty}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 16px', borderRadius: '10px',
                            border: '1px solid #e2e8f0', background: '#fff',
                            color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                            transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}
                    >
                        <iconify-icon icon="solar:document-add-linear" width="16"></iconify-icon>
                        Document vide
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={!selectedContext}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 20px', borderRadius: '10px',
                            border: 'none',
                            background: selectedContext ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#e2e8f0',
                            color: selectedContext ? '#fff' : '#94a3b8',
                            cursor: selectedContext ? 'pointer' : 'not-allowed',
                            fontSize: '13px', fontWeight: 600,
                            boxShadow: selectedContext ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                            transition: 'all 0.15s'
                        }}
                    >
                        Générer
                        <iconify-icon icon="solar:arrow-right-linear" width="16"></iconify-icon>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

// ─── Step 3: Generating ────────────────────────────────────────────
function StepGenerating({ templateName, generating, error, onRetry }) {
    return (
        <div style={{
            width: '100%', maxWidth: '540px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '80px 24px',
            animation: 'fadeInUp 0.3s ease-out'
        }}>
            {error ? (
                <>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: '#fef2f2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        <iconify-icon icon="solar:danger-triangle-bold-duotone" width="32" style={{ color: '#ef4444' }}></iconify-icon>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                        Erreur de génération
                    </div>
                    <div style={{
                        fontSize: '13px', color: '#64748b', textAlign: 'center',
                        marginBottom: '24px', maxWidth: '360px'
                    }}>
                        {error}
                    </div>
                    <button
                        onClick={onRetry}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', borderRadius: '10px',
                            border: '1px solid #e2e8f0', background: '#fff',
                            color: '#4f46e5', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                            transition: 'all 0.15s'
                        }}
                    >
                        <iconify-icon icon="solar:restart-linear" width="16"></iconify-icon>
                        Réessayer
                    </button>
                </>
            ) : (
                <>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }}>
                        <iconify-icon icon="svg-spinners:ring-resize" width="28" style={{ color: '#4f46e5' }}></iconify-icon>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                        Génération en cours...
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Préparation de votre {templateName || 'document'}
                    </div>
                </>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
            `}</style>
        </div>
    )
}

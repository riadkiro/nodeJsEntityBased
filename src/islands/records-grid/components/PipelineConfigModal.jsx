import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const DEFAULT_PIPELINE_STAGES = [
    { label: 'Nouveau', color: '#64748b' },
    { label: 'Qualification', color: '#3b82f6' },
    { label: 'Proposition', color: '#f59e0b' },
    { label: 'Gagné', color: '#22c55e' },
    { label: 'Perdu', color: '#ef4444' },
]

const TAG_FIELD_TYPES = new Set(['select', 'multiselect', 'multi-select', 'multi_select', 'tags', 'tag'])

function cleanId(value) {
    return String(value?._id?.$oid || value?._id || value || '')
}

function slugify(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || `pipeline-${Date.now()}`
}

function normalizeOption(option, index) {
    const optionId = cleanId(option?._id || option?.id || option?.value || option?.label || option?.name || option)
    return {
        id: optionId,
        value: String(option?.value ?? optionId),
        label: option?.label || option?.name || String(option?.value || optionId || `Étape ${index + 1}`),
        color: option?.color || option?.couleur || '#6366f1',
        order: Number.isFinite(Number(option?.order)) ? Number(option.order) : index,
    }
}

function normalizeChoiceOption(option, index) {
    if (!option) {
        return { value: '', label: `Option ${index + 1}`, color: '#64748b', order: index }
    }
    if (typeof option === 'string') {
        return { value: option, label: option, color: '#64748b', order: index }
    }
    const value = String(option.value ?? option.id ?? option._id ?? option.label ?? option.name ?? '')
    return {
        value,
        label: option.label || option.name || value || `Option ${index + 1}`,
        color: option.color || option.couleur || option.bg || '#64748b',
        order: Number.isFinite(Number(option.order)) ? Number(option.order) : index,
    }
}

function buildPipelineFields(entityData, createdFields = []) {
    const fields = []
    const seen = new Set()
    const pushField = (classification, source) => {
        const id = cleanId(classification)
        if (!id || seen.has(id)) return
        seen.add(id)
        const options = (classification.options || [])
            .map(normalizeOption)
            .sort((a, b) => a.order - b.order)

        fields.push({
            id,
            value: source === 'status' ? 'status' : id,
            label: classification.name || (source === 'status' ? 'Statut' : 'Pipeline'),
            source,
            options,
        })
    }
    const pushCustomField = (field) => {
        const id = cleanId(field)
        if (!id || seen.has(`field:${id}`)) return
        const typeConfig = field.type_config || field.typeConfig || {}
        const type = String(field.fieldType || field.type || field.render?.input || '').toLowerCase()
        const input = String(field.render?.input || '').toLowerCase()
        const isSelect = type === 'select' || input === 'select'
        if (!isSelect || typeConfig.multiple || !typeConfig.useAsPipeline) return

        const options = (typeConfig.options || field.options || [])
            .map(normalizeOption)
            .filter(option => option.id || option.label)
            .sort((a, b) => a.order - b.order)

        seen.add(`field:${id}`)
        fields.push({
            id,
            value: `field:${id}`,
            label: field.label || field.name || 'Pipeline',
            source: 'field',
            typeConfig,
            options,
        })
    }

    if (entityData?.statusClassification) {
        pushField(entityData.statusClassification, 'status')
    }
    ;(entityData?.classifications || []).forEach(classification => {
        pushField(classification, 'classification')
    })
    createdFields.forEach(classification => {
        pushField(classification, 'classification')
    })
    ;(entityData?.customFields || []).forEach(pushCustomField)

    return fields
}

function buildTagFields(entityData) {
    return (entityData?.customFields || [])
        .filter(field => field && typeof field === 'object')
        .map(field => {
            const type = String(field.fieldType || field.type || field.render?.input || '').toLowerCase()
            const display = String(field.render?.display?.card || field.render?.display?.table || '').toLowerCase()
            const options = (field.type_config?.options || field.typeConfig?.options || field.options || [])
                .map(normalizeChoiceOption)
                .filter(option => option.value || option.label)

            return {
                id: cleanId(field),
                label: field.label || field.name || 'Champ',
                type,
                options,
                eligible: TAG_FIELD_TYPES.has(type) || ['badge', 'chip', 'chips', 'tags'].includes(display) || options.length > 0,
            }
        })
        .filter(field => field.id && field.eligible)
}

function resolveSelectedValue(fields, viewSettings) {
    if (!fields.length) return ''
    const configured = viewSettings?.kanbanField || 'status'
    if (configured === 'status' && fields.some(field => field.value === 'status')) return 'status'
    const direct = fields.find(field => field.value === configured || field.id === configured)
    return direct?.value || fields[0].value
}

function ButtonIcon({ icon, title, onClick, disabled, tone = 'neutral' }) {
    const toneClass = tone === 'danger'
        ? 'hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-950/30'
        : 'hover:border-primary/30 hover:bg-primary/5 hover:text-primary'

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={`grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-400 transition disabled:opacity-40 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark ${toneClass}`}
        >
            <iconify-icon icon={icon} width="15"></iconify-icon>
        </button>
    )
}

export default function PipelineConfigModal({
    open,
    accountNumber,
    entityId,
    entityData,
    viewId,
    viewSettings,
    onClose,
    onSaved,
}) {
    const [createdFields, setCreatedFields] = useState([])
    const fields = useMemo(() => buildPipelineFields(entityData, createdFields), [entityData, createdFields])
    const tagFields = useMemo(() => buildTagFields(entityData), [entityData])
    const [selectedValue, setSelectedValue] = useState('')
    const selectedField = fields.find(field => field.value === selectedValue) || fields[0] || null
    const [stages, setStages] = useState([])
    const [deletedIds, setDeletedIds] = useState([])
    const [newPipelineName, setNewPipelineName] = useState('')
    const [selectedTagFields, setSelectedTagFields] = useState([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!open) return
        setError('')
        setSelectedValue(prev => {
            if (prev && fields.some(field => field.value === prev)) return prev
            return resolveSelectedValue(fields, viewSettings)
        })
        setSelectedTagFields(Array.isArray(viewSettings?.kanbanTagFields) ? viewSettings.kanbanTagFields : [])
        setDeletedIds([])
    }, [open, fields, viewSettings])

    useEffect(() => {
        if (!open || !selectedField) {
            setStages([])
            return
        }
        setStages(selectedField.options.map(option => ({ ...option })))
        setDeletedIds([])
    }, [open, selectedField?.id])

    if (!open) return null

    const updateStage = (stageId, patch) => {
        setStages(prev => prev.map(stage => stage.id === stageId ? { ...stage, ...patch } : stage))
    }

    const moveStage = (stageId, direction) => {
        setStages(prev => {
            const index = prev.findIndex(stage => stage.id === stageId)
            const nextIndex = index + direction
            if (index < 0 || nextIndex < 0 || nextIndex >= prev.length) return prev
            const next = [...prev]
            const [stage] = next.splice(index, 1)
            next.splice(nextIndex, 0, stage)
            return next
        })
    }

    const addStage = () => {
        const index = stages.length
        const preset = DEFAULT_PIPELINE_STAGES[index % DEFAULT_PIPELINE_STAGES.length]
        setStages(prev => [
            ...prev,
            {
                id: `tmp_${Date.now()}_${index}`,
                label: preset.label,
                color: preset.color,
                order: index,
                isNew: true,
            }
        ])
    }

    const removeStage = (stage) => {
        setStages(prev => prev.filter(item => item.id !== stage.id))
        if (!stage.isNew && stage.id) {
            setDeletedIds(prev => [...prev, stage.id])
        }
    }

    const toggleTagField = (fieldId) => {
        setSelectedTagFields(prev => prev.includes(fieldId)
            ? prev.filter(id => id !== fieldId)
            : [...prev, fieldId]
        )
    }

    const apiJson = async (url, body) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data.error || data.success === false) {
            throw new Error(data.error || `Erreur HTTP ${res.status}`)
        }
        return data
    }

    const createPipeline = async () => {
        const name = newPipelineName.trim()
        if (!name) {
            setError('Nom requis')
            return
        }
        setSaving(true)
        setError('')
        try {
            const data = await apiJson(`/account/${accountNumber}/classification/api/create`, {
                name,
                slug: slugify(name),
                type: 'status',
                entities: entityId ? [entityId] : [],
                options: DEFAULT_PIPELINE_STAGES,
            })
            const classification = data.classification
            setCreatedFields(prev => [...prev, classification])
            setSelectedValue(cleanId(classification))
            setNewPipelineName('')
        } catch (createError) {
            setError(createError.message || 'Création impossible')
        } finally {
            setSaving(false)
        }
    }

    const savePipeline = async () => {
        if (!selectedField) {
            setError('Pipeline requise')
            return
        }
        const validStages = stages
            .map((stage, index) => ({
                ...stage,
                label: String(stage.label || '').trim(),
                color: stage.color || '#6366f1',
                order: index,
            }))
            .filter(stage => stage.label)

        if (!validStages.length) {
            setError('Ajoute au moins une étape')
            return
        }

        setSaving(true)
        setError('')
        try {
            const originalById = new Map(selectedField.options.map(option => [option.id, option]))
            const finalOptions = []

            if (selectedField.source === 'field') {
                const options = validStages.map((stage, index) => {
                    const value = String(stage.value || (!String(stage.id).startsWith('tmp_') ? stage.id : stage.label))
                    return {
                        label: stage.label,
                        value,
                        color: stage.color,
                        order: index,
                    }
                })

                await apiJson(`/account/${accountNumber}/field-template/api/${selectedField.id}/update`, {
                    typeConfig: {
                        ...(selectedField.typeConfig || {}),
                        useAsPipeline: true,
                        options,
                    },
                })
                finalOptions.push(...validStages.map((stage, index) => ({
                    ...stage,
                    id: String(stage.value || (!String(stage.id).startsWith('tmp_') ? stage.id : stage.label)),
                    order: index,
                    isNew: false,
                })))
            } else {
                for (const stage of validStages) {
                    if (stage.isNew || stage.id.startsWith('tmp_')) {
                        const data = await apiJson(`/account/${accountNumber}/classification/api/fast-add`, {
                            classificationId: selectedField.id,
                            label: stage.label,
                            color: stage.color,
                        })
                        finalOptions.push({ ...stage, id: cleanId(data.option), isNew: false })
                        continue
                    }

                    const original = originalById.get(stage.id)
                    if (original && (original.label !== stage.label || original.color !== stage.color)) {
                        await apiJson(`/account/${accountNumber}/classification/api/update-option`, {
                            classificationId: selectedField.id,
                            optionId: stage.id,
                            label: stage.label,
                            color: stage.color,
                        })
                    }
                    finalOptions.push(stage)
                }

                for (const optionId of deletedIds) {
                    await apiJson(`/account/${accountNumber}/classification/api/delete-option`, {
                        classificationId: selectedField.id,
                        optionId,
                    })
                }

                await apiJson(`/account/${accountNumber}/classification/api/reorder`, {
                    classificationId: selectedField.id,
                    options: finalOptions.map((stage, index) => ({ id: stage.id, order: index })),
                })
            }

            const nextSettings = {
                ...(viewSettings || {}),
                viewMode: 'kanban',
                kanbanField: selectedField.value,
                kanbanTagFields: selectedTagFields.filter(fieldId => tagFields.some(field => field.id === fieldId)),
            }
            await apiJson(`/account/${accountNumber}/api/view/config`, {
                viewId,
                settings: nextSettings,
            })

            onSaved?.(nextSettings)
        } catch (saveError) {
            setError(saveError.message || 'Sauvegarde impossible')
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 flex items-center justify-center bg-slate-950/45 p-4"
            style={{ zIndex: 10000 }}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) onClose?.()
            }}
        >
            <div
                className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1726]"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                            <iconify-icon icon="solar:slider-horizontal-bold-duotone" width="19"></iconify-icon>
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-gray-900 dark:text-white">Configurer la pipeline</div>
                            <div className="truncate text-xs text-gray-400">{entityData?.name || 'Entité'}</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => !saving && onClose?.()}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-dark/50 dark:text-white-dark dark:hover:bg-dark"
                        title="Fermer"
                    >
                        <iconify-icon icon="solar:close-circle-bold" width="17"></iconify-icon>
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
                        <div className="space-y-5">
                            <div className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-dark/20 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)]">
                                <label className="grid gap-1.5">
                                    <span className="text-[11px] font-bold uppercase text-gray-400">Champ pipeline</span>
                                    <select
                                        value={selectedValue}
                                        onChange={(event) => setSelectedValue(event.target.value)}
                                        className="form-select h-10 rounded-lg border-gray-200 bg-white text-sm font-semibold text-gray-800 dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                    >
                                        {fields.map(field => (
                                            <option key={field.value} value={field.value}>{field.label}</option>
                                        ))}
                                    </select>
                                </label>

                                <div className="grid gap-1.5">
                                    <span className="text-[11px] font-bold uppercase text-gray-400">Créer une pipeline</span>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newPipelineName}
                                            onChange={(event) => setNewPipelineName(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault()
                                                    createPipeline()
                                                }
                                            }}
                                            className="form-input h-10 min-w-0 flex-1 rounded-lg border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                            placeholder="Nom de pipeline"
                                            disabled={saving}
                                        />
                                        <button
                                            type="button"
                                            onClick={createPipeline}
                                            disabled={saving}
                                            className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-white transition hover:bg-primary/90 disabled:opacity-60"
                                            title="Créer"
                                        >
                                            <iconify-icon icon={saving ? 'svg-spinners:ring-resize' : 'solar:add-circle-bold'} width="18"></iconify-icon>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] font-bold uppercase text-gray-400">Étapes</div>
                                        <div className="text-xs text-gray-400">{stages.length} colonne{stages.length > 1 ? 's' : ''} dans le kanban</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addStage}
                                        disabled={!selectedField || saving}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-primary/40 hover:text-primary disabled:opacity-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark"
                                    >
                                        <iconify-icon icon="solar:add-circle-bold" width="14"></iconify-icon>
                                        Ajouter
                                    </button>
                                </div>

                                <div className="grid gap-2">
                                    {stages.map((stage, index) => (
                                        <div
                                            key={stage.id}
                                            className="grid grid-cols-[28px_34px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-gray-100 bg-white p-2 shadow-sm shadow-gray-100/60 dark:border-white/10 dark:bg-[#111827] dark:shadow-none"
                                        >
                                            <div className="text-center text-[11px] font-bold text-gray-400">{index + 1}</div>
                                            <label
                                                className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-dark"
                                                title="Couleur"
                                            >
                                                <span className="h-4 w-4 rounded" style={{ backgroundColor: stage.color || '#6366f1' }}></span>
                                                <input
                                                    type="color"
                                                    value={stage.color || '#6366f1'}
                                                    onChange={(event) => updateStage(stage.id, { color: event.target.value })}
                                                    disabled={saving}
                                                    className="sr-only"
                                                />
                                            </label>
                                            <input
                                                type="text"
                                                value={stage.label}
                                                onChange={(event) => updateStage(stage.id, { label: event.target.value })}
                                                disabled={saving}
                                                className="form-input h-9 min-w-0 rounded-lg border-gray-200 text-sm font-semibold dark:border-white/10 dark:bg-[#1b2e4b] dark:text-white"
                                            />
                                            <div className="flex items-center gap-1">
                                                <ButtonIcon icon="solar:alt-arrow-up-bold" title="Monter" onClick={() => moveStage(stage.id, -1)} disabled={index === 0 || saving} />
                                                <ButtonIcon icon="solar:alt-arrow-down-bold" title="Descendre" onClick={() => moveStage(stage.id, 1)} disabled={index === stages.length - 1 || saving} />
                                                <ButtonIcon icon="solar:trash-bin-trash-bold" title="Supprimer" onClick={() => removeStage(stage)} disabled={saving} tone="danger" />
                                            </div>
                                        </div>
                                    ))}

                                    {!stages.length && (
                                        <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-white/10">
                                            Aucune étape
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="mb-2">
                                    <div className="text-[11px] font-bold uppercase text-gray-400">Tags sur les cartes</div>
                                    <div className="text-xs text-gray-400">Champs select ou multi-select affichés comme badges sur les opportunités.</div>
                                </div>
                                {tagFields.length > 0 ? (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {tagFields.map(field => {
                                            const active = selectedTagFields.includes(field.id)
                                            return (
                                                <button
                                                    key={field.id}
                                                    type="button"
                                                    onClick={() => toggleTagField(field.id)}
                                                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                                                        active
                                                            ? 'border-primary/40 bg-primary/5 text-primary'
                                                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary/30 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark'
                                                    }`}
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-bold">{field.label}</span>
                                                        <span className="block text-[11px] text-gray-400">{field.options.length || 'Sans'} option{field.options.length > 1 ? 's' : ''}</span>
                                                    </span>
                                                    <span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${active ? 'border-primary bg-primary text-white' : 'border-gray-200 text-transparent dark:border-white/10'}`}>
                                                        <iconify-icon icon="solar:check-read-bold" width="12"></iconify-icon>
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-xs text-gray-400 dark:border-white/10">
                                        Aucun champ select ou multi-select disponible sur cette fiche.
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>

                        <aside className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm shadow-gray-100/70 dark:border-white/10 dark:bg-[#111827] dark:shadow-none">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-gray-400">Aperçu</span>
                                <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 dark:bg-dark dark:text-white-dark">Kanban</span>
                            </div>
                            <div className="space-y-2">
                                {stages.slice(0, 5).map(stage => (
                                    <div key={`preview-${stage.id}`} className="rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-white/10 dark:bg-dark/40">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <span
                                                className="truncate rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                                                style={{ backgroundColor: stage.color || '#6366f1' }}
                                            >
                                                {stage.label || 'Étape'}
                                            </span>
                                            <span className="text-[11px] font-bold text-gray-400">0</span>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 bg-white p-2 dark:border-white/10 dark:bg-[#0e1726]">
                                            <div className="mb-2 h-2 w-3/4 rounded bg-gray-200 dark:bg-white/10"></div>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedTagFields.slice(0, 2).map(fieldId => {
                                                    const field = tagFields.find(item => item.id === fieldId)
                                                    const option = field?.options?.[0]
                                                    return (
                                                        <span
                                                            key={fieldId}
                                                            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                                            style={{
                                                                backgroundColor: `${option?.color || '#64748b'}1a`,
                                                                color: option?.color || '#64748b',
                                                            }}
                                                        >
                                                            {option?.label || field?.label || 'Tag'}
                                                        </span>
                                                    )
                                                })}
                                                {!selectedTagFields.length && <span className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/10"></span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-dark/30">
                    <button
                        type="button"
                        onClick={() => !saving && onClose?.()}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-[#111827] dark:text-white-dark"
                        disabled={saving}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={savePipeline}
                        disabled={saving || !selectedField}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
                    >
                        <iconify-icon icon={saving ? 'svg-spinners:ring-resize' : 'solar:diskette-bold'} width="15"></iconify-icon>
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

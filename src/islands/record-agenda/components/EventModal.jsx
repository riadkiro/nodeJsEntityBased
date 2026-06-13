/**
 * EventModal — Create/Edit event modal
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'

const EVENT_TYPES = [
    { value: 'consultation', label: 'Consultation', color: '#4361ee' },
    { value: 'reunion', label: 'Réunion', color: '#8b5cf6' },
    { value: 'rappel', label: 'Rappel', color: '#f59e0b' },
    { value: 'tache', label: 'Tâche', color: '#10b981' },
    { value: 'personnel', label: 'Personnel', color: '#ec4899' },
    { value: 'autre', label: 'Autre', color: '#6b7280' },
]

const EVENT_TAG_FALLBACK_OPTIONS = [
    { label: 'Important', value: 'Important', color: '#ef4444' },
    { label: 'Date limite', value: 'Date limite', color: '#f59e0b' },
    { label: 'Risque amende', value: 'Risque amende', color: '#dc2626' },
]

const DEFAULT_CREATED_TAG_COLOR = '#64748b'
const UPCOMING_WIDGET_FIELD = 'widget_prochains_evenements'
const IMPORTANT_DATE_WIDGET_FIELD = 'widget_date_importante'

export default function EventModal({
    isOpen, onClose, event, entityData, prefillDate,
    onCreate, onUpdate, onDelete,
    getCustomFieldValue, getStatusInfo, accountNumber
}) {
    const [form, setForm] = useState({
        title: '',
        date: '',
        endDate: '',
        duration: 30,
        type: 'consultation',
        tags: [],
        lieu: '',
        notes: '',
        statusOptionId: '',
        showInUpcomingWidget: true,
        isImportantDate: false,
    })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')
    const [createdTagOptions, setCreatedTagOptions] = useState([])

    const isEditing = !!event

    // Populate form when editing
    useEffect(() => {
        if (!isOpen) return
        setFormError('')
        setCreatedTagOptions([])

        if (event) {
            const status = getStatusInfo(event)
            const statusCv = (event.classificationValues || []).find(
                cv => cv.classificationId?.toString() === entityData?.statusClassification?._id?.toString()
            )

            const eventTags = normalizeTagValues(getCustomFieldValue(event, 'tags_evenement'))

            setForm({
                title: event.title || '',
                date: event.date ? toLocalDateTime(new Date(event.date)) : '',
                endDate: event.end_date ? toLocalDateTime(new Date(event.end_date)) : '',
                duration: getCustomFieldValue(event, 'duree_evenement') || 30,
                type: getCustomFieldValue(event, 'type_evenement') || 'consultation',
                tags: eventTags,
                lieu: getCustomFieldValue(event, 'lieu_evenement') || '',
                notes: getCustomFieldValue(event, 'notes_evenement') || '',
                statusOptionId: statusCv?.optionId?.toString() || '',
                showInUpcomingWidget: normalizeBooleanValue(getCustomFieldValue(event, UPCOMING_WIDGET_FIELD), true),
                isImportantDate: normalizeBooleanValue(
                    getCustomFieldValue(event, IMPORTANT_DATE_WIDGET_FIELD),
                    eventTags.some(tag => tag.toLowerCase() === 'date importante')
                ),
            })
        } else {
            // New event
            let defaultDate = ''
            if (prefillDate) {
                // prefillDate could be "2026-05-15" or "2026-05-15T10:00:00"
                const d = new Date(prefillDate)
                if (isNaN(d.getTime())) {
                    defaultDate = prefillDate + 'T09:00'
                } else {
                    // Round to nearest 5 minutes
                    d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0)
                    defaultDate = toLocalDateTime(d)
                }
            } else {
                const now = new Date()
                now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0)
                defaultDate = toLocalDateTime(now)
            }

            // Default status = first option (Planifié)
            const defaultStatusId = entityData?.statusClassification?.options?.[0]?._id?.toString() || ''

            setForm({
                title: '',
                date: defaultDate,
                endDate: '',
                duration: 30,
                type: 'consultation',
                tags: [],
                lieu: '',
                notes: '',
                statusOptionId: defaultStatusId,
                showInUpcomingWidget: true,
                isImportantDate: false,
            })
        }
    }, [isOpen, event, prefillDate, entityData, getCustomFieldValue, getStatusInfo])

    const handleChange = useCallback((field, value) => {
        setFormError('')
        setForm(prev => ({ ...prev, [field]: value }))
    }, [])

    const handleSave = useCallback(async () => {
        if (!form.title.trim()) return
        setSaving(true)
        setFormError('')

        try {
            const startDate = parseDateTime(form.date, 'Date')
            let endDate = form.endDate ? parseDateTime(form.endDate, 'Date de fin').toISOString() : undefined

            // Compute endDate from date + duration if not explicitly set
            if (!endDate && startDate && form.duration) {
                const end = new Date(startDate.getTime() + (parseInt(form.duration) || 30) * 60000)
                endDate = end.toISOString()
            }

            const payload = {
                title: form.title.trim(),
                date: startDate ? startDate.toISOString() : undefined,
                endDate,
                duration: parseInt(form.duration) || 30,
                type: form.type,
                tags: normalizeTagValues(form.tags),
                lieu: form.lieu,
                notes: form.notes,
                statusOptionId: form.statusOptionId || undefined,
                showInUpcomingWidget: !!form.showInUpcomingWidget,
                isImportantDate: !!form.isImportantDate,
            }

            if (isEditing) {
                await onUpdate(event._id.toString(), payload)
            } else {
                await onCreate(payload)
            }
        } catch (err) {
            console.error('[EventModal] Save error:', err)
            setFormError(err.message || "Impossible d'enregistrer cet evenement.")
        } finally {
            setSaving(false)
        }
    }, [form, isEditing, event, onCreate, onUpdate])

    if (!isOpen) return null

    const statusOptions = entityData?.statusClassification?.options || []
    const tagField = getEventTagsField(entityData)
    const tagOptions = mergeTagOptions([
        EVENT_TAG_FALLBACK_OPTIONS,
        tagField?.type_config?.options || [],
        createdTagOptions,
        normalizeTagValues(form.tags).map(tag => ({ label: tag, value: tag })),
    ])

    const handleCreateTagOption = async (label) => {
        const option = { label, value: label, color: DEFAULT_CREATED_TAG_COLOR }
        const fieldId = tagField?._id?.toString?.() || tagField?._id

        if (!accountNumber || !fieldId) {
            setCreatedTagOptions(prev => mergeTagOptions([prev, [option]]))
            return option
        }

        const res = await fetch(`/account/${accountNumber}/field-template/api/${fieldId}/add-option`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(option)
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.success) throw new Error(data.error || 'Création impossible')

        const created = normalizeTagOption(data.option || option)
        setCreatedTagOptions(prev => mergeTagOptions([prev, [created]]))
        return created
    }

    return (
        <div className="ra-modal-overlay" onClick={onClose}>
            <div className="ra-modal" onClick={e => e.stopPropagation()}>
                <div className="ra-modal-header">
                    <div className="ra-modal-header-left">
                        <div className="ra-modal-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <h3>{isEditing ? 'Modifier l\'événement' : 'Nouvel événement'}</h3>
                    </div>
                    <button className="ra-modal-close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="ra-modal-body">
                    {/* Title */}
                    <div className="ra-field">
                        <label className="ra-label">Titre</label>
                        <input
                            type="text"
                            className="ra-input"
                            placeholder="Ex: Consultation de suivi..."
                            value={form.title}
                            onChange={e => handleChange('title', e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Date & Duration row */}
                    <div className="ra-field-row">
                        <div className="ra-field" style={{ flex: 1 }}>
                            <label className="ra-label">Date & heure</label>
                            <input
                                type="datetime-local"
                                className="ra-input"
                                step="300"
                                value={form.date}
                                onChange={e => handleChange('date', e.target.value)}
                            />
                        </div>
                        <div className="ra-field" style={{ width: 100 }}>
                            <label className="ra-label">Durée (min)</label>
                            <input
                                type="number"
                                className="ra-input"
                                value={form.duration}
                                onChange={e => handleChange('duration', e.target.value)}
                                min="5" max="480" step="5"
                            />
                        </div>
                    </div>

                    {/* Type & Status row */}
                    <div className="ra-field-row">
                        <div className="ra-field" style={{ flex: 1 }}>
                            <label className="ra-label">Type</label>
                            <div className="ra-type-pills">
                                {EVENT_TYPES.map(t => (
                                    <button
                                        key={t.value}
                                        className={`ra-type-pill ${form.type === t.value ? 'active' : ''}`}
                                        style={{
                                            '--pill-c': t.color,
                                            background: form.type === t.value ? `${t.color}15` : undefined,
                                            borderColor: form.type === t.value ? `${t.color}40` : undefined,
                                            color: form.type === t.value ? t.color : undefined,
                                        }}
                                        onClick={() => handleChange('type', t.value)}
                                        type="button"
                                    >
                                        <span className="ra-pill-dot" style={{ background: t.color }} />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    {statusOptions.length > 0 && (
                        <div className="ra-field">
                            <label className="ra-label">Statut</label>
                            <div className="ra-status-pills">
                                {statusOptions.map(opt => (
                                    <button
                                        key={opt._id.toString()}
                                        className={`ra-status-pill ${form.statusOptionId === opt._id.toString() ? 'active' : ''}`}
                                        style={{
                                            '--st-c': opt.color,
                                            background: form.statusOptionId === opt._id.toString() ? `${opt.color}15` : undefined,
                                            borderColor: form.statusOptionId === opt._id.toString() ? opt.color : undefined,
                                            color: form.statusOptionId === opt._id.toString() ? opt.color : undefined,
                                        }}
                                        onClick={() => handleChange('statusOptionId', opt._id.toString())}
                                        type="button"
                                    >
                                        <span className="ra-pill-dot" style={{ background: opt.color }} />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    <div className="ra-field">
                        <label className="ra-label">Étiquettes</label>
                        <EventTagsMultiselect
                            value={form.tags}
                            options={tagOptions}
                            onChange={next => handleChange('tags', next)}
                            onCreateOption={handleCreateTagOption}
                        />
                    </div>

                    {/* Widget visibility */}
                    <div className="ra-field">
                        <label className="ra-label">Widget</label>
                        <div className="ra-widget-switches">
                            <label className={`ra-widget-switch ${form.showInUpcomingWidget ? 'active' : ''}`}>
                                <span className="ra-widget-switch-copy">
                                    <strong>Prochains événements</strong>
                                    <small>Afficher dans le widget agenda</small>
                                </span>
                                <span className="ra-switch">
                                    <input
                                        type="checkbox"
                                        checked={!!form.showInUpcomingWidget}
                                        onChange={event => handleChange('showInUpcomingWidget', event.target.checked)}
                                    />
                                    <span />
                                </span>
                            </label>
                            <label className={`ra-widget-switch ${form.isImportantDate ? 'active' : ''}`}>
                                <span className="ra-widget-switch-copy">
                                    <strong>Date importante</strong>
                                    <small>Afficher dans le widget dates importantes</small>
                                </span>
                                <span className="ra-switch">
                                    <input
                                        type="checkbox"
                                        checked={!!form.isImportantDate}
                                        onChange={event => handleChange('isImportantDate', event.target.checked)}
                                    />
                                    <span />
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="ra-field">
                        <label className="ra-label">Lieu</label>
                        <input
                            type="text"
                            className="ra-input"
                            placeholder="Cabinet, Salle A, Domicile..."
                            value={form.lieu}
                            onChange={e => handleChange('lieu', e.target.value)}
                        />
                    </div>

                    {/* Notes */}
                    <div className="ra-field">
                        <label className="ra-label">Notes</label>
                        <textarea
                            className="ra-input ra-textarea"
                            placeholder="Notes additionnelles..."
                            rows={3}
                            value={form.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                        />
                    </div>

                    {formError && (
                        <div className="ra-modal-error" role="alert">
                            {formError}
                        </div>
                    )}
                </div>

                <div className="ra-modal-footer">
                    {isEditing && (
                        <button
                            className="ra-delete-btn"
                            onClick={() => onDelete(event._id.toString())}
                            type="button"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Supprimer
                        </button>
                    )}
                    <div className="ra-modal-footer-right">
                        <button className="ra-cancel-btn" onClick={onClose} type="button">Annuler</button>
                        <button
                            className="ra-save-btn"
                            onClick={handleSave}
                            disabled={saving || !form.title.trim()}
                            type="button"
                        >
                            {saving ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer')}
                        </button>
                    </div>
                </div>
            </div>

            <style>{getModalStyles()}</style>
        </div>
    )
}

function EventTagsMultiselect({ value, options, onChange, onCreateOption }) {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const rootRef = useRef(null)
    const inputRef = useRef(null)

    const selectedValues = useMemo(() => normalizeTagValues(value), [value])
    const allOptions = useMemo(() => mergeTagOptions([
        options,
        selectedValues.map(tag => ({ label: tag, value: tag })),
    ]), [options, selectedValues])

    const selectedOptions = useMemo(() => {
        return selectedValues.map(tag => {
            return allOptions.find(opt => tagMatchesValue(opt, tag)) || { label: tag, value: tag, color: DEFAULT_CREATED_TAG_COLOR }
        })
    }, [allOptions, selectedValues])

    const query = search.trim().toLowerCase()
    const filteredOptions = useMemo(() => {
        return allOptions
            .filter(opt => !selectedValues.some(tag => tagMatchesValue(opt, tag)))
            .filter(opt => {
                if (!query) return true
                return String(opt.label || '').toLowerCase().includes(query) || String(opt.value || '').toLowerCase().includes(query)
            })
            .slice(0, 8)
    }, [allOptions, selectedValues, query])

    const hasExactMatch = useMemo(() => {
        if (!query) return false
        return allOptions.some(opt =>
            String(opt.label || '').trim().toLowerCase() === query ||
            String(opt.value || '').trim().toLowerCase() === query
        )
    }, [allOptions, query])

    useEffect(() => {
        const onDown = (event) => {
            if (!rootRef.current || rootRef.current.contains(event.target)) return
            setOpen(false)
            setSearch('')
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [])

    const addTag = useCallback((option) => {
        const opt = normalizeTagOption(option)
        if (!opt.value) return
        const exists = selectedValues.some(tag => tag.toLowerCase() === String(opt.value).toLowerCase())
        if (!exists) onChange([...selectedValues, opt.value])
        setSearch('')
        setOpen(true)
        requestAnimationFrame(() => inputRef.current?.focus())
    }, [onChange, selectedValues])

    const removeTag = useCallback((tag) => {
        onChange(selectedValues.filter(item => item.toLowerCase() !== String(tag).toLowerCase()))
        requestAnimationFrame(() => inputRef.current?.focus())
    }, [onChange, selectedValues])

    const createTag = useCallback(async () => {
        const label = search.trim()
        if (!label || hasExactMatch || creating) return
        setCreating(true)
        try {
            const created = await onCreateOption(label)
            addTag(created || { label, value: label })
        } catch (err) {
            console.error('[EventTags] Create option error:', err)
            window.showMessage ? window.showMessage(err.message || 'Création impossible', 'danger') : alert(err.message || 'Création impossible')
        } finally {
            setCreating(false)
        }
    }, [addTag, creating, hasExactMatch, onCreateOption, search])

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            if (filteredOptions.length > 0) addTag(filteredOptions[0])
            else createTag()
        } else if (event.key === 'Backspace' && !search && selectedValues.length > 0) {
            removeTag(selectedValues[selectedValues.length - 1])
        } else if (event.key === 'Escape') {
            setOpen(false)
            setSearch('')
        }
    }

    return (
        <div className="ra-tag-ms" ref={rootRef}>
            <div className={`ra-tag-ms-control ${open ? 'open' : ''}`} onClick={() => { setOpen(true); inputRef.current?.focus() }}>
                {selectedOptions.map(tag => (
                    <span
                        key={tag.value}
                        className="ra-tag-ms-pill"
                        style={{
                            '--tag-c': tag.color || DEFAULT_CREATED_TAG_COLOR,
                            background: `${tag.color || DEFAULT_CREATED_TAG_COLOR}12`,
                            borderColor: `${tag.color || DEFAULT_CREATED_TAG_COLOR}35`,
                            color: tag.color || DEFAULT_CREATED_TAG_COLOR,
                        }}
                    >
                        {tag.label}
                        <button type="button" onClick={(event) => { event.stopPropagation(); removeTag(tag.value) }} aria-label={`Retirer ${tag.label}`}>
                            ×
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    className="ra-tag-ms-input"
                    value={search}
                    onChange={event => { setSearch(event.target.value); setOpen(true) }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedOptions.length ? 'Ajouter...' : 'Important, Date limite...'}
                />
            </div>

            {open && (filteredOptions.length > 0 || (search.trim() && !hasExactMatch)) && (
                <div className="ra-tag-ms-menu">
                    {filteredOptions.map(option => (
                        <button key={option.value} type="button" className="ra-tag-ms-option" onClick={() => addTag(option)}>
                            <span className="ra-tag-ms-dot" style={{ background: option.color || DEFAULT_CREATED_TAG_COLOR }} />
                            <span>{option.label}</span>
                        </button>
                    ))}
                    {search.trim() && !hasExactMatch && (
                        <button type="button" className="ra-tag-ms-create" onClick={createTag} disabled={creating}>
                            <span>+</span>
                            {creating ? 'Création...' : `Créer "${search.trim()}"`}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

function getEventTagsField(entityData) {
    return (entityData?.customFields || []).find(field => field?.name === 'tags_evenement') || null
}

function normalizeBooleanValue(value, fallback = false) {
    if (value === undefined || value === null || value === '') return fallback
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0

    const token = String(value).trim().toLowerCase()
    if (['true', '1', 'yes', 'oui', 'on'].includes(token)) return true
    if (['false', '0', 'no', 'non', 'off'].includes(token)) return false

    return fallback
}

function normalizeTagValues(value) {
    const raw = Array.isArray(value)
        ? value
        : (typeof value === 'string' ? value.split(',') : [])

    return raw
        .map(item => String(item || '').trim())
        .filter(Boolean)
        .filter((item, idx, arr) => arr.findIndex(other => other.toLowerCase() === item.toLowerCase()) === idx)
}

function normalizeTagOption(option) {
    if (typeof option === 'object' && option) {
        const label = String(option.label || option.value || '').trim()
        const value = String(option.value || option.label || '').trim()
        return { label, value, color: option.color || DEFAULT_CREATED_TAG_COLOR }
    }

    const value = String(option || '').trim()
    return { label: value, value, color: DEFAULT_CREATED_TAG_COLOR }
}

function tagMatchesValue(option, value) {
    const token = String(value || '').trim().toLowerCase()
    return [option.value, option.label]
        .filter(item => item !== undefined && item !== null)
        .some(item => String(item).trim().toLowerCase() === token)
}

function mergeTagOptions(groups) {
    const merged = []
    const seen = new Set()

    groups.flat().forEach(option => {
        const normalized = normalizeTagOption(option)
        if (!normalized.value) return
        const token = normalized.value.toLowerCase()
        if (seen.has(token)) return
        seen.add(token)
        merged.push(normalized)
    })

    return merged
}

function toLocalDateTime(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}`
}

function parseDateTime(value, label) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        throw new Error(`${label} invalide.`)
    }
    return date
}

function getModalStyles() {
    return `
.ra-modal-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,.25);
    backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
    animation:raFadeIn .2s ease;
}
.ra-modal {
    background:#fff; border-radius:16px;
    box-shadow:0 20px 60px rgba(0,0,0,.15);
    width:520px; max-width:calc(100vw - 40px);
    max-height:calc(100vh - 40px); overflow-y:auto;
    animation:raSlideUp .3s ease;
}
.dark .ra-modal { background:#0e1726; border:1px solid #253b5c; }

@keyframes raSlideUp {
    from { opacity:0; transform:translateY(20px); }
    to { opacity:1; transform:translateY(0); }
}

.ra-modal-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:20px 24px 0;
}
.ra-modal-header-left { display:flex; align-items:center; gap:10px; }
.ra-modal-icon {
    width:36px; height:36px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, #14b8a618, #14b8a608);
    color:#14b8a6;
}
.ra-modal-header h3 { font-size:16px; font-weight:700; color:#0e1726; margin:0; }
.dark .ra-modal-header h3 { color:#e0e6ed; }

.ra-modal-close {
    width:32px; height:32px; border:none; border-radius:8px;
    background:transparent; color:#9ca3af; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s;
}
.ra-modal-close:hover { background:#f1f5f9; color:#374151; }
.dark .ra-modal-close:hover { background:#1b2e4b; color:#e0e6ed; }

.ra-modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:16px; }

.ra-field { display:flex; flex-direction:column; gap:6px; }
.ra-field-row { display:flex; gap:12px; }

.ra-label { font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
.dark .ra-label { color:#506690; }

.ra-input {
    width:100%; padding:9px 12px; border:1.5px solid #e2e8f0;
    border-radius:8px; font-size:13px; color:#0e1726;
    background:#fff; font-family:inherit; outline:none;
    transition:border-color .2s, box-shadow .2s;
    box-sizing:border-box;
}
.ra-input:focus { border-color:#14b8a6; box-shadow:0 0 0 3px rgba(20,184,166,.08); }
.dark .ra-input { background:#1b2e4b; border-color:#253b5c; color:#e0e6ed; }
.dark .ra-input:focus { border-color:#14b8a6; }
.ra-textarea { resize:vertical; min-height:60px; line-height:1.45; }

.ra-tag-ms { position:relative; }
.ra-tag-ms-control {
    min-height:42px; width:100%; padding:6px 8px;
    border:1.5px solid #e2e8f0; border-radius:8px;
    background:#fff; display:flex; align-items:center; flex-wrap:wrap; gap:6px;
    cursor:text; transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
}
.ra-tag-ms-control.open {
    border-color:#14b8a6;
    box-shadow:0 0 0 3px rgba(20,184,166,.08);
}
.dark .ra-tag-ms-control { background:#1b2e4b; border-color:#253b5c; }
.dark .ra-tag-ms-control.open { border-color:#14b8a6; }
.ra-tag-ms-pill {
    display:inline-flex; align-items:center; gap:5px;
    min-height:25px; padding:3px 8px; border:1px solid;
    border-radius:7px; font-size:12px; font-weight:700; line-height:1.2;
}
.ra-tag-ms-pill button {
    width:16px; height:16px; border:0; border-radius:50%;
    background:transparent; color:inherit; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; line-height:1; opacity:.65; padding:0;
}
.ra-tag-ms-pill button:hover { opacity:1; background:rgba(15,23,42,.08); }
.ra-tag-ms-input {
    flex:1; min-width:130px; border:0; outline:0; background:transparent;
    color:#0e1726; font-size:13px; font-family:inherit; padding:4px 3px;
}
.ra-tag-ms-input::placeholder { color:#9ca3af; }
.dark .ra-tag-ms-input { color:#e0e6ed; }
.ra-tag-ms-menu {
    position:absolute; left:0; right:0; top:calc(100% + 5px); z-index:20;
    background:#fff; border:1px solid #e2e8f0; border-radius:10px;
    box-shadow:0 16px 42px rgba(15,23,42,.14);
    padding:5px; max-height:210px; overflow-y:auto;
}
.dark .ra-tag-ms-menu { background:#0e1726; border-color:#253b5c; box-shadow:0 16px 42px rgba(0,0,0,.32); }
.ra-tag-ms-option,
.ra-tag-ms-create {
    width:100%; border:0; background:transparent; border-radius:8px;
    display:flex; align-items:center; gap:8px; padding:8px 9px;
    color:#334155; font-size:12.5px; font-weight:700;
    cursor:pointer; text-align:left; font-family:inherit;
}
.ra-tag-ms-option:hover,
.ra-tag-ms-create:hover { background:#f8fafc; }
.dark .ra-tag-ms-option,
.dark .ra-tag-ms-create { color:#e0e6ed; }
.dark .ra-tag-ms-option:hover,
.dark .ra-tag-ms-create:hover { background:#1b2e4b; }
.ra-tag-ms-dot { width:8px; height:8px; border-radius:50%; flex:none; }
.ra-tag-ms-create { color:#14b8a6; border-top:1px solid #f1f5f9; margin-top:3px; }
.dark .ra-tag-ms-create { border-top-color:#253b5c; }
.ra-tag-ms-create span {
    width:18px; height:18px; border-radius:6px; background:rgba(20,184,166,.12);
    display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800;
}
.ra-tag-ms-create:disabled { opacity:.6; cursor:wait; }

.ra-widget-switches { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.ra-widget-switch {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    min-width:0; padding:11px 12px; border:1.5px solid #e2e8f0;
    border-radius:10px; background:#fff; cursor:pointer; transition:all .18s;
}
.ra-widget-switch:hover { border-color:#cbd5e1; background:#fbfdff; }
.ra-widget-switch.active { border-color:#14b8a655; background:rgba(20,184,166,.05); }
.dark .ra-widget-switch { background:#1b2e4b; border-color:#253b5c; }
.dark .ra-widget-switch:hover { border-color:#3b4f6f; }
.dark .ra-widget-switch.active { border-color:#14b8a6; background:rgba(20,184,166,.12); }
.ra-widget-switch-copy { display:flex; flex-direction:column; gap:2px; min-width:0; }
.ra-widget-switch-copy strong {
    font-size:12.5px; line-height:1.2; color:#0f172a; font-weight:800;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.ra-widget-switch-copy small {
    font-size:10.5px; line-height:1.25; color:#94a3b8; font-weight:600;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.dark .ra-widget-switch-copy strong { color:#e0e6ed; }
.dark .ra-widget-switch-copy small { color:#64748b; }
.ra-switch { position:relative; width:38px; height:22px; flex:none; }
.ra-switch input { position:absolute; inset:0; opacity:0; cursor:pointer; z-index:2; }
.ra-switch span {
    position:absolute; inset:0; border-radius:999px; background:#cbd5e1;
    transition:background .18s;
}
.ra-switch span::before {
    content:''; position:absolute; width:16px; height:16px; left:3px; top:3px;
    border-radius:999px; background:#fff; box-shadow:0 1px 4px rgba(15,23,42,.2);
    transition:transform .18s;
}
.ra-switch input:checked + span { background:#14b8a6; }
.ra-switch input:checked + span::before { transform:translateX(16px); }
.dark .ra-switch span { background:#506690; }

.ra-modal-error {
    padding:10px 12px; border-radius:9px;
    border:1px solid #fecaca; background:#fff7f7; color:#b91c1c;
    font-size:12px; font-weight:700; line-height:1.4;
}
.dark .ra-modal-error { background:rgba(127,29,29,.18); border-color:#7f1d1d; color:#fecaca; }

.ra-type-pills, .ra-status-pills { display:flex; flex-wrap:wrap; gap:6px; }

.ra-type-pill, .ra-status-pill {
    display:inline-flex; align-items:center; gap:5px;
    padding:5px 12px; border-radius:7px;
    border:1.5px solid #e2e8f0; background:#fff;
    font-size:12px; font-weight:600; color:#6b7280;
    cursor:pointer; transition:all .2s; font-family:inherit;
}
.ra-type-pill:hover, .ra-status-pill:hover { border-color:#d1d5db; }
.dark .ra-type-pill, .dark .ra-status-pill {
    background:#1b2e4b; border-color:#253b5c; color:#888da8;
}

.ra-pill-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

.ra-modal-footer {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 24px 20px; gap:12px;
}
.ra-modal-footer-right { display:flex; gap:8px; margin-left:auto; }

.ra-cancel-btn {
    padding:9px 18px; border:1.5px solid #e2e8f0; border-radius:8px;
    background:#fff; color:#6b7280; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-cancel-btn:hover { background:#f9fafb; border-color:#d1d5db; }
.dark .ra-cancel-btn { background:#1b2e4b; border-color:#253b5c; color:#888da8; }

.ra-save-btn {
    padding:9px 20px; border:none; border-radius:8px;
    background:linear-gradient(135deg, #14b8a6, #14b8a6dd);
    color:#fff; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-save-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(20,184,166,.3); }
.ra-save-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

.ra-delete-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:9px 16px; border:1.5px solid #fecaca; border-radius:8px;
    background:#fff; color:#ef4444; font-size:12px; font-weight:600;
    cursor:pointer; transition:all .15s; font-family:inherit;
}
.ra-delete-btn:hover { background:#fef2f2; border-color:#ef4444; }
.dark .ra-delete-btn { background:#1b2e4b; border-color:#7f1d1d; }

@media(max-width:560px) {
    .ra-widget-switches { grid-template-columns:1fr; }
}
`
}

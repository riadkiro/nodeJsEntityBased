/**
 * EventModal — Create/Edit event modal
 */
import React, { useState, useEffect, useCallback } from 'react'

const EVENT_TYPES = [
    { value: 'consultation', label: 'Consultation', color: '#4361ee' },
    { value: 'reunion', label: 'Réunion', color: '#8b5cf6' },
    { value: 'rappel', label: 'Rappel', color: '#f59e0b' },
    { value: 'tache', label: 'Tâche', color: '#10b981' },
    { value: 'personnel', label: 'Personnel', color: '#ec4899' },
    { value: 'autre', label: 'Autre', color: '#6b7280' },
]

export default function EventModal({
    isOpen, onClose, event, entityData, prefillDate,
    onCreate, onUpdate, onDelete,
    getCustomFieldValue, getStatusInfo
}) {
    const [form, setForm] = useState({
        title: '',
        date: '',
        endDate: '',
        duration: 30,
        type: 'consultation',
        lieu: '',
        notes: '',
        statusOptionId: '',
    })
    const [saving, setSaving] = useState(false)

    const isEditing = !!event

    // Populate form when editing
    useEffect(() => {
        if (!isOpen) return

        if (event) {
            const status = getStatusInfo(event)
            const statusCv = (event.classificationValues || []).find(
                cv => cv.classificationId?.toString() === entityData?.statusClassification?._id?.toString()
            )

            setForm({
                title: event.title || '',
                date: event.date ? toLocalDateTime(new Date(event.date)) : '',
                endDate: event.end_date ? toLocalDateTime(new Date(event.end_date)) : '',
                duration: getCustomFieldValue(event, 'duree_evenement') || 30,
                type: getCustomFieldValue(event, 'type_evenement') || 'consultation',
                lieu: getCustomFieldValue(event, 'lieu_evenement') || '',
                notes: getCustomFieldValue(event, 'notes_evenement') || '',
                statusOptionId: statusCv?.optionId?.toString() || '',
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
                lieu: '',
                notes: '',
                statusOptionId: defaultStatusId,
            })
        }
    }, [isOpen, event, prefillDate, entityData])

    const handleChange = useCallback((field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }, [])

    const handleSave = useCallback(async () => {
        if (!form.title.trim()) return
        setSaving(true)

        // Compute endDate from date + duration if not explicitly set
        let endDate = form.endDate
        if (!endDate && form.date && form.duration) {
            const start = new Date(form.date)
            const end = new Date(start.getTime() + parseInt(form.duration) * 60000)
            endDate = end.toISOString()
        }

        const payload = {
            title: form.title.trim(),
            date: form.date ? new Date(form.date).toISOString() : undefined,
            endDate: endDate || undefined,
            duration: parseInt(form.duration) || 30,
            type: form.type,
            lieu: form.lieu,
            notes: form.notes,
            statusOptionId: form.statusOptionId || undefined,
        }

        try {
            if (isEditing) {
                await onUpdate(event._id.toString(), payload)
            } else {
                await onCreate(payload)
            }
        } catch (err) {
            console.error('[EventModal] Save error:', err)
        }
        setSaving(false)
    }, [form, isEditing, event, onCreate, onUpdate])

    if (!isOpen) return null

    const statusOptions = entityData?.statusClassification?.options || []

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

function toLocalDateTime(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d}T${h}:${min}`
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
`
}

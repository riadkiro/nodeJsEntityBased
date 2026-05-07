/**
 * ListView — Tabular list view with sortable columns
 */
import React, { useMemo, useState } from 'react'

export default function ListView({ events, entityData, onEventClick, onDeleteEvent, getStatusInfo, getCustomFieldValue }) {
    const [sortField, setSortField] = useState('date')
    const [sortDir, setSortDir] = useState('asc')

    const sorted = useMemo(() => {
        return [...events].sort((a, b) => {
            let va, vb
            switch (sortField) {
                case 'title':
                    va = (a.title || '').toLowerCase()
                    vb = (b.title || '').toLowerCase()
                    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
                case 'status':
                    va = getStatusInfo(a).label
                    vb = getStatusInfo(b).label
                    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
                case 'type':
                    va = getCustomFieldValue(a, 'type_evenement') || ''
                    vb = getCustomFieldValue(b, 'type_evenement') || ''
                    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
                case 'date':
                default:
                    va = a.date ? new Date(a.date).getTime() : 0
                    vb = b.date ? new Date(b.date).getTime() : 0
                    return sortDir === 'asc' ? va - vb : vb - va
            }
        })
    }, [events, sortField, sortDir, getStatusInfo, getCustomFieldValue])

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        const d = new Date(dateStr)
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    const isPast = (dateStr) => dateStr && new Date(dateStr) < new Date()

    const SortIcon = ({ field }) => (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: sortField === field ? 1 : 0.3 }}>
            <path d={sortField === field && sortDir === 'desc' ? 'M5 2L8 6H2L5 2Z' : 'M5 8L2 4H8L5 8Z'} fill="currentColor" />
        </svg>
    )

    if (events.length === 0) return null

    return (
        <div className="ra-list-wrap">
            <style>{getListStyles()}</style>
            <table className="ra-list-table">
                <thead>
                    <tr>
                        <th className="ra-th ra-th-sortable" onClick={() => toggleSort('title')}>
                            Titre <SortIcon field="title" />
                        </th>
                        <th className="ra-th ra-th-sortable" onClick={() => toggleSort('date')}>
                            Date <SortIcon field="date" />
                        </th>
                        <th className="ra-th">Heure</th>
                        <th className="ra-th">Durée</th>
                        <th className="ra-th ra-th-sortable" onClick={() => toggleSort('type')}>
                            Type <SortIcon field="type" />
                        </th>
                        <th className="ra-th">Lieu</th>
                        <th className="ra-th ra-th-sortable" onClick={() => toggleSort('status')}>
                            Statut <SortIcon field="status" />
                        </th>
                        <th className="ra-th" style={{ width: 40 }}></th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((ev, i) => {
                        const status = getStatusInfo(ev)
                        const type = getCustomFieldValue(ev, 'type_evenement')
                        const lieu = getCustomFieldValue(ev, 'lieu_evenement')
                        const duration = getCustomFieldValue(ev, 'duree_evenement')
                        const past = isPast(ev.date)

                        return (
                            <tr
                                key={ev._id?.toString()}
                                className={`ra-tr ${past ? 'past' : ''}`}
                                onClick={() => onEventClick(ev)}
                                style={{ animationDelay: `${i * 30}ms` }}
                            >
                                <td className="ra-td ra-td-title">
                                    <div className="ra-td-title-dot" style={{ background: status.color }} />
                                    {ev.title || 'Sans titre'}
                                </td>
                                <td className="ra-td">{formatDate(ev.date)}</td>
                                <td className="ra-td ra-td-time">{formatTime(ev.date)}</td>
                                <td className="ra-td">{duration ? `${duration} min` : '—'}</td>
                                <td className="ra-td ra-td-type">
                                    {type ? (
                                        <span className="ra-td-type-badge">
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td className="ra-td">{lieu || '—'}</td>
                                <td className="ra-td">
                                    <span className="ra-td-status" style={{ background: `${status.color}12`, color: status.color }}>
                                        {status.label}
                                    </span>
                                </td>
                                <td className="ra-td ra-td-actions">
                                    <button
                                        className="ra-td-delete"
                                        onClick={(e) => { e.stopPropagation(); onDeleteEvent(ev._id?.toString()) }}
                                        title="Supprimer"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

function getListStyles() {
    return `
.ra-list-wrap {
    background:#fff; border-radius:14px; border:1px solid #e8ecf1;
    overflow:hidden; animation:raFadeIn .4s ease;
}
.dark .ra-list-wrap { background:#0e1726; border-color:#253b5c; }

.ra-list-table { width:100%; border-collapse:collapse; font-size:13px; }

.ra-th {
    text-align:left; padding:12px 14px; font-size:11px; font-weight:700;
    color:#9ca3af; text-transform:uppercase; letter-spacing:.05em;
    border-bottom:1px solid #e8ecf1; white-space:nowrap;
    user-select:none;
}
.dark .ra-th { color:#506690; border-bottom-color:#253b5c; }
.ra-th-sortable { cursor:pointer; }
.ra-th-sortable:hover { color:#6b7280; }
.dark .ra-th-sortable:hover { color:#888da8; }

.ra-tr {
    cursor:pointer; transition:background .15s;
    animation:raFadeIn .3s ease both;
}
.ra-tr:hover { background:#f9fafb; }
.dark .ra-tr:hover { background:#1b2e4b; }
.ra-tr.past { opacity:.6; }

.ra-td {
    padding:10px 14px; border-bottom:1px solid #f1f5f9;
    color:#374151; white-space:nowrap;
}
.dark .ra-td { color:#e0e6ed; border-bottom-color:#1b2e4b; }

.ra-td-title {
    font-weight:600; display:flex; align-items:center; gap:8px;
    max-width:220px; overflow:hidden; text-overflow:ellipsis;
}
.ra-td-title-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

.ra-td-time { font-weight:700; color:#14b8a6; font-variant-numeric:tabular-nums; }

.ra-td-type-badge {
    font-size:11px; font-weight:600; padding:2px 8px; border-radius:5px;
    background:#f1f5f9; color:#6b7280;
}
.dark .ra-td-type-badge { background:#253b5c; color:#888da8; }

.ra-td-status {
    font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px;
    text-transform:uppercase; letter-spacing:.03em;
}

.ra-td-actions { padding:0; }
.ra-td-delete {
    width:30px; height:30px; border:none; border-radius:6px;
    background:transparent; color:#d1d5db; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s; opacity:0;
}
.ra-tr:hover .ra-td-delete { opacity:1; }
.ra-td-delete:hover { background:#fef2f2; color:#ef4444; }
.dark .ra-td-delete:hover { background:#1a0505; }
`
}

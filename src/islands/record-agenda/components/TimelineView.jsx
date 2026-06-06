/**
 * TimelineView — Vertical chronological timeline with grouped events
 */
import React, { useMemo } from 'react'

export default function TimelineView({ events, entityData, onEventClick, getStatusInfo, getCustomFieldValue }) {
    // Group events by date
    const grouped = useMemo(() => {
        const sorted = [...events].sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0
            const db = b.date ? new Date(b.date).getTime() : 0
            return da - db
        })

        const groups = {}
        sorted.forEach(ev => {
            const d = ev.date ? new Date(ev.date) : new Date()
            const key = d.toISOString().split('T')[0]
            if (!groups[key]) groups[key] = []
            groups[key].push(ev)
        })

        return Object.entries(groups).map(([dateKey, items]) => ({
            dateKey,
            date: new Date(dateKey),
            items
        }))
    }, [events])

    const formatDate = (d) => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const ds = d.toISOString().split('T')[0]
        if (ds === today.toISOString().split('T')[0]) return "Aujourd'hui"
        if (ds === tomorrow.toISOString().split('T')[0]) return "Demain"
        if (ds === yesterday.toISOString().split('T')[0]) return "Hier"

        return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    const isPast = (dateStr) => {
        if (!dateStr) return false
        return new Date(dateStr) < new Date()
    }

    const isToday = (dateStr) => {
        if (!dateStr) return false
        return new Date(dateStr).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
    }

    if (events.length === 0) return null

    return (
        <div className="ra-timeline">
            <style>{getTimelineStyles()}</style>
            {grouped.map((group, gi) => (
                <div key={group.dateKey} className="ra-tl-group" style={{ animationDelay: `${gi * 80}ms` }}>
                    <div className={`ra-tl-date-header ${isToday(group.dateKey) ? 'today' : ''} ${isPast(group.dateKey) && !isToday(group.dateKey) ? 'past' : ''}`}>
                        <div className="ra-tl-date-dot" />
                        <span className="ra-tl-date-label">{formatDate(group.date)}</span>
                        <span className="ra-tl-date-count">{group.items.length} événement{group.items.length > 1 ? 's' : ''}</span>
                    </div>

                    <div className="ra-tl-items">
                        {group.items.map((ev, ei) => {
                            const status = getStatusInfo(ev)
                            const lieu = getCustomFieldValue(ev, 'lieu_evenement')
                            const duration = getCustomFieldValue(ev, 'duree_evenement')
                            const type = getCustomFieldValue(ev, 'type_evenement')
                            const tags = normalizeTimelineTags(getCustomFieldValue(ev, 'tags_evenement'))
                            const evPast = isPast(ev.date)

                            return (
                                <div
                                    key={ev._id?.toString()}
                                    className={`ra-tl-item ${evPast ? 'past' : ''}`}
                                    style={{ animationDelay: `${gi * 80 + ei * 50}ms` }}
                                    onClick={() => onEventClick(ev)}
                                >
                                    <div className="ra-tl-time">
                                        {formatTime(ev.date)}
                                    </div>
                                    <div className="ra-tl-connector">
                                        <div className="ra-tl-line" />
                                        <div className="ra-tl-node" style={{ borderColor: status.color, background: `${status.color}20` }} />
                                        <div className="ra-tl-line" />
                                    </div>
                                    <div className="ra-tl-card">
                                        <div className="ra-tl-card-accent" style={{ background: status.color }} />
                                        <div className="ra-tl-card-body">
                                            <div className="ra-tl-card-top">
                                                <h4 className="ra-tl-card-title">{ev.title || 'Sans titre'}</h4>
                                                <span className="ra-tl-status" style={{ background: `${status.color}15`, color: status.color }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="ra-tl-card-meta">
                                                {duration && (
                                                    <span className="ra-tl-meta-item">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                        {duration} min
                                                    </span>
                                                )}
                                                {lieu && (
                                                    <span className="ra-tl-meta-item">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                        {lieu}
                                                    </span>
                                                )}
                                                {type && (
                                                    <span className="ra-tl-meta-item">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                            {tags.length > 0 && (
                                                <div className="ra-tl-tags">
                                                    {tags.map(tag => (
                                                        <span key={tag} className="ra-tl-tag">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

function normalizeTimelineTags(value) {
    const raw = Array.isArray(value)
        ? value
        : (typeof value === 'string' ? value.split(',') : [])

    return raw
        .map(item => String(item || '').trim())
        .filter(Boolean)
}

function getTimelineStyles() {
    return `
.ra-timeline { padding:4px 0; }

.ra-tl-group { animation:raFadeIn .5s ease both; margin-bottom:8px; }

.ra-tl-date-header {
    display:flex; align-items:center; gap:10px; padding:8px 0;
}
.ra-tl-date-dot {
    width:10px; height:10px; border-radius:50%;
    background:#d1d5db; flex-shrink:0;
}
.ra-tl-date-header.today .ra-tl-date-dot { background:#14b8a6; box-shadow:0 0 0 3px rgba(20,184,166,.2); }
.ra-tl-date-header.past .ra-tl-date-dot { background:#9ca3af; }

.ra-tl-date-label { font-size:14px; font-weight:700; color:#0e1726; text-transform:capitalize; }
.dark .ra-tl-date-label { color:#e0e6ed; }
.ra-tl-date-header.past .ra-tl-date-label { color:#9ca3af; }
.dark .ra-tl-date-header.past .ra-tl-date-label { color:#506690; }

.ra-tl-date-count { font-size:11px; color:#9ca3af; font-weight:600; }

.ra-tl-items { padding-left:5px; margin-left:0; }

.ra-tl-item {
    display:flex; align-items:stretch; gap:0; margin-bottom:4px;
    cursor:pointer; animation:raFadeIn .4s ease both;
    transition:transform .15s;
}
.ra-tl-item:hover { transform:translateX(4px); }

.ra-tl-time {
    width:50px; flex-shrink:0; font-size:12px; font-weight:700;
    color:#6b7280; padding-top:14px; text-align:right; padding-right:12px;
}
.dark .ra-tl-time { color:#506690; }
.ra-tl-item.past .ra-tl-time { color:#d1d5db; }
.dark .ra-tl-item.past .ra-tl-time { color:#3b4f6b; }

.ra-tl-connector {
    display:flex; flex-direction:column; align-items:center; width:20px; flex-shrink:0;
}
.ra-tl-line { width:2px; flex:1; background:#e2e8f0; }
.dark .ra-tl-line { background:#253b5c; }
.ra-tl-node {
    width:10px; height:10px; border-radius:50%; border:2px solid;
    flex-shrink:0;
}

.ra-tl-card {
    flex:1; display:flex; background:#fff; border:1px solid #e8ecf1;
    border-radius:10px; overflow:hidden; transition:box-shadow .2s;
    margin:4px 0;
}
.dark .ra-tl-card { background:#1b2e4b; border-color:#253b5c; }
.ra-tl-item:hover .ra-tl-card { box-shadow:0 4px 12px rgba(0,0,0,.06); }
.dark .ra-tl-item:hover .ra-tl-card { box-shadow:0 4px 12px rgba(0,0,0,.2); }

.ra-tl-card-accent { width:4px; flex-shrink:0; }

.ra-tl-card-body { padding:10px 14px; flex:1; min-width:0; }

.ra-tl-card-top { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:4px; }

.ra-tl-card-title {
    font-size:13px; font-weight:700; color:#0e1726; margin:0;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.dark .ra-tl-card-title { color:#e0e6ed; }
.ra-tl-item.past .ra-tl-card-title { color:#9ca3af; }
.dark .ra-tl-item.past .ra-tl-card-title { color:#506690; }

.ra-tl-status {
    font-size:10px; font-weight:700; padding:2px 8px; border-radius:6px;
    white-space:nowrap; flex-shrink:0; text-transform:uppercase; letter-spacing:.03em;
}

.ra-tl-card-meta { display:flex; flex-wrap:wrap; gap:10px; }

.ra-tl-meta-item {
    display:inline-flex; align-items:center; gap:4px;
    font-size:11px; color:#9ca3af; font-weight:500;
}
.dark .ra-tl-meta-item { color:#506690; }

.ra-tl-tags {
    display:flex; flex-wrap:wrap; gap:5px; margin-top:8px;
}
.ra-tl-tag {
    display:inline-flex; align-items:center; min-height:20px;
    padding:2px 7px; border-radius:6px;
    background:#f8fafc; border:1px solid #e2e8f0;
    color:#64748b; font-size:10.5px; font-weight:800;
}
.dark .ra-tl-tag { background:#0e1726; border-color:#253b5c; color:#94a3b8; }
`
}

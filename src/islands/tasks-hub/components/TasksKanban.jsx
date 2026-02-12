/**
 * TasksKanban — Kanban board styled after the Notes page card design
 * 
 * Features (pixel-perfect from /notes):
 * - Colored background cards based on priority/tag
 * - Avatar + user name + date header per card
 * - Bold title + description body
 * - Footer with tag color dot, delete icon, and favorite star
 * - 3-dot dropdown with Edit/Delete/View actions
 * - Columns grouped by task status
 * - Horizontal drag-to-scroll for the board
 * - Smooth hover transitions and shadows
 */
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react'

// ─── Color mapping for card backgrounds (mirrors Notes page) ─────────
const TAG_STYLES = {
    'Haute': { bg: 'bg-danger-light shadow-danger', text: 'text-danger', fill: 'fill-danger', dot: '#e7515a' },
    'Critique': { bg: 'bg-danger-light shadow-danger', text: 'text-danger', fill: 'fill-danger', dot: '#e7515a' },
    'Urgente': { bg: 'bg-danger-light shadow-danger', text: 'text-danger', fill: 'fill-danger', dot: '#e7515a' },
    'Urgent': { bg: 'bg-danger-light shadow-danger', text: 'text-danger', fill: 'fill-danger', dot: '#e7515a' },
    'Important': { bg: 'bg-danger-light shadow-danger', text: 'text-danger', fill: 'fill-danger', dot: '#e7515a' },
    'Moyenne': { bg: 'bg-warning-light shadow-warning', text: 'text-warning', fill: 'fill-warning', dot: '#e2a03f' },
    'Normal': { bg: 'bg-info-light shadow-info', text: 'text-info', fill: 'fill-info', dot: '#2196f3' },
    'Normale': { bg: 'bg-info-light shadow-info', text: 'text-info', fill: 'fill-info', dot: '#2196f3' },
    'Basse': { bg: 'bg-primary-light shadow-primary', text: 'text-primary', fill: 'fill-primary', dot: '#4361ee' },
}

const DEFAULT_STYLE = { bg: 'dark:shadow-dark', text: 'text-gray-400', fill: '', dot: '#9ca3af' }

function getCardStyle(task) {
    // Try priority first, then status
    if (task.priority && TAG_STYLES[task.priority]) return TAG_STYLES[task.priority]
    return DEFAULT_STYLE
}

// ─── SVG Icon Components ─────────────────────────────────────────────
function DotsIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 rotate-90 opacity-70 hover:opacity-100">
            <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle opacity="0.5" cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="19" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function EditIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ltr:mr-3 rtl:ml-3">
            <path d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z"
                stroke="currentColor" strokeWidth="1.5" />
            <path opacity="0.5"
                d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function DeleteIcon({ className = "h-5 w-5" }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className}>
            <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path opacity="0.5" d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path opacity="0.5" d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path opacity="0.5"
                d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function ViewIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="h-4.5 w-4.5 ltr:mr-3 rtl:ml-3">
            <path opacity="0.5"
                d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z"
                stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function StarIcon({ filled }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={`h-4.5 w-4.5 group-hover:fill-warning ${filled ? 'fill-warning' : ''}`}>
            <path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

function TagDotIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 rotate-45">
            <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

// ─── Card Dropdown Menu ──────────────────────────────────────────────
function CardDropdown({ task, accountNumber, entitySlug }) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (!open) return
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    return (
        <div ref={dropdownRef} className="dropdown relative">
            <button type="button" className="text-primary" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open) }}>
                <DotsIcon />
            </button>
            {open && (
                <ul className="absolute z-50 min-w-[140px] rounded-md bg-white dark:bg-[#1b2e4b] shadow-lg border dark:border-gray-700 py-1 text-sm font-medium ltr:right-0 rtl:left-0 top-full mt-1"
                    style={{ animation: 'fadeIn 0.15s ease-out' }}>
                    <li>
                        <a href={`/account/${accountNumber}/record/${entitySlug}/${task._id}/edit`}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                            onClick={(e) => e.stopPropagation()}>
                            <EditIcon /> Edit
                        </a>
                    </li>
                    <li>
                        <a href={`/account/${accountNumber}/record/${entitySlug}/${task._id}`}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                            onClick={(e) => e.stopPropagation()}>
                            <ViewIcon /> View
                        </a>
                    </li>
                </ul>
            )}
        </div>
    )
}

// ─── Single Kanban Card (Notes design) ───────────────────────────────
function KanbanCard({ task, accountNumber, entitySlug, favorites, onToggleFav }) {
    const style = getCardStyle(task)
    const isFav = favorites[task._id] || false
    const initials = task.assignedTo
        ? task.assignedTo.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
        : ''

    const dateStr = task.createdAt
        ? new Date(task.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : ''

    return (
        <div className={`panel pb-12 relative ${style.bg}`}>
            <div className="min-h-[142px]">
                {/* Top row: avatar + name + dropdown */}
                <div className="flex justify-between">
                    <div className="flex w-max items-center">
                        <div className="flex-none">
                            {task.assignedTo ? (
                                <div className="grid h-8 w-8 place-content-center rounded-full bg-gray-300 text-sm font-semibold dark:bg-gray-700">
                                    {initials}
                                </div>
                            ) : (
                                <div className="rounded-full bg-gray-300 p-2 dark:bg-gray-700">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5">
                                        <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                                        <ellipse opacity="0.5" cx="12" cy="17" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="ltr:ml-2 rtl:mr-2">
                            <div className="font-semibold">{task.assignedTo || 'Non assigné'}</div>
                            <div className="text-sx text-white-dark">{dateStr}</div>
                        </div>
                    </div>
                    <CardDropdown task={task} accountNumber={accountNumber} entitySlug={entitySlug} />
                </div>

                {/* Title + Description */}
                <div>
                    <h4 className="mt-4 font-semibold">
                        <a href={`/account/${accountNumber}/record/${entitySlug}/${task._id}`}
                            className="hover:text-primary transition-colors">
                            {task.title || 'Sans titre'}
                        </a>
                    </h4>
                    {task.description && (
                        <p className="mt-2 text-white-dark line-clamp-3">{task.description}</p>
                    )}

                    {/* Status + Priority badges */}
                    {(task.status || task.priority) && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {task.status && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        backgroundColor: (task.statusColor || '#9ca3af') + '18',
                                        color: task.statusColor || '#9ca3af'
                                    }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.statusColor || '#9ca3af' }} />
                                    {task.status}
                                </span>
                            )}
                            {task.priority && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        backgroundColor: (style.dot || '#9ca3af') + '18',
                                        color: style.dot || '#9ca3af'
                                    }}>
                                    {task.priority}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Progress bar */}
                    {task.progress > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${task.progress}%`,
                                        backgroundColor: task.progress >= 80 ? '#00ab55' : task.progress >= 50 ? '#e2a03f' : '#4361ee',
                                    }} />
                            </div>
                            <span className="text-[10px] text-gray-500 tabular-nums font-medium">{task.progress}%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer (absolute bottom) — tag dot + delete + favorite */}
            <div className="absolute bottom-5 left-0 w-full px-5">
                <div className="mt-2 flex items-center justify-between">
                    {/* Tag dot */}
                    <div className={style.text}>
                        <TagDotIcon />
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center">
                        {/* Due date indicator */}
                        {task.dueDate && (
                            <span className={`text-[10px] flex items-center gap-1 mr-3 ${new Date(task.dueDate) < new Date() ? 'text-danger' : 'text-gray-400'}`}>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                        )}
                        {/* Favorite star */}
                        <button type="button"
                            className="group text-warning ltr:ml-2 rtl:mr-2"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(task._id) }}>
                            <StarIcon filled={isFav} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main TasksKanban Component ──────────────────────────────────────
export default function TasksKanban({
    rows,
    filters = [],
    accountNumber,
    entitySlug,
    entityId,
}) {
    const scrollRef = useRef(null)
    const [favorites, setFavorites] = useState({})

    // ─── Drag-to-scroll ──────────────────────────────────────────────
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    const handleMouseDown = useCallback((e) => {
        if (e.button !== 0) return
        if (e.target.closest('a, button, .dropdown')) return
        const container = scrollRef.current
        if (!container) return
        isDragging.current = true
        startX.current = e.pageX - container.offsetLeft
        scrollLeft.current = container.scrollLeft
        container.style.cursor = 'grabbing'
    }, [])

    const handleMouseMove = useCallback((e) => {
        if (!isDragging.current) return
        e.preventDefault()
        const container = scrollRef.current
        if (!container) return
        const x = e.pageX - container.offsetLeft
        const walk = (x - startX.current) * 1.5
        container.scrollLeft = scrollLeft.current - walk
    }, [])

    const handleMouseUp = useCallback(() => {
        isDragging.current = false
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
    }, [])

    // ─── Toggle favorite ─────────────────────────────────────────────
    const toggleFav = useCallback((taskId) => {
        setFavorites(prev => ({ ...prev, [taskId]: !prev[taskId] }))
    }, [])

    // ─── Extract columns from filters (status filter) ────────────────
    const columns = useMemo(() => {
        const statusFilter = filters.find(f => f.field === 'status')
        if (statusFilter?.options?.length) {
            const cols = statusFilter.options.map(opt => ({
                id: opt.label,
                title: opt.label,
                color: opt.color || '#6366f1',
            }))
            cols.push({ id: 'Sans statut', title: 'Sans statut', color: '#9ca3af' })
            return cols
        }
        // Fallback: extract unique statuses from rows
        const statuses = [...new Set(rows.map(r => r.status || 'Sans statut'))]
        return statuses.map(s => ({
            id: s,
            title: s,
            color: '#6366f1',
        }))
    }, [filters, rows])

    // ─── Group rows by status ────────────────────────────────────────
    const cardsByColumn = useMemo(() => {
        const grouped = {}
        columns.forEach(col => (grouped[col.id] = []))
        rows.forEach(row => {
            const status = row.status || 'Sans statut'
            if (grouped[status]) {
                grouped[status].push(row)
            } else if (grouped['Sans statut']) {
                grouped['Sans statut'].push(row)
            }
        })
        return grouped
    }, [columns, rows])

    return (
        <div
            ref={scrollRef}
            className="h-full overflow-x-auto overflow-y-auto"
            style={{ cursor: 'grab', userSelect: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="flex gap-5 p-1 h-full" style={{ width: 'max-content', minHeight: '100%' }}>
                {columns.map(col => {
                    const cards = cardsByColumn[col.id] || []
                    return (
                        <div
                            key={col.id}
                            className="flex flex-col w-80 min-w-[300px]"
                        >
                            {/* ── Column Header ── */}
                            <div className="flex items-center gap-2.5 px-3 py-3 mb-3">
                                <span
                                    className="w-3 h-3 rounded-sm flex-shrink-0 rotate-45"
                                    style={{ backgroundColor: col.color }}
                                />
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-white flex-1">
                                    {col.title}
                                </h4>
                                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-1 font-semibold tabular-nums">
                                    {cards.length}
                                </span>
                            </div>

                            {/* ── Cards (scrollable) ── */}
                            <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
                                {cards.length === 0 ? (
                                    <div className="text-xs text-gray-300 dark:text-gray-600 text-center py-12 italic">
                                        Aucune tâche
                                    </div>
                                ) : (
                                    cards.map(task => (
                                        <KanbanCard
                                            key={task._id}
                                            task={task}
                                            accountNumber={accountNumber}
                                            entitySlug={entitySlug}
                                            favorites={favorites}
                                            onToggleFav={toggleFav}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

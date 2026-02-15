/**
 * TasksChecklist — Two-panel interactive checklist view
 * 
 * Left panel:  Active tasks (unchecked) — draggable for reorder
 * Right panel: Completed tasks (checked, strikethrough)
 * Checking a task moves it to the right panel with animation.
 * Unchecking moves it back to the left.
 */
import React, { useMemo, useState, useRef, useCallback } from 'react'

export default function TasksChecklist({
    rows,
    onToggle,
    accountNumber,
    entitySlug,
}) {
    // Track which task is animating out (for transition effect)
    const [animatingId, setAnimatingId] = useState(null)
    const [animatingDirection, setAnimatingDirection] = useState(null) // 'to-done' | 'to-active'

    // Drag & drop state
    const [draggedId, setDraggedId] = useState(null)
    const [dragOverId, setDragOverId] = useState(null)
    const [customOrder, setCustomOrder] = useState([]) // ordered IDs

    // Split tasks into active vs completed
    const activeTasks = useMemo(() => {
        return rows.filter(t => t.status !== 'Terminé' && t.status !== 'Terminée')
    }, [rows])

    const completedTasks = useMemo(() => {
        return rows.filter(t => t.status === 'Terminé' || t.status === 'Terminée')
    }, [rows])

    // Apply custom order to active tasks
    const orderedActiveTasks = useMemo(() => {
        if (customOrder.length === 0) return activeTasks
        const orderMap = new Map(customOrder.map((id, idx) => [id, idx]))
        return [...activeTasks].sort((a, b) => {
            const ia = orderMap.has(a._id) ? orderMap.get(a._id) : 9999
            const ib = orderMap.has(b._id) ? orderMap.get(b._id) : 9999
            return ia - ib
        })
    }, [activeTasks, customOrder])

    // Priority colors
    const priorityConfig = {
        'Haute': { color: '#e7515a', bg: '#fef2f2', icon: '▲' },
        'Moyenne': { color: '#e2a03f', bg: '#fffbeb', icon: '■' },
        'Basse': { color: '#00ab55', bg: '#f0fdf4', icon: '▼' },
        'Critique': { color: '#e7515a', bg: '#fef2f2', icon: '⬆' },
        'Urgente': { color: '#e7515a', bg: '#fef2f2', icon: '⬆' },
        'Urgent': { color: '#e7515a', bg: '#fef2f2', icon: '⬆' },
    }

    // Handle toggle with animation
    const handleToggle = useCallback((taskId) => {
        const task = rows.find(r => r._id === taskId)
        if (!task) return

        const isCompleted = task.status === 'Terminé' || task.status === 'Terminée'
        setAnimatingId(taskId)
        setAnimatingDirection(isCompleted ? 'to-active' : 'to-done')

        // Delay the actual toggle to allow animation
        setTimeout(() => {
            onToggle(taskId)
            setAnimatingId(null)
            setAnimatingDirection(null)
        }, 300)
    }, [rows, onToggle])

    // ─── Drag & Drop ─────────────────────────────────────────────────
    const handleDragStart = useCallback((e, taskId) => {
        setDraggedId(taskId)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', taskId)
        // Add grabbing style
        e.currentTarget.style.opacity = '0.5'
    }, [])

    const handleDragEnd = useCallback((e) => {
        e.currentTarget.style.opacity = '1'
        setDraggedId(null)
        setDragOverId(null)
    }, [])

    const handleDragOver = useCallback((e, taskId) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (taskId !== dragOverId) {
            setDragOverId(taskId)
        }
    }, [dragOverId])

    const handleDrop = useCallback((e, targetId) => {
        e.preventDefault()
        if (!draggedId || draggedId === targetId) {
            setDragOverId(null)
            return
        }

        // Build new order
        const currentIds = orderedActiveTasks.map(t => t._id)
        const fromIdx = currentIds.indexOf(draggedId)
        const toIdx = currentIds.indexOf(targetId)
        if (fromIdx === -1 || toIdx === -1) return

        const newOrder = [...currentIds]
        newOrder.splice(fromIdx, 1)
        newOrder.splice(toIdx, 0, draggedId)
        setCustomOrder(newOrder)

        setDraggedId(null)
        setDragOverId(null)
    }, [draggedId, orderedActiveTasks])

    // ─── Task Card ───────────────────────────────────────────────────
    const TaskCard = ({ task, isCompleted, draggable = false }) => {
        const isAnimating = animatingId === task._id
        const prio = priorityConfig[task.priority] || { color: '#9ca3af', bg: '#f3f4f6', icon: '' }
        const isDragOver = dragOverId === task._id

        return (
            <div
                data-task-id={task._id}
                draggable={draggable}
                onDragStart={draggable ? (e) => handleDragStart(e, task._id) : undefined}
                onDragEnd={draggable ? handleDragEnd : undefined}
                onDragOver={draggable ? (e) => handleDragOver(e, task._id) : undefined}
                onDrop={draggable ? (e) => handleDrop(e, task._id) : undefined}
                className={`
                    group flex items-start gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300 ease-in-out
                    ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                    ${isCompleted
                        ? 'bg-gray-50/50 dark:bg-white/[0.02]'
                        : 'bg-white dark:bg-white/[0.04] hover:shadow-sm'
                    }
                    ${isDragOver ? 'ring-2 ring-primary/40 ring-offset-1' : ''}
                    ${isAnimating && animatingDirection === 'to-done' ? 'animate-slide-out-right' : ''}
                    ${isAnimating && animatingDirection === 'to-active' ? 'animate-slide-out-left' : ''}
                    border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50
                `}
                style={{
                    animationDuration: '300ms',
                    animationFillMode: 'forwards',
                }}
            >
                {/* Drag handle (active tasks only) */}
                {draggable && (
                    <div style={{ flexShrink: 0, marginTop: 2, opacity: 0.25, cursor: 'grab', transition: 'opacity 0.2s' }}
                        className="group-hover:!opacity-60">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#9ca3af' }}>
                            <circle cx="8" cy="4" r="2" /><circle cx="16" cy="4" r="2" />
                            <circle cx="8" cy="12" r="2" /><circle cx="16" cy="12" r="2" />
                            <circle cx="8" cy="20" r="2" /><circle cx="16" cy="20" r="2" />
                        </svg>
                    </div>
                )}

                {/* Custom checkbox */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(task._id)
                    }}
                    style={{
                        width: 22,
                        height: 22,
                        borderRadius: 8,
                        border: `2px solid ${isCompleted ? '#10b981' : '#d1d5db'}`,
                        backgroundColor: isCompleted ? '#10b981' : 'transparent',
                        flexShrink: 0,
                        marginTop: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isCompleted ? '0 1px 3px rgba(16,185,129,0.3)' : 'none',
                        padding: 0,
                        outline: 'none',
                    }}
                >
                    {isCompleted && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12L10 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>

                {/* Task content */}
                <div
                    className="flex-1 min-w-0"
                    onClick={() => window.location.href = `/account/${accountNumber}/record/${entitySlug}/${task._id}`}
                >
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className="text-sm font-medium"
                            style={{
                                transition: 'all 0.3s',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                color: isCompleted ? '#9ca3af' : undefined,
                            }}
                        >
                            {task.title || 'Sans titre'}
                        </span>

                        {/* Priority tag */}
                        {task.priority && !isCompleted && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                                style={{
                                    backgroundColor: prio.bg,
                                    color: prio.color,
                                    border: `1px solid ${prio.color}20`,
                                }}
                            >
                                <span style={{ fontSize: '7px' }}>{prio.icon}</span>
                                {task.priority}
                            </span>
                        )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Due date */}
                        {task.dueDate && (
                            <span className={`text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded-md ${new Date(task.dueDate) < new Date() && !isCompleted
                                ? 'text-red-600 bg-red-50 dark:bg-red-950/20'
                                : 'text-gray-400 bg-gray-50 dark:bg-gray-800'
                                }`}>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M8 2V5M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                            </span>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.split(',').map((tag, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-500 dark:bg-indigo-950/20 dark:text-indigo-400 font-medium">
                                {tag.trim()}
                            </span>
                        ))}

                        {/* Progress */}
                        {task.progress > 0 && !isCompleted && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-14 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${task.progress}%`,
                                            backgroundColor: task.progress >= 80 ? '#00ab55' : '#4361ee',
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 tabular-nums font-medium">{task.progress}%</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Arrow icon on hover */}
                <svg
                    className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 cursor-pointer"
                    viewBox="0 0 24 24" fill="none"
                    onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/account/${accountNumber}/record/${entitySlug}/${task._id}`
                    }}
                >
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>
        )
    }

    return (
        <>
            {/* Animation styles */}
            <style>{`
                @keyframes slideOutRight {
                    0% { opacity: 1; transform: translateX(0); }
                    100% { opacity: 0; transform: translateX(40px); }
                }
                @keyframes slideOutLeft {
                    0% { opacity: 1; transform: translateX(0); }
                    100% { opacity: 0; transform: translateX(-40px); }
                }
                .animate-slide-out-right { animation: slideOutRight 300ms ease-in-out forwards; }
                .animate-slide-out-left { animation: slideOutLeft 300ms ease-in-out forwards; }
            `}</style>

            <div className="h-full flex gap-4 overflow-hidden">
                {/* ─── LEFT PANEL: Active Tasks ─── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Panel header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            À faire
                        </h3>
                        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: '#eff6ff', color: '#2563eb', fontVariantNumeric: 'tabular-nums' }}>
                            {orderedActiveTasks.length}
                        </span>
                    </div>

                    {/* Task list */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 pb-2">
                        {orderedActiveTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600 py-10">
                                <svg className="w-12 h-12 mb-3 opacity-40" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" />
                                    <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <span className="text-xs font-medium">Toutes les tâches sont terminées !</span>
                                <span className="text-[10px] mt-0.5">🎉 Bon travail</span>
                            </div>
                        ) : (
                            orderedActiveTasks.map(task => (
                                <TaskCard key={task._id} task={task} isCompleted={false} draggable={true} />
                            ))
                        )}
                    </div>
                </div>

                {/* ─── DIVIDER ─── */}
                <div style={{ width: 1, backgroundColor: '#e5e7eb', flexShrink: 0, alignSelf: 'stretch', margin: '8px 0' }} />

                {/* ─── RIGHT PANEL: Completed Tasks ─── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ maxWidth: '45%' }}>
                    {/* Panel header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Terminées
                        </h3>
                        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: '#ecfdf5', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                            {completedTasks.length}
                        </span>
                    </div>

                    {/* Completed task list */}
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1 pb-2">
                        {completedTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-600 py-10">
                                <svg className="w-10 h-10 mb-2 opacity-30" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs">Aucune tâche terminée</span>
                            </div>
                        ) : (
                            completedTasks.map(task => (
                                <TaskCard key={task._id} task={task} isCompleted={true} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

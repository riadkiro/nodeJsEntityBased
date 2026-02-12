/**
 * TasksChecklist — Interactive checklist view
 * 
 * Displays tasks as a checkbox list grouped by status.
 * Completed tasks get a strikethrough effect with smooth animation.
 * Each task shows: checkbox, title, priority badge, due date, tags.
 */
import React, { useMemo, useState } from 'react'

export default function TasksChecklist({
    rows,
    onToggle,
    accountNumber,
    entitySlug,
}) {
    // Group tasks by status
    const grouped = useMemo(() => {
        const groups = {}
        rows.forEach(row => {
            const status = row.status || 'Sans statut'
            if (!groups[status]) groups[status] = []
            groups[status].push(row)
        })

        // Sort groups: "Terminé" last, "À faire" first
        const sortOrder = ['À faire', 'En cours', 'En attente', 'En revue', 'Bloqué', 'Terminé', 'Terminée', 'Sans statut']
        return Object.entries(groups).sort(([a], [b]) => {
            const ia = sortOrder.indexOf(a)
            const ib = sortOrder.indexOf(b)
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
        })
    }, [rows])

    // Collapsed groups for better UX
    const [collapsedGroups, setCollapsedGroups] = useState({})
    const toggleGroup = (group) => {
        setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }))
    }

    // Priority colors
    const priorityColors = {
        'Haute': '#e7515a',
        'Moyenne': '#e2a03f',
        'Basse': '#00ab55',
        'Critique': '#e7515a',
        'Urgente': '#e7515a',
    }

    return (
        <div className="h-full overflow-y-auto pr-2">
            <div className="space-y-4">
                {grouped.map(([status, tasks]) => {
                    const isCollapsed = collapsedGroups[status]
                    const completedCount = tasks.filter(t => t.status === 'Terminé' || t.status === 'Terminée').length
                    const statusColor = tasks[0]?.statusColor || '#6366f1'

                    return (
                        <div key={status} className="rounded-xl overflow-hidden">
                            {/* Group header */}
                            <button
                                type="button"
                                onClick={() => toggleGroup(status)}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors rounded-xl"
                            >
                                {/* Status color bar */}
                                <span
                                    className="w-1 h-6 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: statusColor }}
                                />
                                <span className="text-sm font-semibold text-gray-800 dark:text-white flex-1 text-left">
                                    {status}
                                </span>
                                <span className="text-xs text-gray-400 tabular-nums">
                                    {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
                                </span>
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                                    viewBox="0 0 24 24" fill="none"
                                >
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>

                            {/* Task items */}
                            {!isCollapsed && (
                                <div className="mt-1 space-y-0.5">
                                    {tasks.map(task => {
                                        const isCompleted = task.status === 'Terminé' || task.status === 'Terminée'
                                        const priorityColor = priorityColors[task.priority] || '#9ca3af'

                                        return (
                                            <div
                                                key={task._id}
                                                className={`
                                                    group flex items-center gap-3 px-4 py-3 rounded-xl
                                                    transition-all duration-300 cursor-pointer
                                                    hover:bg-gray-50 dark:hover:bg-white/[0.03]
                                                    ${isCompleted ? 'opacity-60' : ''}
                                                `}
                                            >
                                                {/* Custom checkbox */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onToggle(task._id)
                                                    }}
                                                    className={`
                                                        w-5 h-5 rounded-md border-2 flex-shrink-0
                                                        flex items-center justify-center
                                                        transition-all duration-200
                                                        ${isCompleted
                                                            ? 'bg-green-500 border-green-500'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                                                        }
                                                    `}
                                                >
                                                    {isCompleted && (
                                                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
                                                            <path d="M5 12L10 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </button>

                                                {/* Task content */}
                                                <div className="flex-1 min-w-0" onClick={() => window.location.href = `/account/${accountNumber}/record/${entitySlug}/${task._id}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium transition-all duration-300 ${isCompleted
                                                            ? 'line-through text-gray-400 dark:text-gray-500'
                                                            : 'text-gray-800 dark:text-white'
                                                            }`}>
                                                            {task.title || 'Sans titre'}
                                                        </span>
                                                    </div>

                                                    {/* Meta row */}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {/* Priority */}
                                                        {task.priority && (
                                                            <span
                                                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                                                style={{
                                                                    backgroundColor: priorityColor + '15',
                                                                    color: priorityColor,
                                                                }}
                                                            >
                                                                {task.priority}
                                                            </span>
                                                        )}

                                                        {/* Due date */}
                                                        {task.dueDate && (
                                                            <span className={`text-[10px] flex items-center gap-1 ${new Date(task.dueDate) < new Date() && !isCompleted
                                                                ? 'text-red-500'
                                                                : 'text-gray-400'
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
                                                        {task.tags && (
                                                            <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                                                {task.tags}
                                                            </span>
                                                        )}

                                                        {/* Progress */}
                                                        {task.progress > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-12 h-1 rounded-full bg-gray-200 dark:bg-gray-700">
                                                                    <div
                                                                        className="h-full rounded-full"
                                                                        style={{
                                                                            width: `${task.progress}%`,
                                                                            backgroundColor: task.progress >= 80 ? '#00ab55' : '#4361ee',
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 tabular-nums">{task.progress}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* View arrow (on hover) */}
                                                <svg
                                                    className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                    viewBox="0 0 24 24" fill="none"
                                                >
                                                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

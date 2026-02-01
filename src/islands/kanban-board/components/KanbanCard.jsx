/**
 * KanbanCard - Draggable card component
 * Compact design with minimal spacing
 */
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function KanbanCard({
    record,
    onEdit,
    onDelete,
    isDragging = false
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging
    } = useSortable({ id: record._id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1
    }

    // Format date
    const dueDate = record.dueDate
        ? new Date(record.dueDate).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : null

    // Get title
    const title = record.referenceTitle || record.title || 'Sans titre'

    // Get classification values for tags display
    const classificationValues = record.classificationValues || []
    const hasTags = classificationValues.length > 0

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            data-dnd="card"
            className={`cursor-move bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all dark:bg-[#1a2a3f] dark:border-gray-700 group ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
        >
            {/* Main content */}
            <div className="p-3">
                {/* Title */}
                <div className="text-sm font-medium text-gray-800 dark:text-white leading-5 line-clamp-2 mb-2">
                    {title}
                </div>

                {/* Meta info row */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {/* Attachments indicator */}
                    {record.attachments?.length > 0 && (
                        <span className="flex items-center gap-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            {record.attachments.length}
                        </span>
                    )}

                    {/* Comments indicator */}
                    <span className="flex items-center gap-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        0
                    </span>
                </div>

                {/* Tags row */}
                {hasTags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {classificationValues.slice(0, 2).map((cv, i) => (
                            <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            >
                                {cv.optionLabel || 'Tag'}
                            </span>
                        ))}
                        {classificationValues.length > 2 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                +{classificationValues.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    {dueDate ? (
                        <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <path d="M3 10H21" />
                                <path d="M8 2V6" />
                                <path d="M16 2V6" />
                            </svg>
                            <span>{dueDate}</span>
                        </>
                    ) : (
                        <span className="text-gray-300">—</span>
                    )}
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Edit button */}
                    <button
                        type="button"
                        className="p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.()
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* Delete button */}
                    <button
                        type="button"
                        className="p-1 hover:text-danger rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.()
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M20.5 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

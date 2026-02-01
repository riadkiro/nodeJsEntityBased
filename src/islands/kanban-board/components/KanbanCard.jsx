/**
 * KanbanCard - Draggable card component
 * Full design with tags, date, actions
 */
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function KanbanCard({ record, isDragging = false }) {
    const id = String(record._id)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: dragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: (isDragging || dragging) ? 0.7 : 1
    }

    // Format date
    const dueDate = record.dueDate
        ? new Date(record.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : null

    const createdDate = record.createdAt
        ? new Date(record.createdAt).toLocaleDateString('fr-FR')
        : null

    const title = record.referenceTitle || record.title || 'Sans titre'
    const description = record.description || ''
    const tags = record.tags || []
    const classificationValues = record.classificationValues || []

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`cursor-move bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all dark:bg-[#1a2a3f] dark:border-gray-700 group ${(isDragging || dragging) ? 'shadow-lg ring-2 ring-primary/30' : ''}`}
            data-dnd="card"
            {...attributes}
            {...listeners}
        >
            {/* Content */}
            <div className="p-3">
                {/* Title */}
                <div className="text-sm font-semibold text-gray-800 dark:text-white leading-5 line-clamp-2 mb-2">
                    {title}
                </div>

                {/* Description */}
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {description}
                    </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1 mb-2">
                    {tags.length > 0 ? (
                        tags.slice(0, 2).map((tag, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654" />
                                </svg>
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 italic flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654" />
                            </svg>
                            Sans tag
                        </span>
                    )}
                    {tags.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700">
                            +{tags.length - 2}
                        </span>
                    )}
                </div>

                {/* Meta icons row */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    {record.attachments?.length > 0 && (
                        <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            {record.attachments.length}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        0
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M3 10H21" />
                        <path d="M8 2V6" />
                        <path d="M16 2V6" />
                    </svg>
                    <span>{dueDate || createdDate || '—'}</span>
                </div>

                {/* Action buttons - visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        className="p-1 hover:text-info rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="p-1 hover:text-danger rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => e.stopPropagation()}
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

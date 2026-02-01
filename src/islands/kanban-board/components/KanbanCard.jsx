/**
 * KanbanCard - Draggable card component
 * Displays record title, description, tags, date, and actions
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
        opacity: isSortableDragging ? 0.5 : 1,
        maxWidth: '197px'
    }

    // Format date
    const formattedDate = record.createdAt
        ? new Date(record.createdAt).toLocaleDateString('fr-FR')
        : 'N/A'

    // Get title
    const title = record.referenceTitle || record.title || 'Sans titre'

    // Get description
    const description = record.description || ''

    // Get tags
    const tags = record.tags || []

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            data-dnd="card"
            className={`cursor-move space-y-3 rounded-lg bg-gray-100 p-4 shadow-sm border border-transparent hover:border-primary transition-all dark:bg-[#121c2c] group max-w-[197px] w-full mx-auto ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
        >
            {/* Title */}
            <div className="flex justify-between items-start mb-2">
                <div
                    className="text-xs font-bold text-gray-800 dark:text-white-light leading-4 h-12 overflow-hidden w-full line-clamp-3 break-words"
                >
                    {title}
                </div>
            </div>

            {/* Description */}
            {description && (
                <p className="text-xs text-white-dark line-clamp-2">
                    {description}
                </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
                {tags.length > 0 ? (
                    tags.map((tag, i) => (
                        <div
                            key={i}
                            className="badge bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded flex items-center gap-1"
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654" />
                            </svg>
                            <span>{tag}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-[10px] text-white-dark/50 italic flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4.172 3.172C3 4.343 3 6.229 3 10v4c0 3.771 0 5.657 1.172 6.828C5.343 22 7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172C21 19.657 21 17.771 21 14v-1.22c0-1.835 0-2.752-.379-3.55-.378-.798-1.07-1.39-2.455-2.576l-1.5-1.282c-1.97-1.687-2.955-2.531-4.136-2.605-.17-.01-.343-.01-.56 0-1.18.074-2.166.918-4.136 2.605L6.334 6.654" />
                        </svg>
                        <span>Sans tag</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-1 text-[10px] font-medium text-white-dark">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M3 10H21" />
                        <path d="M8 2V6" />
                        <path d="M16 2V6" />
                    </svg>
                    <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Edit button */}
                    <button
                        type="button"
                        className="p-1 hover:text-info transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.()
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* Delete button */}
                    <button
                        type="button"
                        className="p-1 hover:text-danger transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.()
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20.5 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

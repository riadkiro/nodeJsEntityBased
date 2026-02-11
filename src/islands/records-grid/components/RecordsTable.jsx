/**
 * RecordsTable - Virtual scrolling table
 * Pixel-perfect reproduction of existing HTMX table styling
 */
import React, { useState } from 'react'

export default function RecordsTable({
    records,
    columns,
    virtualizer,
    sort,
    onSort,
    onColumnReorder,
    density,
    titleDisplay,
    entityIcon,
    accountNumber,
    entitySlug
}) {
    const [draggedColumn, setDraggedColumn] = useState(null)
    const [dragOverColumn, setDragOverColumn] = useState(null)
    const virtualRows = virtualizer.getVirtualItems()

    // Density configuration
    // Comfortable = default (comme avant)
    // Normal = espacement réduit, font inchangée
    // Compact = espacement réduit + image réduite + font réduite
    const densityConfig = {
        compact: {
            rowHeight: 36,
            cellClass: 'py-1',
            fontSize: 'text-xs',
            imageSize: 'w-6 h-6',
            fontWeight: 'font-medium'
        },
        normal: {
            rowHeight: 44,
            cellClass: 'py-2',
            fontSize: 'text-sm',  // Font inchangée
            imageSize: 'w-9 h-9', // Image inchangée
            fontWeight: 'font-semibold'
        },
        comfortable: {
            rowHeight: 56,
            cellClass: 'py-3',
            fontSize: 'text-sm',  // Défaut
            imageSize: 'w-9 h-9', // Défaut
            fontWeight: 'font-semibold'
        }
    }

    const config = densityConfig[density] || densityConfig.comfortable

    console.log('[RecordsTable] Rendering with:', {
        recordsCount: records.length,
        virtualRowsCount: virtualRows.length,
        density
    })

    return (
        <table className="table-hover whitespace-nowrap dataTable-table w-full">
            <thead className="sticky top-0 bg-white dark:bg-[#1b2e4b] z-10">
                <tr>
                    {columns.map((col, index) => {
                        // Check if this column is currently sorted
                        const isSorted = sort?.field === col.id ||
                            (col.id === 'title' && sort?.field === 'title') ||
                            (col.id === 'createdAt' && sort?.field === 'createdAt')
                        const sortDirection = sort?.direction || 'desc'
                        const isDragging = draggedColumn === col.id
                        const isDragOver = dragOverColumn === col.id && draggedColumn !== col.id
                        const canDrag = col.id !== 'actions'

                        return (
                            <th
                                key={col.id}
                                data-sortable={col.sortable !== false ? '' : undefined}
                                data-column-id={col.id}
                                onDragEnter={(e) => {
                                    e.preventDefault()
                                    if (col.id !== 'actions' && draggedColumn && draggedColumn !== col.id) {
                                        setDragOverColumn(col.id)
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                }}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    if (draggedColumn && draggedColumn !== col.id && col.id !== 'actions' && onColumnReorder) {
                                        onColumnReorder(draggedColumn, col.id)
                                    }
                                    setDraggedColumn(null)
                                    setDragOverColumn(null)
                                }}
                                className={`px-2 ${col.id === 'actions' ? 'sticky right-0 bg-white dark:bg-gray-900 z-20' : ''} ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'border-l-2 border-l-primary bg-primary/5' : ''}`}
                                style={{ transition: 'opacity 0.15s, border-color 0.15s, background 0.15s', ...(col.id === 'actions' ? { width: '1%', whiteSpace: 'nowrap' } : {}) }}
                            >
                                <div className="flex items-center gap-1">
                                    {/* Drag handle - only this element is draggable */}
                                    {canDrag && (
                                        <span
                                            draggable="true"
                                            onDragStart={(e) => {
                                                setDraggedColumn(col.id)
                                                e.dataTransfer.effectAllowed = 'move'
                                                e.dataTransfer.setData('text/plain', col.id)
                                            }}
                                            onDragEnd={() => {
                                                setDraggedColumn(null)
                                                setDragOverColumn(null)
                                            }}
                                            className="cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                                <circle cx="9" cy="6" r="1.5" />
                                                <circle cx="15" cy="6" r="1.5" />
                                                <circle cx="9" cy="12" r="1.5" />
                                                <circle cx="15" cy="12" r="1.5" />
                                                <circle cx="9" cy="18" r="1.5" />
                                                <circle cx="15" cy="18" r="1.5" />
                                            </svg>
                                        </span>
                                    )}
                                    {col.sortable !== false ? (
                                        <a
                                            href="#"
                                            className="dataTable-sorter flex items-center gap-1"
                                            draggable="false"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                onSort(col.id)
                                            }}
                                        >
                                            {col.name}
                                            {isSorted && (
                                                <svg
                                                    className={`h-3 w-3 text-primary transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </a>
                                    ) : (
                                        col.name
                                    )}
                                </div>
                            </th>
                        )
                    })}
                </tr>
            </thead>
            <tbody>
                {/* Top spacer for virtual scroll */}
                {virtualRows.length > 0 && virtualRows[0].start > 0 && (
                    <tr>
                        <td colSpan={columns.length} style={{ height: virtualRows[0].start, padding: 0 }} />
                    </tr>
                )}

                {/* Virtual rows */}
                {virtualRows.map(virtualRow => {
                    const record = records[virtualRow.index]
                    if (!record) return null

                    // Inline padding based on density for stronger specificity
                    const cellPadding = {
                        compact: '4px 8px',
                        normal: '8px 12px',
                        comfortable: '12px 12px'
                    }[density] || '12px 12px'

                    return (
                        <tr
                            key={record._id}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            style={{ minHeight: config.rowHeight }}
                        >
                            {columns.map(col => (
                                <td
                                    key={col.id}
                                    className={`${config.fontSize} ${col.id === 'actions' ? 'sticky right-0 bg-white dark:bg-gray-900' : ''}`}
                                    style={{ padding: cellPadding, ...(col.id === 'actions' ? { width: '1%', whiteSpace: 'nowrap' } : {}) }}
                                >
                                    {renderCellValue(record, col, accountNumber, entitySlug, config, titleDisplay, entityIcon)}
                                </td>
                            ))}
                        </tr>
                    )
                })}

                {/* Bottom spacer for virtual scroll */}
                {virtualRows.length > 0 && (
                    <tr>
                        <td
                            colSpan={columns.length}
                            style={{
                                height: Math.max(0, virtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end || 0)),
                                padding: 0
                            }}
                        />
                    </tr>
                )}
            </tbody>
        </table>
    )
}

// Helper to render cell values with proper formatting
function renderCellValue(record, col, accountNumber, entitySlug, config, titleDisplay, entityIcon) {
    switch (col.id) {
        case 'title': {
            const refTitle = record.referenceTitle || record.title || 'Sans titre'
            const initial = refTitle.charAt(0).toUpperCase()
            // Image: fallback to profile-N.jpeg (NO /uploads prefix!)
            const profileNum = (Math.abs(refTitle.charCodeAt(0) || 65) % 35) + 1
            const imageUrl = record.image || `/assets/images/profile-${profileNum}.jpeg`

            return (
                <div className="flex items-center gap-2">
                    {titleDisplay === 'avatar' && (
                        <img
                            src={imageUrl}
                            alt={refTitle}
                            className={`${config.imageSize} rounded-full max-w-none`}
                        />
                    )}
                    {titleDisplay === 'icon' && entityIcon && (
                        <div className={`${config.imageSize} rounded-lg max-w-none flex items-center justify-center bg-primary/10 text-primary shrink-0`}>
                            <iconify-icon icon={entityIcon} width="16"></iconify-icon>
                        </div>
                    )}
                    <a
                        href={`/account/${accountNumber}/record/${entitySlug}/${record._id}`}
                        className={`${config.fontWeight} hover:text-primary transition-colors`}
                    >
                        {refTitle}
                    </a>
                </div>
            )
        }

        case 'createdAt':
            return new Date(record.createdAt).toLocaleDateString('fr-FR')

        case 'actions':
            return (
                <div className="flex items-center gap-0">
                    {/* View */}
                    <a
                        href={`/account/${accountNumber}/record/${entitySlug}/${record._id}`}
                        className="p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                        title="Voir"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </a>
                    {/* Edit */}
                    <a
                        href={`/account/${accountNumber}/record/${entitySlug}/${record._id}/edit`}
                        className="p-1 rounded-lg text-gray-500 hover:text-info hover:bg-info/10 transition-all"
                        title="Modifier"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M16.862 4.487L18.55 2.8C19.33 2.02 20.59 2.02 21.37 2.8C22.15 3.58 22.15 4.84 21.37 5.62L19.681 7.307M16.862 4.487L4.162 17.187C3.882 17.467 3.682 17.818 3.592 18.198L2.732 21.596C2.642 21.966 2.952 22.296 3.322 22.226L6.892 21.556C7.242 21.486 7.572 21.306 7.832 21.046L20.513 8.366M16.862 4.487L19.681 7.307" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    {/* Delete */}
                    <button
                        type="button"
                        className="p-1 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all"
                        title="Supprimer"
                        onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
                                // TODO: Implement delete
                                console.log('Delete record:', record._id)
                            }
                        }}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M20.5 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18.833 8.5L18.373 15.4C18.196 18.054 18.108 19.381 17.243 20.19C16.378 21 15.048 21 12.387 21H11.613C8.952 21 7.622 21 6.757 20.19C5.892 19.381 5.804 18.054 5.627 15.4L5.167 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M6.5 6C6.556 5.367 6.612 5.1 6.877 4.714C7.178 4.275 7.945 3.917 9.484 3.2L9.924 2.984C10.683 2.589 11.06 2.392 11.476 2.318C11.823 2.254 12.177 2.254 12.524 2.318C12.94 2.392 13.317 2.589 14.076 2.984L14.516 3.2C16.055 3.917 16.822 4.275 17.123 4.714C17.388 5.1 17.444 5.367 17.5 6" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>
                </div>
            )

        default: {
            // Relation column (id starts with 'rel:')
            if (col.id.startsWith('rel:')) {
                const relKey = col.id.substring(4)
                const denormRelations = record._denorm?.relations || []
                const denormRel = denormRelations.find(dr => dr.relationKey === relKey)
                if (denormRel?.records?.length > 0) {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {denormRel.records.map((r, i) => (
                                <a
                                    key={i}
                                    href={`/account/${accountNumber}/record/${r.entitySlug || entitySlug}/${r._id}`}
                                    className="text-primary hover:underline text-xs"
                                >
                                    {r.title || 'Sans titre'}
                                </a>
                            ))}
                        </div>
                    )
                }
                // Fallback: raw relation without denorm
                const rawRel = (record.relations || []).find(r => r.relationKey === relKey)
                return rawRel?.value ? '—' : ''
            }

            // Classification column (id starts with 'classif:')
            if (col.id.startsWith('classif:')) {
                const classifId = col.id.substring(8)
                const cv = (record.classificationValues || []).find(
                    c => c.classificationId?.toString() === classifId
                )
                if (cv?.label) {
                    const color = cv.color || '#888'
                    return (
                        <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                                backgroundColor: `${color}15`,
                                color: color,
                                border: `1px solid ${color}30`
                            }}
                        >
                            {cv.label}
                        </span>
                    )
                }
                if (cv?.value) {
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {cv.value}
                        </span>
                    )
                }
                return ''
            }

            // Custom field value
            if (record.customFields) {
                const field = record.customFields.find(cf => {
                    const fieldId = cf.field_id?._id || cf.field_id
                    return fieldId?.toString() === col.id
                })
                if (!field) return ''
                const val = field.value
                // Recurrence field: render as badges
                if (val && typeof val === 'object' && val._v) {
                    const badges = []
                    Object.entries(val).forEach(([key, v]) => {
                        if (key === '_v' || key === 'customText') return
                        if (Array.isArray(v)) {
                            v.forEach(item => badges.push(item))
                        } else if (v) {
                            badges.push(v)
                        }
                    })
                    if (val.customText) badges.push(val.customText)
                    return (
                        <div className="flex flex-wrap gap-1">
                            {badges.map((b, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                    {b}
                                </span>
                            ))}
                        </div>
                    )
                }
                return val || ''
            }
            return ''
        }
    }
}

/**
 * DataGridTable - Generic virtual scrolling table
 * Pixel-perfect reproduction of RecordsTable design for any data
 */
import React, { useState } from 'react'

export default function DataGridTable({
    rows,
    columns,
    virtualizer,
    sort,
    onSort,
    onColumnReorder,
    density,
    accountNumber,
    rowClickUrl,
    selectedIds = new Set(),
    onToggleSelectRow,
    onSelectAllOnPage
}) {
    const [draggedColumn, setDraggedColumn] = useState(null)
    const [dragOverColumn, setDragOverColumn] = useState(null)
    const virtualRows = virtualizer.getVirtualItems()

    const allOnPageSelected = rows.length > 0 && rows.every(r => selectedIds.has(r._id))
    const someOnPageSelected = rows.some(r => selectedIds.has(r._id))

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
            fontSize: 'text-sm',
            imageSize: 'w-9 h-9',
            fontWeight: 'font-semibold'
        },
        comfortable: {
            rowHeight: 56,
            cellClass: 'py-3',
            fontSize: 'text-sm',
            imageSize: 'w-9 h-9',
            fontWeight: 'font-semibold'
        }
    }

    const config = densityConfig[density] || densityConfig.comfortable

    return (
        <table className="table-hover whitespace-nowrap dataTable-table w-full">
            <thead className="sticky top-0 bg-white dark:bg-[#1b2e4b] z-10">
                <tr>
                    {/* Checkbox column header */}
                    <th className="px-2 w-10" style={{ width: '40px', minWidth: '40px' }}>
                        <div className="flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={allOnPageSelected}
                                ref={el => { if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected }}
                                onChange={(e) => onSelectAllOnPage?.(e.target.checked)}
                                className="form-checkbox text-primary rounded cursor-pointer w-4 h-4"
                            />
                        </div>
                    </th>
                    {columns.map((col) => {
                        const isSorted = sort?.field === col.id
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
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    if (draggedColumn && draggedColumn !== col.id && col.id !== 'actions' && onColumnReorder) {
                                        onColumnReorder(draggedColumn, col.id)
                                    }
                                    setDraggedColumn(null)
                                    setDragOverColumn(null)
                                }}
                                className={`px-2 ${col.id === 'actions' ? 'sticky right-0 z-20' : ''} ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'border-l-2 border-l-primary bg-primary/5' : ''}`}
                                style={{ transition: 'opacity 0.15s, border-color 0.15s, background 0.15s', ...(col.id === 'actions' ? { width: '1%', whiteSpace: 'nowrap' } : {}) }}
                            >
                                <div className="flex items-center gap-1">
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
                                    ) : col.name}
                                </div>
                            </th>
                        )
                    })}
                </tr>
            </thead>
            <tbody>
                {/* Top spacer */}
                {virtualRows.length > 0 && virtualRows[0].start > 0 && (
                    <tr>
                        <td colSpan={columns.length + 1} style={{ height: virtualRows[0].start, padding: 0 }} />
                    </tr>
                )}

                {/* Virtual rows */}
                {virtualRows.map(virtualRow => {
                    const row = rows[virtualRow.index]
                    if (!row) return null

                    const cellPadding = {
                        compact: '4px 8px',
                        normal: '8px 12px',
                        comfortable: '12px 12px'
                    }[density] || '12px 12px'

                    const isRowSelected = selectedIds.has(row._id)

                    return (
                        <tr
                            key={row._id || virtualRow.index}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            style={{ minHeight: config.rowHeight }}
                            className={isRowSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}
                        >
                            {/* Checkbox cell */}
                            <td
                                className={`${config.fontSize}`}
                                style={{ padding: cellPadding, width: '40px', minWidth: '40px' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={isRowSelected}
                                        onChange={() => onToggleSelectRow?.(row._id)}
                                        className="form-checkbox text-primary rounded cursor-pointer w-4 h-4"
                                    />
                                </div>
                            </td>
                            {columns.map(col => (
                                <td
                                    key={col.id}
                                    className={`${config.fontSize} ${col.id === 'actions' ? 'sticky right-0 bg-white dark:bg-gray-900' : ''}`}
                                    style={{ padding: cellPadding, ...(col.id === 'actions' ? { width: '1%', whiteSpace: 'nowrap' } : {}) }}
                                >
                                    {renderCellValue(row, col, accountNumber, config, rowClickUrl)}
                                </td>
                            ))}
                        </tr>
                    )
                })}

                {/* Bottom spacer */}
                {virtualRows.length > 0 && (
                    <tr>
                        <td
                            colSpan={columns.length + 1}
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

function renderCellValue(row, col, accountNumber, config, rowClickUrl) {
    const value = row[col.id]

    // Actions column
    if (col.id === 'actions') {
        const actions = col.actions || row._actions || []
        if (actions.length === 0 && rowClickUrl) {
            const href = rowClickUrl.replace('{id}', row._id)
            return (
                <div className="flex items-center gap-0">
                    <a
                        href={href}
                        className="p-1 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                        title="Voir"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 5C7.5 5 3.73 7.94 2 12C3.73 16.06 7.5 19 12 19C16.5 19 20.27 16.06 22 12C20.27 7.94 16.5 5 12 5Z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </a>
                </div>
            )
        }
        // Render custom actions from column definition
        return (
            <div className="flex items-center gap-0" dangerouslySetInnerHTML={{ __html: value || '' }} />
        )
    }

    // Color column — render swatch
    if (col.type === 'color') {
        return (
            <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: value || '#ffffff' }} />
        )
    }

    // Icon column — render iconify icon
    if (col.type === 'icon') {
        return value ? (
            <div className={`${config.imageSize} rounded-lg flex items-center justify-center bg-primary/10 text-primary`}>
                <iconify-icon icon={value} width="16"></iconify-icon>
            </div>
        ) : ''
    }

    // Badge column — render as badge
    if (col.type === 'badge') {
        const badgeColor = row[col.colorField] || col.badgeColor || '#4361ee'
        return value ? (
            <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{
                    backgroundColor: `${badgeColor}15`,
                    color: badgeColor,
                    border: `1px solid ${badgeColor}30`
                }}
            >
                {value}
            </span>
        ) : ''
    }

    // Date column
    if (col.type === 'date') {
        return value ? new Date(value).toLocaleDateString('fr-FR') : ''
    }

    // Link column — first column with link
    if (col.link) {
        const href = col.link.replace('{id}', row._id).replace('{accountNumber}', accountNumber)
        const icon = row._icon || col.icon || null
        const color = row._color || col.color || null
        return (
            <div className="flex items-center gap-2">
                {icon && (
                    <div className={`${config.imageSize} rounded-lg max-w-none flex items-center justify-center shrink-0`}
                        style={{ backgroundColor: color ? `${color}15` : 'rgba(67,97,238,0.1)', color: color || '#4361ee' }}>
                        <iconify-icon icon={icon} width="16"></iconify-icon>
                    </div>
                )}
                <a href={href} className={`${config.fontWeight} hover:text-primary transition-colors`}>
                    {value || 'Sans titre'}
                </a>
            </div>
        )
    }

    // Boolean column
    if (col.type === 'boolean') {
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-success/10 text-success border border-success/20' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border border-gray-200 dark:border-gray-700'}`}>
                {value ? 'Oui' : 'Non'}
            </span>
        )
    }

    // Default: raw value
    return value ?? ''
}

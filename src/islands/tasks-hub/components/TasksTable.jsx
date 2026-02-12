/**
 * TasksTable — Classic DataGrid table view for tasks
 * 
 * Reuses the same table layout and styling as DataGridTable
 * with sorting, column headers, row click, and pagination.
 * Uses @tanstack/react-virtual for virtualized rows.
 */
import React, { useRef, useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export default function TasksTable({
    rows,
    columns,
    sort,
    onSort,
    onColumnReorder,
    density,
    accountNumber,
    entitySlug,
    pagination,
    onPageChange,
}) {
    const parentRef = useRef(null)

    // Row height based on density
    const rowHeight = useMemo(() => {
        switch (density) {
            case 'compact': return 36
            case 'comfortable': return 56
            default: return 44
        }
    }, [density])

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 10,
    })

    // Render cell content based on column type
    const renderCell = useCallback((row, col) => {
        const value = row[col.id]

        if (col.id === 'title') {
            return (
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: row._color || '#4361ee' }}
                    >
                        {(row.title || '').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white truncate">
                        {row.title || 'Sans titre'}
                    </span>
                </div>
            )
        }

        if (col.id === 'status' || col.id === 'priority') {
            if (!value) return <span className="text-gray-300 dark:text-gray-600">—</span>
            const color = col.id === 'status' ? row.statusColor : row.priorityColor
            return (
                <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                        backgroundColor: (color || '#9ca3af') + '20',
                        color: color || '#9ca3af',
                    }}
                >
                    {value}
                </span>
            )
        }

        if (col.id === 'tags') {
            if (!value) return <span className="text-gray-300 dark:text-gray-600">—</span>
            return (
                <div className="flex flex-wrap gap-1">
                    {value.split(',').map((tag, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                            {tag.trim()}
                        </span>
                    ))}
                </div>
            )
        }

        if (col.id === 'progress') {
            const progress = parseInt(value) || 0
            return (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 max-w-[80px]">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: progress >= 80 ? '#00ab55' : progress >= 50 ? '#e2a03f' : '#4361ee',
                            }}
                        />
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums">{progress}%</span>
                </div>
            )
        }

        if (col.type === 'date' || col.id === 'dueDate' || col.id === 'createdAt') {
            if (!value) return <span className="text-gray-300 dark:text-gray-600">—</span>
            return (
                <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                    {new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        }

        if (col.id === 'actions') {
            return (
                <div className="flex items-center gap-1">
                    <a
                        href={`/account/${accountNumber}/record/${entitySlug}/${row._id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="Voir"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5Z" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </a>
                </div>
            )
        }

        return <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{value || '—'}</span>
    }, [accountNumber, entitySlug])

    // Handle row click
    const handleRowClick = useCallback((row) => {
        window.location.href = `/account/${accountNumber}/record/${entitySlug}/${row._id}`
    }, [accountNumber, entitySlug])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Table */}
            <div className="dataTable-container flex-1 overflow-auto" ref={parentRef}>
                <table className="w-full table-auto dataTable-table">
                    <thead>
                        <tr className="border-b dark:border-gray-800">
                            {columns.map(col => (
                                <th
                                    key={col.id}
                                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-primary select-none' : ''}`}
                                    onClick={() => col.sortable && onSort(col.id)}
                                    draggable={col.id !== 'actions'}
                                    onDragStart={(e) => e.dataTransfer.setData('text/plain', col.id)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const fromId = e.dataTransfer.getData('text/plain')
                                        if (fromId && fromId !== col.id) onColumnReorder(fromId, col.id)
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.name}
                                        {sort.field === col.id && (
                                            <svg className={`w-3 h-3 transition-transform ${sort.direction === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
                                                <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ height: virtualizer.getTotalSize() }}>
                            <td colSpan={columns.length} style={{ padding: 0, position: 'relative' }}>
                                {virtualizer.getVirtualItems().map(virtualRow => {
                                    const row = rows[virtualRow.index]
                                    if (!row) return null
                                    return (
                                        <div
                                            key={row._id}
                                            className="flex items-center border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                            onClick={() => handleRowClick(row)}
                                        >
                                            {columns.map(col => (
                                                <div
                                                    key={col.id}
                                                    className="px-4 flex items-center overflow-hidden"
                                                    style={{
                                                        height: `${virtualRow.size}px`,
                                                        flex: col.id === 'title' ? '2 1 0' : col.id === 'actions' ? '0 0 60px' : '1 1 0',
                                                        minWidth: col.id === 'actions' ? '60px' : '100px',
                                                    }}
                                                >
                                                    {renderCell(row, col)}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="dataTable-bottom flex items-center justify-between border-t pt-4 dark:border-gray-800">
                <div className="dataTable-info text-gray-500 dark:text-gray-400">
                    Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}
                </div>
                <nav className="dataTable-pagination">
                    <ul className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                        <li>
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50"
                            >
                                &laquo;
                            </button>
                        </li>
                        {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                            let pageNum
                            if (pagination.pages <= 5) pageNum = i + 1
                            else if (pagination.page <= 3) pageNum = i + 1
                            else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                            else pageNum = pagination.page - 2 + i
                            return (
                                <li key={pageNum}>
                                    <button
                                        onClick={() => onPageChange(pageNum)}
                                        className={`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${pageNum === pagination.page
                                            ? 'bg-primary text-white dark:bg-primary dark:text-white-light'
                                            : 'bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                </li>
                            )
                        })}
                        <li>
                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary disabled:opacity-50"
                            >
                                &raquo;
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

/**
 * RecordsTable - Virtual scrolling table
 * Pixel-perfect reproduction of existing HTMX table styling
 */
import React from 'react'

export default function RecordsTable({
    records,
    columns,
    virtualizer,
    sort,
    onSort,
    density,
    accountNumber,
    entitySlug
}) {
    const virtualRows = virtualizer.getVirtualItems()

    console.log('[RecordsTable] Rendering with:', {
        recordsCount: records.length,
        virtualRowsCount: virtualRows.length,
        firstRecordTitle: records[0]?.title || records[0]?.referenceTitle
    })

    return (
        <table className="table-hover whitespace-nowrap dataTable-table w-full">
            <thead className="sticky top-0 bg-white dark:bg-[#1b2e4b] z-10">
                <tr>
                    {columns.map(col => (
                        <th key={col.id} data-sortable={col.sortable !== false ? '' : undefined}>
                            {col.sortable !== false ? (
                                <a
                                    href="#"
                                    className="dataTable-sorter"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onSort(col.id)
                                    }}
                                >
                                    {col.name}
                                </a>
                            ) : (
                                col.name
                            )}
                        </th>
                    ))}
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

                    return (
                        <tr
                            key={record._id}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                        >
                            {columns.map(col => (
                                <td key={col.id}>
                                    {renderCellValue(record, col, accountNumber, entitySlug)}
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
function renderCellValue(record, col, accountNumber, entitySlug) {
    switch (col.id) {
        case 'title': {
            const refTitle = record.referenceTitle || record.title || 'Sans titre'
            const initial = refTitle.charAt(0).toUpperCase()
            // Image: fallback to profile-N.jpeg (NO /uploads prefix!)
            const profileNum = (Math.abs(refTitle.charCodeAt(0) || 65) % 35) + 1
            const imageUrl = record.image || `/assets/images/profile-${profileNum}.jpeg`

            return (
                <div className="flex items-center gap-2">
                    <img
                        src={imageUrl}
                        alt={refTitle}
                        className="w-9 h-9 rounded-full max-w-none"
                    />
                    <div className="font-semibold">{refTitle}</div>
                </div>
            )
        }

        case 'createdAt':
            return new Date(record.createdAt).toLocaleDateString('fr-FR')

        case 'actions':
            return (
                <div className="flex items-center gap-2">
                    <a
                        href={`/account/${accountNumber}/record/${entitySlug}/${record._id}`}
                        className="btn btn-sm btn-outline-info"
                    >
                        Modifier
                    </a>
                </div>
            )

        default: {
            // Custom field value
            if (record.customFields) {
                const field = record.customFields.find(cf => {
                    const fieldId = cf.field_id?._id || cf.field_id
                    return fieldId?.toString() === col.id
                })
                return field?.value || ''
            }
            return ''
        }
    }
}

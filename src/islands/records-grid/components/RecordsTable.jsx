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
                                    className={config.fontSize}
                                    style={{ padding: cellPadding }}
                                >
                                    {renderCellValue(record, col, accountNumber, entitySlug, config)}
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
function renderCellValue(record, col, accountNumber, entitySlug, config) {
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
                        className={`${config.imageSize} rounded-full max-w-none`}
                    />
                    <div className={config.fontWeight}>{refTitle}</div>
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

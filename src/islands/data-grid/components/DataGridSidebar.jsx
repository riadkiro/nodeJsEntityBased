/**
 * DataGridSidebar - Filter sidebar for DataGrid island
 * Displays classification-based filters (status, priority, tags, etc.) 
 * from API-provided filter data. Pixel-perfect match with RecordsSidebar.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'

const SIDEBAR_MIN_WIDTH = 229
const SIDEBAR_MAX_WIDTH = 500

export default function DataGridSidebar({
    title,
    titlePlural,
    icon,
    accountNumber,
    entitySlug,
    filters = [],
    activeFilters = {},
    onFilterChange,
    showSidebar,
    addUrl,
    addLabel,
    sidebarWidth = 280,
    onWidthChange
}) {
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        if (showDropdown) {
            document.addEventListener('mousedown', handleClick)
        }
        return () => document.removeEventListener('mousedown', handleClick)
    }, [showDropdown])

    // ====== RESIZE LOGIC ======
    const isResizingRef = useRef(false)
    const startXRef = useRef(0)
    const startWidthRef = useRef(0)

    const handleResizeStart = useCallback((e) => {
        e.preventDefault()
        isResizingRef.current = true
        startXRef.current = e.clientX
        startWidthRef.current = sidebarWidth
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }, [sidebarWidth])

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizingRef.current) return
            const delta = e.clientX - startXRef.current
            const newWidth = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, startWidthRef.current + delta))
            onWidthChange?.(newWidth)
        }
        const handleMouseUp = () => {
            if (isResizingRef.current) {
                isResizingRef.current = false
                document.body.style.cursor = ''
                document.body.style.userSelect = ''
            }
        }
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [onWidthChange])

    if (!showSidebar) return null

    const handleFilterClick = (filterId, optionId) => {
        const currentFilters = { ...activeFilters }
        const currentValues = currentFilters[filterId] || []

        if (optionId === '__all__') {
            // Clear this filter
            delete currentFilters[filterId]
        } else {
            const idx = currentValues.indexOf(optionId)
            if (idx > -1) {
                // Remove
                currentValues.splice(idx, 1)
                if (currentValues.length === 0) {
                    delete currentFilters[filterId]
                } else {
                    currentFilters[filterId] = [...currentValues]
                }
            } else {
                // Add
                currentFilters[filterId] = [...currentValues, optionId]
            }
        }

        onFilterChange(currentFilters)
    }

    const hasAnyFilter = Object.keys(activeFilters).length > 0

    return (
        <div className="panel z-10 flex-none space-y-4 overflow-hidden p-4 h-full"
            style={{ display: 'flex', flexDirection: 'column', width: sidebarWidth, minWidth: SIDEBAR_MIN_WIDTH, maxWidth: SIDEBAR_MAX_WIDTH, position: 'relative' }}>
            {/* Resize Handle */}
            <div
                onMouseDown={handleResizeStart}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: -3,
                    width: 6,
                    height: '100%',
                    cursor: 'col-resize',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                className="group"
            >
                <div
                    style={{
                        width: 3,
                        height: 40,
                        borderRadius: 4,
                        transition: 'background-color 0.15s, opacity 0.15s'
                    }}
                    className="bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100"
                />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="flex items-center text-center">
                        <div>
                            {icon ? (
                                <iconify-icon icon={icon} width="22" style={{ color: 'var(--primary)' }}></iconify-icon>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                                    <path
                                        d="M20.3116 12.6473L20.8293 10.7154C21.4335 8.46034 21.7356 7.3328 21.5081 6.35703C21.3285 5.58657 20.9244 4.88668 20.347 4.34587C19.6157 3.66095 18.4881 3.35883 16.2331 2.75458C13.978 2.15033 12.8504 1.84821 11.8747 2.07573C11.1042 2.25537 10.4043 2.65945 9.86351 3.23687C9.27709 3.86298 8.97128 4.77957 8.51621 6.44561C8.43979 6.7254 8.35915 7.02633 8.27227 7.35057L8.27222 7.35077L7.75458 9.28263C7.15033 11.5377 6.84821 12.6652 7.07573 13.641C7.25537 14.4115 7.65945 15.1114 8.23687 15.6522C8.96815 16.3371 10.0957 16.6392 12.3508 17.2435L12.3508 17.2435C14.3834 17.7881 15.4999 18.0873 16.415 17.9744C16.5152 17.9621 16.6129 17.9448 16.7092 17.9223C17.4796 17.7427 18.1795 17.3386 18.7203 16.7612C19.4052 16.0299 19.7074 14.9024 20.3116 12.6473Z"
                                        stroke="currentColor" strokeWidth="1.5"></path>
                                    <path opacity="0.5"
                                        d="M16.415 17.9741C16.2065 18.6126 15.8399 19.1902 15.347 19.6519C14.6157 20.3368 13.4881 20.6389 11.2331 21.2432C8.97798 21.8474 7.85044 22.1495 6.87466 21.922C6.10421 21.7424 5.40432 21.3383 4.86351 20.7609C4.17859 20.0296 3.87647 18.9021 3.27222 16.647L2.75458 14.7151C2.15033 12.46 1.84821 11.3325 2.07573 10.3567C2.25537 9.58627 2.65945 8.88638 3.23687 8.34557C3.96815 7.66065 5.09569 7.35853 7.35077 6.75428C7.77741 6.63996 8.16368 6.53646 8.51621 6.44531"
                                        stroke="currentColor" strokeWidth="1.5"></path>
                                    <path d="M11.7769 10L16.6065 11.2941" stroke="currentColor" strokeWidth="1.5"
                                        strokeLinecap="round"></path>
                                    <path opacity="0.5" d="M11 12.8975L13.8978 13.6739" stroke="currentColor"
                                        strokeWidth="1.5" strokeLinecap="round"></path>
                                </svg>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">{title}</h3>
                    </div>
                </div>
            </div>

            <div className="h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b]"></div>

            {/* Scrollable filter list */}
            <div className="!mt-0" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="flex h-full flex-col pb-16" style={{ position: 'relative' }}>
                    <div className="relative -mr-3.5 h-full grow pr-3.5 overflow-auto">
                        <div className="space-y-1">
                            {/* "All" button */}
                            <button type="button"
                                className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${!hasAnyFilter ? 'bg-gray-100 dark:text-primary text-primary dark:bg-[#181F32]' : ''}`}
                                onClick={() => onFilterChange({})}>
                                <div className="flex items-center">
                                    <iconify-icon icon="solar:checklist-minimalistic-bold-duotone" width="20"></iconify-icon>
                                    <div className="ltr:ml-3 rtl:mr-3">Toutes les {titlePlural || title}</div>
                                </div>
                            </button>

                            {/* Classification-based filter groups */}
                            {filters.map((filterGroup) => (
                                <div key={filterGroup.id}>
                                    <div className="h-px w-full border-b border-[#e0e6ed] dark:border-[#1b2e4b] my-2"></div>
                                    <div className="px-1 py-2 text-white-dark text-xs uppercase font-semibold tracking-wider">
                                        {filterGroup.name}
                                    </div>

                                    {filterGroup.type === 'tags' ? (
                                        /* Tag-style filter (badges/chips) */
                                        <div className="flex flex-wrap gap-1.5 px-1">
                                            {filterGroup.options.map((option) => {
                                                const isActive = (activeFilters[filterGroup.id] || []).includes(option.id)
                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        className="mb-0 py-0.5 px-2.5 text-xs rounded-full cursor-pointer transition-all font-medium"
                                                        style={{
                                                            border: `1.5px solid ${option.color || '#9ca3af'}`,
                                                            color: isActive ? '#fff' : (option.color || '#9ca3af'),
                                                            backgroundColor: isActive ? (option.color || '#9ca3af') : 'transparent',
                                                        }}
                                                        onClick={() => handleFilterClick(filterGroup.id, option.id)}
                                                    >
                                                        {option.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        /* List-style filter (status, priority) */
                                        <div className="space-y-0.5">
                                            {filterGroup.options.map((option) => {
                                                const isActive = (activeFilters[filterGroup.id] || []).includes(option.id)
                                                return (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        className={`flex h-9 w-full items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${isActive ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''}`}
                                                        onClick={() => handleFilterClick(filterGroup.id, option.id)}
                                                    >
                                                        <span
                                                            className="inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0"
                                                            style={{ backgroundColor: option.color || '#9ca3af' }}
                                                        ></span>
                                                        <span className="truncate">{option.label}</span>
                                                        {option.count !== undefined && (
                                                            <span className="ml-auto text-xs opacity-60">{option.count}</span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Add button */}
                    {addUrl && (
                        <div className="absolute bottom-0 w-full p-4 left-0">
                            <a href={addUrl} className="btn btn-primary w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                    strokeLinejoin="round" className="h-5 w-5 ltr:mr-2 rtl:ml-2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                {addLabel || 'Ajouter'}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

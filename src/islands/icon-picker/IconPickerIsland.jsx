/**
 * IconPickerIsland — React Island component
 * Pixel-perfect replica of the vanilla JS IconPicker (public/assets/js/icon-picker.js)
 * 
 * Uses the same CSS classes from picker.css
 * Same DOM structure, same interactions, same icon loading logic
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'

// ============================================
// ICON LIBRARIES (same as vanilla JS version)
// ============================================
const ICON_LIBRARIES = {
    solar: {
        label: 'Solar',
        prefix: 'solar',
        styles: [
            { value: 'bold-duotone', label: 'Duotone' },
            { value: 'bold', label: 'Bold' },
            { value: 'linear', label: 'Linear' },
            { value: 'outline', label: 'Outline' },
            { value: 'broken', label: 'Broken' }
        ],
        defaultStyle: 'bold-duotone'
    },
    mdi: {
        label: 'MDI',
        prefix: 'mdi',
        styles: null,
        defaultStyle: null
    },
    tabler: {
        label: 'Tabler',
        prefix: 'tabler',
        styles: null,
        defaultStyle: null
    }
}

const PAGE_SIZE = 80

// Cache for loaded icons
const iconCache = {}

async function loadLibraryIcons(libraryKey, style) {
    const cacheKey = `${libraryKey}:${style || 'default'}`
    if (iconCache[cacheKey]) return iconCache[cacheKey]

    const lib = ICON_LIBRARIES[libraryKey]
    if (!lib) return []

    try {
        const module = await import(`https://esm.sh/@iconify-json/${lib.prefix}/icons.json`)
        const data = module.default || module
        const iconNames = Object.keys(data.icons || {})

        let result
        if (libraryKey === 'solar' && style) {
            result = iconNames
                .filter(name => name.endsWith(`-${style}`))
                .map(name => `${lib.prefix}:${name}`)
        } else {
            result = iconNames.map(name => `${lib.prefix}:${name}`)
        }

        iconCache[cacheKey] = result
        return result
    } catch (e) {
        console.error(`Failed to load ${libraryKey} icons:`, e)
        return []
    }
}

// ============================================
// ICON PICKER COMPONENT
// ============================================
export default function IconPickerIsland({ name = 'icon', value = '', externalCallback = null }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIcon, setSelectedIcon] = useState(value || '')
    const [currentLibrary, setCurrentLibrary] = useState('solar')
    const [currentStyle, setCurrentStyle] = useState('bold-duotone')
    const [searchQuery, setSearchQuery] = useState('')
    const [allIcons, setAllIcons] = useState([])
    const [loading, setLoading] = useState(false)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    const triggerRef = useRef(null)
    const panelRef = useRef(null)
    const searchInputRef = useRef(null)
    const hiddenInputRef = useRef(null)
    const debounceRef = useRef(null)

    // Position state for the panel
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })

    // ===== Load icons when library/style changes =====
    const loadIcons = useCallback(async () => {
        setLoading(true)
        setVisibleCount(PAGE_SIZE)
        const style = ICON_LIBRARIES[currentLibrary].styles ? currentStyle : null
        const icons = await loadLibraryIcons(currentLibrary, style)
        setAllIcons(icons)
        setLoading(false)
    }, [currentLibrary, currentStyle])

    useEffect(() => {
        if (isOpen) loadIcons()
    }, [isOpen, loadIcons])

    // ===== Filtered icons =====
    const filteredIcons = useMemo(() => {
        if (!searchQuery) return allIcons
        const q = searchQuery.toLowerCase()
        return allIcons.filter(name => name.toLowerCase().includes(q))
    }, [allIcons, searchQuery])

    const visibleIcons = useMemo(() => {
        return filteredIcons.slice(0, visibleCount)
    }, [filteredIcons, visibleCount])

    // ===== Position update =====
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return
        const rect = triggerRef.current.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight

        let top = rect.bottom + 8
        let left = rect.left

        // Flip up if needed
        if (top + 400 > vh - 20) top = rect.top - 400 - 8
        // Adjust horizontal
        if (left + 320 > vw - 20) left = vw - 320 - 20
        if (left < 20) left = 20

        setPanelPos({ top, left })
    }, [])

    // ===== Open / Close =====
    const open = useCallback(() => {
        setIsOpen(true)
        setSearchQuery('')
        setVisibleCount(PAGE_SIZE)
        // Use rAF to position after render
        requestAnimationFrame(() => updatePosition())
    }, [updatePosition])

    const close = useCallback(() => {
        setIsOpen(false)
    }, [])

    const toggle = useCallback(() => {
        if (isOpen) close()
        else open()
    }, [isOpen, open, close])

    // ===== Select icon =====
    const selectIcon = useCallback((icon) => {
        setSelectedIcon(icon)
        if (hiddenInputRef.current) hiddenInputRef.current.value = icon

        // Call external callback
        if (typeof externalCallback === 'function') {
            externalCallback(icon)
        }

        // Dispatch custom event for Alpine.js or other listeners
        if (triggerRef.current) {
            const container = triggerRef.current.closest('[data-island="icon-picker"]')
            if (container) {
                container.dispatchEvent(new CustomEvent('icon-selected', {
                    detail: { icon },
                    bubbles: true
                }))
            }
        }

        close()
    }, [externalCallback, close])

    // ===== Search with debounce =====
    const handleSearch = useCallback((e) => {
        const val = e.target.value
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setSearchQuery(val.toLowerCase())
            setVisibleCount(PAGE_SIZE)
        }, 200)
    }, [])

    // ===== Click outside & ESC =====
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)) {
                close()
            }
        }

        const handleKeydown = (e) => {
            if (e.key === 'Escape') close()
        }

        const handleScroll = () => {
            requestAnimationFrame(() => updatePosition())
        }

        document.addEventListener('click', handleClickOutside, true)
        document.addEventListener('keydown', handleKeydown)
        window.addEventListener('scroll', handleScroll, true)
        window.addEventListener('resize', updatePosition)

        // Focus search
        setTimeout(() => {
            if (searchInputRef.current) searchInputRef.current.focus()
        }, 100)

        return () => {
            document.removeEventListener('click', handleClickOutside, true)
            document.removeEventListener('keydown', handleKeydown)
            window.removeEventListener('scroll', handleScroll, true)
            window.removeEventListener('resize', updatePosition)
        }
    }, [isOpen, close, updatePosition])

    // ===== Scroll & Resize reposition =====
    useEffect(() => {
        if (isOpen) updatePosition()
    }, [isOpen, updatePosition])

    // ===== Library / Style handlers =====
    const handleLibraryChange = useCallback((e) => {
        const lib = e.target.value
        setCurrentLibrary(lib)
        const libConfig = ICON_LIBRARIES[lib]
        if (libConfig.styles) {
            setCurrentStyle(libConfig.defaultStyle)
        }
    }, [])

    const handleStyleChange = useCallback((e) => {
        setCurrentStyle(e.target.value)
    }, [])

    // ===== Load more =====
    const loadMore = useCallback(() => {
        setVisibleCount(prev => prev + PAGE_SIZE)
    }, [])

    // ===== Render =====
    const lib = ICON_LIBRARIES[currentLibrary]
    const hasMore = visibleCount < filteredIcons.length

    return (
        <div className="picker-container">
            {/* Hidden input for form integration */}
            <input
                ref={hiddenInputRef}
                type="hidden"
                name={name}
                value={selectedIcon}
            />

            {/* Trigger button - pixel-perfect match of vanilla JS */}
            <button
                ref={triggerRef}
                type="button"
                className={`picker-trigger picker-trigger--icon${selectedIcon ? ' picker-trigger--selected' : ''}`}
                title={selectedIcon || 'Choisir une icône'}
                onClick={(e) => { e.stopPropagation(); toggle() }}
            >
                <iconify-icon
                    icon={selectedIcon || 'tabler:apps'}
                    width="20"
                />
            </button>

            {/* Panel - rendered via portal to body */}
            {isOpen && createPortal(
                <div
                    ref={panelRef}
                    className="picker-panel picker-panel--icon picker-panel--open"
                    style={{
                        zIndex: 9999,
                        display: 'block',
                        top: `${panelPos.top}px`,
                        left: `${panelPos.left}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="picker-header">Icône</div>

                    {/* Controls */}
                    <div className="picker-controls">
                        {/* Library select */}
                        <select
                            className="picker-library form-select"
                            value={currentLibrary}
                            onChange={handleLibraryChange}
                        >
                            {Object.entries(ICON_LIBRARIES).map(([key, lib]) => (
                                <option key={key} value={key}>{lib.label}</option>
                            ))}
                        </select>

                        {/* Style select (Solar only) */}
                        {lib.styles && (
                            <select
                                className="picker-style form-select"
                                value={currentStyle}
                                onChange={handleStyleChange}
                            >
                                {lib.styles.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        )}

                        {/* Search */}
                        <div className="picker-search-wrap">
                            <iconify-icon
                                icon="solar:magnifer-linear"
                                width="14"
                                className="picker-search-icon"
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    pointerEvents: 'none'
                                }}
                            />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="picker-search form-input"
                                placeholder="Rechercher..."
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Icon Grid */}
                    <div className="picker-grid">
                        {loading ? (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '20px 0',
                                color: '#9ca3af',
                                fontSize: '12px'
                            }}>
                                Chargement...
                            </div>
                        ) : visibleIcons.length === 0 ? (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '20px 0',
                                color: '#9ca3af',
                                fontSize: '12px'
                            }}>
                                Aucune icône trouvée
                            </div>
                        ) : (
                            visibleIcons.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    className={`picker-item${selectedIcon === icon ? ' picker-item--selected' : ''}`}
                                    title={icon}
                                    onClick={() => selectIcon(icon)}
                                >
                                    <iconify-icon icon={icon} width="20" />
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="picker-footer">
                        {hasMore ? (
                            <button
                                type="button"
                                className="picker-load-more"
                                onClick={loadMore}
                            >
                                Charger plus
                            </button>
                        ) : (
                            <span />
                        )}
                        <span className="picker-count">
                            {visibleIcons.length} / {filteredIcons.length}
                        </span>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

// ============================================
// PUBLIC API - for external usage
// ============================================
IconPickerIsland.displayName = 'IconPickerIsland'

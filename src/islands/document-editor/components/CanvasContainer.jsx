/**
 * CanvasContainer Component
 * Scrollable container with page components, page mode switcher, page labels
 * Includes document zoom system (Ctrl+Wheel, pinch-to-zoom, zoom buttons)
 */
import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react'
import EditorPage from './EditorPage'

const ZOOM_MIN = 0.25
const ZOOM_MAX = 3
const ZOOM_STEP = 0.1
const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const CanvasContainer = forwardRef(function CanvasContainer({
    doc,
    setDoc,
    pageRefs,
    selectedPageIndex,
    setSelectedPageIndex,
    editorMode,
    isGlobalSelection,
    handlePageInput,
    handlePaste,
    handleKeyDown,
    setPageMode,
    addPage,
    zoomLevel,
    setZoomLevel,
    accountNumber
}, ref) {
    // Detect dark mode from document

    // ===== LAYOUT CONFIG STATE =====
    const [panelMode, setPanelMode] = useState(false)
    const [showConfig, setShowConfig] = useState(null) // pageIndex or null
    const configRef = useRef(null)

    // Close config dropdown on outside click
    useEffect(() => {
        if (showConfig === null) return
        const handleClick = (e) => {
            if (configRef.current && !configRef.current.contains(e.target)) {
                setShowConfig(null)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [showConfig])
    const [isDark, setIsDark] = useState(false)
    const [showZoomPresets, setShowZoomPresets] = useState(false)
    const scrollContainerRef = useRef(null)
    const touchStartDistRef = useRef(null)
    const touchStartZoomRef = useRef(null)
    const zoomPresetsRef = useRef(null)

    useEffect(() => {
        const checkDarkMode = () => {
            // Check both body (where Alpine.js applies 'dark' class via $store.app.theme)
            // and documentElement (fallback)
            const dark = document.body.classList.contains('dark') || document.documentElement.classList.contains('dark');
            setIsDark(dark);
        }
        // Also check localStorage for immediate detection before Alpine init
        try {
            const stored = localStorage.getItem('_x_theme');
            if (stored) {
                let theme;
                try { theme = JSON.parse(stored); } catch (e) { theme = stored; }
                if (theme === 'dark') setIsDark(true);
                else if (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) setIsDark(true);
                else if (theme === 'light') setIsDark(false);
            }
        } catch (e) { /* ignore */ }
        checkDarkMode()

        // Watch for dark mode changes on both body and html
        const observer = new MutationObserver(checkDarkMode)
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

        // Re-check after Alpine init delay
        const timer = setTimeout(checkDarkMode, 100);
        return () => { observer.disconnect(); clearTimeout(timer); }
    }, [])

    // Clamp zoom level
    const clampZoom = useCallback((z) => {
        return Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)) * 100) / 100
    }, [])

    // Zoom controls
    const zoomIn = useCallback(() => {
        setZoomLevel(prev => clampZoom(prev + ZOOM_STEP))
    }, [setZoomLevel, clampZoom])

    const zoomOut = useCallback(() => {
        setZoomLevel(prev => clampZoom(prev - ZOOM_STEP))
    }, [setZoomLevel, clampZoom])

    const zoomReset = useCallback(() => {
        setZoomLevel(1)
    }, [setZoomLevel])

    // ========== Ctrl + Mouse Wheel Zoom ==========
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const handleWheel = (e) => {
            if (!e.ctrlKey && !e.metaKey) return
            e.preventDefault()

            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
            setZoomLevel(prev => clampZoom(prev + delta))
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => container.removeEventListener('wheel', handleWheel)
    }, [setZoomLevel, clampZoom])

    // ========== Touch Pinch-to-Zoom ==========
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const getTouchDistance = (touches) => {
            const dx = touches[0].clientX - touches[1].clientX
            const dy = touches[0].clientY - touches[1].clientY
            return Math.sqrt(dx * dx + dy * dy)
        }

        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                e.preventDefault()
                touchStartDistRef.current = getTouchDistance(e.touches)
                touchStartZoomRef.current = zoomLevel
            }
        }

        const handleTouchMove = (e) => {
            if (e.touches.length === 2 && touchStartDistRef.current !== null) {
                e.preventDefault()
                const currentDist = getTouchDistance(e.touches)
                const scale = currentDist / touchStartDistRef.current
                const newZoom = clampZoom(touchStartZoomRef.current * scale)
                setZoomLevel(newZoom)
            }
        }

        const handleTouchEnd = () => {
            touchStartDistRef.current = null
            touchStartZoomRef.current = null
        }

        container.addEventListener('touchstart', handleTouchStart, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd)

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [zoomLevel, setZoomLevel, clampZoom])

    // ========== Safari Gesture Events (pinch) ==========
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        let gestureStartZoom = 1

        const handleGestureStart = (e) => {
            e.preventDefault()
            gestureStartZoom = zoomLevel
        }

        const handleGestureChange = (e) => {
            e.preventDefault()
            setZoomLevel(clampZoom(gestureStartZoom * e.scale))
        }

        container.addEventListener('gesturestart', handleGestureStart, { passive: false })
        container.addEventListener('gesturechange', handleGestureChange, { passive: false })

        return () => {
            container.removeEventListener('gesturestart', handleGestureStart)
            container.removeEventListener('gesturechange', handleGestureChange)
        }
    }, [zoomLevel, setZoomLevel, clampZoom])

    // Close zoom presets menu on outside click
    useEffect(() => {
        if (!showZoomPresets) return
        const handleClickOutside = (e) => {
            if (zoomPresetsRef.current && !zoomPresetsRef.current.contains(e.target)) {
                setShowZoomPresets(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showZoomPresets])

    const zoomPercent = Math.round(zoomLevel * 100)

    return (
        <div className="flex-1 flex flex-col min-w-0 dark:bg-gray-800 overflow-hidden" style={{ position: 'relative' }}>
            {/* Template Watermark Background */}
            {doc.isTemplate && (
                <div 
                    className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
                    style={{ opacity: 0.03 }}
                >
                    <div style={{
                        fontSize: '12vw',
                        fontWeight: 900,
                        color: isDark ? '#ffffff' : '#000000',
                        transform: 'rotate(-35deg)',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        letterSpacing: '0.15em'
                    }}>
                        TEMPLATE
                    </div>
                </div>
            )}
            
            {/* Canvas Area */}
            <div
                ref={(el) => {
                    scrollContainerRef.current = el
                    // Forward the ref
                    if (typeof ref === 'function') ref(el)
                    else if (ref) ref.current = el
                }}
                className="flex-1 overflow-auto p-8"
                style={{
                    scrollbarColor: '#64748b transparent',
                    scrollbarWidth: 'thin',
                }}
            >
                <div
                    className="flex flex-col items-center gap-8"
                    style={{
                        backgroundColor: isDark ? '#1f2937' : 'transparent',
                        marginTop: '50px',
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        // Reserve space for the scaled content so scrollbars work correctly
                        marginBottom: zoomLevel > 1 ? `${(zoomLevel - 1) * 100}%` : 0,
                    }}
                >
                    {doc.pages.map((page, pageIndex) => (
                        <div key={pageIndex} className="relative">
                            {/* Page Label */}
                            <div className="absolute -top-6 left-0 right-0 flex items-center justify-center">
                                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded">
                                    Page {pageIndex + 1}
                                </span>
                            </div>

                            {/* Mode Switcher */}
                            <div
                                className="mode-switcher absolute -top-6 right-0 z-50 flex items-center gap-1 dark:bg-gray-800 rounded-lg px-1 py-0.5 shadow-sm border-0 dark:border-gray-800"
                                data-print-hide="true"
                                style={{ marginTop: '-38px' }}
                            >
                                <button
                                    onClick={() => setPageMode(pageIndex, 'edition')}
                                    className={`px-2 py-0.5 text-[10px] rounded-lg transition-colors ${page.mode === 'edition'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Édition
                                </button>
                                <button
                                    onClick={() => setPageMode(pageIndex, 'layout')}
                                    className={`px-2 py-0.5 text-[10px] rounded-lg transition-colors ${page.mode === 'layout'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Layout
                                </button>
                                <button
                                    onClick={() => setPageMode(pageIndex, 'designer')}
                                    className={`px-2 py-0.5 text-[10px] rounded-lg transition-colors ${page.mode === 'designer'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Designer
                                </button>

                                {/* Config button — only in layout mode */}
                                {page.mode === 'layout' && (
                                    <div className="relative" ref={showConfig === pageIndex ? configRef : undefined}>
                                        <button
                                            onClick={() => setShowConfig(showConfig === pageIndex ? null : pageIndex)}
                                            className={`px-1.5 py-0.5 text-[10px] rounded-lg transition-colors ${showConfig === pageIndex
                                                ? 'bg-primary text-white'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            title="Configuration du layout"
                                        >
                                            <iconify-icon icon="solar:settings-bold" width="12"></iconify-icon>
                                        </button>

                                        {/* Config Dropdown */}
                                        {showConfig === pageIndex && (
                                            <div
                                                className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-3"
                                                style={{ minWidth: '220px' }}
                                            >
                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Options d'affichage</div>

                                                {/* Panel Mode Toggle */}
                                                <div
                                                    onClick={() => setPanelMode(prev => !prev)}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer' }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <iconify-icon icon="solar:widget-4-bold-duotone" width="18" style={{ color: '#6b7280' }}></iconify-icon>
                                                        <span className="text-sm text-gray-700 dark:text-gray-200">Mode Panels</span>
                                                    </div>
                                                    {/* Switch toggle — inline styles for reliability */}
                                                    <div style={{
                                                        position: 'relative',
                                                        width: '40px',
                                                        height: '22px',
                                                        borderRadius: '11px',
                                                        backgroundColor: panelMode ? 'var(--primary, #4361ee)' : '#d1d5db',
                                                        transition: 'background-color 0.2s',
                                                        cursor: 'pointer',
                                                        flexShrink: 0,
                                                    }}>
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '2px',
                                                            left: panelMode ? '20px' : '2px',
                                                            width: '18px',
                                                            height: '18px',
                                                            borderRadius: '50%',
                                                            backgroundColor: '#fff',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                                            transition: 'left 0.2s',
                                                        }} />
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px', marginLeft: '26px' }}>
                                                    {panelMode ? 'Éléments affichés en panels avec bordures' : 'Éléments compacts sans bordures'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Page */}
                            <EditorPage
                                page={page}
                                pageIndex={pageIndex}
                                doc={doc}
                                setDoc={setDoc}
                                pageRefs={pageRefs}
                                isSelected={selectedPageIndex === pageIndex}
                                onSelect={() => setSelectedPageIndex(pageIndex)}
                                handlePageInput={handlePageInput}
                                handlePaste={handlePaste}
                                handleKeyDown={handleKeyDown}
                                isGlobalSelection={isGlobalSelection}
                                panelMode={panelMode}
                                accountNumber={accountNumber}
                                documentId={doc._id}
                                sourceRecordId={doc.draftRecordId}
                            />

                            {/* Lock Overlay — visible on edition pages when layout/designer is active on ANY page */}
                            {page.mode === 'edition' && doc.pages.some((p, i) => i !== pageIndex && (p.mode === 'layout' || p.mode === 'designer')) && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 100,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '32px',
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(243, 244, 246, 0.75)',
                                        backdropFilter: 'blur(2px)',
                                        WebkitBackdropFilter: 'blur(2px)',
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: '#fff',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                                        border: '1px solid rgba(229, 231, 235, 0.8)',
                                        maxWidth: '320px',
                                    }}>
                                        <div style={{
                                            width: '48px', height: '48px',
                                            backgroundColor: '#fef3c7',
                                            color: '#d97706',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 16px',
                                        }}>
                                            <iconify-icon icon="solar:lock-bold-duotone" width="28"></iconify-icon>
                                        </div>
                                        <h4 style={{
                                            fontSize: '13px', fontWeight: 700,
                                            color: '#111827', marginBottom: '8px',
                                            textTransform: 'uppercase', letterSpacing: '0.05em',
                                        }}>
                                            Édition verrouillée
                                        </h4>
                                        <p style={{
                                            fontSize: '12px', color: '#6b7280',
                                            lineHeight: 1.6, margin: 0,
                                        }}>
                                            L'édition est désactivée car les pages{' '}
                                            <span style={{ fontWeight: 900, color: '#d97706' }}>
                                                [{doc.pages.map((p, i) => (p.mode === 'layout' || p.mode === 'designer') ? (i + 1) : null).filter(Boolean).join(', ')}]
                                            </span>{' '}
                                            sont en mode Layout.
                                        </p>
                                        <div style={{
                                            marginTop: '12px', fontSize: '10px',
                                            color: '#9ca3af', fontWeight: 500,
                                        }}>
                                            Repassez ces pages en mode Édition pour modifier ce contenu.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Page Button */}
                    <button
                        onClick={addPage}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-primary border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg hover:border-primary transition-colors"
                        data-print-hide="true"
                    >
                        <iconify-icon icon="tabler:plus" width="18"></iconify-icon>
                        <span className="text-sm">Ajouter une page</span>
                    </button>
                </div>
            </div>

            {/* Zoom Controls Bar — bottom center, floating */}
            <div
                data-print-hide="true"
                style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    background: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: isDark ? '1px solid rgba(75, 85, 99, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '10px',
                    padding: '4px 6px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                    zIndex: 30,
                    userSelect: 'none',
                }}
            >
                {/* Zoom Out */}
                <button
                    onClick={zoomOut}
                    disabled={zoomLevel <= ZOOM_MIN}
                    title="Zoom arrière (Ctrl + Scroll ↓)"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: isDark ? '#d1d5db' : '#64748b',
                        cursor: zoomLevel <= ZOOM_MIN ? 'not-allowed' : 'pointer',
                        opacity: zoomLevel <= ZOOM_MIN ? 0.3 : 1,
                        transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                        if (zoomLevel > ZOOM_MIN) e.currentTarget.style.background = isDark ? 'rgba(75,85,99,0.5)' : 'rgba(241,245,249,1)'
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                    <iconify-icon icon="tabler:minus" width="16"></iconify-icon>
                </button>

                {/* Zoom Level Indicator (clickable for presets) */}
                <div style={{ position: 'relative' }} ref={zoomPresetsRef}>
                    <button
                        onClick={() => setShowZoomPresets(!showZoomPresets)}
                        title="Niveaux de zoom"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '52px',
                            height: '28px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: isDark ? '#e5e7eb' : '#334155',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: 'Inter, system-ui, sans-serif',
                            letterSpacing: '-0.01em',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(75,85,99,0.5)' : 'rgba(241,245,249,1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                        {zoomPercent}%
                    </button>

                    {/* Zoom Presets Dropdown */}
                    {showZoomPresets && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '36px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: isDark ? '#1f2937' : '#ffffff',
                                border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '4px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                minWidth: '80px',
                                zIndex: 50,
                            }}
                        >
                            {ZOOM_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => {
                                        setZoomLevel(preset)
                                        setShowZoomPresets(false)
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '6px 12px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        background: zoomLevel === preset
                                            ? (isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)')
                                            : 'transparent',
                                        color: zoomLevel === preset
                                            ? '#3b82f6'
                                            : (isDark ? '#d1d5db' : '#475569'),
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: zoomLevel === preset ? 600 : 400,
                                        textAlign: 'center',
                                        transition: 'background 0.15s',
                                        fontFamily: 'Inter, system-ui, sans-serif',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (zoomLevel !== preset) e.currentTarget.style.background = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(241,245,249,1)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = zoomLevel === preset
                                            ? (isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)')
                                            : 'transparent'
                                    }}
                                >
                                    {Math.round(preset * 100)}%
                                </button>
                            ))}

                            {/* Divider */}
                            <div style={{
                                height: '1px',
                                background: isDark ? '#374151' : '#e2e8f0',
                                margin: '4px 0'
                            }} />

                            {/* Fit to width */}
                            <button
                                onClick={() => {
                                    setZoomLevel(1)
                                    setShowZoomPresets(false)
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    width: '100%',
                                    padding: '6px 12px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: isDark ? '#d1d5db' : '#475569',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    transition: 'background 0.15s',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(241,245,249,1)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                            >
                                <iconify-icon icon="tabler:arrows-maximize" width="13"></iconify-icon>
                                Réinitialiser
                            </button>
                        </div>
                    )}
                </div>

                {/* Zoom In */}
                <button
                    onClick={zoomIn}
                    disabled={zoomLevel >= ZOOM_MAX}
                    title="Zoom avant (Ctrl + Scroll ↑)"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: isDark ? '#d1d5db' : '#64748b',
                        cursor: zoomLevel >= ZOOM_MAX ? 'not-allowed' : 'pointer',
                        opacity: zoomLevel >= ZOOM_MAX ? 0.3 : 1,
                        transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                        if (zoomLevel < ZOOM_MAX) e.currentTarget.style.background = isDark ? 'rgba(75,85,99,0.5)' : 'rgba(241,245,249,1)'
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                    <iconify-icon icon="tabler:plus" width="16"></iconify-icon>
                </button>
            </div>
        </div>
    )
})

export default CanvasContainer

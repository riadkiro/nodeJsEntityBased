/**
 * DesignerCanvas — Free-form Canva-like design surface.
 * 
 * Renders all page.elements[] with absolute positioning on the A4 canvas.
 * Manages selection state, keyboard shortcuts, and element CRUD.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import DesignerElement from './DesignerElement'
import DesignerToolbar from './DesignerToolbar'

// Generate unique IDs
const uid = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// Default element factories
const ELEMENT_DEFAULTS = {
    text: (x, y) => ({
        id: uid(),
        type: 'text',
        x: x ?? 60,
        y: y ?? 60,
        width: 300,
        height: 60,
        rotation: 0,
        content: '<p>Tapez votre texte ici</p>',
        fill: '#000000',
        fontSize: 16,
        fontFamily: 'Arial',
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
    heading: (x, y) => ({
        id: uid(),
        type: 'text',
        x: x ?? 60,
        y: y ?? 60,
        width: 500,
        height: 60,
        rotation: 0,
        content: '<h2 style="font-weight:700;font-size:28px;margin:0">Titre</h2>',
        fill: '#000000',
        fontSize: 28,
        fontFamily: 'Arial',
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
    image: (x, y, src) => ({
        id: uid(),
        type: 'image',
        x: x ?? 100,
        y: y ?? 100,
        width: 300,
        height: 200,
        rotation: 0,
        src: src || '',
        alt: 'Image',
        borderRadius: 8,
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
    rect: (x, y) => ({
        id: uid(),
        type: 'shape',
        shape: 'rect',
        x: x ?? 100,
        y: y ?? 100,
        width: 200,
        height: 150,
        rotation: 0,
        fill: '#4361ee',
        stroke: 'transparent',
        strokeWidth: 0,
        borderRadius: 12,
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
    circle: (x, y) => ({
        id: uid(),
        type: 'shape',
        shape: 'circle',
        x: x ?? 100,
        y: y ?? 100,
        width: 150,
        height: 150,
        rotation: 0,
        fill: '#f59e0b',
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
    triangle: (x, y) => ({
        id: uid(),
        type: 'shape',
        shape: 'triangle',
        x: x ?? 100,
        y: y ?? 100,
        width: 160,
        height: 140,
        rotation: 0,
        fill: '#10b981',
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
    star: (x, y) => ({
        id: uid(),
        type: 'shape',
        shape: 'star',
        x: x ?? 100,
        y: y ?? 100,
        width: 150,
        height: 150,
        rotation: 0,
        fill: '#ef4444',
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
    line: (x, y) => ({
        id: uid(),
        type: 'line',
        x: x ?? 60,
        y: y ?? 200,
        width: 400,
        height: 6,
        rotation: 0,
        fill: '#64748b',
        strokeWidth: 2,
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
    frame: (x, y, frameShape = 'rect') => {
        const dims = {
            rect: { width: 280, height: 180 },
            rounded: { width: 280, height: 180 },
            circle: { width: 180, height: 180 },
            square: { width: 180, height: 180 },
            portrait: { width: 180, height: 240 },
            wide: { width: 360, height: 140 },
        }[frameShape] || { width: 280, height: 180 }

        return {
            id: uid(),
            type: 'frame',
            frameShape,
            x: x ?? 100,
            y: y ?? 100,
            width: dims.width,
            height: dims.height,
            rotation: 0,
            src: '',
            alt: 'Cadre image',
            objectPosition: '50% 50%',
            opacity: 1,
            zIndex: 1,
            locked: false
        }
    },
}

export default function DesignerCanvas({
    page,
    pageIndex,
    doc,
    setDoc,
    zoom = 1
}) {
    const [selectedId, setSelectedId] = useState(null)
    const canvasRef = useRef(null)

    const elements = page.elements || []

    // ==================== CRUD ====================
    const updateElements = useCallback((newElements) => {
        setDoc(prev => {
            const pages = [...prev.pages]
            pages[pageIndex] = { ...pages[pageIndex], elements: newElements }
            return { ...prev, pages }
        })
    }, [pageIndex, setDoc])

    const addElement = useCallback((type, extra, position) => {
        const factory = ELEMENT_DEFAULTS[type]
        if (!factory) return

        // Stack elements with offset so they don't overlap
        const count = elements.length
        const offsetX = (count % 5) * 20
        const offsetY = (count % 5) * 20

        const newEl = factory(position?.x ?? (60 + offsetX), position?.y ?? (60 + offsetY), extra)
        // Set zIndex to max + 1
        const maxZ = elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0)
        newEl.zIndex = maxZ + 1

        updateElements([...elements, newEl])
        setSelectedId(newEl.id)
    }, [elements, updateElements])

    const updateElement = useCallback((updatedEl) => {
        updateElements(elements.map(el => el.id === updatedEl.id ? updatedEl : el))
    }, [elements, updateElements])

    const deleteElement = useCallback((id) => {
        updateElements(elements.filter(el => el.id !== id))
        if (selectedId === id) setSelectedId(null)
    }, [elements, updateElements, selectedId])

    const duplicateElement = useCallback((id) => {
        const el = elements.find(e => e.id === id)
        if (!el) return
        const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex || 0), 0)
        const dup = { ...el, id: uid(), x: el.x + 20, y: el.y + 20, zIndex: maxZ + 1 }
        updateElements([...elements, dup])
        setSelectedId(dup.id)
    }, [elements, updateElements])

    const bringForward = useCallback((id) => {
        const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex || 0), 0)
        updateElements(elements.map(el => el.id === id ? { ...el, zIndex: maxZ + 1 } : el))
    }, [elements, updateElements])

    const sendBackward = useCallback((id) => {
        const minZ = elements.reduce((min, e) => Math.min(min, e.zIndex || 0), Infinity)
        updateElements(elements.map(el => el.id === id ? { ...el, zIndex: Math.max(0, minZ - 1) } : el))
    }, [elements, updateElements])

    // ==================== CANVAS CLICK (deselect) ====================
    const handleCanvasClick = useCallback((e) => {
        if (e.target === canvasRef.current || e.target.dataset.designerBg !== undefined) {
            setSelectedId(null)
        }
    }, [])

    // ==================== SIDEBAR INSERTION ====================
    useEffect(() => {
        const handleDesignerAddElement = (event) => {
            const detail = event.detail || {}
            if (!detail.type) return
            addElement(detail.type, detail.frameShape || detail.src || null)
        }

        window.addEventListener('document-designer-add-element', handleDesignerAddElement)
        return () => window.removeEventListener('document-designer-add-element', handleDesignerAddElement)
    }, [addElement])

    const getDropPosition = useCallback((event) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return null
        return {
            x: Math.max(0, Math.round((event.clientX - rect.left) / zoom)),
            y: Math.max(0, Math.round((event.clientY - rect.top) / zoom)),
        }
    }, [zoom])

    const handleDragOver = useCallback((e) => {
        if (!e.dataTransfer.types.includes('application/x-designer-tool')) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    }, [])

    const handleDrop = useCallback((e) => {
        if (!e.dataTransfer.types.includes('application/x-designer-tool')) return
        e.preventDefault()

        try {
            const detail = JSON.parse(e.dataTransfer.getData('application/x-designer-tool') || '{}')
            if (!detail.type) return
            addElement(detail.type, detail.frameShape || detail.src || null, getDropPosition(e))
        } catch (error) {
            console.warn('[DesignerCanvas] Invalid designer tool payload:', error)
        }
    }, [addElement, getDropPosition])

    const selectedElement = elements.find(el => el.id === selectedId)

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* ==================== CANVAS ==================== */}
            <div
                ref={canvasRef}
                data-designer-bg
                onClick={handleCanvasClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    cursor: 'default',
                }}
            >
                {/* Grid background (subtle, Canva-like) */}
                <div
                    data-designer-bg
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(circle, #e2e8f0 0.7px, transparent 0.7px)',
                        backgroundSize: '20px 20px',
                        opacity: 0.5,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* Elements */}
                {elements.map(el => (
                    <DesignerElement
                        key={el.id}
                        element={el}
                        isSelected={selectedId === el.id}
                        onSelect={setSelectedId}
                        onUpdate={updateElement}
                        onDelete={deleteElement}
                        canvasRef={canvasRef}
                        zoom={zoom}
                    />
                ))}

                {/* Empty state */}
                {elements.length === 0 && (
                    <div
                        data-designer-bg
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            pointerEvents: 'none',
                            zIndex: 1,
                        }}
                    >
                        <iconify-icon icon="solar:pallete-2-bold-duotone" width="48" style={{ color: '#cbd5e1' }}></iconify-icon>
                        <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
                            Utilisez la barre gauche pour ajouter des éléments
                        </span>
                        <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
                            Texte · Formes · Cadres
                        </span>
                    </div>
                )}
            </div>

            {/* ==================== CONTEXTUAL TOOLBAR ==================== */}
            {selectedElement && (
                <DesignerToolbar
                    element={selectedElement}
                    onUpdate={updateElement}
                    onDelete={deleteElement}
                    onDuplicate={duplicateElement}
                    onBringForward={bringForward}
                    onSendBackward={sendBackward}
                />
            )}
        </div>
    )
}

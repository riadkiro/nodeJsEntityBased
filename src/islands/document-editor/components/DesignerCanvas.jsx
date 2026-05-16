/**
 * DesignerCanvas — Free-form Canva-like design surface.
 * 
 * Renders all page.elements[] with absolute positioning on the A4 canvas.
 * Manages selection state, keyboard shortcuts, and element CRUD.
 * Includes an inline element insertion toolbar.
 */
import React, { useState, useRef, useCallback } from 'react'
import DesignerElement from './DesignerElement'
import DesignerToolbar from './DesignerToolbar'

// Generate unique IDs
const uid = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// Default element factories
const ELEMENT_DEFAULTS = {
    text: (x, y) => ({
        id: uid(),
        type: 'text',
        x: x || 60,
        y: y || 60,
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
        x: x || 60,
        y: y || 60,
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
        x: x || 100,
        y: y || 100,
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
        x: x || 100,
        y: y || 100,
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
        x: x || 100,
        y: y || 100,
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
        x: x || 100,
        y: y || 100,
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
        x: x || 100,
        y: y || 100,
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
        x: x || 60,
        y: y || 200,
        width: 400,
        height: 6,
        rotation: 0,
        fill: '#64748b',
        strokeWidth: 2,
        opacity: 1,
        zIndex: 1,
        locked: false
    }),
}

export default function DesignerCanvas({
    page,
    pageIndex,
    doc,
    setDoc,
    zoom = 1
}) {
    const [selectedId, setSelectedId] = useState(null)
    const [showImageInput, setShowImageInput] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [showShapeMenu, setShowShapeMenu] = useState(false)
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

    const addElement = useCallback((type, extra) => {
        const factory = ELEMENT_DEFAULTS[type]
        if (!factory) return

        // Stack elements with offset so they don't overlap
        const count = elements.length
        const offsetX = (count % 5) * 20
        const offsetY = (count % 5) * 20

        const newEl = factory(60 + offsetX, 60 + offsetY, extra)
        // Set zIndex to max + 1
        const maxZ = elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0)
        newEl.zIndex = maxZ + 1

        updateElements([...elements, newEl])
        setSelectedId(newEl.id)
        setShowShapeMenu(false)
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
            setShowShapeMenu(false)
        }
    }, [])

    // ==================== IMAGE URL SUBMIT ====================
    const handleImageSubmit = useCallback(() => {
        if (imageUrl.trim()) {
            addElement('image', imageUrl.trim())
            setImageUrl('')
            setShowImageInput(false)
        }
    }, [imageUrl, addElement])

    const selectedElement = elements.find(el => el.id === selectedId)

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* ==================== INSERTION TOOLBAR ==================== */}
            <div
                style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    zIndex: 200,
                    pointerEvents: 'auto'
                }}
                data-print-hide="true"
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '10px',
                    padding: '4px 6px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}>
                    {/* Text */}
                    <button
                        onClick={() => addElement('text')}
                        title="Ajouter un texte"
                        style={toolBtnStyle}
                    >
                        <iconify-icon icon="solar:text-bold-duotone" width="18" style={{ color: '#6366f1' }}></iconify-icon>
                    </button>

                    {/* Heading */}
                    <button
                        onClick={() => addElement('heading')}
                        title="Ajouter un titre"
                        style={toolBtnStyle}
                    >
                        <iconify-icon icon="solar:text-bold" width="18" style={{ color: '#8b5cf6' }}></iconify-icon>
                    </button>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

                    {/* Image */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowImageInput(!showImageInput)}
                            title="Ajouter une image"
                            style={toolBtnStyle}
                        >
                            <iconify-icon icon="solar:gallery-bold-duotone" width="18" style={{ color: '#f59e0b' }}></iconify-icon>
                        </button>

                        {/* Image URL Input Dropdown */}
                        {showImageInput && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                marginTop: '8px',
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '10px',
                                padding: '12px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                zIndex: 300,
                                width: '280px'
                            }}>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>
                                    URL de l'image
                                </label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleImageSubmit() }}
                                        placeholder="https://..."
                                        autoFocus
                                        style={{
                                            flex: 1,
                                            padding: '6px 10px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            outline: 'none',
                                        }}
                                    />
                                    <button
                                        onClick={handleImageSubmit}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#4361ee',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

                    {/* Shapes */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowShapeMenu(!showShapeMenu)}
                            title="Formes"
                            style={toolBtnStyle}
                        >
                            <iconify-icon icon="solar:shapes-bold-duotone" width="18" style={{ color: '#4361ee' }}></iconify-icon>
                            <iconify-icon icon="tabler:chevron-down" width="10" style={{ color: '#94a3b8', marginLeft: '-2px' }}></iconify-icon>
                        </button>

                        {/* Shapes Dropdown */}
                        {showShapeMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                marginTop: '8px',
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '10px',
                                padding: '8px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                zIndex: 300,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '4px',
                                width: '160px'
                            }}>
                                {[
                                    { type: 'rect', icon: 'solar:square-bold-duotone', label: 'Rectangle', color: '#4361ee' },
                                    { type: 'circle', icon: 'solar:round-sort-horizontal-bold-duotone', label: 'Cercle', color: '#f59e0b' },
                                    { type: 'triangle', icon: 'solar:sort-from-bottom-to-top-bold-duotone', label: 'Triangle', color: '#10b981' },
                                    { type: 'star', icon: 'solar:star-bold-duotone', label: 'Étoile', color: '#ef4444' },
                                ].map(s => (
                                    <button
                                        key={s.type}
                                        onClick={() => addElement(s.type)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '10px 6px',
                                            border: 'none',
                                            background: 'transparent',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                    >
                                        <iconify-icon icon={s.icon} width="24" style={{ color: s.color }}></iconify-icon>
                                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Line */}
                    <button
                        onClick={() => addElement('line')}
                        title="Ajouter une ligne"
                        style={toolBtnStyle}
                    >
                        <iconify-icon icon="solar:minus-circle-bold-duotone" width="18" style={{ color: '#64748b' }}></iconify-icon>
                    </button>
                </div>
            </div>

            {/* ==================== CANVAS ==================== */}
            <div
                ref={canvasRef}
                data-designer-bg
                onClick={handleCanvasClick}
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
                            Utilisez la barre d'outils pour ajouter des éléments
                        </span>
                        <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
                            Texte · Images · Formes · Lignes
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

// Shared style for toolbar buttons
const toolBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 8px',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
}

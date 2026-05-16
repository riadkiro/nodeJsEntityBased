/**
 * DesignerElement — A single free-positioned element on the designer canvas.
 * 
 * Supports: drag to move, 8-handle resize, rotation, inline text editing.
 * Uses vanilla mouse events for maximum positioning control (no external drag lib).
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'

// Resize handle positions
const HANDLES = [
    { id: 'tl', cursor: 'nwse-resize', x: 0, y: 0 },
    { id: 'tc', cursor: 'ns-resize', x: 0.5, y: 0 },
    { id: 'tr', cursor: 'nesw-resize', x: 1, y: 0 },
    { id: 'ml', cursor: 'ew-resize', x: 0, y: 0.5 },
    { id: 'mr', cursor: 'ew-resize', x: 1, y: 0.5 },
    { id: 'bl', cursor: 'nesw-resize', x: 0, y: 1 },
    { id: 'bc', cursor: 'ns-resize', x: 0.5, y: 1 },
    { id: 'br', cursor: 'nwse-resize', x: 1, y: 1 },
]

export default function DesignerElement({
    element,
    isSelected,
    onSelect,
    onUpdate,
    onDelete,
    canvasRef,
    zoom = 1
}) {
    const [editing, setEditing] = useState(false)
    const [dragging, setDragging] = useState(false)
    const elementRef = useRef(null)
    const contentRef = useRef(null)
    const dragStart = useRef({ x: 0, y: 0, elX: 0, elY: 0 })

    // ==================== DRAG TO MOVE ====================
    const handleMouseDown = useCallback((e) => {
        if (editing) return
        if (e.target.closest('[data-resize-handle]') || e.target.closest('[data-rotation-handle]')) return
        e.preventDefault()
        e.stopPropagation()

        onSelect(element.id)
        setDragging(true)

        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            elX: element.x,
            elY: element.y
        }

        const handleMove = (ev) => {
            const dx = (ev.clientX - dragStart.current.x) / zoom
            const dy = (ev.clientY - dragStart.current.y) / zoom
            onUpdate({
                ...element,
                x: Math.round(dragStart.current.elX + dx),
                y: Math.round(dragStart.current.elY + dy)
            })
        }

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove)
            document.removeEventListener('mouseup', handleUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            setDragging(false)
        }

        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseup', handleUp)
        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
    }, [element, editing, onSelect, onUpdate, zoom])

    // ==================== RESIZE ====================
    const handleResizeStart = useCallback((e, handleId) => {
        e.preventDefault()
        e.stopPropagation()

        const startX = e.clientX
        const startY = e.clientY
        const startEl = { x: element.x, y: element.y, width: element.width, height: element.height }

        const handleMove = (ev) => {
            const dx = (ev.clientX - startX) / zoom
            const dy = (ev.clientY - startY) / zoom
            const newEl = { ...element }

            // Apply resize based on handle position
            switch (handleId) {
                case 'br':
                    newEl.width = Math.max(30, startEl.width + dx)
                    newEl.height = Math.max(20, startEl.height + dy)
                    break
                case 'bl':
                    newEl.x = startEl.x + dx
                    newEl.width = Math.max(30, startEl.width - dx)
                    newEl.height = Math.max(20, startEl.height + dy)
                    break
                case 'tr':
                    newEl.y = startEl.y + dy
                    newEl.width = Math.max(30, startEl.width + dx)
                    newEl.height = Math.max(20, startEl.height - dy)
                    break
                case 'tl':
                    newEl.x = startEl.x + dx
                    newEl.y = startEl.y + dy
                    newEl.width = Math.max(30, startEl.width - dx)
                    newEl.height = Math.max(20, startEl.height - dy)
                    break
                case 'tc':
                    newEl.y = startEl.y + dy
                    newEl.height = Math.max(20, startEl.height - dy)
                    break
                case 'bc':
                    newEl.height = Math.max(20, startEl.height + dy)
                    break
                case 'ml':
                    newEl.x = startEl.x + dx
                    newEl.width = Math.max(30, startEl.width - dx)
                    break
                case 'mr':
                    newEl.width = Math.max(30, startEl.width + dx)
                    break
            }

            newEl.x = Math.round(newEl.x)
            newEl.y = Math.round(newEl.y)
            newEl.width = Math.round(newEl.width)
            newEl.height = Math.round(newEl.height)
            onUpdate(newEl)
        }

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove)
            document.removeEventListener('mouseup', handleUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseup', handleUp)
        document.body.style.userSelect = 'none'
    }, [element, onUpdate, zoom])

    // ==================== ROTATION ====================
    const handleRotationStart = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()

        const rect = elementRef.current?.getBoundingClientRect()
        if (!rect) return

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const handleMove = (ev) => {
            const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX)
            let degrees = Math.round((angle * 180) / Math.PI + 90)
            if (degrees < 0) degrees += 360

            // Snap to 15° increments if shift is held
            if (ev.shiftKey) {
                degrees = Math.round(degrees / 15) * 15
            }

            onUpdate({ ...element, rotation: degrees })
        }

        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove)
            document.removeEventListener('mouseup', handleUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseup', handleUp)
        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
    }, [element, onUpdate])

    // ==================== INLINE TEXT EDITING ====================
    const handleDoubleClick = useCallback((e) => {
        if (element.type !== 'text') return
        e.preventDefault()
        e.stopPropagation()
        setEditing(true)
        // Focus the contenteditable after render
        requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.focus()
                // Place cursor at end
                const sel = window.getSelection()
                const range = document.createRange()
                range.selectNodeContents(contentRef.current)
                range.collapse(false)
                sel.removeAllRanges()
                sel.addRange(range)
            }
        })
    }, [element.type])

    const handleBlur = useCallback(() => {
        setEditing(false)
        if (contentRef.current) {
            const newContent = contentRef.current.innerHTML
            if (newContent !== element.content) {
                onUpdate({ ...element, content: newContent })
            }
        }
    }, [element, onUpdate])

    // ==================== KEYBOARD ====================
    useEffect(() => {
        if (!isSelected) return
        const handleKey = (e) => {
            if (editing) return
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault()
                onDelete(element.id)
            }
            // Arrow keys for nudging
            const step = e.shiftKey ? 10 : 1
            if (e.key === 'ArrowUp') { e.preventDefault(); onUpdate({ ...element, y: element.y - step }) }
            if (e.key === 'ArrowDown') { e.preventDefault(); onUpdate({ ...element, y: element.y + step }) }
            if (e.key === 'ArrowLeft') { e.preventDefault(); onUpdate({ ...element, x: element.x - step }) }
            if (e.key === 'ArrowRight') { e.preventDefault(); onUpdate({ ...element, x: element.x + step }) }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [isSelected, editing, element, onUpdate, onDelete])

    // ==================== RENDER CONTENT ====================
    const renderContent = () => {
        switch (element.type) {
            case 'text':
                if (editing) {
                    return (
                        <div
                            ref={contentRef}
                            contentEditable
                            suppressContentEditableWarning
                            dangerouslySetInnerHTML={{ __html: element.content || '<p>Tapez votre texte</p>' }}
                            onBlur={handleBlur}
                            style={{
                                width: '100%',
                                height: '100%',
                                outline: 'none',
                                cursor: 'text',
                                overflow: 'hidden',
                                fontSize: `${element.fontSize || 16}px`,
                                fontFamily: element.fontFamily || 'Arial',
                                color: element.fill || '#000000',
                                lineHeight: 1.5,
                                padding: '4px 6px',
                                wordWrap: 'break-word'
                            }}
                        />
                    )
                }
                return (
                    <div
                        dangerouslySetInnerHTML={{ __html: element.content || '<p style="color:#999">Tapez votre texte</p>' }}
                        style={{
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            fontSize: `${element.fontSize || 16}px`,
                            fontFamily: element.fontFamily || 'Arial',
                            color: element.fill || '#000000',
                            lineHeight: 1.5,
                            padding: '4px 6px',
                            wordWrap: 'break-word',
                            pointerEvents: 'none'
                        }}
                    />
                )

            case 'image':
                return (
                    <img
                        src={element.src}
                        alt={element.alt || ''}
                        draggable={false}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: `${element.borderRadius || 0}px`,
                            pointerEvents: 'none'
                        }}
                    />
                )

            case 'shape':
                return renderShape()

            case 'line':
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            width: '100%',
                            height: `${element.strokeWidth || 2}px`,
                            background: element.fill || '#000000',
                            borderRadius: '1px'
                        }} />
                    </div>
                )

            default:
                return <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }} />
        }
    }

    const renderShape = () => {
        const fill = element.fill || '#4361ee'
        const stroke = element.stroke || 'transparent'
        const strokeWidth = element.strokeWidth || 0
        const borderRadius = element.borderRadius || 0

        switch (element.shape) {
            case 'circle':
                return (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <ellipse cx="50" cy="50" rx={50 - strokeWidth} ry={50 - strokeWidth}
                            fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                    </svg>
                )
            case 'triangle':
                return (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon points="50,2 98,98 2,98"
                            fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                    </svg>
                )
            case 'star':
                return (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon points="50,2 61,35 97,35 68,57 79,91 50,70 21,91 32,57 3,35 39,35"
                            fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                    </svg>
                )
            case 'rect':
            default:
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: fill,
                        border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : 'none',
                        borderRadius: `${borderRadius}px`
                    }} />
                )
        }
    }

    // ==================== MAIN RENDER ====================
    return (
        <div
            ref={elementRef}
            data-designer-element={element.id}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            style={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: element.height === 'auto' ? 'auto' : `${element.height}px`,
                minHeight: '20px',
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                transformOrigin: 'center center',
                zIndex: element.zIndex || 1,
                opacity: element.opacity ?? 1,
                cursor: editing ? 'text' : (dragging ? 'grabbing' : 'grab'),
                outline: isSelected ? '2px solid #4361ee' : (element.type === 'text' && !element.content ? '1px dashed #ccc' : 'none'),
                boxShadow: isSelected ? '0 0 0 1px rgba(67,97,238,0.2), 0 4px 12px rgba(0,0,0,0.08)' : 'none',
                transition: dragging ? 'none' : 'box-shadow 0.15s',
                userSelect: editing ? 'text' : 'none',
            }}
        >
            {/* Element Content */}
            {renderContent()}

            {/* Selection UI — only when selected and not editing */}
            {isSelected && !editing && (
                <>
                    {/* Resize Handles */}
                    {HANDLES.map(h => (
                        <div
                            key={h.id}
                            data-resize-handle={h.id}
                            onMouseDown={(e) => handleResizeStart(e, h.id)}
                            style={{
                                position: 'absolute',
                                left: `calc(${h.x * 100}% - 5px)`,
                                top: `calc(${h.y * 100}% - 5px)`,
                                width: '10px',
                                height: '10px',
                                background: '#ffffff',
                                border: '2px solid #4361ee',
                                borderRadius: '2px',
                                cursor: h.cursor,
                                zIndex: 100,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                transition: 'transform 0.1s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.3)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                        />
                    ))}

                    {/* Rotation Handle */}
                    <div
                        data-rotation-handle
                        onMouseDown={handleRotationStart}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '-32px',
                            transform: 'translateX(-50%)',
                            width: '20px',
                            height: '20px',
                            background: '#ffffff',
                            border: '2px solid #4361ee',
                            borderRadius: '50%',
                            cursor: 'grab',
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            <polyline points="17 2 21 3.5 21 8" />
                        </svg>
                    </div>

                    {/* Rotation connector line */}
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '-22px',
                        width: '1px',
                        height: '22px',
                        background: '#4361ee',
                        transform: 'translateX(-50%)',
                        zIndex: 99,
                        opacity: 0.5
                    }} />
                </>
            )}
        </div>
    )
}

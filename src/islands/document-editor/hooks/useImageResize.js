/**
 * useImageResize Hook
 * Provides image selection and resize functionality for contenteditable elements
 * 
 * Pattern: document-level pointerdown capture for reliable single-click
 */
import { useEffect, useCallback, useRef, useState } from 'react'

export function useImageResize(containerRef, onContentChange) {
    const [selectedImage, setSelectedImage] = useState(null)
    const [isResizing, setIsResizing] = useState(false)
    const resizeDataRef = useRef(null)
    const overlayRef = useRef(null)

    const removeResizeOverlay = useCallback(() => {
        if (overlayRef.current) {
            overlayRef.current.remove()
            overlayRef.current = null
        }
        const container = containerRef.current
        if (container) {
            container.querySelectorAll('[data-image-resize-overlay]').forEach(el => el.remove())
        }
    }, [containerRef])

    // Handle resize move - only when resizing is active
    const handleResizeMove = useCallback((e) => {
        if (!resizeDataRef.current) return

        const { img, handle, startX, startWidth, aspectRatio } = resizeDataRef.current
        const deltaX = e.clientX - startX

        let newWidth = startWidth
        if (handle === 'se' || handle === 'ne') newWidth = Math.max(50, startWidth + deltaX)
        if (handle === 'sw' || handle === 'nw') newWidth = Math.max(50, startWidth - deltaX)

        const newHeight = newWidth / aspectRatio

        img.style.width = `${newWidth}px`
        img.style.height = `${newHeight}px`
        img.setAttribute('width', Math.round(newWidth))
        img.setAttribute('height', Math.round(newHeight))

        if (overlayRef.current) {
            overlayRef.current.style.width = `${newWidth}px`
            overlayRef.current.style.height = `${newHeight}px`
        }
    }, [])

    // Handle resize end - cleanup listeners
    const handleResizeEnd = useCallback((e) => {
        if (!resizeDataRef.current) return

        document.removeEventListener('pointermove', handleResizeMove)
        document.removeEventListener('pointerup', handleResizeEnd)
        document.removeEventListener('pointercancel', handleResizeEnd)

        if (onContentChange) onContentChange()

        resizeDataRef.current = null
        setIsResizing(false)
    }, [handleResizeMove, onContentChange])

    // Handle resize start
    const handleResizeStart = useCallback((e, img, handle) => {
        e.preventDefault()
        e.stopPropagation()

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = img.offsetWidth
        const startHeight = img.offsetHeight
        const aspectRatio = startWidth / startHeight

        resizeDataRef.current = { img, handle, startX, startY, startWidth, startHeight, aspectRatio }
        setIsResizing(true)

        document.addEventListener('pointermove', handleResizeMove)
        document.addEventListener('pointerup', handleResizeEnd)
        document.addEventListener('pointercancel', handleResizeEnd)
    }, [handleResizeMove, handleResizeEnd])

    const createResizeOverlay = useCallback((img) => {
        removeResizeOverlay()

        const overlay = document.createElement('div')
        overlay.className = 'image-resize-overlay'
        overlay.setAttribute('data-image-resize-overlay', '1')

        const container = containerRef.current
        if (!container) return null

        // Robust position: rect relative to container rect
        const imgRect = img.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        const left = imgRect.left - containerRect.left + container.scrollLeft
        const top = imgRect.top - containerRect.top + container.scrollTop
        const width = imgRect.width
        const height = imgRect.height

        overlay.style.cssText = `
      position: absolute;
      left: ${left}px;
      top: ${top}px;
      width: ${width}px;
      height: ${height}px;
      border: 2px solid #3b82f6;
      pointer-events: none;
      z-index: 1000;
      box-sizing: border-box;
    `

        const handles = ['nw', 'ne', 'sw', 'se']
        handles.forEach(pos => {
            const handle = document.createElement('div')
            handle.className = `resize-handle resize-handle-${pos}`
            handle.setAttribute('data-handle', pos)
            handle.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 2px;
        pointer-events: auto;
        cursor: ${pos === 'nw' || pos === 'se' ? 'nwse-resize' : 'nesw-resize'};
        box-sizing: border-box;
      `
            if (pos.includes('n')) handle.style.top = '-6px'
            if (pos.includes('s')) handle.style.bottom = '-6px'
            if (pos.includes('w')) handle.style.left = '-6px'
            if (pos.includes('e')) handle.style.right = '-6px'

            handle.addEventListener('pointerdown', (e) => handleResizeStart(e, img, pos))
            overlay.appendChild(handle)
        })

        // ensure positioning context
        const cs = window.getComputedStyle(container)
        if (cs.position === 'static') container.style.position = 'relative'

        container.appendChild(overlay)
        overlayRef.current = overlay
        return overlay
    }, [containerRef, removeResizeOverlay, handleResizeStart])

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && selectedImage) {
            setSelectedImage(null)
            removeResizeOverlay()
        }
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedImage && !isResizing) {
            e.preventDefault()
            selectedImage.remove()
            setSelectedImage(null)
            removeResizeOverlay()
            onContentChange?.()
        }
    }, [selectedImage, isResizing, removeResizeOverlay, onContentChange])

    // Document-level pointerdown capture for single-click selection
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const onPointerDownCapture = (e) => {
            // Skip if currently resizing
            if (isResizing) return

            const img = e.target?.closest?.('img')
            const isOverlay = e.target?.closest?.('[data-image-resize-overlay]')

            // Click on resize handles => let handleResizeStart manage it
            if (isOverlay) return

            if (img && container.contains(img)) {
                // Single click select
                e.preventDefault()
                e.stopPropagation()

                setSelectedImage(img)
                createResizeOverlay(img)
                return
            }

            // Click elsewhere inside container => deselect
            if (container.contains(e.target)) {
                setSelectedImage(null)
                removeResizeOverlay()
            }
        }

        document.addEventListener('pointerdown', onPointerDownCapture, true)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('pointerdown', onPointerDownCapture, true)
            document.removeEventListener('keydown', handleKeyDown)
            removeResizeOverlay()
        }
    }, [containerRef, createResizeOverlay, removeResizeOverlay, handleKeyDown, isResizing])

    return {
        selectedImage,
        isResizing,
        deselectImage: () => {
            setSelectedImage(null)
            removeResizeOverlay()
        }
    }
}
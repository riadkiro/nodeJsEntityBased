/**
 * useImageResize Hook
 * Provides image selection and resize functionality for contenteditable elements
 * 
 * Pattern: document-level pointerdown capture for reliable single-click
 * Enhanced: touch support for tablet resize, image alignment via toolbar
 */
import { useEffect, useCallback, useRef, useState } from 'react'

// Module-level ref for cross-component access (formatUtils reads this)
let _globalSelectedImage = null
export function getSelectedImage() { return _globalSelectedImage }

export function useImageResize(containerRef, onContentChange) {
    const [selectedImage, setSelectedImage] = useState(null)
    const [isResizing, setIsResizing] = useState(false)
    const resizeDataRef = useRef(null)
    const overlayRef = useRef(null)

    // Keep module-level ref in sync
    useEffect(() => {
        _globalSelectedImage = selectedImage
        // Mark selected image with data attribute for CSS
        if (selectedImage) {
            selectedImage.setAttribute('data-image-selected', '1')
        }
        return () => {
            _globalSelectedImage = null
            if (selectedImage) {
                selectedImage.removeAttribute('data-image-selected')
            }
        }
    }, [selectedImage])

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

    // Unified move handler - works with both pointer and touch events
    const handleResizeMove = useCallback((e) => {
        if (!resizeDataRef.current) return

        // Get clientX from pointer or touch event
        const clientX = e.touches ? e.touches[0].clientX : e.clientX

        const { img, handle, startX, startWidth, aspectRatio } = resizeDataRef.current
        const deltaX = clientX - startX

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

        // Prevent scrolling during resize on touch
        if (e.cancelable) e.preventDefault()
    }, [])

    // Handle resize end - cleanup listeners
    const handleResizeEnd = useCallback((e) => {
        if (!resizeDataRef.current) return

        document.removeEventListener('pointermove', handleResizeMove)
        document.removeEventListener('pointerup', handleResizeEnd)
        document.removeEventListener('pointercancel', handleResizeEnd)
        document.removeEventListener('touchmove', handleResizeMove)
        document.removeEventListener('touchend', handleResizeEnd)
        document.removeEventListener('touchcancel', handleResizeEnd)

        // Reposition overlay to match new image size/position
        const img = resizeDataRef.current.img
        if (img && overlayRef.current) {
            repositionOverlay(img)
        }

        if (onContentChange) onContentChange()

        resizeDataRef.current = null
        setIsResizing(false)
    }, [handleResizeMove, onContentChange])

    // Reposition overlay to match current image rect
    const repositionOverlay = useCallback((img) => {
        const container = containerRef.current
        if (!container || !overlayRef.current) return

        const imgRect = img.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        const left = imgRect.left - containerRect.left + container.scrollLeft
        const top = imgRect.top - containerRect.top + container.scrollTop

        overlayRef.current.style.left = `${left}px`
        overlayRef.current.style.top = `${top}px`
        overlayRef.current.style.width = `${imgRect.width}px`
        overlayRef.current.style.height = `${imgRect.height}px`
    }, [containerRef])

    // Handle resize start - supports both pointer and touch
    const handleResizeStart = useCallback((e, img, handle) => {
        e.preventDefault()
        e.stopPropagation()

        // Get clientX/Y from pointer or touch
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        const startWidth = img.offsetWidth
        const startHeight = img.offsetHeight
        const aspectRatio = startWidth / startHeight

        resizeDataRef.current = { img, handle, startX: clientX, startY: clientY, startWidth, startHeight, aspectRatio }
        setIsResizing(true)

        // Listen for both pointer and touch events
        document.addEventListener('pointermove', handleResizeMove)
        document.addEventListener('pointerup', handleResizeEnd)
        document.addEventListener('pointercancel', handleResizeEnd)
        document.addEventListener('touchmove', handleResizeMove, { passive: false })
        document.addEventListener('touchend', handleResizeEnd)
        document.addEventListener('touchcancel', handleResizeEnd)
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
        width: 16px;
        height: 16px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 3px;
        pointer-events: auto;
        cursor: ${pos === 'nw' || pos === 'se' ? 'nwse-resize' : 'nesw-resize'};
        box-sizing: border-box;
        touch-action: none;
      `
            if (pos.includes('n')) handle.style.top = '-9px'
            if (pos.includes('s')) handle.style.bottom = '-9px'
            if (pos.includes('w')) handle.style.left = '-9px'
            if (pos.includes('e')) handle.style.right = '-9px'

            // Pointer events (mouse + stylus)
            handle.addEventListener('pointerdown', (e) => handleResizeStart(e, img, pos))
            // Touch events (tablet finger)
            handle.addEventListener('touchstart', (e) => {
                e.preventDefault() // Prevent scrolling
                handleResizeStart(e, img, pos)
            }, { passive: false })

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
            const isImagePlaceholder = e.target?.closest?.('.doc-image-placeholder')

            // Click on resize handles => let handleResizeStart manage it
            if (isOverlay) return
            if (isImagePlaceholder && container.contains(isImagePlaceholder)) return

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

    // Listen for alignment changes from toolbar (formatUtils dispatches this)
    useEffect(() => {
        const handleAlignChanged = () => {
            if (selectedImage && overlayRef.current) {
                requestAnimationFrame(() => {
                    repositionOverlay(selectedImage)
                })
            }
        }
        document.addEventListener('image-align-changed', handleAlignChanged)
        return () => document.removeEventListener('image-align-changed', handleAlignChanged)
    }, [selectedImage, repositionOverlay])

    /**
     * Apply alignment to the selected image's parent block
     * Called from EditorHeader alignment buttons when image is selected
     */
    const alignImage = useCallback((alignment) => {
        if (!selectedImage) return false

        // Find the parent block element (p, div, etc.) that contains the image
        let block = selectedImage.parentElement
        const container = containerRef.current

        // Climb to the nearest block-level parent within the contenteditable
        while (block && block !== container) {
            const display = window.getComputedStyle(block).display
            if (display === 'block' || display === 'flex' || ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI'].includes(block.tagName)) {
                break
            }
            block = block.parentElement
        }

        if (!block || block === container) {
            // Image is a direct child of contenteditable — wrap it in a <p>
            const p = document.createElement('p')
            selectedImage.parentNode.insertBefore(p, selectedImage)
            p.appendChild(selectedImage)
            block = p
        }

        // Set text-align on the block (this naturally aligns inline/inline-block images)
        block.style.textAlign = alignment

        // Ensure image is inline-block so text-align works
        if (selectedImage.style.display === 'block') {
            selectedImage.style.display = 'inline-block'
        }
        // Remove any float that might conflict
        selectedImage.style.float = 'none'

        // Reposition overlay after alignment change
        requestAnimationFrame(() => {
            if (selectedImage && overlayRef.current) {
                repositionOverlay(selectedImage)
            }
        })

        if (onContentChange) onContentChange()
        return true
    }, [selectedImage, containerRef, onContentChange, repositionOverlay])

    return {
        selectedImage,
        isResizing,
        alignImage,
        deselectImage: () => {
            setSelectedImage(null)
            removeResizeOverlay()
        }
    }
}

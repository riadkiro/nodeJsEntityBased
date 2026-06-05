/**
 * useTouchDrag — Reusable touch-based drag & drop for contentEditable targets
 * 
 * Usage:
 *   const { touchHandlers, elRef } = useTouchDrag({ html, label, icon, isDark })
 *   <div ref={elRef} {...touchHandlers}> ... </div>
 * 
 * Behavior:
 *   1. Long press (500ms) → haptic vibration + visual glow on source
 *   2. Touch move → floating ghost follows finger, blue drop indicator on editable
 *   3. Touch end → insert HTML at caretRangeFromPoint in nearest contentEditable
 */
import { useRef, useCallback, useEffect } from 'react'

export default function useTouchDrag({ html, label, icon, isDark, delay = 500 }) {
    const elRef = useRef(null)
    const stateRef = useRef({
        timer: null,
        isDragging: false,
        ghost: null,
        startX: 0,
        startY: 0,
    })

    const cleanup = useCallback(() => {
        const s = stateRef.current
        if (s.ghost) { s.ghost.remove(); s.ghost = null }
        if (s.timer) { clearTimeout(s.timer); s.timer = null }
        s.isDragging = false
        if (elRef.current) {
            elRef.current.style.transform = ''
            elRef.current.style.boxShadow = ''
            elRef.current.style.opacity = ''
        }
        const ind = document.getElementById('touch-drop-indicator')
        if (ind) ind.remove()
    }, [])

    const onTouchStart = useCallback((e) => {
        const touch = e.touches[0]
        const s = stateRef.current
        s.startX = touch.clientX
        s.startY = touch.clientY

        s.timer = setTimeout(() => {
            s.isDragging = true
            if (navigator.vibrate) navigator.vibrate(50)

            // Visual feedback on source
            if (elRef.current) {
                elRef.current.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.3)'
                elRef.current.style.transform = 'scale(0.95)'
                elRef.current.style.opacity = '0.7'
            }

            // Create ghost
            const ghost = document.createElement('div')
            ghost.id = 'touch-drag-ghost'
            ghost.style.cssText = `
                position:fixed; z-index:99999; pointer-events:none;
                padding:8px 14px; background:${isDark ? '#1e293b' : '#fff'};
                border:2px solid #4361ee; border-radius:10px;
                box-shadow:0 12px 40px rgba(67,97,238,0.3);
                font-size:12px; font-weight:600; color:#4361ee;
                display:flex; align-items:center; gap:8px;
                transform:translate(-50%,-120%); opacity:0.95;
                white-space:nowrap;
            `
            const iconStr = icon ? `<iconify-icon icon="${icon}" width="16"></iconify-icon> ` : ''
            ghost.innerHTML = iconStr + (label || 'Drag')
            ghost.style.left = touch.clientX + 'px'
            ghost.style.top = touch.clientY + 'px'
            document.body.appendChild(ghost)
            s.ghost = ghost
        }, delay)
    }, [html, label, icon, isDark, delay])

    const onTouchMove = useCallback((e) => {
        const s = stateRef.current
        const touch = e.touches[0]

        if (!s.isDragging) {
            const dx = Math.abs(touch.clientX - s.startX)
            const dy = Math.abs(touch.clientY - s.startY)
            if (dx > 10 || dy > 10) {
                if (s.timer) { clearTimeout(s.timer); s.timer = null }
            }
            return
        }

        e.preventDefault()

        if (s.ghost) {
            s.ghost.style.left = touch.clientX + 'px'
            s.ghost.style.top = touch.clientY + 'px'
        }

        // Drop indicator
        const target = document.elementFromPoint(touch.clientX, touch.clientY)
        const existing = document.getElementById('touch-drop-indicator')

        if (target && (target.contentEditable === 'true' || target.closest?.('[contenteditable="true"]'))) {
            const editableEl = target.contentEditable === 'true' ? target : target.closest('[contenteditable="true"]')
            if (!existing) {
                const ind = document.createElement('div')
                ind.id = 'touch-drop-indicator'
                ind.style.cssText = `
                    position:fixed; height:3px; background:#4361ee;
                    border-radius:2px; z-index:99998; pointer-events:none;
                    box-shadow:0 0 8px rgba(67,97,238,0.5);
                    transition:top 0.1s ease;
                `
                document.body.appendChild(ind)
            }
            const range = document.caretRangeFromPoint(touch.clientX, touch.clientY)
            if (range) {
                const rect = range.getBoundingClientRect()
                const ind = document.getElementById('touch-drop-indicator')
                if (ind) {
                    const editableRect = editableEl.getBoundingClientRect()
                    ind.style.top = rect.top + 'px'
                    ind.style.left = editableRect.left + 'px'
                    ind.style.width = editableRect.width + 'px'
                }
            }
        } else if (existing) {
            existing.remove()
        }
    }, [])

    const onTouchEnd = useCallback((e) => {
        const s = stateRef.current
        if (!s.isDragging) { cleanup(); return }

        const touch = e.changedTouches[0]
        const target = document.elementFromPoint(touch.clientX, touch.clientY)

        if (target) {
            const editable = target.contentEditable === 'true'
                ? target
                : target.closest?.('[contenteditable="true"]')

            if (editable) {
                const range = document.caretRangeFromPoint(touch.clientX, touch.clientY)
                if (range) {
                    const structuralHtml = (() => {
                        const template = document.createElement('template')
                        template.innerHTML = html || ''
                        return !!template.content.querySelector('[data-doc-content-block="1"], .doc-content-block, table, blockquote, pre, figure, img, .dynamic-table, .doc-image-placeholder, .doc-separator-container, p, h1, h2, h3, h4, h5, h6, ul, ol, li, div[style]')
                    })()
                    const imageInsertionHtml = (() => {
                        const template = document.createElement('template')
                        template.innerHTML = html || ''
                        const children = Array.from(template.content.children || [])
                        if (!children.length) return false
                        return children.every(node => {
                            if (node.matches?.('img, .doc-image-placeholder, [data-image-placeholder="1"]')) return true
                            if (node.matches?.('figure')) {
                                const meaningfulChildren = Array.from(node.children || []).filter(child => !child.matches?.('figcaption'))
                                return meaningfulChildren.length > 0 && meaningfulChildren.every(child => child.matches?.('img, .doc-image-placeholder, [data-image-placeholder="1"]'))
                            }
                            return false
                        })
                    })()
                    const protectedSelector = '[data-doc-content-block="1"], .doc-content-block, table, blockquote, pre, figure, .dynamic-table, .doc-image-placeholder, .doc-separator-container, div[style], p, h1, h2, h3, h4, h5, h6, ul, ol, li'
                    const rangeElement = range.startContainer.nodeType === 3
                        ? range.startContainer.parentElement
                        : range.startContainer
                    const element = target && target !== editable && editable.contains(target) ? target : rangeElement
                    const contentBlock = element?.closest?.('[data-doc-content-block="1"], .doc-content-block') || rangeElement?.closest?.('[data-doc-content-block="1"], .doc-content-block')
                    let protectedBlock = structuralHtml
                        ? (element?.closest?.(protectedSelector) || rangeElement?.closest?.(protectedSelector))
                        : null

                    if (imageInsertionHtml && contentBlock && contentBlock !== editable && editable.contains(contentBlock)) {
                        protectedBlock = null
                    }

                    if (protectedBlock && protectedBlock !== editable && editable.contains(protectedBlock)) {
                        let topBlock = protectedBlock
                        let parent = protectedBlock.parentElement
                        while (parent && parent !== editable) {
                            if (parent.matches?.(protectedSelector)) topBlock = parent
                            parent = parent.parentElement
                        }
                        const rect = topBlock.getBoundingClientRect()
                        const side = touch.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
                        const template = document.createElement('template')
                        template.innerHTML = html
                        const nodes = Array.from(template.content.childNodes)
                        if (side === 'before') topBlock.before(...nodes)
                        else topBlock.after(...nodes)
                        editable.dispatchEvent(new Event('input', { bubbles: true }))
                        cleanup()
                        return
                    }

                    const sel = window.getSelection()
                    sel.removeAllRanges()
                    sel.addRange(range)
                    document.execCommand('insertHTML', false, html)
                    editable.dispatchEvent(new Event('input', { bubbles: true }))
                }
            }
        }

        cleanup()
    }, [html, cleanup])

    useEffect(() => cleanup, [cleanup])

    return {
        elRef,
        touchHandlers: {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            onTouchCancel: cleanup,
        },
    }
}

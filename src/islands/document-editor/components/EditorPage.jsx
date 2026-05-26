/**
 * EditorPage Component
 * Single page component with edition/layout/designer modes
 * 1:1 parity with editor-canvas.ejs page rendering
 * 
 * CRITICAL: contenteditable is UNCONTROLLED
 * - Initial content set via dangerouslySetInnerHTML on first render
 * - Content updates read from ref, NOT from state
 * - No re-render of contenteditable on state changes
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useImageResize } from '../hooks/useImageResize'
import GridBuilder from '../../shared/GridBuilder'
import TableToolbar, { useTableToolbar } from './TableToolbar'
import { useDynamicTableOverlay, DynamicTableOverlay } from './DynamicTableModal'
import DynamicTableModal from './DynamicTableModalReact'
import DesignerCanvas from './DesignerCanvas'

export default function EditorPage({
    page,
    pageIndex,
    doc,
    setDoc,
    pageRefs,
    isSelected,
    onSelect,
    handlePageInput,
    handlePaste,
    handleKeyDown,
    isGlobalSelection,
    panelMode,
    accountNumber,
    documentId,
    sourceRecordId
}) {
    const contentRef = useRef(null)
    const blockCaretRef = useRef(null)
    const placeholderOverlayRef = useRef(null)
    const placeholderResizeRef = useRef(null)
    const imageCropRef = useRef(null)
    const imageContextMenuRef = useRef(null)

    // Table toolbar for edition mode
    const tableToolbarProps = useTableToolbar(
        contentRef,
        () => handlePageInput?.({ target: contentRef.current }, pageIndex)
    )

    // Dynamic table overlay for edition mode
    const dtOverlay = useDynamicTableOverlay(contentRef)

    // Register ref
    useEffect(() => {
        if (contentRef.current) {
            pageRefs.current[pageIndex] = contentRef.current
        }
        return () => {
            delete pageRefs.current[pageIndex]
        }
    }, [pageIndex, pageRefs])

    // Restore content when contenteditable appears (initial mount + mode switch back to edition)
    // CRITICAL: page.mode is a dependency so that when switching from layout→edition,
    // the contenteditable is recreated and needs its content restored from state.
    useEffect(() => {
        if (contentRef.current && page.mode === 'edition') {
            contentRef.current.innerHTML = page.content || ''
        }
    }, [page.mode])

    // ========== CARET VISIBILITY: Scroll cursor into view after typing ==========
    // The page has overflow:hidden + maxHeight, so the cursor can go below the visible area.
    // After each key action, we check if the caret rect is below the page and scroll the
    // outer canvas container to keep it visible.
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const scrollCaretIntoView = () => {
            requestAnimationFrame(() => {
                const sel = window.getSelection()
                if (!sel || sel.rangeCount === 0) return

                const range = sel.getRangeAt(0)
                const rect = range.getBoundingClientRect()
                if (!rect || (rect.top === 0 && rect.bottom === 0 && rect.left === 0)) return

                // Find the scrollable canvas container (.overflow-auto)
                const canvas = el.closest('.overflow-auto')
                if (!canvas) return

                const canvasRect = canvas.getBoundingClientRect()
                const margin = 80

                // If cursor is below the canvas visible area
                if (rect.bottom > canvasRect.bottom - margin) {
                    canvas.scrollBy({ top: rect.bottom - canvasRect.bottom + margin, behavior: 'instant' })
                }
                // If cursor is above the canvas visible area
                else if (rect.top < canvasRect.top + margin) {
                    canvas.scrollBy({ top: rect.top - canvasRect.top - margin, behavior: 'instant' })
                }
            })
        }

        el.addEventListener('keyup', scrollCaretIntoView)
        return () => el.removeEventListener('keyup', scrollCaretIntoView)
    }, [page.mode])

    // Image resize functionality for edition mode
    const handleContentChange = useCallback(() => {
        if (handlePageInput) {
            handlePageInput({ target: contentRef.current }, pageIndex)
        }
    }, [handlePageInput, pageIndex])

    useImageResize(contentRef, handleContentChange)

    const clearAtomicCaret = useCallback(() => {
        blockCaretRef.current = null
    }, [])

    const setCaretAroundAtomic = useCallback((block, side) => {
        const el = contentRef.current
        if (!el || !block || !el.contains(block)) return

        blockCaretRef.current = { block, side }

        const sel = window.getSelection()
        const range = document.createRange()
        if (side === 'before') {
            range.setStartBefore(block)
        } else {
            range.setStartAfter(block)
        }
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        el.focus()
    }, [])

    // ========== IMAGE PLACEHOLDER RESIZE ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const PLACEHOLDER_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23dbeafe'/%3E%3Cstop offset='1' stop-color='%23f8fafc'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23sky)'/%3E%3Ccircle cx='500' cy='80' r='46' fill='%23ffffff' fill-opacity='.88'/%3E%3Cpath d='M0 260 105 178l83 58 128-108 134 132 83-68 107 86v82H0z' fill='%23cbd5e1'/%3E%3Cpath d='M0 304 160 214l118 64 92-46 100 54 170-90v164H0z' fill='%2394a3b8' fill-opacity='.72'/%3E%3C/svg%3E")`
        const DEFAULT_FRAME_WIDTH = 500
        const DEFAULT_FRAME_RATIO = 9 / 16

        const getDefaultFrameWidth = () => {
            const availableWidth = el.clientWidth || DEFAULT_FRAME_WIDTH
            return Math.max(96, Math.min(DEFAULT_FRAME_WIDTH, availableWidth))
        }

        const ensureFrameSize = (placeholder) => {
            const widthStyle = (placeholder.style.width || '').trim()
            const heightStyle = (placeholder.style.height || '').trim()
            const shouldUseDefaultWidth = !widthStyle || widthStyle === 'auto' || widthStyle === '100%'

            placeholder.style.maxWidth = '100%'

            if (shouldUseDefaultWidth) {
                const width = getDefaultFrameWidth()
                placeholder.style.width = `${width}px`
                placeholder.style.height = `${Math.round(width * DEFAULT_FRAME_RATIO)}px`
                return
            }

            if (!heightStyle || heightStyle === 'auto') {
                const width = Math.max(96, placeholder.offsetWidth || parseFloat(widthStyle) || getDefaultFrameWidth())
                placeholder.style.height = `${Math.round(width * DEFAULT_FRAME_RATIO)}px`
            }
        }

        const removeLegacyCaretSpacers = (placeholder) => {
            const siblings = [placeholder.previousSibling, placeholder.nextSibling]
            siblings.forEach(node => {
                if (node?.nodeType === 3 && node.nodeValue === '\u2009') {
                    node.remove()
                }
            })
        }

        const getImageCropTransform = (placeholder) => ({
            x: Number.parseFloat(placeholder?.dataset?.imageX || '0') || 0,
            y: Number.parseFloat(placeholder?.dataset?.imageY || '0') || 0,
            scale: Math.max(0.2, Number.parseFloat(placeholder?.dataset?.imageScale || '1') || 1)
        })

        const setImageCropTransform = (placeholder, transform) => {
            if (!placeholder) return
            const next = {
                x: Math.round((Number.isFinite(transform.x) ? transform.x : 0) * 10) / 10,
                y: Math.round((Number.isFinite(transform.y) ? transform.y : 0) * 10) / 10,
                scale: Math.max(0.2, Math.min(6, Number.isFinite(transform.scale) ? transform.scale : 1))
            }
            placeholder.dataset.imageX = String(next.x)
            placeholder.dataset.imageY = String(next.y)
            placeholder.dataset.imageScale = String(Math.round(next.scale * 1000) / 1000)
            applyImageCropTransform(placeholder)
        }

        const applyImageCropTransform = (placeholder) => {
            const img = placeholder?.querySelector('img')
            if (!img) return
            const { x, y, scale } = getImageCropTransform(placeholder)
            img.style.transformOrigin = 'center center'
            img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
            img.style.willChange = 'transform'
        }

        const applyFrameImageSizing = (placeholder) => {
            const img = placeholder?.querySelector('img')
            if (!img) return

            const frameWidth = placeholder.offsetWidth || parseFloat(placeholder.style.width || '') || 0
            const frameHeight = placeholder.offsetHeight || parseFloat(placeholder.style.height || '') || 0
            const fillByHeight = frameHeight > frameWidth

            img.style.display = 'block'
            img.style.pointerEvents = 'none'
            img.style.maxWidth = 'none'
            img.style.maxHeight = 'none'
            img.style.objectFit = 'initial'
            img.style.flex = '0 0 auto'

            if (fillByHeight) {
                img.style.width = 'auto'
                img.style.height = '100%'
            } else {
                img.style.width = '100%'
                img.style.height = 'auto'
            }
            applyImageCropTransform(placeholder)
        }

        const normalizePlaceholder = (placeholder) => {
            if (!placeholder) return
            const hasImage = !!placeholder.querySelector('img')
            removeLegacyCaretSpacers(placeholder)
            placeholder.setAttribute('contenteditable', 'false')
            placeholder.style.position = 'relative'
            placeholder.style.display = 'inline-flex'
            placeholder.style.alignItems = 'center'
            placeholder.style.justifyContent = 'center'
            placeholder.style.verticalAlign = 'top'
            placeholder.style.boxSizing = 'border-box'
            placeholder.style.resize = 'none'
            placeholder.style.overflow = 'hidden'
            placeholder.style.cursor = 'pointer'
            placeholder.style.minWidth = '96px'
            placeholder.style.minHeight = '72px'
            placeholder.style.margin = '12px 0'
            ensureFrameSize(placeholder)

            const next = placeholder.nextElementSibling
            if (next?.tagName === 'P' && !next.textContent.trim() && next.innerHTML.replace(/<br\s*\/?>/gi, '').trim() === '') {
                next.remove()
            }

            if (hasImage) {
                placeholder.classList.add('has-image')
                placeholder.style.backgroundImage = 'none'
                placeholder.style.backgroundColor = 'transparent'
                placeholder.style.padding = '0'
                applyFrameImageSizing(placeholder)
            } else {
                placeholder.classList.remove('has-image')
                placeholder.innerHTML = ''
                placeholder.style.border = '0'
                placeholder.style.borderRadius = placeholder.style.borderRadius || '8px'
                placeholder.style.backgroundColor = '#f8fafc'
                placeholder.style.backgroundImage = PLACEHOLDER_BG
                placeholder.style.backgroundSize = 'cover'
                placeholder.style.backgroundPosition = 'center'
            }
        }

        const removeOverlay = () => {
            if (placeholderOverlayRef.current?.overlay) {
                placeholderOverlayRef.current.overlay.remove()
            }
            placeholderOverlayRef.current = null
        }

        const getEditorZoom = () => {
            const scaledAncestor = el.closest('[style*="scale"]')
            const match = scaledAncestor?.style.transform?.match(/scale\(([\d.]+)\)/)
            const zoom = match ? parseFloat(match[1]) : 1
            return Number.isFinite(zoom) && zoom > 0 ? zoom : 1
        }

        const positionOverlay = () => {
            const state = placeholderOverlayRef.current
            if (!state?.overlay || !state.placeholder || !el.contains(state.placeholder)) return
            const rect = state.placeholder.getBoundingClientRect()
            const elRect = el.getBoundingClientRect()
            const zoom = getEditorZoom()
            state.overlay.style.left = `${(rect.left - elRect.left) / zoom + el.scrollLeft}px`
            state.overlay.style.top = `${(rect.top - elRect.top) / zoom + el.scrollTop}px`
            state.overlay.style.width = `${rect.width / zoom}px`
            state.overlay.style.height = `${rect.height / zoom}px`
        }

        const removeContextMenu = () => {
            const menu = imageContextMenuRef.current
            if (!menu) return
            document.removeEventListener('pointerdown', menu._closeOnOutside, true)
            document.removeEventListener('keydown', menu._closeOnEscape, true)
            menu.remove()
            imageContextMenuRef.current = null
        }

        const positionCropOverlay = () => {
            const state = imageCropRef.current
            if (!state?.overlay || !state.placeholder || !el.contains(state.placeholder)) return
            const rect = state.placeholder.getBoundingClientRect()
            const elRect = el.getBoundingClientRect()
            const zoom = getEditorZoom()
            state.overlay.style.left = `${(rect.left - elRect.left) / zoom + el.scrollLeft}px`
            state.overlay.style.top = `${(rect.top - elRect.top) / zoom + el.scrollTop}px`
            state.overlay.style.width = `${rect.width / zoom}px`
            state.overlay.style.height = `${rect.height / zoom}px`
        }

        const removeCropOverlay = (save = false) => {
            const state = imageCropRef.current
            if (!state) return
            document.removeEventListener('pointermove', handleCropPointerMove)
            document.removeEventListener('pointerup', endCropInteraction)
            document.removeEventListener('pointercancel', endCropInteraction)
            if (state.overlay) state.overlay.remove()
            if (state.placeholder && el.contains(state.placeholder)) {
                state.placeholder.style.cursor = 'pointer'
            }
            imageCropRef.current = null
            if (save) handleContentChange()
        }

        const showCropOverlay = (placeholder) => {
            const img = placeholder?.querySelector('img')
            if (!placeholder || !img) return
            normalizePlaceholder(placeholder)
            removeOverlay()
            removeContextMenu()
            removeCropOverlay()

            placeholder.style.cursor = 'grab'

            const overlay = document.createElement('div')
            overlay.contentEditable = 'false'
            overlay.setAttribute('data-placeholder-crop-overlay', '1')
            overlay.style.cssText = `
                position:absolute;
                border:1.5px solid #2563eb;
                border-radius:8px;
                box-sizing:border-box;
                pointer-events:none;
                z-index:1002;
                box-shadow:0 0 0 1px rgba(37,99,235,.15);
            `

            const handles = ['nw', 'ne', 'se', 'sw']
            handles.forEach(pos => {
                const handle = document.createElement('span')
                handle.className = `doc-image-crop-handle doc-image-crop-handle-${pos}`
                handle.setAttribute('data-image-crop-handle', pos)
                handle.style.cssText = `
                    position:absolute;
                    width:12px;
                    height:12px;
                    background:#2563eb;
                    border:2px solid #fff;
                    border-radius:999px;
                    box-sizing:border-box;
                    pointer-events:auto;
                    cursor:${pos === 'nw' || pos === 'se' ? 'nwse-resize' : 'nesw-resize'};
                    touch-action:none;
                    box-shadow:0 1px 4px rgba(15,23,42,.24);
                `
                if (pos.includes('n')) handle.style.top = '-7px'
                if (pos.includes('s')) handle.style.bottom = '-7px'
                if (pos.includes('w')) handle.style.left = '-7px'
                if (pos.includes('e')) handle.style.right = '-7px'
                handle.addEventListener('pointerdown', event => startCropScale(event, placeholder, pos))
                overlay.appendChild(handle)
            })

            if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative'
            el.appendChild(overlay)
            imageCropRef.current = { overlay, placeholder, mode: null }
            positionCropOverlay()
        }

        const openImageContextMenu = (placeholder, event) => {
            if (!placeholder || !el.contains(placeholder)) return
            event.preventDefault()
            event.stopPropagation()
            normalizePlaceholder(placeholder)
            showOverlay(placeholder)
            removeContextMenu()

            const menu = document.createElement('div')
            menu.setAttribute('data-placeholder-context-menu', '1')
            menu.style.cssText = `
                position:fixed;
                left:${event.clientX}px;
                top:${event.clientY}px;
                z-index:100000;
                min-width:176px;
                padding:6px;
                background:#fff;
                color:#0f172a;
                border:1px solid #e2e8f0;
                border-radius:8px;
                box-shadow:0 12px 28px rgba(15,23,42,.18);
                font-family:Inter,system-ui,sans-serif;
            `

            const addItem = (label, onSelect) => {
                const item = document.createElement('button')
                item.type = 'button'
                item.textContent = label
                item.style.cssText = `
                    width:100%;
                    display:block;
                    border:0;
                    background:transparent;
                    color:inherit;
                    padding:8px 10px;
                    border-radius:6px;
                    text-align:left;
                    font-size:13px;
                    cursor:pointer;
                `
                item.addEventListener('mouseenter', () => { item.style.background = '#f1f5f9' })
                item.addEventListener('mouseleave', () => { item.style.background = 'transparent' })
                item.addEventListener('pointerdown', e => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeContextMenu()
                    onSelect()
                })
                menu.appendChild(item)
            }

            addItem("Changer l'image", () => {
                window.dispatchEvent(new CustomEvent('document-image-placeholder-click', {
                    detail: { placeholder, pageIndex }
                }))
            })
            if (placeholder.querySelector('img')) {
                addItem("Ajuster l'image", () => showCropOverlay(placeholder))
            }
            addItem('Supprimer le frame', () => deletePlaceholder(placeholder))

            menu._closeOnOutside = e => {
                if (!menu.contains(e.target)) removeContextMenu()
            }
            menu._closeOnEscape = e => {
                if (e.key === 'Escape') removeContextMenu()
            }
            document.body.appendChild(menu)
            imageContextMenuRef.current = menu
            requestAnimationFrame(() => {
                document.addEventListener('pointerdown', menu._closeOnOutside, true)
                document.addEventListener('keydown', menu._closeOnEscape, true)
            })
        }

        const placeCaretIn = (node) => {
            const sel = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(node)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
            el.focus()
        }

        const deletePlaceholder = (placeholder) => {
            if (!placeholder || !el.contains(placeholder)) return

            const next = placeholder.nextSibling
            const prev = placeholder.previousSibling
            placeholder.remove()
            removeOverlay()
            clearAtomicCaret()

            const target = next?.nodeType === 1 ? next : prev?.nodeType === 1 ? prev : null
            if (target && el.contains(target)) {
                placeCaretIn(target)
            } else {
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                el.appendChild(p)
                placeCaretIn(p)
            }
            handleContentChange()
        }

        const showOverlay = (placeholder) => {
            removeCropOverlay(true)
            normalizePlaceholder(placeholder)
            removeOverlay()

            const overlay = document.createElement('div')
            overlay.contentEditable = 'false'
            overlay.setAttribute('data-placeholder-resize-overlay', '1')
            overlay.style.cssText = `
                position:absolute;
                border:1.5px solid #7c3aed;
                border-radius:8px;
                box-sizing:border-box;
                pointer-events:none;
                z-index:1001;
                box-shadow:none;
            `

            const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
            handles.forEach(pos => {
                const handle = document.createElement('span')
                handle.className = `doc-image-placeholder-handle doc-image-placeholder-handle-${pos}`
                handle.setAttribute('data-placeholder-resize-handle', pos)
                const cursorMap = {
                    n: 'ns-resize',
                    s: 'ns-resize',
                    e: 'ew-resize',
                    w: 'ew-resize',
                    nw: 'nwse-resize',
                    se: 'nwse-resize',
                    ne: 'nesw-resize',
                    sw: 'nesw-resize'
                }
                handle.style.cssText = `
                    position:absolute;
                    width:${pos.length === 1 ? 14 : 11}px;
                    height:${pos.length === 1 ? 6 : 11}px;
                    background:#fff;
                    border:1.5px solid #7c3aed;
                    border-radius:${pos.length === 1 ? 6 : 999}px;
                    box-sizing:border-box;
                    pointer-events:auto;
                    cursor:${cursorMap[pos]};
                    touch-action:none;
                `
                if (pos.includes('n')) handle.style.top = '-6px'
                if (pos.includes('s')) handle.style.bottom = '-6px'
                if (pos.includes('w')) handle.style.left = '-6px'
                if (pos.includes('e')) handle.style.right = '-6px'
                if (pos === 'n' || pos === 's') {
                    handle.style.left = '50%'
                    handle.style.transform = 'translateX(-50%)'
                }
                if (pos === 'e' || pos === 'w') {
                    handle.style.top = '50%'
                    handle.style.transform = 'translateY(-50%)'
                }
                overlay.appendChild(handle)
            })

            const deleteButton = document.createElement('button')
            deleteButton.type = 'button'
            deleteButton.contentEditable = 'false'
            deleteButton.title = 'Supprimer le frame image'
            deleteButton.setAttribute('data-placeholder-delete', '1')
            deleteButton.innerHTML = '×'
            deleteButton.style.cssText = `
                position:absolute;
                top:-12px;
                right:-12px;
                width:24px;
                height:24px;
                border-radius:999px;
                border:2px solid #fff;
                background:#ef4444;
                color:#fff;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:0;
                font-size:16px;
                font-weight:700;
                line-height:1;
                cursor:pointer;
                pointer-events:auto;
                box-shadow:0 2px 8px rgba(15,23,42,.22);
            `
            deleteButton.addEventListener('pointerdown', (event) => {
                event.preventDefault()
                event.stopPropagation()
                deletePlaceholder(placeholder)
            })
            overlay.appendChild(deleteButton)

            if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative'
            el.appendChild(overlay)
            placeholderOverlayRef.current = { overlay, placeholder }
            positionOverlay()
        }

        const insertParagraphAfter = (placeholder) => {
            const p = document.createElement('p')
            p.innerHTML = '<br>'
            placeholder.after(p)
            removeOverlay()
            clearAtomicCaret()
            placeCaretIn(p)
            handleContentChange()
        }

        const applyImageToFrame = (placeholder, url, alt = '') => {
            if (!placeholder || !url) return
            placeholder.innerHTML = ''
            const img = document.createElement('img')
            img.src = url
            img.alt = alt || ''
            img.style.cssText = 'display:block;pointer-events:none;max-width:none;max-height:none;'
            placeholder.appendChild(img)
            placeholder.dataset.imageSrc = url
            placeholder.dataset.imageX = '0'
            placeholder.dataset.imageY = '0'
            placeholder.dataset.imageScale = '1'
            placeholder.classList.add('has-image')
            placeholder.style.backgroundImage = 'none'
            placeholder.style.backgroundColor = 'transparent'
            placeholder.style.border = 'none'
            placeholder.style.padding = '0'
            placeholder.style.margin = '12px 0'
            normalizePlaceholder(placeholder)
            showOverlay(placeholder)
            handleContentChange()
        }

        const extractDroppedImage = (event) => {
            const html = event.dataTransfer?.getData('text/html') || ''
            if (html) {
                const template = document.createElement('template')
                template.innerHTML = html
                const img = template.content.querySelector('img')
                if (img?.src) return { url: img.src, alt: img.alt || '' }
            }

            const text = (event.dataTransfer?.getData('text/uri-list') || event.dataTransfer?.getData('text/plain') || '').trim()
            if (/^https?:\/\//i.test(text) || text.startsWith('/')) {
                return { url: text.split('\n')[0], alt: '' }
            }

            const file = Array.from(event.dataTransfer?.files || []).find(f => String(f.type || '').startsWith('image/'))
            if (file) {
                return { url: URL.createObjectURL(file), alt: file.name || '' }
            }

            return null
        }

        const getEventPlaceholder = (event) => {
            const direct = event.target.closest?.('.doc-image-placeholder')
            if (direct && el.contains(direct)) return direct
            const overlay = event.target.closest?.('[data-placeholder-resize-overlay], [data-placeholder-resize-handle], [data-placeholder-delete]')
            if (overlay && placeholderOverlayRef.current?.placeholder) return placeholderOverlayRef.current.placeholder
            return null
        }

        const startResize = (event, handle) => {
            const state = placeholderOverlayRef.current
            if (!state?.placeholder) return

            event.preventDefault()
            event.stopPropagation()

            const pointer = event.touches ? event.touches[0] : event
            placeholderResizeRef.current = {
                placeholder: state.placeholder,
                handle,
                startX: pointer.clientX,
                startY: pointer.clientY,
                startWidth: state.placeholder.offsetWidth,
                startHeight: state.placeholder.offsetHeight,
                zoom: getEditorZoom()
            }

            document.addEventListener('pointermove', handleResizeMove)
            document.addEventListener('pointerup', endResize)
            document.addEventListener('pointercancel', endResize)
        }

        const handleResizeMove = (event) => {
            const state = placeholderResizeRef.current
            if (!state) return
            const zoom = state.zoom || getEditorZoom()
            const dx = (event.clientX - state.startX) / zoom
            const dy = (event.clientY - state.startY) / zoom

            let width = state.startWidth
            let height = state.startHeight
            if (state.handle.includes('e')) width = state.startWidth + dx
            if (state.handle.includes('w')) width = state.startWidth - dx
            if (state.handle.includes('s')) height = state.startHeight + dy
            if (state.handle.includes('n')) height = state.startHeight - dy

            state.placeholder.style.width = `${Math.max(96, Math.round(width))}px`
            state.placeholder.style.height = `${Math.max(72, Math.round(height))}px`
            applyFrameImageSizing(state.placeholder)
            positionOverlay()
            event.preventDefault()
        }

        const endResize = () => {
            if (!placeholderResizeRef.current) return
            applyFrameImageSizing(placeholderResizeRef.current.placeholder)
            placeholderResizeRef.current = null
            document.removeEventListener('pointermove', handleResizeMove)
            document.removeEventListener('pointerup', endResize)
            document.removeEventListener('pointercancel', endResize)
            handleContentChange()
        }

        const startCropMove = (event, placeholder) => {
            const state = imageCropRef.current
            if (!state?.overlay || state.placeholder !== placeholder) return
            event.preventDefault()
            event.stopPropagation()

            const current = getImageCropTransform(placeholder)
            placeholder.style.cursor = 'grabbing'
            imageCropRef.current = {
                ...state,
                mode: 'move',
                startX: event.clientX,
                startY: event.clientY,
                startImageX: current.x,
                startImageY: current.y,
                startScale: current.scale,
                zoom: getEditorZoom()
            }
            document.addEventListener('pointermove', handleCropPointerMove)
            document.addEventListener('pointerup', endCropInteraction)
            document.addEventListener('pointercancel', endCropInteraction)
        }

        const startCropScale = (event, placeholder, handle) => {
            const state = imageCropRef.current
            if (!state?.overlay || state.placeholder !== placeholder) return
            event.preventDefault()
            event.stopPropagation()

            const rect = placeholder.getBoundingClientRect()
            const current = getImageCropTransform(placeholder)
            imageCropRef.current = {
                ...state,
                mode: 'scale',
                handle,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2,
                startDistance: Math.max(1, Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2))),
                startImageX: current.x,
                startImageY: current.y,
                startScale: current.scale,
                zoom: getEditorZoom()
            }
            document.addEventListener('pointermove', handleCropPointerMove)
            document.addEventListener('pointerup', endCropInteraction)
            document.addEventListener('pointercancel', endCropInteraction)
        }

        const handleCropPointerMove = (event) => {
            const state = imageCropRef.current
            if (!state?.placeholder || !state.mode) return

            if (state.mode === 'move') {
                const zoom = state.zoom || getEditorZoom()
                setImageCropTransform(state.placeholder, {
                    x: state.startImageX + (event.clientX - state.startX) / zoom,
                    y: state.startImageY + (event.clientY - state.startY) / zoom,
                    scale: state.startScale
                })
            }

            if (state.mode === 'scale') {
                const distance = Math.max(1, Math.hypot(event.clientX - state.centerX, event.clientY - state.centerY))
                setImageCropTransform(state.placeholder, {
                    x: state.startImageX,
                    y: state.startImageY,
                    scale: state.startScale * (distance / state.startDistance)
                })
            }

            positionCropOverlay()
            if (event.cancelable) event.preventDefault()
        }

        const endCropInteraction = () => {
            const state = imageCropRef.current
            if (!state) return
            document.removeEventListener('pointermove', handleCropPointerMove)
            document.removeEventListener('pointerup', endCropInteraction)
            document.removeEventListener('pointercancel', endCropInteraction)
            if (state.placeholder && el.contains(state.placeholder)) {
                state.placeholder.style.cursor = 'grab'
            }
            imageCropRef.current = { ...state, mode: null }
            handleContentChange()
        }

        const handleCropWheel = (event) => {
            const state = imageCropRef.current
            if (!state?.placeholder || !el.contains(state.placeholder)) return
            const targetInsideCrop = state.placeholder.contains(event.target) || state.overlay?.contains(event.target)
            if (!targetInsideCrop) return

            event.preventDefault()
            event.stopPropagation()
            const current = getImageCropTransform(state.placeholder)
            const factor = event.deltaY < 0 ? 1.06 : 0.94
            setImageCropTransform(state.placeholder, {
                x: current.x,
                y: current.y,
                scale: current.scale * factor
            })
            handleContentChange()
        }

        const handlePointerDown = (event) => {
            const deleteButton = event.target.closest?.('[data-placeholder-delete]')
            if (deleteButton) {
                event.preventDefault()
                event.stopPropagation()
                deletePlaceholder(placeholderOverlayRef.current?.placeholder)
                return
            }

            const cropHandle = event.target.closest?.('[data-image-crop-handle]')
            if (cropHandle) {
                const placeholder = imageCropRef.current?.placeholder
                if (placeholder) startCropScale(event, placeholder, cropHandle.getAttribute('data-image-crop-handle'))
                return
            }

            const cropPlaceholder = event.target.closest?.('.doc-image-placeholder')
            if (imageCropRef.current?.placeholder && cropPlaceholder === imageCropRef.current.placeholder) {
                startCropMove(event, cropPlaceholder)
                return
            }

            const handle = event.target.closest?.('[data-placeholder-resize-handle]')
            if (handle) {
                startResize(event, handle.getAttribute('data-placeholder-resize-handle'))
                return
            }

            const placeholder = event.target.closest?.('.doc-image-placeholder')
            if (placeholder && el.contains(placeholder)) {
                removeCropOverlay(true)
                normalizePlaceholder(placeholder)
                showOverlay(placeholder)
                event.preventDefault()
                return
            }

            if (!event.target.closest?.('[data-placeholder-resize-overlay]')) {
                removeOverlay()
                removeCropOverlay(true)
            }
        }

        const handleDoubleClick = (event) => {
            const placeholder = getEventPlaceholder(event)
            if (!placeholder) return
            event.preventDefault()
            event.stopPropagation()
            if (placeholder.querySelector('img')) {
                showCropOverlay(placeholder)
            }
        }

        const handleContextMenu = (event) => {
            const placeholder = getEventPlaceholder(event)
            if (!placeholder) return
            openImageContextMenu(placeholder, event)
        }

        const handleFrameDragOver = (event) => {
            const placeholder = getEventPlaceholder(event)
            if (!placeholder) return
            event.preventDefault()
            event.stopPropagation()
            event.dataTransfer.dropEffect = 'copy'
            showOverlay(placeholder)
        }

        const handleFrameDrop = (event) => {
            const placeholder = getEventPlaceholder(event)
            if (!placeholder) return
            const image = extractDroppedImage(event)
            if (!image?.url) return
            event.preventDefault()
            event.stopPropagation()
            applyImageToFrame(placeholder, image.url, image.alt)
        }

        const handleFrameKeyDown = (event) => {
            const state = placeholderOverlayRef.current
            const placeholder = state?.placeholder
            if (!placeholder || !el.contains(placeholder)) return
            const activeInsideEditor = document.activeElement === el || el.contains(document.activeElement)
            if (!activeInsideEditor) return

            if (event.key === 'Enter') {
                event.preventDefault()
                event.stopPropagation()
                insertParagraphAfter(placeholder)
                return
            }

            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault()
                event.stopPropagation()
                deletePlaceholder(placeholder)
            }
        }

        const handleCropKeyDown = (event) => {
            if (!imageCropRef.current) return
            if (event.key === 'Escape' || event.key === 'Enter') {
                event.preventDefault()
                event.stopPropagation()
                removeCropOverlay(true)
            }
        }

        let normalizeAnimationFrame = null
        const normalizeAllPlaceholders = () => {
            normalizeAnimationFrame = null
            el.querySelectorAll('.doc-image-placeholder').forEach(normalizePlaceholder)
            positionOverlay()
            positionCropOverlay()
        }
        const schedulePlaceholderNormalize = () => {
            if (normalizeAnimationFrame) cancelAnimationFrame(normalizeAnimationFrame)
            normalizeAnimationFrame = requestAnimationFrame(normalizeAllPlaceholders)
        }
        const placeholderObserver = new MutationObserver((mutations) => {
            const hasNewPlaceholder = mutations.some(mutation => Array.from(mutation.addedNodes || []).some(node => (
                node.nodeType === 1 &&
                (node.matches?.('.doc-image-placeholder') || node.querySelector?.('.doc-image-placeholder'))
            )))
            if (hasNewPlaceholder) schedulePlaceholderNormalize()
        })

        normalizeAllPlaceholders()
        placeholderObserver.observe(el, { childList: true, subtree: true })
        el.addEventListener('pointerdown', handlePointerDown, true)
        el.addEventListener('dblclick', handleDoubleClick, true)
        el.addEventListener('contextmenu', handleContextMenu, true)
        el.addEventListener('dragover', handleFrameDragOver, true)
        el.addEventListener('drop', handleFrameDrop, true)
        el.addEventListener('wheel', handleCropWheel, { passive: false, capture: true })
        document.addEventListener('keydown', handleFrameKeyDown, true)
        document.addEventListener('keydown', handleCropKeyDown, true)
        window.addEventListener('resize', positionOverlay)
        window.addEventListener('resize', positionCropOverlay)

        return () => {
            el.removeEventListener('pointerdown', handlePointerDown, true)
            el.removeEventListener('dblclick', handleDoubleClick, true)
            el.removeEventListener('contextmenu', handleContextMenu, true)
            el.removeEventListener('dragover', handleFrameDragOver, true)
            el.removeEventListener('drop', handleFrameDrop, true)
            el.removeEventListener('wheel', handleCropWheel, true)
            document.removeEventListener('keydown', handleFrameKeyDown, true)
            document.removeEventListener('keydown', handleCropKeyDown, true)
            window.removeEventListener('resize', positionOverlay)
            window.removeEventListener('resize', positionCropOverlay)
            document.removeEventListener('pointermove', handleResizeMove)
            document.removeEventListener('pointerup', endResize)
            document.removeEventListener('pointercancel', endResize)
            placeholderObserver.disconnect()
            if (normalizeAnimationFrame) cancelAnimationFrame(normalizeAnimationFrame)
            removeContextMenu()
            removeCropOverlay(false)
            removeOverlay()
        }
    }, [page.mode, handleContentChange])

    // ========== BLOCK INTERACTION: Hover Delete Button ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const BLOCK_SELECTORS = 'blockquote, table, div[style], pre'
        const RUNTIME_OVERLAYS = '[data-placeholder-resize-overlay], [data-placeholder-resize-handle], [data-placeholder-delete], [data-image-resize-overlay]'

        // Find the top-level block ancestor within the contenteditable
        const findTopBlock = (target) => {
            if (target.closest?.('.doc-image-placeholder')) return null
            if (target.closest?.(RUNTIME_OVERLAYS)) return null
            const block = target.closest(BLOCK_SELECTORS)
            if (!block) return null
            if (block.matches?.(RUNTIME_OVERLAYS)) return null
            // Walk up to find the outermost block that is still inside the contenteditable
            let topBlock = block
            let parent = block.parentElement
            while (parent && parent !== el) {
                if (parent.matches?.(RUNTIME_OVERLAYS)) return null
                if (parent.matches(BLOCK_SELECTORS)) {
                    topBlock = parent
                }
                parent = parent.parentElement
            }
            // Must be inside the contenteditable
            if (!el.contains(topBlock)) return null
            return topBlock
        }

        const handleMouseOver = (e) => {
            const block = findTopBlock(e.target)
            if (!block) return

            // Don't add duplicate buttons
            if (block.querySelector('.doc-block-delete-btn')) return

            // Ensure the block has position:relative so the absolute delete button works
            const pos = window.getComputedStyle(block).position
            if (pos === 'static') {
                block.style.position = 'relative'
            }

            // Create delete button
            const btn = document.createElement('span')
            btn.className = 'doc-block-delete-btn'
            btn.innerHTML = '×'
            btn.contentEditable = 'false'
            btn.title = 'Supprimer ce bloc'
            btn.setAttribute('data-no-drag', 'true')

            let blockDeleted = false
            const deleteBlockElement = (ev) => {
                if (blockDeleted || !block.isConnected) return
                blockDeleted = true
                ev.preventDefault()
                ev.stopPropagation()
                // Insert a <p><br></p> where the block was, so cursor has somewhere to go
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                block.replaceWith(p)
                // Place cursor in the new paragraph
                const sel = window.getSelection()
                const range = document.createRange()
                range.selectNodeContents(p)
                range.collapse(true)
                sel.removeAllRanges()
                sel.addRange(range)
                // Trigger save
                if (handlePageInput) {
                    handlePageInput({ target: el }, pageIndex)
                }
            }

            btn.addEventListener('pointerdown', deleteBlockElement)
            btn.addEventListener('mousedown', deleteBlockElement)
            btn.addEventListener('click', deleteBlockElement)

            block.appendChild(btn)
        }

        const handleMouseOut = (e) => {
            const block = findTopBlock(e.target)
            if (!block) return

            // Check if mouse is still inside the block
            const related = e.relatedTarget
            if (related && block.contains(related)) return

            // Remove delete button and reset position
            const btn = block.querySelector('.doc-block-delete-btn')
            if (btn) btn.remove()
        }

        el.addEventListener('mouseover', handleMouseOver)
        el.addEventListener('mouseout', handleMouseOut)

        return () => {
            el.removeEventListener('mouseover', handleMouseOver)
            el.removeEventListener('mouseout', handleMouseOut)
        }
    }, [page.mode, pageIndex, handlePageInput])

    // ========== BLOCK ESCAPE: Enter at end of block exits it ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const ESCAPE_BLOCKS = 'blockquote, pre, div[style], table'
        const ATOMIC_BLOCKS = 'table, img, .dynamic-table, .doc-image-placeholder, figure, pre'

        const isAtomicBlock = (node) => node?.nodeType === 1 && node.matches?.(ATOMIC_BLOCKS)

        const placeCursorIn = (element) => {
            const sel = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(element)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
            element.focus?.()
        }

        const getAdjacentAtomicBlock = (range) => {
            if (!range.collapsed || range.startContainer !== el) return null
            const children = Array.from(el.childNodes)
            const before = children[range.startOffset - 1]
            const after = children[range.startOffset]
            if (isAtomicBlock(before)) return { block: before, side: 'after' }
            if (isAtomicBlock(after)) return { block: after, side: 'before' }
            return blockCaretRef.current?.block && el.contains(blockCaretRef.current.block)
                ? blockCaretRef.current
                : null
        }

        const handleKeyDown = (e) => {
            if (e.key !== 'Enter' || e.shiftKey) return

            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) return

            const range = sel.getRangeAt(0)
            const adjacent = getAdjacentAtomicBlock(range)
            if (adjacent?.block) {
                e.preventDefault()
                e.stopPropagation()

                const p = document.createElement('p')
                p.innerHTML = '<br>'
                p.style.cssText = ''

                if (adjacent.side === 'before') {
                    el.insertBefore(p, adjacent.block)
                } else {
                    adjacent.block.after(p)
                }

                clearAtomicCaret()
                placeCursorIn(p)
                if (handlePageInput) {
                    handlePageInput({ target: el }, pageIndex)
                }
                return
            }

            let node = sel.getRangeAt(0).commonAncestorContainer
            if (node.nodeType === 3) node = node.parentElement

            // Find the outermost escape block
            const block = node.closest(ESCAPE_BLOCKS)
            if (!block || !el.contains(block)) return

            // CRITICAL: div[style] matches the contenteditable container itself!
            // The contenteditable is a <div> with inline styles (padding, maxHeight, etc.)
            // We must NOT treat it as a "block to escape" — that would create a <p> OUTSIDE the editor.
            if (block === el) return

            // Check if cursor is at the end of the block content
            const testRange = document.createRange()
            testRange.selectNodeContents(block)
            testRange.setStart(range.endContainer, range.endOffset)
            const remainingContent = testRange.cloneContents()
            const remainingText = remainingContent.textContent || ''

            // If there's no meaningful text after the cursor, exit the block
            if (remainingText.trim() === '') {
                e.preventDefault()
                e.stopPropagation()

                // Create a new paragraph after the block
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                block.after(p)

                // Place cursor in the new paragraph
                const newRange = document.createRange()
                newRange.selectNodeContents(p)
                newRange.collapse(true)
                sel.removeAllRanges()
                sel.addRange(newRange)

                // Trigger save
                if (handlePageInput) {
                    handlePageInput({ target: el }, pageIndex)
                }
            }
        }

        el.addEventListener('keydown', handleKeyDown)
        return () => el.removeEventListener('keydown', handleKeyDown)
    }, [page.mode, pageIndex, handlePageInput, clearAtomicCaret])

    // ========== CLICK OUTSIDE BLOCK: Place cursor in free area ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const BLOCK_SELECTORS = 'blockquote, table, div[style], pre'
        const ATOMIC_BLOCKS = 'table, img, .dynamic-table, .doc-image-placeholder, figure, pre'
        const RUNTIME_OVERLAYS = '[data-placeholder-resize-overlay], [data-image-resize-overlay]'

        const findSideAtomicBlock = (x, y) => {
            const children = Array.from(el.children || [])
                .filter(child => !child.matches?.(RUNTIME_OVERLAYS))
            for (const child of children) {
                const atomic = child.matches?.(ATOMIC_BLOCKS)
                    ? child
                    : child.querySelector?.(ATOMIC_BLOCKS)
                if (!atomic || !el.contains(atomic)) continue

                const rect = atomic.getBoundingClientRect()
                if (y < rect.top || y > rect.bottom) continue
                if (x < rect.left || x > rect.right) {
                    return { block: atomic, side: x < rect.left + rect.width / 2 ? 'before' : 'after' }
                }
            }
            return null
        }

        // Track mousedown to distinguish genuine clicks from drag-selections
        let mouseDownTarget = null
        let mouseDownPos = { x: 0, y: 0 }

        const handleMouseDown = (e) => {
            mouseDownTarget = e.target
            mouseDownPos = { x: e.clientX, y: e.clientY }
            const atomicBlock = e.target.closest?.(ATOMIC_BLOCKS)
            if (atomicBlock && el.contains(atomicBlock)) {
                e.preventDefault()
            }
        }

        const handleClick = (e) => {
            // GUARD 1: If user has a text selection (non-collapsed), don't interfere
            const sel = window.getSelection()
            if (sel && !sel.isCollapsed) return

            // GUARD 2: If mousedown was on a different target or far away, this is a drag — skip
            if (mouseDownTarget !== e.target) return
            const dx = Math.abs(e.clientX - mouseDownPos.x)
            const dy = Math.abs(e.clientY - mouseDownPos.y)
            if (dx > 5 || dy > 5) return // moved more than 5px = drag, not click

            // Only handle direct clicks on the contenteditable itself
            // (clicks on the padding/empty area, not on children)
            const target = e.target
            if (target.closest?.(RUNTIME_OVERLAYS)) return

            // If click is directly on the contenteditable container
            // or on a simple <p>/<br> (non-block), no action needed - browser handles it
            if (target !== el) {
                const placeholder = target.closest?.('.doc-image-placeholder')
                if (placeholder && el.contains(placeholder)) {
                    e.preventDefault()
                    e.stopPropagation()
                    clearAtomicCaret()
                    return
                }

                const atomicBlock = target.closest?.(ATOMIC_BLOCKS)
                if (atomicBlock && el.contains(atomicBlock)) {
                    e.preventDefault()
                    e.stopPropagation()

                    const rect = atomicBlock.getBoundingClientRect()
                    const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
                    setCaretAroundAtomic(atomicBlock, side)
                    return
                }

                // Check if click is inside a block
                const clickedBlock = target.closest(BLOCK_SELECTORS)
                if (!clickedBlock || !el.contains(clickedBlock)) return // not in a block, browser handles fine
                // User clicked inside a block - that's normal editing, do nothing
                clearAtomicCaret()
                return
            }

            const sideAtomic = findSideAtomicBlock(e.clientX, e.clientY)
            if (sideAtomic?.block) {
                e.preventDefault()
                setCaretAroundAtomic(sideAtomic.block, sideAtomic.side)
                return
            }

            clearAtomicCaret()
        }

        el.addEventListener('mousedown', handleMouseDown)
        el.addEventListener('click', handleClick)
        return () => {
            el.removeEventListener('mousedown', handleMouseDown)
            el.removeEventListener('click', handleClick)
        }
    }, [page.mode, pageIndex, clearAtomicCaret, setCaretAroundAtomic])

    // ========== CHECKBOX TOGGLE: Click ☐ ↔ ☑ ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const handleCheckboxClick = (e) => {
            const target = e.target
            if (!target.classList?.contains('doc-checkbox')) return
            e.preventDefault()
            e.stopPropagation()

            const isChecked = target.getAttribute('data-checked') === 'true'
            target.setAttribute('data-checked', isChecked ? 'false' : 'true')
            target.textContent = isChecked ? '\u2610' : '\u2611'

            // Trigger save
            if (handlePageInput) {
                handlePageInput({ target: el }, pageIndex)
            }
        }

        el.addEventListener('click', handleCheckboxClick)
        return () => el.removeEventListener('click', handleCheckboxClick)
    }, [page.mode, pageIndex, handlePageInput])


    // ========== DROP INDICATOR (ghost line) ==========
    const dropIndicatorRef = useRef(null)
    const dragCounterRef = useRef(0) // track enter/leave for nested elements

    const showDropIndicator = useCallback((x, y) => {
        const el = contentRef.current
        const indicator = dropIndicatorRef.current
        if (!el || !indicator) return

        // Get caret position from mouse coordinates
        let range
        if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(x, y)
        } else if (document.caretPositionFromPoint) {
            const pos = document.caretPositionFromPoint(x, y)
            if (pos) {
                range = document.createRange()
                range.setStart(pos.offsetNode, pos.offset)
                range.collapse(true)
            }
        }

        if (!range) {
            indicator.style.display = 'none'
            return
        }

        // Calculate position relative to the page wrapper (parent of contentRef)
        const pageWrapper = el.parentElement
        const pageRect = pageWrapper.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()

        // Detect zoom level from ancestor transform: scale(N)
        // getBoundingClientRect returns screen coords (post-transform),
        // but position:absolute uses local coords (pre-transform)
        let zoom = 1
        const scaledAncestor = el.closest('[style*="scale"]')
        if (scaledAncestor) {
            const match = scaledAncestor.style.transform?.match(/scale\(([\d.]+)\)/)
            if (match) zoom = parseFloat(match[1])
        }

        // Find the node and closest block element
        let node = range.startContainer
        if (node.nodeType === 3) node = node.parentNode

        // CRITICAL: Do NOT include 'div' — it matches the contenteditable container itself
        // which would position the indicator at the top of the entire editor
        const BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, blockquote, pre, table, ul, ol, li, hr'
        let blockEl = node?.closest?.(BLOCK_SELECTOR)

        // Make sure the block is inside the contenteditable
        if (blockEl && !el.contains(blockEl)) blockEl = null

        let lineTop

        if (blockEl) {
            const blockRect = blockEl.getBoundingClientRect()
            // Determine if cursor is in top half or bottom half of block
            const midY = blockRect.top + blockRect.height / 2
            if (y < midY) {
                // Show indicator above the block
                lineTop = (blockRect.top - pageRect.top) / zoom
            } else {
                // Show indicator below the block
                lineTop = (blockRect.bottom - pageRect.top) / zoom
            }
        } else {
            // No block found — use caret rect directly
            const caretRect = range.getBoundingClientRect()
            if (caretRect.height > 0) {
                lineTop = (caretRect.bottom - pageRect.top) / zoom
            } else {
                // Collapsed range with no height — use mouse Y
                lineTop = (y - pageRect.top) / zoom
            }
        }

        const lineLeft = (elRect.left - pageRect.left) / zoom
        const lineWidth = elRect.width / zoom

        // Show the indicator
        indicator.style.display = 'block'
        indicator.style.top = `${lineTop}px`
        indicator.style.left = `${lineLeft}px`
        indicator.style.width = `${lineWidth}px`
    }, [])

    const hideDropIndicator = useCallback(() => {
        if (dropIndicatorRef.current) {
            dropIndicatorRef.current.style.display = 'none'
        }
    }, [])

    // Handle edition mode drop from sidebar
    const handleEditionDrop = useCallback((e) => {
        e.preventDefault()
        dragCounterRef.current = 0
        hideDropIndicator()

        const html = e.dataTransfer.getData('text/html')
        const text = e.dataTransfer.getData('text/plain')

        if (html || text) {
            // Get drop position
            const range = document.caretRangeFromPoint(e.clientX, e.clientY)
            if (range) {
                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
                document.execCommand('insertHTML', false, html || text)
            }
        }
    }, [hideDropIndicator])

    useEffect(() => {
        if (page.mode !== 'edition') return

        const handleExternalHtmlInsert = (event) => {
            if (!isSelected) return
            const html = event.detail?.html
            const el = contentRef.current
            if (!html || !el) return

            el.focus()

            const sel = window.getSelection()
            if (!sel) return
            let range = null
            if (sel?.rangeCount) {
                const currentRange = sel.getRangeAt(0)
                const ancestor = currentRange.commonAncestorContainer.nodeType === 1
                    ? currentRange.commonAncestorContainer
                    : currentRange.commonAncestorContainer.parentElement
                if (ancestor && el.contains(ancestor)) {
                    range = currentRange
                }
            }

            if (!range) {
                range = document.createRange()
                range.selectNodeContents(el)
                range.collapse(false)
                sel.removeAllRanges()
                sel.addRange(range)
            }

            document.execCommand('insertHTML', false, html)
            handlePageInput?.({ target: el }, pageIndex)
        }

        window.addEventListener('document-editor-insert-html', handleExternalHtmlInsert)
        return () => window.removeEventListener('document-editor-insert-html', handleExternalHtmlInsert)
    }, [page.mode, isSelected, handlePageInput, pageIndex])

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        showDropIndicator(e.clientX, e.clientY)
    }, [showDropIndicator])

    const handleDragEnter = useCallback((e) => {
        e.preventDefault()
        dragCounterRef.current++
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        dragCounterRef.current--
        if (dragCounterRef.current <= 0) {
            dragCounterRef.current = 0
            hideDropIndicator()
        }
    }, [hideDropIndicator])

    // Calculate page dimensions
    const { width, height } = doc.dimensions || { width: 794, height: 1123 }
    const { top, bottom, left, right } = doc.margins || { top: 40, bottom: 40, left: 40, right: 40 }

    const hasHeader = !!doc.headerHtml
    const hasFooter = !!doc.footerHtml

    // Reduce contenteditable padding when header/footer is present (they have their own padding)
    const contentPaddingTop = hasHeader ? 8 : top
    const contentPaddingBottom = hasFooter ? 8 : bottom

    return (
        <div
            className={`bg-white shadow-2xl relative transition-shadow ${isSelected ? 'ring-2 ring-primary/20' : ''
                }`}
            style={{
                width: `${width}px`,
                minHeight: `${height}px`,
                backgroundColor: page.background || '#ffffff',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={onSelect}
        >
            {/* Global Header (non-editable, all pages) */}
            {hasHeader && page.mode === 'edition' && (
                <DocHeaderFooter
                    type="header"
                    html={doc.headerHtml}
                    onRemove={() => setDoc(prev => ({ ...prev, headerHtml: '' }))}
                    paddingLeft={left}
                    paddingRight={right}
                    paddingTop={top}
                />
            )}

            {/* Edition Mode */}
            {page.mode === 'edition' && (
                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none text-black"
                    style={{
                        padding: `${contentPaddingTop}px ${right}px ${contentPaddingBottom}px ${left}px`,
                        flex: 1,
                        minHeight: 0,
                        maxHeight: `${height - (hasHeader ? 0 : 0) - (hasFooter ? 0 : 0)}px`,
                        overflow: 'hidden',
                        color: '#000000',
                        caretColor: '#000000',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: '1.6'
                    }}
                    onInput={(e) => handlePageInput(e, pageIndex)}
                    onPaste={(e) => handlePaste(e, pageIndex)}
                    onKeyDown={(e) => handleKeyDown?.(e, pageIndex, contentRef)}
                    onDrop={handleEditionDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                />
            )}

            {/* Drop Position Indicator (ghost line) */}
            {page.mode === 'edition' && (
                <div
                    ref={dropIndicatorRef}
                    style={{
                        display: 'none',
                        position: 'absolute',
                        height: '2px',
                        background: '#4361ee',
                        borderRadius: '1px',
                        pointerEvents: 'none',
                        zIndex: 50,
                        transition: 'top 0.08s ease-out, left 0.08s ease-out, width 0.08s ease-out',
                        boxShadow: '0 0 6px rgba(67, 97, 238, 0.4)',
                    }}
                >
                    {/* Left endpoint circle */}
                    <div style={{
                        position: 'absolute',
                        left: '-3px',
                        top: '-3px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#4361ee',
                        boxShadow: '0 0 4px rgba(67, 97, 238, 0.5)',
                    }} />
                    {/* Right endpoint circle */}
                    <div style={{
                        position: 'absolute',
                        right: '-3px',
                        top: '-3px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#4361ee',
                        boxShadow: '0 0 4px rgba(67, 97, 238, 0.5)',
                    }} />
                </div>
            )}

            {/* Table Toolbar (floating, edition mode only) */}
            {page.mode === 'edition' && (
                <TableToolbar {...tableToolbarProps} />
            )}

            {/* Dynamic Table Overlay (floating, edition mode only) */}
            {page.mode === 'edition' && (
                <DynamicTableOverlay
                    activeConfig={dtOverlay.activeConfig}
                    overlayPos={dtOverlay.overlayPos}
                    openModal={dtOverlay.openModal}
                />
            )}

            {/* Dynamic Table Modal */}
            {page.mode === 'edition' && (
                <DynamicTableModal
                    open={dtOverlay.modalOpen}
                    onClose={dtOverlay.closeModal}
                    config={dtOverlay.activeConfig}
                    accountNumber={accountNumber}
                    documentId={documentId}
                    sourceRecordId={sourceRecordId}
                    activePlaceholder={dtOverlay.activePlaceholder}
                />
            )}


            {/* Global Footer (non-editable, all pages) */}
            {hasFooter && page.mode === 'edition' && (
                <DocHeaderFooter
                    type="footer"
                    html={doc.footerHtml}
                    onRemove={() => setDoc(prev => ({ ...prev, footerHtml: '' }))}
                    paddingLeft={left}
                    paddingRight={right}
                    paddingBottom={bottom}
                />
            )}

            {/* Layout Mode */}
            {page.mode === 'layout' && (
                <div
                    className="min-h-full"
                    style={{
                        padding: `${top}px ${right}px ${bottom}px ${left}px`,
                        minHeight: `${height}px`
                    }}
                >
                    <LayoutModeContent
                        page={page}
                        pageIndex={pageIndex}
                        doc={doc}
                        setDoc={setDoc}
                        panelMode={panelMode}
                    />
                </div>
            )}

            {/* Designer Mode */}
            {page.mode === 'designer' && (
                <div
                    className="relative"
                    style={{
                        minHeight: `${height}px`,
                        height: `${height}px`,
                        overflow: 'hidden'
                    }}
                >
                    <DesignerModeContent
                        page={page}
                        pageIndex={pageIndex}
                        doc={doc}
                        setDoc={setDoc}
                    />
                </div>
            )}
        </div>
    )
}

// ========== HEADER/FOOTER COMPONENT ==========
// Non-editable, rendered on every page from doc-level headerHtml/footerHtml
function DocHeaderFooter({ type, html, onRemove, paddingLeft, paddingRight, paddingTop, paddingBottom }) {
    const [hovered, setHovered] = React.useState(false)

    return (
        <div
            contentEditable={false}
            style={{
                position: 'relative',
                padding: `${type === 'header' ? (paddingTop || 20) : 12}px ${paddingRight || 40}px ${type === 'footer' ? (paddingBottom || 20) : 12}px ${paddingLeft || 40}px`,
                color: '#000000',
                userSelect: 'none',
                flexShrink: 0,
                cursor: 'default'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Rendered HTML content */}
            <div
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ pointerEvents: 'none' }}
            />

            {/* Hover overlay with label + remove button */}
            {hovered && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px solid rgba(59,130,246,0.4)',
                        borderRadius: '0',
                        background: 'rgba(59,130,246,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        zIndex: 5,
                        pointerEvents: 'none'
                    }}
                >
                    {/* Label */}
                    <span
                        style={{
                            position: 'absolute',
                            top: type === 'header' ? '4px' : 'auto',
                            bottom: type === 'footer' ? '4px' : 'auto',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#3b82f6',
                            background: 'white',
                            padding: '1px 8px',
                            borderRadius: '4px',
                            border: '1px solid rgba(59,130,246,0.3)',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {type === 'header' ? 'En-tête (toutes les pages)' : 'Pied de page (toutes les pages)'}
                    </span>

                    {/* Remove button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onRemove()
                        }}
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            lineHeight: 1,
                            cursor: 'pointer',
                            zIndex: 10,
                            border: '2px solid white',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            pointerEvents: 'auto'
                        }}
                        title={`Supprimer ${type === 'header' ? "l'en-tête" : 'le pied de page'}`}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    )
}


// ========== LAYOUT BLOCK: Editable text/html block ==========
function EditableBlock({ block, onUpdate, onDelete }) {
    const contentRef = useRef(null)
    const [focused, setFocused] = useState(false)
    const [hovered, setHovered] = useState(false)

    const handleBlur = useCallback(() => {
        setFocused(false)
        if (contentRef.current) {
            const newContent = contentRef.current.innerHTML
            if (newContent !== block.content) {
                onUpdate({ ...block, content: newContent })
            }
        }
    }, [block, onUpdate])

    const handleFocus = useCallback(() => {
        setFocused(true)
    }, [])

    const showBorder = hovered || focused

    return (
        <div
            className="group/el relative"
            style={{ position: 'relative' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Floating controls — only on hover */}
            <div
                style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-4px',
                    display: 'flex',
                    gap: '3px',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.15s',
                    zIndex: 20,
                    pointerEvents: hovered ? 'auto' : 'none',
                }}
            >
                <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete() }}
                    style={{
                        width: '22px', height: '22px',
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        lineHeight: 1,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    }}
                    title="Supprimer"
                >
                    <iconify-icon icon="solar:trash-bin-minimalistic-bold" width="12"></iconify-icon>
                </button>
            </div>

            {/* Editable content */}
            <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: block.content || '' }}
                onBlur={handleBlur}
                onFocus={handleFocus}
                style={{
                    outline: 'none',
                    minHeight: '20px',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    border: showBorder ? '1px solid rgba(67,97,238,0.3)' : '1px solid transparent',
                    boxShadow: focused ? '0 0 0 3px rgba(67,97,238,0.12)' : 'none',
                    cursor: 'text',
                    background: showBorder ? 'rgba(67,97,238,0.02)' : 'transparent',
                }}
            />
        </div>
    )
}

// ========== LAYOUT BLOCK: Resizable image block ==========
function ResizableImageBlock({ block, onUpdate, onDelete }) {
    const [imgWidth, setImgWidth] = useState(block.width || null)
    const [resizing, setResizing] = useState(false)
    const [hovered, setHovered] = useState(false)
    const imgRef = useRef(null)
    const startRef = useRef({ x: 0, w: 0 })

    const startResize = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const currentWidth = imgRef.current?.offsetWidth || 200
        startRef.current = { x: clientX, w: currentWidth }
        setResizing(true)

        const doMove = (ev) => {
            const cx = ev.touches ? ev.touches[0].clientX : ev.clientX
            const delta = cx - startRef.current.x
            const newW = Math.max(60, startRef.current.w + delta)
            setImgWidth(newW)
        }
        const doEnd = () => {
            document.removeEventListener('mousemove', doMove)
            document.removeEventListener('mouseup', doEnd)
            document.removeEventListener('touchmove', doMove)
            document.removeEventListener('touchend', doEnd)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            setResizing(false)
            // Save the final width
            const finalW = imgRef.current?.offsetWidth
            if (finalW) {
                onUpdate({ ...block, width: finalW })
            }
        }

        document.addEventListener('mousemove', doMove)
        document.addEventListener('mouseup', doEnd)
        document.addEventListener('touchmove', doMove, { passive: false })
        document.addEventListener('touchend', doEnd)
        document.body.style.cursor = 'nwse-resize'
        document.body.style.userSelect = 'none'
    }, [block, onUpdate])

    const showBorder = hovered || resizing

    return (
        <div
            className="group/el relative"
            style={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '100%',
                borderRadius: '8px',
                border: showBorder ? '1px solid rgba(67,97,238,0.3)' : '1px solid transparent',
                padding: showBorder ? '4px' : '4px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: showBorder ? '0 0 0 3px rgba(67,97,238,0.08)' : 'none',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Floating controls */}
            <div
                style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-4px',
                    display: 'flex',
                    gap: '3px',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.15s',
                    zIndex: 20,
                    pointerEvents: hovered ? 'auto' : 'none',
                }}
            >
                <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete() }}
                    style={{
                        width: '22px', height: '22px',
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    }}
                    title="Supprimer"
                >
                    <iconify-icon icon="solar:trash-bin-minimalistic-bold" width="12"></iconify-icon>
                </button>
            </div>

            {/* Image */}
            <img
                ref={imgRef}
                src={block.src}
                alt={block.alt || ''}
                style={{
                    width: imgWidth ? `${imgWidth}px` : '100%',
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '6px',
                    outline: resizing ? '2px solid rgba(67,97,238,0.5)' : 'none',
                }}
            />

            {/* Resize handle — bottom-right corner */}
            <div
                onMouseDown={startResize}
                onTouchStart={startResize}
                style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    width: '16px',
                    height: '16px',
                    cursor: 'nwse-resize',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.15s',
                    zIndex: 15,
                    touchAction: 'none',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
            >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M12 2L2 12M12 6L6 12M12 10L10 12" stroke="rgba(67,97,238,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>
        </div>
    )
}


// Layout Mode Content — uses shared GridBuilder for unified grid editing
function LayoutModeContent({ page, pageIndex, doc, setDoc, panelMode }) {
    const rows = page.rows || []

    const handleRowsChange = useCallback((newRows) => {
        setDoc(prev => {
            const pages = [...prev.pages]
            pages[pageIndex] = { ...pages[pageIndex], rows: newRows }
            return { ...prev, pages }
        })
    }, [pageIndex, setDoc])

    const handleDropInColumn = useCallback((rowIndex, colIndex, data) => {
        if (!data.html && !data.text) return

        setDoc(prev => {
            const pages = [...prev.pages]
            const updatedPage = { ...pages[pageIndex] }
            const rows = [...(updatedPage.rows || [])]
            const row = { ...rows[rowIndex] }
            const columns = [...row.columns]
            const column = { ...columns[colIndex] }

            // Create a new block from the dropped content
            const block = {
                id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: 'html',
                content: data.html || data.text
            }

            column.blocks = [...(column.blocks || []), block]
            columns[colIndex] = column
            row.columns = columns
            rows[rowIndex] = row
            updatedPage.rows = rows
            pages[pageIndex] = updatedPage
            return { ...prev, pages }
        })
    }, [pageIndex, setDoc])

    // Unified block update helper
    const updateBlock = useCallback((rowIndex, colIndex, blockIndex, updatedBlock) => {
        setDoc(prev => {
            const pages = [...prev.pages]
            const updatedPage = { ...pages[pageIndex] }
            const rows = [...updatedPage.rows]
            const row = { ...rows[rowIndex] }
            const columns = [...row.columns]
            const column = { ...columns[colIndex] }
            const blocks = [...column.blocks]
            blocks[blockIndex] = updatedBlock
            column.blocks = blocks
            columns[colIndex] = column
            row.columns = columns
            rows[rowIndex] = row
            updatedPage.rows = rows
            pages[pageIndex] = updatedPage
            return { ...prev, pages }
        })
    }, [pageIndex, setDoc])

    const deleteBlock = useCallback((rowIndex, colIndex, blockIndex) => {
        setDoc(prev => {
            const pages = [...prev.pages]
            const updatedPage = { ...pages[pageIndex] }
            const rows = [...updatedPage.rows]
            const row = { ...rows[rowIndex] }
            const columns = [...row.columns]
            const column = { ...columns[colIndex] }
            column.blocks = column.blocks.filter((_, i) => i !== blockIndex)
            columns[colIndex] = column
            row.columns = columns
            rows[rowIndex] = row
            updatedPage.rows = rows
            pages[pageIndex] = updatedPage
            return { ...prev, pages }
        })
    }, [pageIndex, setDoc])

    const renderBlock = useCallback((block, colIndex, rowIndex, blockIndex) => {
        const onUpdate = (updatedBlock) => updateBlock(rowIndex, colIndex, blockIndex, updatedBlock)
        const onDel = () => deleteBlock(rowIndex, colIndex, blockIndex)

        // Image blocks — resizable
        if (block.type === 'image') {
            return (
                <ResizableImageBlock
                    key={block.id || blockIndex}
                    block={block}
                    onUpdate={onUpdate}
                    onDelete={onDel}
                />
            )
        }

        // Text / HTML blocks — inline editable
        if (block.type === 'text' || block.type === 'html' || !block.type) {
            return (
                <EditableBlock
                    key={block.id || blockIndex}
                    block={block}
                    onUpdate={onUpdate}
                    onDelete={onDel}
                />
            )
        }

        // Fallback
        return (
            <div className="group/el relative" style={{ position: 'relative' }}>
                <div dangerouslySetInnerHTML={{ __html: block.content || '' }} />
            </div>
        )
    }, [updateBlock, deleteBlock])

    // Render a lightweight preview for the drag overlay ghost
    const renderDragOverlay = useCallback((block) => {
        if (block.type === 'image') {
            return (
                <div style={{ pointerEvents: 'none' }}>
                    <img
                        src={block.src}
                        alt={block.alt || ''}
                        style={{
                            width: block.width ? `${block.width}px` : '100%',
                            maxWidth: '300px',
                            height: 'auto',
                            borderRadius: '6px',
                        }}
                    />
                </div>
            )
        }
        return (
            <div
                style={{
                    pointerEvents: 'none',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    maxHeight: '120px',
                    overflow: 'hidden',
                }}
                dangerouslySetInnerHTML={{ __html: block.content || '<p>Block</p>' }}
            />
        )
    }, [])

    return (
        <GridBuilder
            rows={rows}
            onRowsChange={handleRowsChange}
            renderBlock={renderBlock}
            renderDragOverlay={renderDragOverlay}
            onDropInColumn={handleDropInColumn}
            panelMode={panelMode}
        />
    )
}

// Designer Mode Content — Canva-like free-form canvas
function DesignerModeContent({ page, pageIndex, doc, setDoc }) {
    return (
        <DesignerCanvas
            page={page}
            pageIndex={pageIndex}
            doc={doc}
            setDoc={setDoc}
        />
    )
}

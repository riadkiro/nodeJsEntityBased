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
import {
    FOOTER_PRESETS,
    HEADER_PRESETS,
    headerFooterHasLine,
    normalizeHeaderFooterHtml,
    stripHeaderFooterLineFromElement
} from '../utils/headerFooterPresets'

const EDITOR_HISTORY_EVENT = 'dexio:document-editor-before-mutation'

function requestEditorUndoCheckpoint(label) {
    window.dispatchEvent(new CustomEvent(EDITOR_HISTORY_EVENT, { detail: { label } }))
}

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
    sourceRecordId,
    triggerSave
}) {
    const contentRef = useRef(null)
    const blockCaretRef = useRef(null)
    const placeholderOverlayRef = useRef(null)
    const placeholderResizeRef = useRef(null)
    const imageCropRef = useRef(null)
    const imageContextMenuRef = useRef(null)
    const selectedTableRef = useRef(null)
    const [headerFooterChooser, setHeaderFooterChooser] = useState(null)

    // Table toolbar for edition mode
    const tableToolbarProps = useTableToolbar(
        contentRef,
        (eventLike = null) => handlePageInput?.({ target: contentRef.current, ...(eventLike || {}) }, pageIndex)
    )
    const { selectTable: selectTableForToolbar, clearToolbar: clearTableToolbar } = tableToolbarProps

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
        contentRef.current?.querySelectorAll?.('[data-atomic-caret]').forEach(marker => marker.remove())
        blockCaretRef.current = null
    }, [])

    const clearSelectedTable = useCallback((options = {}) => {
        if (selectedTableRef.current) {
            selectedTableRef.current.removeAttribute('data-table-selected')
            selectedTableRef.current = null
        }
        if (options.clearToolbar) {
            clearTableToolbar?.()
        }
    }, [clearTableToolbar])

    const getEditorZoom = useCallback(() => {
        const el = contentRef.current
        const scaledAncestor = el?.closest('[style*="scale"]')
        const match = scaledAncestor?.style?.transform?.match(/scale\(([\d.]+)\)/)
        const zoom = match ? parseFloat(match[1]) : 1
        return Number.isFinite(zoom) && zoom > 0 ? zoom : 1
    }, [])

    const positionAtomicCaret = useCallback(() => {
        const el = contentRef.current
        const state = blockCaretRef.current
        const marker = state?.marker || el?.querySelector?.('[data-atomic-caret]')
        const block = state?.block

        if (!el || !state || !marker || !block || !el.contains(block) || !el.contains(marker)) {
            el?.querySelectorAll?.('[data-atomic-caret]').forEach(node => node.remove())
            blockCaretRef.current = null
            return
        }

        el.querySelectorAll?.('[data-atomic-caret]').forEach(node => {
            if (node !== marker) node.remove()
        })

        const pageWrapper = el.parentElement
        const blockRect = block.getBoundingClientRect()
        const wrapperRect = pageWrapper?.getBoundingClientRect?.() || el.getBoundingClientRect()
        const contentRect = el.getBoundingClientRect()
        const zoom = getEditorZoom()
        const rawLeft = state.side === 'before' ? blockRect.left - 6 : blockRect.right + 4
        const clampedLeft = Math.max(contentRect.left + 2, Math.min(rawLeft, contentRect.right - 4))

        marker.style.top = `${(blockRect.top - wrapperRect.top) / zoom}px`
        marker.style.left = `${(clampedLeft - wrapperRect.left) / zoom}px`
        marker.style.height = `${Math.max(18, blockRect.height / zoom)}px`
        marker.style.display = 'block'
    }, [getEditorZoom])

    const setCaretAroundAtomic = useCallback((block, side) => {
        const el = contentRef.current
        if (!el || !block || !el.contains(block)) return

        clearSelectedTable({ clearToolbar: true })
        clearAtomicCaret()
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

        const marker = document.createElement('span')
        marker.setAttribute('data-atomic-caret', '1')
        marker.contentEditable = 'false'
        marker.setAttribute('aria-hidden', 'true')
        marker.style.cssText = `
            position: absolute;
            width: 2px;
            background: #2563eb;
            border-radius: 2px;
            pointer-events: none;
            z-index: 95;
            display: none;
            transition: top 0.06s ease-out, left 0.06s ease-out, height 0.06s ease-out;
        `
        el.appendChild(marker)
        blockCaretRef.current = { block, side, marker }
        positionAtomicCaret()
        requestAnimationFrame(positionAtomicCaret)
        el.focus()
    }, [clearAtomicCaret, clearSelectedTable, positionAtomicCaret])

    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        let frame = null
        const schedulePosition = () => {
            if (frame) return
            frame = requestAnimationFrame(() => {
                frame = null
                positionAtomicCaret()
            })
        }

        const observer = new MutationObserver((mutations) => {
            const shouldReposition = mutations.some(mutation => {
                const target = mutation.target?.nodeType === 1 ? mutation.target : mutation.target?.parentElement
                return !target?.closest?.('[data-atomic-caret]')
            })
            if (shouldReposition) schedulePosition()
        })
        observer.observe(el, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        })

        const resizeObserver = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(schedulePosition)
            : null
        resizeObserver?.observe(el)
        Array.from(el.children || []).forEach(child => {
            if (!child.matches?.('[data-atomic-caret]')) resizeObserver?.observe(child)
        })

        const canvas = el.closest('.overflow-auto')
        window.addEventListener('resize', schedulePosition)
        window.addEventListener('scroll', schedulePosition, true)
        canvas?.addEventListener('scroll', schedulePosition, { passive: true })
        el.addEventListener('input', schedulePosition)
        el.addEventListener('keyup', schedulePosition)
        el.addEventListener('mouseup', schedulePosition)

        return () => {
            if (frame) cancelAnimationFrame(frame)
            observer.disconnect()
            resizeObserver?.disconnect()
            window.removeEventListener('resize', schedulePosition)
            window.removeEventListener('scroll', schedulePosition, true)
            canvas?.removeEventListener('scroll', schedulePosition)
            el.removeEventListener('input', schedulePosition)
            el.removeEventListener('keyup', schedulePosition)
            el.removeEventListener('mouseup', schedulePosition)
        }
    }, [page.mode, positionAtomicCaret])

    const selectAtomicTable = useCallback((table, cell = null) => {
        const el = contentRef.current
        if (!el || !table || !el.contains(table)) return

        clearAtomicCaret()
        if (selectedTableRef.current && selectedTableRef.current !== table) {
            selectedTableRef.current.removeAttribute('data-table-selected')
        }
        selectedTableRef.current = table
        table.setAttribute('data-table-selected', '1')
        selectTableForToolbar?.(table, cell || table.querySelector('td, th'))

        const sel = window.getSelection()
        if (sel) sel.removeAllRanges()
        el.focus({ preventScroll: true })
    }, [clearAtomicCaret, selectTableForToolbar])

    useEffect(() => {
        return () => clearSelectedTable({ clearToolbar: true })
    }, [clearSelectedTable])

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

            requestEditorUndoCheckpoint('delete-image-frame')
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
                top:-14px;
                right:-14px;
                width:28px;
                height:28px;
                border-radius:999px;
                border:3px solid #fff;
                background:#dc2626;
                color:#fff;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:0;
                font-size:20px;
                font-weight:700;
                line-height:1;
                cursor:pointer;
                pointer-events:auto;
                box-shadow:0 5px 16px rgba(185,28,28,.34), 0 1px 4px rgba(15,23,42,.28);
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
        const RUNTIME_OVERLAYS = '[data-placeholder-resize-overlay], [data-placeholder-resize-handle], [data-placeholder-delete], [data-image-resize-overlay], [data-atomic-caret], .doc-block-delete-btn'

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
            if (block._docBlockDeleteButton?.isConnected || block.querySelector('.doc-block-delete-btn')) return

            if (block.tagName === 'TABLE') {
                const editorPos = window.getComputedStyle(el).position
                if (editorPos === 'static') el.style.position = 'relative'
            } else {
                // Ensure the block has position:relative so the absolute delete button works
                const pos = window.getComputedStyle(block).position
                if (pos === 'static') {
                    block.style.position = 'relative'
                }
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
                requestEditorUndoCheckpoint('delete-block')
                // Insert a <p><br></p> where the block was, so cursor has somewhere to go
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                btn.remove()
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
            btn.addEventListener('mouseleave', (event) => {
                const related = event.relatedTarget
                if (related && block.contains(related)) return
                if (block._docBlockDeleteButton === btn) delete block._docBlockDeleteButton
                btn.remove()
            })

            if (block.tagName === 'TABLE') {
                const blockRect = block.getBoundingClientRect()
                const editorRect = el.getBoundingClientRect()
                const localTop = Math.max(2, blockRect.top - editorRect.top - 14)
                const localLeft = Math.min(
                    Math.max(2, blockRect.right - editorRect.left - 14),
                    Math.max(2, el.clientWidth - 30)
                )
                btn.style.top = `${localTop}px`
                btn.style.left = `${localLeft}px`
                btn.style.right = 'auto'
                el.appendChild(btn)
            } else {
                block.appendChild(btn)
            }
            block._docBlockDeleteButton = btn
        }

        const handleMouseOut = (e) => {
            const block = findTopBlock(e.target)
            if (!block) return

            // Check if mouse is still inside the block
            const related = e.relatedTarget
            const btn = block._docBlockDeleteButton || block.querySelector('.doc-block-delete-btn')
            if (related && (block.contains(related) || btn?.contains?.(related))) return

            // Remove delete button and reset position
            if (block._docBlockDeleteButton === btn) delete block._docBlockDeleteButton
            if (btn) btn.remove()
        }

        el.addEventListener('mouseover', handleMouseOver)
        el.addEventListener('mouseout', handleMouseOut)

        return () => {
            el.removeEventListener('mouseover', handleMouseOver)
            el.removeEventListener('mouseout', handleMouseOut)
            el.querySelectorAll('.doc-block-delete-btn').forEach(btn => btn.remove())
        }
    }, [page.mode, pageIndex, handlePageInput])

    // ========== BLOCK ESCAPE: Enter at end of block exits it ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const ESCAPE_BLOCKS = 'blockquote, pre, div[style], table'
        const ATOMIC_BLOCKS = 'table, img, .dynamic-table, .doc-image-placeholder, figure, pre, blockquote, div[style], ul, ol, .doc-separator-container'
        const TABLE_CELL_SELECTOR = 'td, th'

        const isAtomicBlock = (node) => node?.nodeType === 1 && node.matches?.(ATOMIC_BLOCKS)
        const isInsideTableCell = (node) => {
            const element = node?.nodeType === 3 ? node.parentElement : node
            const cell = element?.closest?.(TABLE_CELL_SELECTOR)
            return !!(cell && el.contains(cell))
        }
        const getContainingTableCell = (node) => {
            const element = node?.nodeType === 3 ? node.parentElement : node
            const cell = element?.closest?.(TABLE_CELL_SELECTOR)
            return cell && el.contains(cell) ? cell : null
        }
        const isCaretAtCellBoundary = (cell, range, boundary) => {
            if (!cell || !range.collapsed) return false

            const probe = range.cloneRange()
            probe.selectNodeContents(cell)
            if (boundary === 'start') {
                probe.setEnd(range.startContainer, range.startOffset)
            } else {
                probe.setStart(range.endContainer, range.endOffset)
            }

            return probe.toString().replace(/\u00A0/g, ' ').trim() === ''
        }
        const isFirstTableCell = (table, cell) => {
            const first = table?.querySelector?.(TABLE_CELL_SELECTOR)
            return first === cell
        }
        const isLastTableCell = (table, cell) => {
            const cells = table ? Array.from(table.querySelectorAll(TABLE_CELL_SELECTOR)) : []
            return cells.length > 0 && cells[cells.length - 1] === cell
        }
        const getContainingEditableBlock = (node) => {
            const element = node?.nodeType === 3 ? node.parentElement : node
            const block = element?.closest?.('p, div')
            return block && block.parentElement === el ? block : null
        }
        const isEmptyEditableBlock = (block) => {
            if (!block || block === el || block.matches?.(ATOMIC_BLOCKS)) return false
            if (block.querySelector?.('table, img, .doc-image-placeholder, .dynamic-table, input, textarea, select, button')) return false
            const text = (block.textContent || '').replace(/\u200B/g, '').replace(/\u00A0/g, ' ').trim()
            if (text) return false
            return block.innerHTML.replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/gi, '').trim() === ''
        }
        const getAdjacentTableForEmptyBlock = (block) => {
            if (!isEmptyEditableBlock(block)) return null

            const next = block.nextElementSibling
            if (next?.tagName === 'TABLE') return { emptyBlock: block, table: next, side: 'before' }

            const prev = block.previousElementSibling
            if (prev?.tagName === 'TABLE') return { emptyBlock: block, table: prev, side: 'after' }

            return null
        }
        const getRootElementBeforeOffset = (offset) => {
            const nodes = Array.from(el.childNodes)
            for (let i = offset - 1; i >= 0; i--) {
                if (nodes[i]?.nodeType === 1) return nodes[i]
            }
            return null
        }
        const getRootElementAfterOffset = (offset) => {
            const nodes = Array.from(el.childNodes)
            for (let i = offset; i < nodes.length; i++) {
                if (nodes[i]?.nodeType === 1) return nodes[i]
            }
            return null
        }
        const getEmptyBlockBesideRootTableCaret = (range) => {
            if (!range.collapsed || range.startContainer !== el) return null

            const before = getRootElementBeforeOffset(range.startOffset)
            const after = getRootElementAfterOffset(range.startOffset)

            if (after?.tagName === 'TABLE' && isEmptyEditableBlock(before)) {
                return { emptyBlock: before, table: after, side: 'before' }
            }

            if (before?.tagName === 'TABLE' && isEmptyEditableBlock(after)) {
                return { emptyBlock: after, table: before, side: 'after' }
            }

            return null
        }
        const hasTableTopSpacing = (table) => {
            if (!table || table.tagName !== 'TABLE') return false
            const computedTop = Number.parseFloat(window.getComputedStyle(table).marginTop || '0') || 0
            const inlineTop = Number.parseFloat(table.style.marginTop || '0') || 0
            return computedTop > 0 || inlineTop > 0
        }

        const removeTableTopSpacing = (table) => {
            if (!hasTableTopSpacing(table)) return false

            table.style.marginTop = '0px'
            return true
        }

        const placeCursorIn = (element) => {
            const sel = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(element)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
            element.focus?.()
        }

        const insertParagraphAround = (block, side) => {
            const p = document.createElement('p')
            p.innerHTML = '<br>'
            p.style.cssText = ''

            if (side === 'before') {
                el.insertBefore(p, block)
            } else {
                block.after(p)
            }

            clearAtomicCaret()
            clearSelectedTable({ clearToolbar: true })
            placeCursorIn(p)
            return p
        }

        const deleteSelectedTable = (table) => {
            if (!table || !el.contains(table)) return

            requestEditorUndoCheckpoint('delete-table')
            const next = table.nextElementSibling
            const prev = table.previousElementSibling
            table.remove()
            clearAtomicCaret()
            clearSelectedTable({ clearToolbar: true })

            let target = null
            if (next?.tagName === 'P') target = next
            else if (prev?.tagName === 'P') target = prev
            else {
                target = document.createElement('p')
                target.innerHTML = '<br>'
                if (next && el.contains(next)) {
                    el.insertBefore(target, next)
                } else {
                    el.appendChild(target)
                }
            }

            placeCursorIn(target)
            handlePageInput?.({ target: el }, pageIndex)
        }

        const getAdjacentAtomicBlock = (range) => {
            if (!range.collapsed) return null
            if (blockCaretRef.current?.block && el.contains(blockCaretRef.current.block)) {
                return blockCaretRef.current
            }
            if (range.startContainer !== el) return null
            const children = Array.from(el.childNodes)
            const before = children[range.startOffset - 1]
            const after = children[range.startOffset]
            if (isAtomicBlock(before)) return { block: before, side: 'after' }
            if (isAtomicBlock(after)) return { block: after, side: 'before' }
            return null
        }

        const handleKeyDown = (e) => {
            const selectedTable = selectedTableRef.current
            if (selectedTable && el.contains(selectedTable)) {
                if (e.key === 'Escape') {
                    e.preventDefault()
                    e.stopPropagation()
                    clearSelectedTable({ clearToolbar: true })
                    return
                }

                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    e.stopPropagation()
                    insertParagraphAround(selectedTable, 'after')
                    handlePageInput?.({ target: el }, pageIndex)
                    return
                }

                if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault()
                    e.stopPropagation()
                    deleteSelectedTable(selectedTable)
                    return
                }
            }

            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) return

            const range = sel.getRangeAt(0)
            const tableCell = getContainingTableCell(range.startContainer)
            if (tableCell) {
                const table = tableCell.closest('table')
                const shouldSelectTableFromCellBoundary =
                    (e.key === 'Backspace' && isFirstTableCell(table, tableCell) && isCaretAtCellBoundary(tableCell, range, 'start')) ||
                    (e.key === 'Delete' && isLastTableCell(table, tableCell) && isCaretAtCellBoundary(tableCell, range, 'end'))

                if (shouldSelectTableFromCellBoundary) {
                    e.preventDefault()
                    e.stopPropagation()
                    selectAtomicTable(table, tableCell)
                    return
                }

                clearAtomicCaret()
                if (selectedTableRef.current) clearSelectedTable()
                return
            }

            if ((e.key === 'Backspace' || e.key === 'Delete') && range.collapsed) {
                const emptyBlock = getContainingEditableBlock(range.startContainer)
                const adjacentEmptyBlockTable =
                    getAdjacentTableForEmptyBlock(emptyBlock) ||
                    getEmptyBlockBesideRootTableCaret(range)
                if (adjacentEmptyBlockTable?.table) {
                    e.preventDefault()
                    e.stopPropagation()
                    requestEditorUndoCheckpoint('remove-table-spacer')
                    adjacentEmptyBlockTable.emptyBlock.remove()
                    if (adjacentEmptyBlockTable.side === 'before') {
                        removeTableTopSpacing(adjacentEmptyBlockTable.table)
                    }
                    setCaretAroundAtomic(adjacentEmptyBlockTable.table, adjacentEmptyBlockTable.side)
                    handlePageInput?.({ target: el }, pageIndex)
                    return
                }
            }

            const adjacent = getAdjacentAtomicBlock(range)

            if (adjacent?.block?.tagName === 'TABLE') {
                if (e.key === 'Delete' && adjacent.side === 'before' && hasTableTopSpacing(adjacent.block)) {
                    e.preventDefault()
                    e.stopPropagation()
                    requestEditorUndoCheckpoint('remove-table-spacing')
                    removeTableTopSpacing(adjacent.block)
                    setCaretAroundAtomic(adjacent.block, 'before')
                    handlePageInput?.({ target: el }, pageIndex)
                    return
                }

                const shouldSelectForDelete =
                    (e.key === 'Backspace' && adjacent.side === 'after') ||
                    (e.key === 'Delete' && adjacent.side === 'before')

                if (shouldSelectForDelete) {
                    e.preventDefault()
                    e.stopPropagation()
                    selectAtomicTable(adjacent.block)
                    return
                }
            }

            const isPlainTyping = e.key?.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
            if (isPlainTyping && adjacent?.block) {
                insertParagraphAround(adjacent.block, adjacent.side)
                return
            }

            if (e.key !== 'Enter' || e.shiftKey) return

            if (adjacent?.block) {
                e.preventDefault()
                e.stopPropagation()

                insertParagraphAround(adjacent.block, adjacent.side)
                if (handlePageInput) {
                    handlePageInput({ target: el }, pageIndex)
                }
                return
            }

            let node = sel.getRangeAt(0).commonAncestorContainer
            if (node.nodeType === 3) node = node.parentElement

            // Find the outermost escape block so Enter exits the whole styled block,
            // not an inner div/p that belongs to the block's visual design.
            let block = node.closest(ESCAPE_BLOCKS)
            let parent = block?.parentElement
            while (parent && parent !== el) {
                if (parent.matches?.(ESCAPE_BLOCKS)) {
                    block = parent
                }
                parent = parent.parentElement
            }
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

        const handlePasteIntoAtomicCaret = () => {
            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) return

            const range = sel.getRangeAt(0)
            if (isInsideTableCell(range.startContainer)) return

            const adjacent = getAdjacentAtomicBlock(range)
            if (adjacent?.block) {
                insertParagraphAround(adjacent.block, adjacent.side)
            }
        }

        el.addEventListener('keydown', handleKeyDown)
        el.addEventListener('paste', handlePasteIntoAtomicCaret)
        return () => {
            el.removeEventListener('keydown', handleKeyDown)
            el.removeEventListener('paste', handlePasteIntoAtomicCaret)
        }
    }, [page.mode, pageIndex, handlePageInput, clearAtomicCaret, clearSelectedTable, selectAtomicTable, setCaretAroundAtomic])

    // ========== CLICK OUTSIDE BLOCK: Place cursor in free area ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const BLOCK_SELECTORS = 'blockquote, table, div[style], pre, ul, ol, .doc-separator-container'
        const ATOMIC_BLOCKS = 'table, img, .dynamic-table, .doc-image-placeholder, figure, pre, blockquote, div[style], ul, ol, .doc-separator-container'
        const RUNTIME_OVERLAYS = '[data-placeholder-resize-overlay], [data-image-resize-overlay], [data-atomic-caret]'
        const TABLE_CELL_SELECTOR = 'td, th'
        const TABLE_EDGE_TOLERANCE = 6
        const BLOCK_EDGE_TOLERANCE = 12

        const getTopEditableBlock = (target, selector = ATOMIC_BLOCKS) => {
            const element = target?.nodeType === 3 ? target.parentElement : target
            const block = element?.closest?.(selector)
            if (!block || block === el || !el.contains(block)) return null

            let topBlock = block
            let parent = block.parentElement
            while (parent && parent !== el) {
                if (parent.matches?.(selector)) topBlock = parent
                parent = parent.parentElement
            }
            return topBlock === el ? null : topBlock
        }

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

        const getBlockSideHit = (event) => {
            const block = getTopEditableBlock(event.target)
            if (!block || block.tagName === 'TABLE') return null
            if (event.target.closest?.(TABLE_CELL_SELECTOR)) return null

            const rect = block.getBoundingClientRect()
            const onSideEdge =
                event.clientX <= rect.left + BLOCK_EDGE_TOLERANCE ||
                event.clientX >= rect.right - BLOCK_EDGE_TOLERANCE

            if (!onSideEdge) return null

            return {
                block,
                side: event.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
            }
        }

        const findTableAboveClick = (x, y) => {
            let candidate = null
            const tables = Array.from(el.children || []).filter(child => child.tagName === 'TABLE')
            for (const table of tables) {
                const rect = table.getBoundingClientRect()
                if (y < rect.top) break
                if (y >= rect.bottom && x >= rect.left - 12 && x <= rect.right + 12) {
                    candidate = table
                }
            }
            return candidate
        }

        const placeCursorIn = (node) => {
            const sel = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(node)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
            el.focus()
        }

        const getTableHit = (event) => {
            const table = event.target.closest?.('table')
            if (!table || !el.contains(table)) return null

            const resizeHandle = event.target.closest?.('.tt-col-resize-handle, .tt-table-resize-handle')
            if (resizeHandle) {
                return { table, cell: null, selectTable: true }
            }

            const rect = table.getBoundingClientRect()
            const onOuterEdge =
                event.clientX <= rect.left + TABLE_EDGE_TOLERANCE ||
                event.clientX >= rect.right - TABLE_EDGE_TOLERANCE ||
                event.clientY <= rect.top + TABLE_EDGE_TOLERANCE ||
                event.clientY >= rect.bottom - TABLE_EDGE_TOLERANCE

            const cell = event.target.closest?.(TABLE_CELL_SELECTOR)
            if (cell && table.contains(cell) && !onOuterEdge) {
                return { table, cell, selectTable: false }
            }

            return { table, cell: cell && table.contains(cell) ? cell : null, selectTable: true }
        }

        // Track mousedown to distinguish genuine clicks from drag-selections
        let mouseDownTarget = null
        let mouseDownPos = { x: 0, y: 0 }

        const handleMouseDown = (e) => {
            mouseDownTarget = e.target
            mouseDownPos = { x: e.clientX, y: e.clientY }

            const tableHit = getTableHit(e)
            if (tableHit) {
                if (tableHit.selectTable) {
                    e.preventDefault()
                } else {
                    clearAtomicCaret()
                    clearSelectedTable()
                }
                return
            }

            const blockSideHit = getBlockSideHit(e)
            if (blockSideHit) {
                e.preventDefault()
                return
            }

            const atomicBlock = getTopEditableBlock(e.target)
            const editableTextBlock = getTopEditableBlock(e.target, 'blockquote, div[style], ul, ol')
            if (atomicBlock && atomicBlock !== el && el.contains(atomicBlock) && atomicBlock !== editableTextBlock) {
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
                const tableHit = getTableHit(e)
                if (tableHit) {
                    if (!tableHit.selectTable) {
                        clearAtomicCaret()
                        clearSelectedTable()
                        return
                    }

                    e.preventDefault()
                    e.stopPropagation()
                    selectAtomicTable(tableHit.table, tableHit.cell)
                    return
                }

                const blockSideHit = getBlockSideHit(e)
                if (blockSideHit) {
                    e.preventDefault()
                    e.stopPropagation()
                    setCaretAroundAtomic(blockSideHit.block, blockSideHit.side)
                    return
                }

                const placeholder = target.closest?.('.doc-image-placeholder')
                if (placeholder && el.contains(placeholder)) {
                    e.preventDefault()
                    e.stopPropagation()
                    clearAtomicCaret()
                    clearSelectedTable({ clearToolbar: true })
                    return
                }

                const atomicBlock = getTopEditableBlock(target)
                if (atomicBlock && atomicBlock !== el && el.contains(atomicBlock)) {
                    const editableTextBlock = getTopEditableBlock(target, 'blockquote, div[style], ul, ol')
                    if (atomicBlock === editableTextBlock) {
                        clearAtomicCaret()
                        clearSelectedTable({ clearToolbar: true })
                        return
                    }
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
                clearSelectedTable({ clearToolbar: true })
                return
            }

            const sideAtomic = findSideAtomicBlock(e.clientX, e.clientY)
            if (sideAtomic?.block) {
                e.preventDefault()
                setCaretAroundAtomic(sideAtomic.block, sideAtomic.side)
                return
            }

            const tableAbove = findTableAboveClick(e.clientX, e.clientY)
            if (tableAbove) {
                const next = tableAbove.nextElementSibling
                e.preventDefault()
                if (next?.tagName === 'P') {
                    clearAtomicCaret()
                    clearSelectedTable({ clearToolbar: true })
                    placeCursorIn(next)
                } else {
                    setCaretAroundAtomic(tableAbove, 'after')
                }
                return
            }

            clearAtomicCaret()
            clearSelectedTable({ clearToolbar: true })
        }

        el.addEventListener('mousedown', handleMouseDown)
        el.addEventListener('click', handleClick)
        return () => {
            el.removeEventListener('mousedown', handleMouseDown)
            el.removeEventListener('click', handleClick)
        }
    }, [page.mode, pageIndex, clearAtomicCaret, clearSelectedTable, selectAtomicTable, setCaretAroundAtomic])

    // ========== TABLE COPY: keep selected tables semantic ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const handleCopy = (event) => {
            const table = selectedTableRef.current
            if (!table || !el.contains(table)) return

            const clone = table.cloneNode(true)
            clone.querySelectorAll('.doc-block-delete-btn, .tt-col-resize-handle, .tt-table-resize-handle, [data-atomic-caret]').forEach(node => node.remove())
            clone.removeAttribute('data-table-selected')

            event.clipboardData.setData('text/html', clone.outerHTML)
            event.clipboardData.setData('text/plain', clone.textContent || '')
            event.preventDefault()
        }

        document.addEventListener('copy', handleCopy)
        return () => document.removeEventListener('copy', handleCopy)
    }, [page.mode])

    // ========== TABLE STRUCTURE GUARD: keep block drops out of cells ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        let repairFrame = null
        let isRepairing = false

        const getOwningCell = (node) => {
            let parent = node?.parentElement
            while (parent && parent !== el) {
                if (parent.matches?.('td, th')) return parent
                parent = parent.parentElement
            }
            return null
        }

        const isProtectedStyledCellDiv = (node) => {
            if (!node?.matches?.('div[style]')) return false
            const cell = getOwningCell(node)
            if (!cell || node.parentElement !== cell) return false
            const style = node.getAttribute('style') || ''
            return /(?:^|;)\s*(margin|background|border|border-radius|display|padding)\s*:/i.test(style)
        }

        const styleKey = (node) => String(node?.getAttribute?.('style') || '')
            .replace(/\s+/g, '')
            .replace(/;$/, '')
            .toLowerCase()

        const isCustomCardFragment = (node) => {
            if (!node?.matches?.('div[style]') || node.parentElement !== el) return false
            const style = node.getAttribute('style') || ''
            return /background\s*:/i.test(style) && /border\s*:/i.test(style) && /border-radius\s*:/i.test(style)
        }

        const isLikelySplitCardFragment = (node) => {
            const text = (node.textContent || '').replace(/\u00A0/g, ' ').trim()
            if (!text) return true
            return text.length <= 4 && node.children.length <= 1
        }

        const mergeSplitCustomCardFragments = () => {
            let changed = false
            Array.from(el.children || []).forEach(node => {
                if (!node.isConnected || !isCustomCardFragment(node)) return

                let next = node.nextElementSibling
                while (
                    next &&
                    isCustomCardFragment(next) &&
                    styleKey(next) === styleKey(node) &&
                    (isLikelySplitCardFragment(node) || isLikelySplitCardFragment(next))
                ) {
                    while (next.firstChild) node.appendChild(next.firstChild)
                    const removed = next
                    next = next.nextElementSibling
                    removed.remove()
                    changed = true
                }
            })
            return changed
        }

        const repairTableStructure = () => {
            if (isRepairing) return
            isRepairing = true

            const selector = [
                'td table',
                'th table',
                'td .dynamic-table',
                'th .dynamic-table',
                'td .doc-image-placeholder',
                'th .doc-image-placeholder',
                'td .doc-separator-container',
                'th .doc-separator-container',
                'td blockquote',
                'th blockquote',
                'td pre',
                'th pre',
                'td figure',
                'th figure',
                'td > div[style]',
                'th > div[style]'
            ].join(', ')

            const anchors = new Map()
            let changed = false

            Array.from(el.querySelectorAll(selector)).forEach(node => {
                if (!node.isConnected || node.closest?.('[data-table-context-menu], [data-atomic-caret]')) return
                if (node.matches?.('div[style]') && !isProtectedStyledCellDiv(node)) return

                const cell = getOwningCell(node)
                const outerTable = cell?.closest?.('table')
                if (!cell || !outerTable || !el.contains(outerTable) || outerTable === node) return

                const anchor = anchors.get(outerTable) || outerTable
                anchor.after(node)
                anchors.set(outerTable, node)

                const cellText = (cell.textContent || '').replace(/\u00A0/g, ' ').trim()
                if (!cellText && !cell.querySelector('br')) {
                    cell.innerHTML = '&nbsp;'
                }
                changed = true
            })

            if (mergeSplitCustomCardFragments()) {
                changed = true
            }

            isRepairing = false
            if (changed) {
                handlePageInput?.({ target: el }, pageIndex)
            }
        }

        const scheduleRepair = () => {
            if (repairFrame) cancelAnimationFrame(repairFrame)
            repairFrame = requestAnimationFrame(() => {
                repairFrame = null
                repairTableStructure()
            })
        }

        const observer = new MutationObserver(scheduleRepair)
        observer.observe(el, { childList: true, subtree: true })
        scheduleRepair()

        return () => {
            if (repairFrame) cancelAnimationFrame(repairFrame)
            observer.disconnect()
        }
    }, [page.mode, pageIndex, handlePageInput])

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

        // getBoundingClientRect returns screen coords after zoom, while the
        // absolutely positioned indicator uses local page coordinates.
        const zoom = getEditorZoom()

        // Find the node and closest block element
        let node = range.startContainer
        if (node.nodeType === 3) node = node.parentNode

        const PROTECTED_DROP_SELECTOR = 'table, blockquote, pre, figure, .dynamic-table, .doc-image-placeholder, .doc-separator-container, div[style], p, h1, h2, h3, h4, h5, h6, ul, ol, li'
        const BLOCK_SELECTOR = `${PROTECTED_DROP_SELECTOR}, hr`
        let blockEl = node?.closest?.(BLOCK_SELECTOR)

        if (blockEl && blockEl !== el && el.contains(blockEl)) {
            let parent = blockEl.parentElement
            while (parent && parent !== el) {
                if (parent.matches?.(PROTECTED_DROP_SELECTOR)) blockEl = parent
                parent = parent.parentElement
            }
        }

        // Make sure the block is inside the contenteditable
        if (blockEl && (!el.contains(blockEl) || blockEl === el)) blockEl = null

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

        const contentLeft = (elRect.left - pageRect.left) / zoom
        const contentWidth = elRect.width / zoom
        const lineInset = 10
        const lineLeft = contentLeft + lineInset
        const lineWidth = Math.max(48, contentWidth - lineInset * 2)
        const cursorLeft = Math.max(
            lineLeft,
            Math.min((x - pageRect.left) / zoom, lineLeft + lineWidth)
        )

        // Show the indicator
        indicator.style.display = 'block'
        indicator.style.top = `${lineTop}px`
        indicator.style.left = `${lineLeft}px`
        indicator.style.width = `${lineWidth}px`
        indicator.style.setProperty('--drop-caret-x', `${cursorLeft - lineLeft}px`)
    }, [getEditorZoom])

    const hideDropIndicator = useCallback(() => {
        if (dropIndicatorRef.current) {
            dropIndicatorRef.current.style.display = 'none'
        }
    }, [])

    const getRangeFromPoint = useCallback((x, y) => {
        if (document.caretRangeFromPoint) {
            return document.caretRangeFromPoint(x, y)
        }
        if (document.caretPositionFromPoint) {
            const pos = document.caretPositionFromPoint(x, y)
            if (pos) {
                const range = document.createRange()
                range.setStart(pos.offsetNode, pos.offset)
                range.collapse(true)
                return range
            }
        }
        return null
    }, [])

    const isStructuralBlockHtml = useCallback((html) => {
        if (!html) return false
        const template = document.createElement('template')
        template.innerHTML = html
        if (template.content.querySelector('table, blockquote, pre, figure, img, .dynamic-table, .doc-image-placeholder, .doc-separator-container, p, h1, h2, h3, h4, h5, h6, ul, ol, li')) {
            return true
        }
        return Array.from(template.content.querySelectorAll('div[style]')).some(div => {
            const style = div.getAttribute('style') || ''
            return /(?:^|;)\s*(margin|background|border|border-radius|display|padding|gap|box-shadow|width)\s*:/i.test(style)
        })
    }, [])

    const insertHtmlAroundProtectedBlock = useCallback((block, side, html, text = '') => {
        const el = contentRef.current
        if (!el || !block || !el.contains(block)) return false

        const template = document.createElement('template')
        if (html && html.trim()) {
            template.innerHTML = html
        } else {
            const p = document.createElement('p')
            p.textContent = text || ''
            template.content.appendChild(p)
        }

        const nodes = Array.from(template.content.childNodes)
        if (!nodes.length) return false

        if (side === 'before') {
            block.before(...nodes)
        } else {
            block.after(...nodes)
        }

        const target = nodes[nodes.length - 1]
        const sel = window.getSelection()
        const range = document.createRange()
        if (target) {
            range.setStartAfter(target)
            range.collapse(true)
        }
        sel.removeAllRanges()
        sel.addRange(range)

        clearAtomicCaret()
        clearSelectedTable({ clearToolbar: true })
        return true
    }, [clearAtomicCaret, clearSelectedTable])

    const getProtectedDropBlock = useCallback((range, x, y) => {
        const el = contentRef.current
        if (!el || !range) return null
        const hasPoint = Number.isFinite(x) && Number.isFinite(y) && (x !== 0 || y !== 0)

        const rangeElement = range.startContainer.nodeType === 3
            ? range.startContainer.parentElement
            : range.startContainer
        const target = hasPoint ? document.elementFromPoint(x, y) : null
        const element = target && target !== el && el.contains(target) ? target : rangeElement

        const cell = element?.closest?.('td, th') || rangeElement?.closest?.('td, th')
        if (cell && el.contains(cell)) {
            const table = cell.closest('table')
            if (table && el.contains(table)) {
                const rect = table.getBoundingClientRect()
                return { block: table, side: hasPoint && y < rect.top + rect.height / 2 ? 'before' : 'after' }
            }
        }

        const protectedSelector = 'table, blockquote, pre, figure, .dynamic-table, .doc-image-placeholder, .doc-separator-container, div[style], p, h1, h2, h3, h4, h5, h6, ul, ol, li'
        const protectedBlock = element?.closest?.(protectedSelector) || rangeElement?.closest?.(protectedSelector)
        if (protectedBlock && protectedBlock !== el && el.contains(protectedBlock)) {
            let topBlock = protectedBlock
            let parent = protectedBlock.parentElement
            while (parent && parent !== el) {
                if (parent.matches?.(protectedSelector)) {
                    topBlock = parent
                }
                parent = parent.parentElement
            }
            const rect = topBlock.getBoundingClientRect()
            return { block: topBlock, side: hasPoint && y < rect.top + rect.height / 2 ? 'before' : 'after' }
        }

        return null
    }, [])

    // Handle edition mode drop from sidebar
    const handleEditionDrop = useCallback((e) => {
        e.preventDefault()
        dragCounterRef.current = 0
        hideDropIndicator()
        clearAtomicCaret()
        clearSelectedTable({ clearToolbar: true })

        const html = e.dataTransfer.getData('text/html')
        const text = e.dataTransfer.getData('text/plain')

        if (html || text) {
            // Get drop position
            const range = getRangeFromPoint(e.clientX, e.clientY)
            if (range) {
                const protectedDrop = isStructuralBlockHtml(html)
                    ? getProtectedDropBlock(range, e.clientX, e.clientY)
                    : null

                if (protectedDrop?.block) {
                    if (insertHtmlAroundProtectedBlock(protectedDrop.block, protectedDrop.side, html, text)) {
                        handlePageInput?.({ target: contentRef.current }, pageIndex)
                    }
                    return
                }

                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
                document.execCommand('insertHTML', false, html || text)
            }
        }
    }, [clearAtomicCaret, clearSelectedTable, getRangeFromPoint, handlePageInput, hideDropIndicator, insertHtmlAroundProtectedBlock, isStructuralBlockHtml, getProtectedDropBlock, pageIndex])

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

            const protectedInsert = isStructuralBlockHtml(html)
                ? getProtectedDropBlock(range, 0, 0)
                : null
            if (protectedInsert?.block) {
                insertHtmlAroundProtectedBlock(protectedInsert.block, protectedInsert.side || 'after', html)
                handlePageInput?.({ target: el }, pageIndex)
                return
            }

            document.execCommand('insertHTML', false, html)
            handlePageInput?.({ target: el }, pageIndex)
        }

        window.addEventListener('document-editor-insert-html', handleExternalHtmlInsert)
        return () => window.removeEventListener('document-editor-insert-html', handleExternalHtmlInsert)
    }, [page.mode, isSelected, handlePageInput, pageIndex, getProtectedDropBlock, insertHtmlAroundProtectedBlock, isStructuralBlockHtml])

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        showDropIndicator(e.clientX, e.clientY)
    }, [showDropIndicator])

    const handleDragEnter = useCallback((e) => {
        e.preventDefault()
        clearAtomicCaret()
        clearSelectedTable({ clearToolbar: true })
        dragCounterRef.current++
    }, [clearAtomicCaret, clearSelectedTable])

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

    const clearBrowserSelection = useCallback(() => {
        const selection = window.getSelection?.()
        if (selection && selection.rangeCount > 0) {
            selection.removeAllRanges()
        }
    }, [])

    const openHeaderFooterChooser = useCallback((type) => {
        clearBrowserSelection()
        setHeaderFooterChooser(type)
        requestAnimationFrame(clearBrowserSelection)
    }, [clearBrowserSelection])

    const handleHeaderFooterChange = useCallback((type, nextHtml) => {
        const key = type === 'header' ? 'headerHtml' : 'footerHtml'
        const normalizedHtml = normalizeHeaderFooterHtml(type, nextHtml)
        setDoc(prev => {
            if (prev[key] === normalizedHtml) return prev
            const nextDoc = { ...prev, [key]: normalizedHtml }
            triggerSave?.(nextDoc)
            return nextDoc
        })
    }, [setDoc, triggerSave])

    const handleHeaderFooterRemove = useCallback((type) => {
        const key = type === 'header' ? 'headerHtml' : 'footerHtml'
        setDoc(prev => {
            if (!prev[key]) return prev
            const nextDoc = { ...prev, [key]: '' }
            triggerSave?.(nextDoc)
            return nextDoc
        })
    }, [setDoc, triggerSave])

    const applyHeaderFooterPreset = useCallback((type, html) => {
        const key = type === 'footer' ? 'footerHtml' : 'headerHtml'
        const normalizedHtml = normalizeHeaderFooterHtml(type, html)
        setDoc(prev => {
            const nextDoc = { ...prev, [key]: normalizedHtml }
            triggerSave?.(nextDoc)
            return nextDoc
        })
        setHeaderFooterChooser(null)

        requestAnimationFrame(() => {
            const pageNode = contentRef.current?.parentElement
            const targetEl = pageNode?.querySelector?.(`[data-doc-header-footer-editable="${type}"]`)
            if (!targetEl) return
            targetEl.focus({ preventScroll: true })
            const sel = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(targetEl)
            range.collapse(false)
            sel.removeAllRanges()
            sel.addRange(range)
        })
    }, [setDoc, triggerSave])

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
            {!hasHeader && page.mode === 'edition' && (
                <HeaderFooterDoubleClickZone
                    type="header"
                    height={top}
                    onOpen={() => openHeaderFooterChooser('header')}
                />
            )}

            {!hasHeader && headerFooterChooser === 'header' && page.mode === 'edition' && (
                <HeaderFooterPresetChooser
                    type="header"
                    presets={HEADER_PRESETS}
                    top={top}
                    left={left}
                    right={right}
                    onSelect={(html) => applyHeaderFooterPreset('header', html)}
                    onClose={() => setHeaderFooterChooser(null)}
                />
            )}

            {/* Global Header (non-editable, all pages) */}
            {hasHeader && page.mode === 'edition' && (
                <DocHeaderFooter
                    type="header"
                    html={doc.headerHtml}
                    onChange={handleHeaderFooterChange}
                    onRemove={() => handleHeaderFooterRemove('header')}
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
                        height: '1px',
                        background: 'rgba(37, 99, 235, 0.42)',
                        borderRadius: '999px',
                        pointerEvents: 'none',
                        zIndex: 50,
                        transition: 'top 0.06s ease-out, left 0.06s ease-out, width 0.06s ease-out',
                        boxShadow: 'none',
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        left: 'var(--drop-caret-x, 0px)',
                        top: '-10px',
                        width: '2px',
                        height: '20px',
                        borderRadius: '999px',
                        background: '#2563eb',
                        transform: 'translateX(-1px)',
                        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.85)',
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
                    onChange={handleHeaderFooterChange}
                    onRemove={() => handleHeaderFooterRemove('footer')}
                    paddingLeft={left}
                    paddingRight={right}
                    paddingBottom={bottom}
                />
            )}

            {!hasFooter && page.mode === 'edition' && (
                <HeaderFooterDoubleClickZone
                    type="footer"
                    height={bottom}
                    onOpen={() => openHeaderFooterChooser('footer')}
                />
            )}

            {!hasFooter && headerFooterChooser === 'footer' && page.mode === 'edition' && (
                <HeaderFooterPresetChooser
                    type="footer"
                    presets={FOOTER_PRESETS}
                    bottom={bottom}
                    left={left}
                    right={right}
                    onSelect={(html) => applyHeaderFooterPreset('footer', html)}
                    onClose={() => setHeaderFooterChooser(null)}
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

function HeaderFooterDoubleClickZone({ type, height, onOpen }) {
    const [hovered, setHovered] = useState(false)
    const zoneHeight = Math.max(44, Number(height) || 44)
    const isFooter = type === 'footer'

    return (
        <div
            contentEditable={false}
            data-print-hide="true"
            onMouseDown={(e) => {
                e.preventDefault()
            }}
            onDoubleClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onOpen?.()
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'absolute',
                top: isFooter ? 'auto' : 0,
                bottom: isFooter ? 0 : 'auto',
                left: 0,
                right: 0,
                height: `${zoneHeight}px`,
                zIndex: 18,
                cursor: 'text',
                display: 'flex',
                alignItems: isFooter ? 'flex-end' : 'flex-start',
                justifyContent: 'center',
                paddingTop: isFooter ? 0 : '8px',
                paddingBottom: isFooter ? '8px' : 0,
                pointerEvents: 'auto'
            }}
        >
            {hovered && (
                <span
                    style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#3b82f6',
                        background: '#ffffff',
                        border: '1px solid rgba(59,130,246,0.28)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
                        pointerEvents: 'none',
                        userSelect: 'none'
                    }}
                >
                    Double-cliquez pour ajouter {isFooter ? 'un pied de page' : 'un en-tête'}
                </span>
            )}
        </div>
    )
}

function HeaderFooterPresetChooser({ type, presets, top, bottom, left, right, onSelect, onClose }) {
    const isFooter = type === 'footer'

    useEffect(() => {
        const selection = window.getSelection?.()
        if (selection && selection.rangeCount > 0) {
            selection.removeAllRanges()
        }
    }, [])

    return (
        <div
            contentEditable={false}
            data-print-hide="true"
            onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            onDoubleClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            onSelectStart={(e) => {
                e.preventDefault()
            }}
            style={{
                position: 'absolute',
                top: isFooter ? 'auto' : `${Math.max(12, Number(top) || 12)}px`,
                bottom: isFooter ? `${Math.max(12, Number(bottom) || 12)}px` : 'auto',
                left: `${Math.max(16, Number(left) || 16)}px`,
                right: `${Math.max(16, Number(right) || 16)}px`,
                zIndex: 80,
                background: '#ffffff',
                border: '1px solid #dbeafe',
                borderRadius: '8px',
                boxShadow: '0 18px 48px rgba(15,23,42,0.18), 0 4px 14px rgba(15,23,42,0.08)',
                padding: '12px',
                color: '#111827',
                fontFamily: 'Inter, system-ui, sans-serif',
                userSelect: 'none',
                WebkitUserSelect: 'none'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        Ajouter {isFooter ? 'un pied de page' : 'un en-tête'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Choisissez une zone libre ou un modèle de départ.</div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    title="Fermer"
                    style={{
                        width: '24px',
                        height: '24px',
                        border: '0',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <iconify-icon icon="tabler:x" width="14"></iconify-icon>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
                {presets.map(preset => (
                    <button
                        key={preset.id}
                        type="button"
                        onClick={() => onSelect?.(preset.html)}
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            background: '#ffffff',
                            padding: '10px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            minHeight: '86px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            userSelect: 'none',
                            WebkitUserSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6'
                            e.currentTarget.style.background = '#eff6ff'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0'
                            e.currentTarget.style.background = '#ffffff'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                            <iconify-icon icon={preset.icon} width="16" style={{ color: '#2563eb' }}></iconify-icon>
                            {preset.name}
                        </span>
                        <span style={{ fontSize: '10px', lineHeight: 1.35, color: '#64748b' }}>
                            {preset.description}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ========== HEADER/FOOTER COMPONENT ==========
// Editable global header/footer rendered on every edition page.
function DocHeaderFooter({ type, html, onChange, onRemove, paddingLeft, paddingRight, paddingTop, paddingBottom }) {
    const [hovered, setHovered] = useState(false)
    const [focused, setFocused] = useState(false)
    const contentRef = useRef(null)
    const isFooter = type === 'footer'
    const hasLine = headerFooterHasLine(html, type)
    const leftInset = Math.max(12, Number(paddingLeft) || 40)
    const rightInset = Math.max(12, Number(paddingRight) || 40)

    useEffect(() => {
        const node = contentRef.current
        if (!node) return
        if (focused || node.contains(document.activeElement)) return
        const nextHtml = html || ''
        if (node.innerHTML !== nextHtml) node.innerHTML = nextHtml
    }, [html, focused])

    const syncContent = useCallback(() => {
        const node = contentRef.current
        if (!node) return
        onChange?.(type, node.innerHTML)
    }, [onChange, type])

    const removeDecorativeLine = useCallback(() => {
        const node = contentRef.current
        if (!node) return
        const nextHtml = stripHeaderFooterLineFromElement(node, type)
        onChange?.(type, nextHtml)
    }, [onChange, type])

    return (
        <div
            contentEditable={false}
            style={{
                position: 'relative',
                padding: `${type === 'header' ? (paddingTop || 20) : 12}px ${paddingRight || 40}px ${type === 'footer' ? (paddingBottom || 20) : 12}px ${paddingLeft || 40}px`,
                color: '#000000',
                userSelect: 'text',
                flexShrink: 0,
                cursor: 'text'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                data-doc-header-footer-editable={type}
                spellCheck
                onInput={syncContent}
                onBlur={() => {
                    setFocused(false)
                    syncContent()
                }}
                onFocus={() => setFocused(true)}
                style={{
                    outline: 'none',
                    minHeight: type === 'header' ? '24px' : '20px',
                    cursor: 'text',
                    caretColor: '#000000',
                    pointerEvents: 'auto'
                }}
            />

            {(hovered || focused) && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 5,
                        pointerEvents: 'none'
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            left: `${leftInset}px`,
                            right: `${rightInset}px`,
                            top: isFooter ? 0 : 'auto',
                            bottom: isFooter ? 'auto' : 0,
                            height: '1px',
                            background: focused ? 'rgba(37,99,235,0.55)' : 'rgba(59,130,246,0.28)',
                            boxShadow: focused ? '0 0 0 1px rgba(37,99,235,0.08)' : 'none'
                        }}
                    />

                    <span
                        style={{
                            position: 'absolute',
                            top: isFooter ? 'auto' : '4px',
                            bottom: isFooter ? '4px' : 'auto',
                            left: `${leftInset}px`,
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#3b82f6',
                            background: 'white',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(59,130,246,0.22)',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            opacity: focused ? 0.9 : 0.72
                        }}
                    >
                        {isFooter ? 'Pied de page global' : 'En-tête global'}
                    </span>

                    {hasLine && (
                        <button
                            type="button"
                            contentEditable={false}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                removeDecorativeLine()
                            }}
                            style={{
                                position: 'absolute',
                                top: isFooter ? 'auto' : '-10px',
                                bottom: isFooter ? '-10px' : 'auto',
                                right: '18px',
                                height: '22px',
                                borderRadius: '999px',
                                background: '#ffffff',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                padding: '0 8px',
                                fontSize: '10px',
                                fontWeight: 700,
                                lineHeight: 1,
                                cursor: 'pointer',
                                zIndex: 10,
                                border: '1px solid rgba(37,99,235,0.35)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                                pointerEvents: 'auto'
                            }}
                            title="Retirer la ligne de séparation"
                        >
                            <iconify-icon icon={type === 'footer' ? 'tabler:border-top' : 'tabler:border-bottom'} width="12"></iconify-icon>
                            Sans ligne
                        </button>
                    )}

                    <button
                        type="button"
                        contentEditable={false}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onRemove()
                        }}
                        style={{
                            position: 'absolute',
                            top: isFooter ? 'auto' : '-10px',
                            bottom: isFooter ? '-10px' : 'auto',
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

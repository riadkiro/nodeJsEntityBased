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

    // ========== BLOCK INTERACTION: Hover Delete Button ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const BLOCK_SELECTORS = 'blockquote, table, div[style], pre'

        // Find the top-level block ancestor within the contenteditable
        const findTopBlock = (target) => {
            const block = target.closest(BLOCK_SELECTORS)
            if (!block) return null
            // Walk up to find the outermost block that is still inside the contenteditable
            let topBlock = block
            let parent = block.parentElement
            while (parent && parent !== el) {
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

            btn.addEventListener('mousedown', (ev) => {
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
            })

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

                blockCaretRef.current = null
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
    }, [page.mode, pageIndex, handlePageInput])

    // ========== CLICK OUTSIDE BLOCK: Place cursor in free area ==========
    useEffect(() => {
        const el = contentRef.current
        if (!el || page.mode !== 'edition') return

        const BLOCK_SELECTORS = 'blockquote, table, div[style], pre'
        const ATOMIC_BLOCKS = 'table, img, .dynamic-table, .doc-image-placeholder, figure, pre'

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

            // If click is directly on the contenteditable container
            // or on a simple <p>/<br> (non-block), no action needed - browser handles it
            if (target !== el) {
                const placeholder = target.closest?.('.doc-image-placeholder')
                if (placeholder && el.contains(placeholder)) {
                    e.preventDefault()
                    e.stopPropagation()
                    window.dispatchEvent(new CustomEvent('document-image-placeholder-click', {
                        detail: { placeholder, pageIndex }
                    }))
                    return
                }

                const atomicBlock = target.closest?.(ATOMIC_BLOCKS)
                if (atomicBlock && el.contains(atomicBlock)) {
                    e.preventDefault()
                    e.stopPropagation()

                    const rect = atomicBlock.getBoundingClientRect()
                    const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
                    const range = document.createRange()
                    if (side === 'before') {
                        range.setStartBefore(atomicBlock)
                    } else {
                        range.setStartAfter(atomicBlock)
                    }
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                    blockCaretRef.current = { block: atomicBlock, side }
                    el.focus()
                    return
                }

                // Check if click is inside a block
                const clickedBlock = target.closest(BLOCK_SELECTORS)
                if (!clickedBlock || !el.contains(clickedBlock)) return // not in a block, browser handles fine
                // User clicked inside a block - that's normal editing, do nothing
                return
            }

            // Click was on the contenteditable container itself (empty area)
            // This happens when clicking in the padding or between/after blocks
            e.preventDefault()

            const clickY = e.clientY

            // Find all top-level children
            const children = Array.from(el.children)

            if (children.length === 0) {
                // No children at all - create a paragraph
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                el.appendChild(p)
                placeCursorIn(p)
                return
            }

            // Find the right position based on click Y coordinate
            let insertBefore = null
            let insertAfter = null

            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                const rect = child.getBoundingClientRect()

                if (clickY < rect.top) {
                    // Click is above this child — insert before it
                    insertBefore = child
                    break
                }
                insertAfter = child
            }

            // Check if there's already a non-block element at the target position we can use
            if (insertBefore) {
                // If the previous sibling is already a non-block paragraph, place cursor there
                const prev = insertBefore.previousElementSibling
                if (prev && !prev.matches(BLOCK_SELECTORS) && (prev.tagName === 'P' || prev.tagName === 'H1' || prev.tagName === 'H2' || prev.tagName === 'H3')) {
                    placeCursorIn(prev)
                    return
                }
                // Insert a new paragraph before the element
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                el.insertBefore(p, insertBefore)
                placeCursorIn(p)
            } else if (insertAfter) {
                // Click is below the last element
                // If the last element is not a block, reuse it
                const next = insertAfter.nextElementSibling
                if (next && !next.matches(BLOCK_SELECTORS) && (next.tagName === 'P' || next.tagName === 'H1' || next.tagName === 'H2' || next.tagName === 'H3')) {
                    placeCursorIn(next)
                    return
                }
                if (!insertAfter.matches(BLOCK_SELECTORS) && (insertAfter.tagName === 'P' || insertAfter.tagName === 'H1' || insertAfter.tagName === 'H2' || insertAfter.tagName === 'H3')) {
                    placeCursorIn(insertAfter)
                    return
                }
                // Append a new paragraph after the last element
                const p = document.createElement('p')
                p.innerHTML = '<br>'
                insertAfter.after(p)
                placeCursorIn(p)
            }

            // Trigger save
            if (handlePageInput) {
                handlePageInput({ target: el }, pageIndex)
            }
        }

        function placeCursorIn(element) {
            const sel = window.getSelection()
            const range = document.createRange()
            range.selectNodeContents(element)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
            element.focus()
        }

        el.addEventListener('mousedown', handleMouseDown)
        el.addEventListener('click', handleClick)
        return () => {
            el.removeEventListener('mousedown', handleMouseDown)
            el.removeEventListener('click', handleClick)
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

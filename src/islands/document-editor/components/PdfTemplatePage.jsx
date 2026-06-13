import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const PDF_ELEMENT_ADD_EVENT = 'dexio:pdf-template-add-element'
const PDF_FIELD_SELECT_EVENT = 'dexio:pdf-template-select-field'
const PDF_FIELD_CLEAR_EVENT = 'dexio:pdf-template-clear-selection'
const MIN_TEXT_FIELD_WIDTH = 70
const MIN_TEXT_RESIZE_WIDTH = 12
const CURSOR_TEXT_HEIGHT = 20

const DEFAULT_TEXT_FIELD = {
    type: 'text',
    value: '',
    x: 72,
    y: 72,
    width: MIN_TEXT_FIELD_WIDTH,
    height: CURSOR_TEXT_HEIGHT,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    color: '#111827',
    align: 'left',
    lineHeight: 1.15,
    letterSpacing: 0,
    bold: false,
    italic: false,
    underline: false,
    autoSize: true,
    whiteSpace: 'pre-wrap'
}

const FIELD_PRESETS = {
    text: DEFAULT_TEXT_FIELD,
    checkbox: {
        type: 'checkbox',
        checked: false,
        value: '',
        x: 72,
        y: 72,
        width: 18,
        height: 18,
        borderColor: '#111827',
        borderWidth: 1.5,
        fillColor: 'transparent'
    },
    check: {
        type: 'check',
        value: '✓',
        x: 72,
        y: 72,
        width: 24,
        height: 24,
        fontSize: 20,
        color: '#111827',
        bold: true
    },
    cross: {
        type: 'cross',
        value: '×',
        x: 72,
        y: 72,
        width: 24,
        height: 24,
        fontSize: 22,
        color: '#111827',
        bold: true
    },
    line: {
        type: 'line',
        x: 72,
        y: 72,
        width: 160,
        height: 10,
        strokeColor: '#111827',
        strokeWidth: 2
    },
    rectangle: {
        type: 'rectangle',
        x: 72,
        y: 72,
        width: 140,
        height: 56,
        strokeColor: '#111827',
        strokeWidth: 1.5,
        fillColor: 'transparent'
    }
}

const FONT_FAMILIES = ['Arial, sans-serif', 'Inter, sans-serif', 'Times New Roman, serif', 'Courier New, monospace']

function clamp(value, min, max) {
    const number = Number(value)
    if (!Number.isFinite(number)) return min
    return Math.min(max, Math.max(min, number))
}

function safeDecode(value) {
    try {
        return decodeURIComponent(String(value || ''))
    } catch (_) {
        return String(value || '')
    }
}

function encodeUrlPath(path) {
    return String(path || '')
        .split('/')
        .map(segment => segment ? encodeURIComponent(safeDecode(segment)) : segment)
        .join('/')
}

function normalizePdfSourceUrl(template) {
    const rawUrl = String(template?.sourceUrl || '')
    if (!rawUrl) return ''

    try {
        const parsed = new URL(rawUrl, window.location.origin)
        parsed.pathname = encodeUrlPath(parsed.pathname)
        if (parsed.origin === window.location.origin) {
            return `${parsed.pathname}${parsed.search}${parsed.hash}`
        }
        return parsed.toString()
    } catch (_) {
        const [beforeHash, hash = ''] = rawUrl.split('#')
        const [path, query = ''] = beforeHash.split('?')
        return `${encodeUrlPath(path)}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
    }
}

function getPdfTemplate(doc) {
    return doc?.metadata?.pdfTemplate || {}
}

function updatePdfTemplate(setDoc, updater) {
    setDoc(prev => {
        const metadata = { ...(prev.metadata || {}) }
        const pdfTemplate = { ...(metadata.pdfTemplate || {}) }
        const nextTemplate = updater(pdfTemplate, prev) || pdfTemplate
        if (nextTemplate === pdfTemplate) return prev
        return {
            ...prev,
            metadata: {
                ...metadata,
                pdfTemplate: nextTemplate
            }
        }
    })
}

function getEditorZoom(el) {
    const scaledAncestor = el?.closest?.('[style*="scale"]')
    const match = scaledAncestor?.style?.transform?.match(/scale\(([\d.]+)\)/)
    const zoom = match ? Number.parseFloat(match[1]) : 1
    return Number.isFinite(zoom) && zoom > 0 ? zoom : 1
}

function getFieldType(field) {
    return field?.type || 'text'
}

function isCheckboxChecked(field) {
    return field?.checked === true
        || field?.value === true
        || ['true', 'checked', '1', 'yes', 'on', '✓'].includes(String(field?.value || '').toLowerCase())
}

function measureTextFieldSize(field, value, pageDims) {
    const text = String(value ?? '')
    const fontSize = Number(field?.fontSize || DEFAULT_TEXT_FIELD.fontSize)
    const lineHeight = Number(field?.lineHeight || DEFAULT_TEXT_FIELD.lineHeight)
    const lineHeightPx = Math.ceil(fontSize * lineHeight)
    const letterSpacing = Number(field?.letterSpacing || 0)
    const lines = text.split(/\r?\n/)
    let maxLineWidth = MIN_TEXT_FIELD_WIDTH

    if (typeof document !== 'undefined') {
        const canvas = measureTextFieldSize.canvas || document.createElement('canvas')
        measureTextFieldSize.canvas = canvas
        const context = canvas.getContext('2d')
        if (context) {
            const fontStyle = field?.italic ? 'italic ' : ''
            const fontWeight = field?.bold ? '700 ' : '400 '
            context.font = `${fontStyle}${fontWeight}${fontSize}px ${field?.fontFamily || DEFAULT_TEXT_FIELD.fontFamily}`
            lines.forEach(line => {
                const measured = context.measureText(line || ' ').width
                const spacing = Math.max(0, (line.length - 1) * letterSpacing)
                maxLineWidth = Math.max(maxLineWidth, Math.ceil(measured + spacing + 3))
            })
        }
    } else {
        lines.forEach(line => {
            maxLineWidth = Math.max(maxLineWidth, Math.ceil((line.length || 1) * fontSize * 0.6))
        })
    }

    const contentHeight = Math.max(CURSOR_TEXT_HEIGHT, lines.length * lineHeightPx)
    return {
        width: Math.round(clamp(maxLineWidth, MIN_TEXT_FIELD_WIDTH, Math.max(MIN_TEXT_FIELD_WIDTH, pageDims.width - Number(field?.x || 0)))),
        height: Math.round(clamp(contentHeight, contentHeight, Math.max(contentHeight, pageDims.height - Number(field?.y || 0))))
    }
}

function textFieldMinimumSize(field, pageDims) {
    const measured = measureTextFieldSize(field, field?.value ?? field?.text ?? '', pageDims)
    return {
        width: MIN_TEXT_RESIZE_WIDTH,
        height: measured.height
    }
}

function fieldMinSize(fieldOrType, pageDims = { width: 794, height: 1123 }) {
    const type = typeof fieldOrType === 'string' ? fieldOrType : getFieldType(fieldOrType)
    if (type === 'text') return textFieldMinimumSize(fieldOrType, pageDims)
    if (type === 'line') return { width: 12, height: 4 }
    if (['checkbox', 'check', 'cross'].includes(type)) return { width: 8, height: 8 }
    return { width: 18, height: 12 }
}

export default function PdfTemplatePage({
    pageIndex,
    doc,
    setDoc,
    isSelected,
    onSelect,
    triggerSave = () => {}
}) {
    const pageRef = useRef(null)
    const canvasRef = useRef(null)
    const dragRef = useRef(null)
    const [selectedFieldId, setSelectedFieldId] = useState(null)
    const [contextMenu, setContextMenu] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const template = getPdfTemplate(doc)
    const hideBackground = Boolean(template.hideBackground)
    const fields = useMemo(
        () => (Array.isArray(template.fields) ? template.fields : []).filter(field => Number(field.pageIndex || 0) === pageIndex),
        [template.fields, pageIndex]
    )
    const sourceUrl = useMemo(() => normalizePdfSourceUrl(template), [template])
    const savedPageDims = template.pageDimensions?.[pageIndex] || template.pageDimensions?.[String(pageIndex)]
    const dims = savedPageDims?.width && savedPageDims?.height
        ? { width: savedPageDims.width, height: savedPageDims.height }
        : (doc.dimensions || { width: 794, height: 1123 })
    const selectedField = fields.find(field => field.id === selectedFieldId) || null

    const patchField = useCallback((fieldId, patch, save = true) => {
        updatePdfTemplate(setDoc, pdfTemplate => {
            const allFields = Array.isArray(pdfTemplate.fields) ? [...pdfTemplate.fields] : []
            const idx = allFields.findIndex(field => field.id === fieldId)
            if (idx < 0) return pdfTemplate
            allFields[idx] = { ...allFields[idx], ...patch, updatedAt: new Date().toISOString() }
            return { ...pdfTemplate, fields: allFields }
        })
        if (save) triggerSave()
    }, [setDoc, triggerSave])

    const selectField = useCallback((fieldId) => {
        const field = fields.find(item => item.id === fieldId)
        setSelectedFieldId(fieldId)
        window.dispatchEvent(new CustomEvent('dexio:pdf-template-active-field', {
            detail: { fieldId, pageIndex, fieldType: getFieldType(field) }
        }))
    }, [fields, pageIndex])

    const clearSelection = useCallback(() => {
        setSelectedFieldId(null)
        setContextMenu(null)
        window.dispatchEvent(new CustomEvent('dexio:pdf-template-active-field', {
            detail: { fieldId: null, fieldType: null }
        }))
    }, [])

    const addElement = useCallback((type = 'text', position = null) => {
        const preset = FIELD_PRESETS[type] || FIELD_PRESETS.text
        const countOnPage = fields.length
        const id = `pdf_field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const presetWidth = preset.width || 40
        const presetHeight = preset.height || 20
        const fallbackX = 72 + (countOnPage % 5) * 16
        const fallbackY = 72 + countOnPage * 26
        const field = {
            ...preset,
            id,
            pageIndex,
            x: clamp(position?.x ?? fallbackX, 0, Math.max(0, dims.width - presetWidth)),
            y: clamp(position?.y ?? fallbackY, 0, Math.max(0, dims.height - presetHeight)),
            zIndex: (template.fields || []).length + 1,
            createdAt: new Date().toISOString()
        }
        updatePdfTemplate(setDoc, pdfTemplate => ({
            ...pdfTemplate,
            fields: [...(Array.isArray(pdfTemplate.fields) ? pdfTemplate.fields : []), field]
        }))
        setSelectedFieldId(id)
        window.dispatchEvent(new CustomEvent('dexio:pdf-template-active-field', {
            detail: { fieldId: id, pageIndex, fieldType: type }
        }))
        triggerSave()
    }, [dims.height, dims.width, fields.length, pageIndex, setDoc, template.fields, triggerSave])

    const duplicateSelected = useCallback(() => {
        if (!selectedField) return
        const type = getFieldType(selectedField)
        const min = fieldMinSize(selectedField, dims)
        const id = `pdf_field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const clone = {
            ...selectedField,
            id,
            locked: false,
            x: clamp((selectedField.x || 0) + 16, 0, dims.width - Math.max(min.width, selectedField.width || 20)),
            y: clamp((selectedField.y || 0) + 16, 0, dims.height - Math.max(min.height, selectedField.height || 20)),
            zIndex: (template.fields || []).length + 1,
            createdAt: new Date().toISOString()
        }
        updatePdfTemplate(setDoc, pdfTemplate => ({
            ...pdfTemplate,
            fields: [...(Array.isArray(pdfTemplate.fields) ? pdfTemplate.fields : []), clone]
        }))
        setSelectedFieldId(id)
        window.dispatchEvent(new CustomEvent('dexio:pdf-template-active-field', {
            detail: { fieldId: id, pageIndex, fieldType: type }
        }))
        triggerSave()
    }, [dims.height, dims.width, selectedField, setDoc, template.fields, triggerSave])

    const deleteSelected = useCallback(() => {
        if (!selectedFieldId) return
        updatePdfTemplate(setDoc, pdfTemplate => ({
            ...pdfTemplate,
            fields: (Array.isArray(pdfTemplate.fields) ? pdfTemplate.fields : []).filter(field => field.id !== selectedFieldId)
        }))
        setSelectedFieldId(null)
        setContextMenu(null)
        window.dispatchEvent(new CustomEvent('dexio:pdf-template-active-field', { detail: { fieldId: null } }))
        triggerSave()
    }, [selectedFieldId, setDoc, triggerSave])

    const toggleSelectedLock = useCallback(() => {
        if (!selectedField) return
        patchField(selectedField.id, { locked: !selectedField.locked })
        setContextMenu(null)
    }, [patchField, selectedField])

    const openContextMenu = useCallback((event, field) => {
        event.preventDefault()
        event.stopPropagation()
        const rect = pageRef.current?.getBoundingClientRect()
        if (!rect?.width || !rect?.height) return
        const localX = (event.clientX - rect.left) * dims.width / rect.width
        const localY = (event.clientY - rect.top) * dims.height / rect.height
        selectField(field.id)
        setContextMenu({
            fieldId: field.id,
            x: Math.round(clamp(localX + 6, 0, Math.max(0, dims.width - 154))),
            y: Math.round(clamp(localY + 6, 0, Math.max(0, dims.height - 78)))
        })
    }, [dims.height, dims.width, selectField])

    useEffect(() => {
        if (!isSelected) return undefined
        const handler = (event) => addElement(event.detail?.type || 'text')
        window.addEventListener(PDF_ELEMENT_ADD_EVENT, handler)
        return () => window.removeEventListener(PDF_ELEMENT_ADD_EVENT, handler)
    }, [addElement, isSelected])

    useEffect(() => {
        if (!contextMenu) return undefined
        const close = () => setContextMenu(null)
        window.addEventListener('mousedown', close)
        window.addEventListener('keydown', close)
        window.addEventListener('scroll', close, true)
        return () => {
            window.removeEventListener('mousedown', close)
            window.removeEventListener('keydown', close)
            window.removeEventListener('scroll', close, true)
        }
    }, [contextMenu])

    useEffect(() => {
        const handleActiveField = (event) => {
            const detail = event.detail || {}
            if (!detail.fieldId) {
                setSelectedFieldId(null)
                return
            }
            if (Number(detail.pageIndex) === pageIndex) {
                setSelectedFieldId(detail.fieldId)
            } else {
                setSelectedFieldId(null)
            }
        }
        const handleSelect = (event) => {
            const detail = event.detail || {}
            if (Number(detail.pageIndex) !== pageIndex) {
                setSelectedFieldId(null)
                return
            }
            setSelectedFieldId(detail.fieldId || null)
        }
        const handleClear = (event) => {
            const detail = event.detail || {}
            if (detail.pageIndex === undefined || Number(detail.pageIndex) === pageIndex) {
                setSelectedFieldId(null)
            }
        }
        window.addEventListener('dexio:pdf-template-active-field', handleActiveField)
        window.addEventListener(PDF_FIELD_SELECT_EVENT, handleSelect)
        window.addEventListener(PDF_FIELD_CLEAR_EVENT, handleClear)
        return () => {
            window.removeEventListener('dexio:pdf-template-active-field', handleActiveField)
            window.removeEventListener(PDF_FIELD_SELECT_EVENT, handleSelect)
            window.removeEventListener(PDF_FIELD_CLEAR_EVENT, handleClear)
        }
    }, [pageIndex])

    useEffect(() => {
        let cancelled = false
        async function renderPage() {
            if (!sourceUrl || !canvasRef.current) return
            setLoading(true)
            setError('')
            try {
                const pdf = await pdfjsLib.getDocument({ url: sourceUrl, withCredentials: true, disableWorker: true }).promise
                const pdfPage = await pdf.getPage(pageIndex + 1)
                if (cancelled) return

                const baseViewport = pdfPage.getViewport({ scale: 1 })
                const cssWidth = Math.round(baseViewport.width * 96 / 72)
                const cssHeight = Math.round(baseViewport.height * 96 / 72)
                const scale = Math.max(1, Math.min(2.5, dims.width / baseViewport.width * 1.6))
                const viewport = pdfPage.getViewport({ scale })
                const canvas = canvasRef.current
                const context = canvas.getContext('2d')
                canvas.width = Math.ceil(viewport.width)
                canvas.height = Math.ceil(viewport.height)
                context.fillStyle = '#ffffff'
                context.fillRect(0, 0, canvas.width, canvas.height)
                await pdfPage.render({ canvasContext: context, viewport }).promise
                if (cancelled) return

                updatePdfTemplate(setDoc, pdfTemplate => {
                    const pageCount = pdf.numPages || 1
                    const pageDimensions = { ...(pdfTemplate.pageDimensions || {}) }
                    const currentDim = pageDimensions[pageIndex]
                    const shouldUpdateDim = !currentDim || currentDim.width !== cssWidth || currentDim.height !== cssHeight
                    const shouldUpdateCount = Number(pdfTemplate.pageCount || 0) !== pageCount
                    if (!shouldUpdateDim && !shouldUpdateCount) return pdfTemplate

                    if (shouldUpdateDim) {
                        pageDimensions[pageIndex] = { width: cssWidth, height: cssHeight }
                    }
                    return { ...pdfTemplate, pageCount, pageDimensions }
                })
                triggerSave()

                if (pageIndex === 0 && (!doc.dimensions || doc.dimensions.width !== cssWidth || doc.dimensions.height !== cssHeight)) {
                    setDoc(prev => {
                        const pages = [...(prev.pages || [])]
                        const pageCount = pdf.numPages || 1
                        while (pages.length < pageCount) {
                            pages.push({
                                content: '',
                                elements: [],
                                rows: [],
                                mode: 'edition',
                                background: { color: '#ffffff' },
                                order: pages.length
                            })
                        }
                        return {
                            ...prev,
                            format: 'Custom',
                            orientation: cssWidth >= cssHeight ? 'landscape' : 'portrait',
                            dimensions: { width: cssWidth, height: cssHeight },
                            margins: { top: 0, right: 0, bottom: 0, left: 0 },
                            pages
                        }
                    })
                    triggerSave()
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('[PDF Template] render failed:', err)
                    setError('Impossible de charger le PDF')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        renderPage()
        return () => { cancelled = true }
    }, [dims.width, doc.dimensions, pageIndex, setDoc, sourceUrl, triggerSave])

    useEffect(() => {
        const handleMove = (event) => {
            const drag = dragRef.current
            if (!drag) return
            const dx = (event.clientX - drag.startX) / drag.zoom
            const dy = (event.clientY - drag.startY) / drag.zoom
            const min = drag.minSize || fieldMinSize(drag.fieldType, dims)
            const patch = drag.mode === 'resize'
                ? {
                    width: Math.round(clamp(drag.startWidth + dx, min.width, dims.width - drag.startFieldX)),
                    height: Math.round(clamp(drag.startHeight + dy, min.height, dims.height - drag.startFieldY)),
                    ...(drag.fieldType === 'text' ? { autoSize: false } : {})
                }
                : {
                    x: Math.round(clamp(drag.startFieldX + dx, 0, dims.width - drag.startWidth)),
                    y: Math.round(clamp(drag.startFieldY + dy, 0, dims.height - drag.startHeight))
                }
            patchField(drag.fieldId, patch, false)
            event.preventDefault()
        }

        const handleUp = () => {
            if (!dragRef.current) return
            dragRef.current = null
            triggerSave()
        }

        window.addEventListener('pointermove', handleMove)
        window.addEventListener('pointerup', handleUp)
        window.addEventListener('pointercancel', handleUp)
        return () => {
            window.removeEventListener('pointermove', handleMove)
            window.removeEventListener('pointerup', handleUp)
            window.removeEventListener('pointercancel', handleUp)
        }
    }, [dims.height, dims.width, patchField, triggerSave])

    const startDrag = useCallback((event, field, mode) => {
        event.preventDefault()
        event.stopPropagation()
        if (mode === 'move' && field.locked) return
        selectField(field.id)
        dragRef.current = {
            mode,
            fieldId: field.id,
            fieldType: getFieldType(field),
            minSize: fieldMinSize(field, dims),
            startX: event.clientX,
            startY: event.clientY,
            startFieldX: Number(field.x || 0),
            startFieldY: Number(field.y || 0),
            startWidth: Number(field.width || DEFAULT_TEXT_FIELD.width),
            startHeight: Number(field.height || DEFAULT_TEXT_FIELD.height),
            zoom: getEditorZoom(pageRef.current)
        }
    }, [dims, selectField])

    const renderElement = (field, selected) => {
        const type = getFieldType(field)
        if (type === 'text') {
            return (
                <textarea
                    value={field.value ?? field.text ?? ''}
                    onChange={(event) => {
                        const value = event.target.value
                        const nextPatch = { value }
                        if (field.autoSize !== false) {
                            Object.assign(nextPatch, measureTextFieldSize(field, value, dims))
                        }
                        patchField(field.id, nextPatch)
                    }}
                    onFocus={() => selectField(field.id)}
                    spellCheck={false}
                    style={{
                        width: '100%',
                        height: '100%',
                        resize: 'none',
                        border: selected ? '1.5px solid #2563eb' : '1px dashed rgba(37,99,235,0.45)',
                        outline: 'none',
                        background: selected ? 'rgba(255,255,255,0.74)' : 'rgba(255,255,255,0.42)',
                        color: field.color || DEFAULT_TEXT_FIELD.color,
                        fontSize: `${field.fontSize || DEFAULT_TEXT_FIELD.fontSize}px`,
                        fontFamily: field.fontFamily || DEFAULT_TEXT_FIELD.fontFamily,
                        fontWeight: field.bold ? 700 : 400,
                        fontStyle: field.italic ? 'italic' : 'normal',
                        textDecoration: field.underline ? 'underline' : 'none',
                        textAlign: field.align || 'left',
                        lineHeight: field.lineHeight || DEFAULT_TEXT_FIELD.lineHeight,
                        letterSpacing: `${field.letterSpacing || 0}px`,
                        padding: '0',
                        overflow: 'hidden',
                        boxShadow: selected ? '0 0 0 3px rgba(37,99,235,.12)' : 'none'
                    }}
                />
            )
        }

        if (type === 'checkbox') {
            const checked = isCheckboxChecked(field)
            const borderColor = field.borderColor || '#111827'
            const boxSize = Math.min(Number(field.width || 18), Number(field.height || 18))
            return (
                <div
                    role="checkbox"
                    aria-checked={checked}
                    title={checked ? 'Cliquer pour décocher' : 'Cliquer pour cocher'}
                    onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        selectField(field.id)
                        patchField(field.id, {
                            checked: !checked,
                            value: !checked ? 'checked' : ''
                        })
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: `${field.borderWidth || 1.5}px solid ${borderColor}`,
                        background: field.fillColor || 'transparent',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: field.checkColor || borderColor,
                        fontFamily: 'Arial, sans-serif',
                        fontSize: `${Math.max(10, Math.round(boxSize * 0.82))}px`,
                        fontWeight: 700,
                        lineHeight: 1,
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}
                >
                    {checked ? '✓' : ''}
                </div>
            )
        }

        if (type === 'check' || type === 'cross') {
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: field.fontFamily || 'Arial, sans-serif',
                        fontSize: `${field.fontSize || (type === 'check' ? 20 : 22)}px`,
                        fontWeight: field.bold === false ? 400 : 700,
                        lineHeight: 1,
                        color: field.color || '#111827',
                        userSelect: 'none'
                    }}
                >
                    {field.value || (type === 'check' ? '✓' : '×')}
                </div>
            )
        }

        if (type === 'line') {
            return (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: '50%',
                            height: `${field.strokeWidth || 2}px`,
                            background: field.strokeColor || '#111827',
                            transform: 'translateY(-50%)'
                        }}
                    />
                </div>
            )
        }

        if (type === 'rectangle') {
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        border: `${field.strokeWidth || 1.5}px solid ${field.strokeColor || '#111827'}`,
                        background: field.fillColor || 'transparent',
                        boxSizing: 'border-box'
                    }}
                />
            )
        }

        return null
    }

    const handlePageMouseDown = useCallback((event) => {
        onSelect?.(event)
        if (!event.target.closest?.('[data-pdf-template-field]')) {
            clearSelection()
        }
    }, [clearSelection, onSelect])

    const handlePageDoubleClick = useCallback((event) => {
        if (event.target.closest?.('[data-pdf-template-field]')) return
        const rect = pageRef.current?.getBoundingClientRect()
        if (!rect?.width || !rect?.height) return
        event.preventDefault()
        event.stopPropagation()
        onSelect?.(event)
        const x = Math.round((event.clientX - rect.left) * dims.width / rect.width)
        const y = Math.round((event.clientY - rect.top) * dims.height / rect.height)
        addElement('text', { x, y })
    }, [addElement, dims.height, dims.width, onSelect])

    return (
        <div
            ref={pageRef}
            onMouseDown={handlePageMouseDown}
            onDoubleClick={handlePageDoubleClick}
            className={`bg-white shadow-2xl relative overflow-hidden ${isSelected ? 'ring-2 ring-primary/45' : ''}`}
            style={{
                width: `${dims.width}px`,
                height: `${dims.height}px`,
                minHeight: `${dims.height}px`,
                maxHeight: `${dims.height}px`
            }}
        >
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                data-pdf-template-background="1"
                data-hidden={hideBackground ? 'true' : 'false'}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    background: '#ffffff',
                    opacity: hideBackground ? 0 : 1,
                    transition: 'opacity 0.15s ease'
                }}
            />

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-400 bg-white/60">
                    Chargement du PDF...
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-red-500 bg-white">
                    {error}
                </div>
            )}

            {fields.map(field => {
                const type = getFieldType(field)
                const selected = field.id === selectedFieldId
                const autoTextSize = type === 'text' && field.autoSize !== false
                    ? measureTextFieldSize(field, field.value ?? field.text ?? '', dims)
                    : null
                const width = field.width || autoTextSize?.width || FIELD_PRESETS[type]?.width || DEFAULT_TEXT_FIELD.width
                const height = Math.max(
                    field.height || FIELD_PRESETS[type]?.height || DEFAULT_TEXT_FIELD.height,
                    autoTextSize?.height || 0
                )
                return (
                    <div
                        key={field.id}
                        className="absolute"
                        data-pdf-template-field="1"
                        style={{
                            left: `${field.x || 0}px`,
                            top: `${field.y || 0}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                            zIndex: 20 + Number(field.zIndex || 0),
                            outline: selected && type !== 'text' ? '1.5px dashed #2563eb' : 'none',
                            boxShadow: selected && type !== 'text' ? '0 0 0 3px rgba(37,99,235,.12)' : 'none'
                        }}
                        onMouseDown={(event) => {
                            event.stopPropagation()
                            selectField(field.id)
                        }}
                        onContextMenu={(event) => openContextMenu(event, field)}
                    >
                        {renderElement(field, selected)}
                        {selected && (
                            <>
                                {!field.locked && (
                                    <button
                                        type="button"
                                        title="Déplacer"
                                        onPointerDown={(event) => startDrag(event, field, 'move')}
                                        className="pdf-field-drag"
                                        style={{
                                            position: 'absolute',
                                            top: '-18px',
                                            left: 0,
                                            height: '16px',
                                            padding: '0 6px',
                                            border: '0',
                                            borderRadius: '4px',
                                            background: '#2563eb',
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            cursor: 'grab'
                                        }}
                                    >
                                        <iconify-icon icon="tabler:arrows-move" width="11"></iconify-icon>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    title="Redimensionner"
                                    onPointerDown={(event) => startDrag(event, field, 'resize')}
                                    style={{
                                        position: 'absolute',
                                        right: '-5px',
                                        bottom: '-5px',
                                        width: '11px',
                                        height: '11px',
                                        border: '2px solid #fff',
                                        borderRadius: '999px',
                                        background: '#2563eb',
                                        cursor: 'nwse-resize',
                                        padding: 0
                                    }}
                                />
                            </>
                        )}
                    </div>
                )
            })}

            {contextMenu && (
                <div
                    data-print-hide="true"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                    style={{
                        position: 'absolute',
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                        zIndex: 9999,
                        minWidth: '142px',
                        padding: '6px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: '#ffffff',
                        boxShadow: '0 12px 30px rgba(15,23,42,0.18)'
                    }}
                >
                    <button
                        type="button"
                        onClick={toggleSelectedLock}
                        style={{
                            width: '100%',
                            height: '30px',
                            border: 0,
                            borderRadius: '6px',
                            background: 'transparent',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <iconify-icon icon={selectedField?.locked ? 'tabler:lock-open' : 'tabler:lock'} width="15"></iconify-icon>
                        {selectedField?.locked ? 'Déverrouiller la position' : 'Verrouiller la position'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            duplicateSelected()
                            setContextMenu(null)
                        }}
                        style={{
                            width: '100%',
                            height: '30px',
                            border: 0,
                            borderRadius: '6px',
                            background: 'transparent',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <iconify-icon icon="tabler:copy" width="15"></iconify-icon>
                        Dupliquer
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            deleteSelected()
                            setContextMenu(null)
                        }}
                        style={{
                            width: '100%',
                            height: '30px',
                            border: 0,
                            borderRadius: '6px',
                            background: 'transparent',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <iconify-icon icon="tabler:trash" width="15"></iconify-icon>
                        Supprimer
                    </button>
                </div>
            )}
        </div>
    )
}

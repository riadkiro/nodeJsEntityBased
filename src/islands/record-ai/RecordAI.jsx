import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const emptySelection = () => ({
    fields: [],
    notes: [],
    chats: [],
    files: [],
    uploads: [],
})

const defaultEngineSettings = () => ({
    responseEngine: 'openai',
    responseModel: '',
    localResponseModel: '',
    embeddingEngine: 'openai',
    embeddingModel: '',
    localEmbeddingModel: '',
})

function fileKey(file) {
    return `${file.source}:${file.id}`
}

function cleanConversationSelection(selection = {}) {
    return {
        fields: Array.isArray(selection.fields) ? selection.fields : [],
        notes: Array.isArray(selection.notes) ? selection.notes : [],
        chats: Array.isArray(selection.chats) ? selection.chats : [],
        files: Array.isArray(selection.files) ? selection.files : [],
        uploads: Array.isArray(selection.uploads) ? selection.uploads : [],
    }
}

function buildPayloadSelection(selection = {}) {
    return {
        fields: Array.isArray(selection.fields) ? selection.fields : [],
        notes: Array.isArray(selection.notes) ? selection.notes : [],
        chats: Array.isArray(selection.chats) ? selection.chats : [],
        files: Array.isArray(selection.files) ? selection.files : [],
        uploads: Array.isArray(selection.uploads)
            ? selection.uploads
                .filter(upload => upload?.id || upload?.text)
                .map(upload => ({
                    id: upload.id,
                    name: upload.name,
                    text: upload.text || '',
                    charCount: upload.charCount || String(upload.text || '').length || 0,
                }))
            : [],
    }
}

function formatDate(value) {
    if (!value) return ''
    try {
        return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    } catch (_) {
        return ''
    }
}

function formatTime(value) {
    if (!value) return ''
    try {
        return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } catch (_) {
        return ''
    }
}

function shortText(value, max = 96) {
    const text = String(value || '').replace(/\s+/g, ' ').trim()
    return text.length > max ? `${text.slice(0, max)}...` : text
}

function fileExtension(name) {
    const match = String(name || '').toLowerCase().match(/\.([a-z0-9]+)(?:[?#].*)?$/)
    return match ? `.${match[1]}` : ''
}

function getFilePreviewType(file = {}) {
    const mime = String(file.mimeType || '').toLowerCase()
    const name = String(file.name || file.originalName || file.filename || '').toLowerCase()
    const ext = fileExtension(name)

    if (mime === 'application/pdf' || ext === '.pdf') return 'pdf'
    if (mime.startsWith('image/') && mime !== 'image/svg+xml') return 'image'
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].includes(ext)) return 'image'
    return ''
}

function normalizeFolderPath(value = '') {
    return String(value || '').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/')
}

function folderNameFromPath(value = '') {
    const clean = normalizeFolderPath(value)
    if (!clean) return 'Drive'
    return clean.split('/').filter(Boolean).pop() || clean
}

function parentFolderPath(value = '') {
    const parts = normalizeFolderPath(value).split('/').filter(Boolean)
    parts.pop()
    return parts.join('/')
}

function childFolderName(folder = '', parent = '') {
    const cleanFolder = normalizeFolderPath(folder)
    const cleanParent = normalizeFolderPath(parent)
    if (!cleanFolder) return ''
    if (!cleanParent) return cleanFolder.split('/')[0] || ''
    if (cleanFolder === cleanParent || !cleanFolder.startsWith(`${cleanParent}/`)) return ''
    return cleanFolder.slice(cleanParent.length + 1).split('/')[0] || ''
}

function fileIcon(file = {}) {
    const previewType = getFilePreviewType(file)
    if (previewType === 'image') return 'solar:gallery-bold-duotone'
    if (previewType === 'pdf') return 'solar:file-text-bold-duotone'
    return file.source === 'drive' ? 'solar:cloud-storage-bold-duotone' : 'solar:document-text-bold-duotone'
}

function fileColor(file = {}) {
    const previewType = getFilePreviewType(file)
    if (previewType === 'image') return '#10b981'
    if (previewType === 'pdf') return '#ef4444'
    if (file.source === 'drive') return '#ec4899'
    return '#f59e0b'
}

function ragBadges(file = {}) {
    const rag = file.rag || null
    if (!rag?.indexed) return []
    return [
        { label: 'Indexed', tone: 'indexed' },
        ...(rag.canonical ? [{ label: 'Canonical', tone: 'canonical' }] : []),
    ]
}

function fileRagMeta(file = {}) {
    const rag = file.rag || null
    if (rag?.indexed) {
        const chunks = rag.chunkCount ? `${rag.chunkCount} chunk${rag.chunkCount > 1 ? 's' : ''}` : 'RAG'
        return rag.canonical ? `Canonical · ${chunks}` : `Indexed · ${chunks}`
    }
    return 'OCR à l’envoi'
}

function renderInlineMarkdown(text, keyPrefix = 'inline') {
    const value = String(text || '')
    const nodes = []
    const pattern = /(\*\*([^*]+)\*\*|`([^`]+)`)/g
    let lastIndex = 0
    let match

    while ((match = pattern.exec(value)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(value.slice(lastIndex, match.index))
        }

        if (match[2]) {
            nodes.push(<strong key={`${keyPrefix}-strong-${match.index}`}>{match[2]}</strong>)
        } else if (match[3]) {
            nodes.push(<code key={`${keyPrefix}-code-${match.index}`}>{match[3]}</code>)
        }

        lastIndex = pattern.lastIndex
    }

    if (lastIndex < value.length) nodes.push(value.slice(lastIndex))
    return nodes.length ? nodes : value
}

function renderMessageContent(content) {
    const lines = String(content || '').split('\n')
    const blocks = []
    let listItems = []
    let blockIndex = 0

    const flushList = () => {
        if (!listItems.length) return
        const items = listItems
        listItems = []
        blocks.push(
            <ul className="rai-md-list" key={`list-${blockIndex++}`}>
                {items.map((item, index) => (
                    <li key={index}>{renderInlineMarkdown(item, `list-${blockIndex}-${index}`)}</li>
                ))}
            </ul>
        )
    }

    lines.forEach((line) => {
        const trimmedRight = line.trimEnd()
        const trimmed = trimmedRight.trim()

        if (!trimmed) {
            flushList()
            return
        }

        const heading = trimmed.match(/^(#{1,4})\s+(.+)$/)
        if (heading) {
            flushList()
            blocks.push(
                <div className="rai-md-heading" key={`heading-${blockIndex++}`}>
                    {renderInlineMarkdown(heading[2], `heading-${blockIndex}`)}
                </div>
            )
            return
        }

        const bullet = trimmedRight.match(/^\s*[-*]\s+(.+)$/)
        if (bullet) {
            listItems.push(bullet[1])
            return
        }

        flushList()
        blocks.push(
            <p className="rai-md-p" key={`p-${blockIndex++}`}>
                {renderInlineMarkdown(trimmedRight, `p-${blockIndex}`)}
            </p>
        )
    })

    flushList()
    return blocks.length ? blocks : null
}

function estimateTokensFromChars(chars) {
    return Math.ceil((chars || 0) / 4)
}

const AGENT_PHASE_MS = 1600

function buildAgentPhrases(selection = {}) {
    const phrases = ['Analyse de la demande']
    const documentCount = (selection.files || []).length

    if (documentCount > 0) {
        phrases.push(documentCount > 1 ? 'Lecture des documents' : 'Lecture du document')
    }

    phrases.push('Thinking', 'Working...')
    return phrases
}

function Icon({ icon, width = 16, color }) {
    return <iconify-icon icon={icon} width={width} style={color ? { color } : undefined}></iconify-icon>
}

function AgentStatus({ phrase = 'Analyse de la demande' }) {
    return (
        <div className="rai-agent-status" role="status" aria-live="polite">
            <span className="rai-agent-loader" aria-hidden="true">
                <span />
                <span />
                <span />
            </span>
            <span className="rai-agent-label">{phrase}</span>
        </div>
    )
}

function SectionItem({ active, icon, color, title, meta, preview, badges = [], onToggle, disabled = false }) {
    return (
        <button type="button" className={`rai-context-item ${active ? 'active' : ''}`} onClick={onToggle} disabled={disabled} title={title}>
            <span className="rai-check" aria-hidden="true">
                {active && <Icon icon="solar:check-bold" width={12} />}
            </span>
            <span className="rai-item-icon" style={{ '--rai-item-color': color || '#111827' }}>
                <Icon icon={icon} width={15} />
            </span>
            <span className="rai-item-body">
                <span className="rai-item-title-row">
                    <span className="rai-item-title">{title}</span>
                    {badges.length > 0 && (
                        <span className="rai-item-badges">
                            {badges.map(badge => (
                                <span key={`${badge.tone}:${badge.label}`} className={`rai-rag-badge ${badge.tone || ''}`}>{badge.label}</span>
                            ))}
                        </span>
                    )}
                </span>
                {preview && <span className="rai-item-preview">{preview}</span>}
                {meta && <span className="rai-item-meta">{meta}</span>}
            </span>
        </button>
    )
}

function ContextGroup({ title, icon, color, count, children }) {
    return (
        <section className="rai-context-group">
            <div className="rai-group-title">
                <span className="rai-group-icon" style={{ color }}>
                    <Icon icon={icon} width={15} />
                </span>
                <span>{title}</span>
                <span className="rai-group-count">{count}</span>
            </div>
            <div className="rai-group-list">{children}</div>
        </section>
    )
}

function ContextCardGrid({ items = [], onOpen }) {
    if (!items.length) return null

    return (
        <div className="rai-context-card-grid">
            {items.map(item => {
                const clickable = item.type === 'files' && item.url && item.previewType
                const content = (
                    <>
                        <span className="rai-context-card-icon" style={{ '--rai-card-color': item.color || '#4f46e5' }}>
                            <Icon icon={item.icon || 'solar:document-text-bold-duotone'} width={15} />
                        </span>
                        <span className="rai-context-card-body">
                            <span className="rai-context-card-title">{item.label}</span>
                            <span className="rai-context-card-meta">
                                {item.previewType === 'pdf' ? 'PDF' : item.previewType === 'image' ? 'Image' : item.meta || contextTypeLabel(item.type)}
                            </span>
                        </span>
                    </>
                )

                if (clickable) {
                    return (
                        <button
                            type="button"
                            key={item.key || `${item.type}:${item.id}`}
                            className="rai-context-card is-clickable"
                            onClick={() => onOpen(item)}
                            title={`Ouvrir ${item.label}`}
                        >
                            {content}
                        </button>
                    )
                }

                return (
                    <div key={item.key || `${item.type}:${item.id}`} className="rai-context-card">
                        {content}
                    </div>
                )
            })}
        </div>
    )
}

function ContextBadgeList({ items = [], onOpen, onRemove, className = 'rai-selected-context' }) {
    if (!items.length) return null

    return (
        <div className={className}>
            {items.map(item => {
                const clickable = item.type === 'files' && item.url && item.previewType
                const open = () => {
                    if (clickable && onOpen) onOpen(item)
                }
                return (
                    <div
                        key={item.key || `${item.type}:${item.id}`}
                        className={`rai-context-badge ${clickable ? 'is-clickable' : ''}`}
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        onClick={open}
                        onKeyDown={event => {
                            if (!clickable) return
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                open()
                            }
                        }}
                        title={clickable ? `Ouvrir ${item.label}` : item.label}
                    >
                        <Icon icon={item.icon || 'solar:document-text-bold-duotone'} width={13} color={item.color || '#4f46e5'} />
                        <span className="rai-badge-text">{item.label}</span>
                        {onRemove && (
                            <button
                                type="button"
                                className="rai-badge-remove"
                                onClick={event => {
                                    event.stopPropagation()
                                    onRemove(item)
                                }}
                                title="Retirer"
                            >
                                <Icon icon="solar:close-circle-bold" width={13} />
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function contextTypeLabel(type) {
    if (type === 'fields') return 'Fiche'
    if (type === 'notes') return 'Note'
    if (type === 'chats') return 'Chat'
    if (type === 'uploads') return 'OCR'
    return 'Contexte'
}

function formatNumber(value) {
    const number = Number(value || 0)
    return Number.isFinite(number) ? number.toLocaleString('fr-FR') : '0'
}

function DebugTextBlock({ title, text, meta, open = false }) {
    return (
        <details className="rai-debug-block" open={open}>
            <summary>
                <span>{title}</span>
                {meta && <strong>{meta}</strong>}
            </summary>
            <pre>{text || 'Aucune donnée'}</pre>
        </details>
    )
}

function DebugPayloadView({ payload = {} }) {
    const ocrItems = Array.isArray(payload.ocr) ? payload.ocr : []
    const uploads = Array.isArray(payload.uploads) ? payload.uploads : []
    const rag = payload.rag || null
    const ragChunks = Array.isArray(rag?.chunks) ? rag.chunks : []
    const ragDocuments = Array.isArray(rag?.documents) ? rag.documents : []
    const reusedDocuments = ragDocuments.filter(document => document.reused).length
    const contextStats = payload.contextStats || {}

    return (
        <div className="rai-debug-payload">
            <div className="rai-debug-kpis">
                <span>Réponse: <strong>{payload.engines?.response?.model ? `${payload.responseEngine}:${payload.engines.response.model}` : payload.model || '-'}</strong></span>
                <span>Embedding: <strong>{payload.engines?.embedding?.engine || payload.embeddingEngine || '-'}</strong></span>
                <span>Contexte envoyé: <strong>{payload.includeContext ? 'oui' : 'non'}</strong></span>
                <span>Contexte modifié: <strong>{payload.contextChanged ? 'oui' : 'non'}</strong></span>
                <span>OCR max: <strong>{payload.limits?.ocrMaxPages || '-'} pages</strong></span>
                <span>RAG: <strong>{rag?.enabled ? `${payload.limits?.ragMaxPages || rag.maxPages || '-'} pages` : 'non'}</strong></span>
                {reusedDocuments > 0 && <span>RAG cache: <strong>{reusedDocuments}</strong></span>}
                <span>Vectoriel: <strong>{rag?.vector?.enabled ? (rag.vector.queryEmbedded ? 'oui' : 'fallback') : 'non'}</strong></span>
                {ragChunks.length > 0 && <span>Chunks: <strong>{ragChunks.length}</strong></span>}
                <span>Contexte: <strong>{formatNumber(contextStats.chars)} caractères</strong></span>
                {contextStats.truncated && <span className="is-warn">Tronqué</span>}
            </div>

            {contextStats.errors?.length > 0 && (
                <DebugTextBlock title="Erreurs OCR/contexte" text={contextStats.errors.join('\n')} open />
            )}

            <DebugTextBlock
                title="Payload envoyé à l'IA"
                meta={`${formatNumber(payload.aiInputOriginalChars)} caractères`}
                text={payload.aiInput}
                open
            />
            <DebugTextBlock
                title="Contexte reconstruit"
                meta={`${formatNumber(payload.contextTextOriginalChars)} caractères`}
                text={payload.contextText}
            />
            <DebugTextBlock
                title="Sélection brute reçue par le serveur"
                text={JSON.stringify(payload.contextSelections || {}, null, 2)}
            />

            {rag && (
                <DebugTextBlock
                    title="Index RAG documents"
                    meta={`${ragDocuments.length} document${ragDocuments.length > 1 ? 's' : ''}`}
                    text={JSON.stringify({
                        enabled: rag.enabled,
                        maxPages: rag.maxPages,
                        maxDocuments: rag.maxDocuments,
                        errors: rag.errors || [],
                        documents: ragDocuments,
                        queryTokens: rag.queryTokens || [],
                        phrases: rag.phrases || [],
                        requestedPages: rag.requestedPages || [],
                        vector: rag.vector || null,
                    }, null, 2)}
                    open={ragDocuments.length > 0}
                />
            )}

            {ragChunks.map((chunk, index) => (
                <DebugTextBlock
                    key={`${chunk.documentId || 'rag'}:${chunk.chunkIndex || index}`}
                    title={`Chunk RAG - ${chunk.name || index + 1}`}
                    meta={`p. ${chunk.pageStart || '-'} | score ${formatNumber(chunk.score)}`}
                    text={[
                        `Reason: ${chunk.reason || '-'}`,
                        `Scores: vector=${chunk.vectorScore ?? '-'} lexical=${chunk.lexicalScore ?? '-'} pageBoost=${chunk.pageBoost ?? '-'}`,
                        `Matched: ${(chunk.matchedTerms || []).join(', ') || '-'}`,
                        '',
                        chunk.text || ''
                    ].join('\n')}
                />
            ))}

            {ocrItems.map((item, index) => (
                <DebugTextBlock
                    key={`${item.source || 'ocr'}:${item.id || index}`}
                    title={`OCR document - ${item.name || item.id || index + 1}`}
                    meta={`${formatNumber(item.rawTextChars)} caractères`}
                    text={[
                        `Meta: ${JSON.stringify(item.meta || {}, null, 2)}`,
                        '',
                        item.rawText || ''
                    ].join('\n')}
                />
            ))}

            {uploads.map((item, index) => (
                <DebugTextBlock
                    key={`${item.id || index}`}
                    title={`Upload OCR - ${item.name || index + 1}`}
                    meta={`${formatNumber(item.rawTextChars)} caractères`}
                    text={item.rawText || ''}
                />
            ))}
        </div>
    )
}

function agentStatusLabel(status) {
    if (status === 'drafting') return 'Analyse'
    if (status === 'review') return 'À valider'
    if (status === 'applying') return 'Application'
    if (status === 'applied') return 'Appliqué'
    if (status === 'partial') return 'Partiel'
    if (status === 'undoing') return 'Annulation'
    if (status === 'undone') return 'Annulé'
    if (status === 'error') return 'Erreur'
    return status || 'Agent'
}

function agentToolIcon(tool) {
    if (tool === 'create_note') return 'solar:notebook-bold-duotone'
    if (tool === 'update_fiche') return 'solar:card-bold-duotone'
    if (tool === 'create_task') return 'solar:checklist-minimalistic-bold-duotone'
    return 'solar:magic-stick-3-bold-duotone'
}

function agentToolColor(tool) {
    if (tool === 'create_note') return '#8b5cf6'
    if (tool === 'update_fiche') return '#4361ee'
    if (tool === 'create_task') return '#10b981'
    return '#4f46e5'
}

function agentActionStatusIcon(status) {
    if (status === 'applied') return 'solar:check-circle-bold-duotone'
    if (status === 'failed') return 'solar:danger-circle-bold-duotone'
    if (status === 'undone') return 'solar:rewind-back-bold-duotone'
    return 'solar:clock-circle-bold-duotone'
}

function AgentActionCard({ action = {} }) {
    const color = agentToolColor(action.tool)
    const diff = Array.isArray(action.diff) ? action.diff : []
    const failed = action.status === 'failed'

    return (
        <div className={`rai-agent-action ${action.status || 'proposed'}`} style={{ '--agent-action-color': color }}>
            <div className="rai-agent-action-head">
                <span className="rai-agent-action-icon">
                    <Icon icon={agentToolIcon(action.tool)} width={16} />
                </span>
                <span className="rai-agent-action-title">
                    <strong>{action.title || action.tool}</strong>
                    <small>{action.description || 'Action proposée'}</small>
                </span>
                <span className={`rai-agent-action-status ${action.status || 'proposed'}`}>
                    <Icon icon={agentActionStatusIcon(action.status)} width={13} />
                    {agentStatusLabel(action.status || 'review')}
                </span>
            </div>

            {action.tool === 'create_note' && action.preview && (
                <div className="rai-agent-preview">
                    <strong>{action.preview.title || action.input?.title || 'Note IA'}</strong>
                    <p>{action.preview.excerpt || ''}</p>
                </div>
            )}

            {action.tool === 'create_task' && action.preview && (
                <div className="rai-agent-preview compact">
                    <strong>{action.preview.title || action.input?.title || 'Tâche IA'}</strong>
                    {action.preview.dueDate && <p>Échéance: {action.preview.dueDate}</p>}
                </div>
            )}

            {diff.length > 0 && (
                <div className="rai-agent-diff">
                    {diff.map(item => (
                        <div className="rai-agent-diff-row" key={`${action.id}:${item.fieldId}`}>
                            <span>{item.label}</span>
                            <div>
                                <em>{item.before}</em>
                                <Icon icon="solar:alt-arrow-right-linear" width={13} />
                                <strong>{item.after}</strong>
                            </div>
                            {item.reason && <small>{item.reason}</small>}
                        </div>
                    ))}
                </div>
            )}

            {failed && action.error && (
                <div className="rai-agent-action-error">
                    <Icon icon="solar:danger-circle-linear" width={14} />
                    {action.error}
                </div>
            )}
        </div>
    )
}

function AgentRunCard({ run = {}, onApply, onUndo, busy = false, onOpenContext }) {
    const actions = Array.isArray(run.proposedActions) ? run.proposedActions : []
    const canApply = ['review', 'partial'].includes(run.status) && actions.some(action => ['proposed', 'failed'].includes(action.status))
    const canUndo = ['applied', 'partial'].includes(run.status) && actions.some(action => action.status === 'applied')
    const steps = Array.isArray(run.plan?.steps) ? run.plan.steps : []

    return (
        <section className={`rai-agent-run ${run.status || 'review'}`}>
            <div className="rai-agent-run-head">
                <span className="rai-agent-run-mark">
                    <Icon icon="solar:magic-stick-3-bold-duotone" width={18} />
                </span>
                <div className="rai-agent-run-title">
                    <strong>{shortText(run.goal || 'Run agent', 92)}</strong>
                    <small>{formatTime(run.createdAt)} · {actions.length} tool{actions.length > 1 ? 's' : ''}</small>
                </div>
                <span className={`rai-agent-run-status ${run.status || 'review'}`}>{agentStatusLabel(run.status)}</span>
            </div>

            {run.summary && <p className="rai-agent-summary">{run.summary}</p>}

            {run.contextItems?.length > 0 && (
                <ContextCardGrid items={run.contextItems} onOpen={onOpenContext} />
            )}

            {steps.length > 0 && (
                <div className="rai-agent-steps">
                    {steps.map((step, index) => (
                        <div className="rai-agent-step" key={step.id || index}>
                            <span>{index + 1}</span>
                            <div>
                                <strong>{step.title}</strong>
                                {step.detail && <small>{step.detail}</small>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="rai-agent-actions">
                {actions.length === 0 && <div className="rai-context-empty">Aucune action proposée</div>}
                {actions.map(action => (
                    <AgentActionCard action={action} key={action.id} />
                ))}
            </div>

            {run.error && (
                <div className="rai-agent-action-error">
                    <Icon icon="solar:danger-circle-linear" width={14} />
                    {run.error}
                </div>
            )}

            <div className="rai-agent-run-footer">
                <span>Review mode actif</span>
                <div>
                    {canUndo && (
                        <button type="button" className="rai-agent-secondary" onClick={() => onUndo(run)} disabled={busy}>
                            <Icon icon="solar:rewind-back-bold-duotone" width={14} />
                            Annuler
                        </button>
                    )}
                    {canApply && (
                        <button type="button" className="rai-agent-primary" onClick={() => onApply(run)} disabled={busy}>
                            <Icon icon={busy ? 'line-md:loading-twotone-loop' : 'solar:check-circle-bold-duotone'} width={14} />
                            Appliquer
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}

export default function RecordAI({ accountNumber, recordId, recordTitle, debugAdmin = false }) {
    const apiBase = `/account/${accountNumber}/api/record-ai/${recordId}`
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [record, setRecord] = useState({ title: recordTitle })
    const [fields, setFields] = useState([])
    const [notes, setNotes] = useState([])
    const [chats, setChats] = useState([])
    const [files, setFiles] = useState([])
    const [limits, setLimits] = useState({})
    const [engineSettings, setEngineSettings] = useState(defaultEngineSettings)
    const [engineOptions, setEngineOptions] = useState({ responseEngines: [], embeddingEngines: [] })
    const [engineRuntime, setEngineRuntime] = useState({})
    const [engineOpen, setEngineOpen] = useState(false)
    const [engineDraft, setEngineDraft] = useState(defaultEngineSettings)
    const [engineSaving, setEngineSaving] = useState(false)
    const [conversations, setConversations] = useState([])
    const [activeConversation, setActiveConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [selection, setSelection] = useState(emptySelection)
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [creating, setCreating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [conversationSearch, setConversationSearch] = useState('')
    const [contextSearch, setContextSearch] = useState('')
    const [contextOpen, setContextOpen] = useState(false)
    const [contextTab, setContextTab] = useState('documents')
    const [documentScope, setDocumentScope] = useState('record')
    const [drivePath, setDrivePath] = useState('')
    const [previewFile, setPreviewFile] = useState(null)
    const [debugOpen, setDebugOpen] = useState(false)
    const [debugLoading, setDebugLoading] = useState(false)
    const [debugError, setDebugError] = useState('')
    const [debugData, setDebugData] = useState(null)
    const [lastContextStats, setLastContextStats] = useState(null)
    const [agentPhrases, setAgentPhrases] = useState(buildAgentPhrases)
    const [agentPhraseIndex, setAgentPhraseIndex] = useState(0)
    const [activeMode, setActiveMode] = useState('chat')
    const [agentRuns, setAgentRuns] = useState([])
    const [agentRunning, setAgentRunning] = useState(false)
    const [agentBusyRunId, setAgentBusyRunId] = useState('')
    const messagesRef = useRef(null)
    const fileInputRef = useRef(null)
    const agentTimerRef = useRef(null)

    const apiFetch = useCallback(async (path, options = {}) => {
        const res = await fetch(`${apiBase}${path}`, {
            credentials: 'include',
            headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data.success === false) {
            throw new Error(data.error || 'Erreur API')
        }
        return data
    }, [apiBase])

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
        })
    }, [])

    const clearAgentTimer = useCallback(() => {
        if (agentTimerRef.current) {
            window.clearTimeout(agentTimerRef.current)
            agentTimerRef.current = null
        }
    }, [])

    const stopAgentStatus = useCallback(() => {
        clearAgentTimer()
        setAgentPhraseIndex(0)
    }, [clearAgentTimer])

    const startAgentStatus = useCallback((currentSelection) => {
        const phrases = buildAgentPhrases(currentSelection)
        setAgentPhrases(phrases)
        setAgentPhraseIndex(0)

        clearAgentTimer()
        if (phrases.length <= 1) return

        let nextIndex = 1
        const advance = () => {
            setAgentPhraseIndex(Math.min(nextIndex, phrases.length - 1))
            if (nextIndex < phrases.length - 1) {
                nextIndex += 1
                agentTimerRef.current = window.setTimeout(advance, AGENT_PHASE_MS)
            } else {
                agentTimerRef.current = null
            }
        }

        agentTimerRef.current = window.setTimeout(advance, AGENT_PHASE_MS)
    }, [clearAgentTimer])

    useEffect(() => () => clearAgentTimer(), [clearAgentTimer])

    const loadConversation = useCallback(async (conversationId) => {
        const data = await apiFetch(`/conversations/${conversationId}`)
        const conversation = data.conversation
        setActiveConversation(conversation)
        setMessages(conversation.messages || [])
        setSelection(emptySelection())
        setLastContextStats(null)
        scrollToBottom()
    }, [apiFetch, scrollToBottom])

    const loadAgentRuns = useCallback(async () => {
        try {
            const data = await apiFetch('/agent/runs')
            setAgentRuns(data.runs || [])
        } catch (err) {
            console.warn('[RecordAI] Agent runs load failed:', err)
        }
    }, [apiFetch])

    const loadBootstrap = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await apiFetch('/bootstrap')
            setRecord(data.record || { title: recordTitle })
            setFields(data.fields || [])
            setNotes(data.notes || [])
            setChats(data.chats || [])
            setFiles(data.files || [])
            setLimits(data.limits || {})
            setEngineSettings({ ...defaultEngineSettings(), ...(data.engineSettings || {}) })
            setEngineOptions(data.engineOptions || { responseEngines: [], embeddingEngines: [] })
            setEngineRuntime(data.engineRuntime || {})
            setConversations(data.conversations || [])
            if (data.conversations?.[0]) {
                await loadConversation(data.conversations[0]._id)
            }
            await loadAgentRuns()
        } catch (err) {
            setError(err.message || 'Chargement impossible')
        } finally {
            setLoading(false)
        }
    }, [apiFetch, loadAgentRuns, loadConversation, recordTitle])

    useEffect(() => {
        loadBootstrap()
    }, [loadBootstrap])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    const selectedFileKeys = useMemo(() => new Set((selection.files || []).map(fileKey)), [selection.files])

    const selectedCount = useMemo(() => {
        return (selection.fields?.length || 0)
            + (selection.notes?.length || 0)
            + (selection.chats?.length || 0)
            + (selection.files?.length || 0)
            + (selection.uploads?.length || 0)
    }, [selection])

    const estimatedTokens = useMemo(() => {
        let chars = 0
        fields.forEach(field => {
            if (selection.fields.includes(field.id)) chars += field.charCount || String(field.value || '').length
        })
        notes.forEach(note => {
            if (selection.notes.includes(String(note.id))) chars += note.charCount || 0
        })
        chats.forEach(chat => {
            if (selection.chats.includes(String(chat.id))) chars += chat.charCount || 3500
        })
        selection.files.forEach(() => { chars += 4500 })
        selection.uploads.forEach(upload => { chars += upload.charCount || String(upload.text || '').length })
        return estimateTokensFromChars(chars)
    }, [fields, notes, chats, selection])

    const filtered = useMemo(() => {
        const q = contextSearch.trim().toLowerCase()
        const match = (value) => !q || String(value || '').toLowerCase().includes(q)
        return {
            fields: fields.filter(item => match(item.label) || match(item.value)),
            notes: notes.filter(item => match(item.title) || match(item.preview)),
            chats: chats.filter(item => match(item.name) || match(item.preview)),
            files: files.filter(item => match(item.name) || match(item.folder)),
        }
    }, [contextSearch, fields, notes, chats, files])

    const filteredConversations = useMemo(() => {
        const q = conversationSearch.trim().toLowerCase()
        if (!q) return conversations
        return conversations.filter(item => {
            return String(item.title || '').toLowerCase().includes(q)
                || String(item.lastMessage?.text || '').toLowerCase().includes(q)
        })
    }, [conversationSearch, conversations])

    const recordContextFiles = useMemo(() => filtered.files.filter(file => file.source === 'record'), [filtered.files])
    const driveContextFiles = useMemo(() => filtered.files.filter(file => file.source === 'drive'), [filtered.files])
    const driveFolders = useMemo(() => {
        const names = new Set()
        driveContextFiles.forEach(file => {
            const child = childFolderName(file.folder || '', drivePath)
            if (child) names.add(child)
        })
        return [...names].sort((a, b) => a.localeCompare(b))
    }, [driveContextFiles, drivePath])
    const visibleDriveFiles = useMemo(() => {
        const current = normalizeFolderPath(drivePath)
        return driveContextFiles.filter(file => normalizeFolderPath(file.folder || '') === current)
    }, [driveContextFiles, drivePath])
    const canBrowseDrive = Boolean(record.canUseAccountDrive) || driveContextFiles.length > 0
    const recordEntityIcon = record.entityIcon || 'solar:card-bold-duotone'
    const recordEntityColor = record.entityColor || '#4f46e5'

    const updateConversationList = useCallback((conversation) => {
        setConversations(prev => {
            const rest = prev.filter(item => item._id !== conversation._id)
            return [conversation, ...rest]
        })
    }, [])

    const createConversation = useCallback(async (initialSelection = emptySelection()) => {
        if (creating) return null
        const contextSelections = cleanConversationSelection(initialSelection)
        setCreating(true)
        try {
            const data = await apiFetch('/conversations', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Nouvelle conversation',
                    contextSelections,
                }),
            })
            setConversations(prev => [data.conversation, ...prev])
            setActiveConversation(data.conversation)
            setMessages([])
            setSelection(contextSelections)
            setLastContextStats(null)
            return data.conversation
        } catch (err) {
            setError(err.message || 'Création impossible')
            return null
        } finally {
            setCreating(false)
        }
    }, [apiFetch, creating])

    const deleteConversation = useCallback(async () => {
        if (!activeConversation) return
        const ok = window.confirm('Effacer cette conversation IA et tout son historique ?')
        if (!ok) return
        try {
            await apiFetch(`/conversations/${activeConversation._id}`, { method: 'DELETE' })
            const next = conversations.find(item => item._id !== activeConversation._id) || null
            setConversations(prev => prev.filter(item => item._id !== activeConversation._id))
            setActiveConversation(null)
            setMessages([])
            setSelection(emptySelection())
            setLastContextStats(null)
            if (next) await loadConversation(next._id)
        } catch (err) {
            setError(err.message || 'Suppression impossible')
        }
    }, [activeConversation, apiFetch, conversations, loadConversation])

    const toggleArrayValue = useCallback((key, id) => {
        setSelection(prev => {
            const current = new Set(prev[key] || [])
            if (current.has(id)) current.delete(id)
            else current.add(id)
            return { ...prev, [key]: Array.from(current) }
        })
    }, [])

    const toggleFile = useCallback((file) => {
        setSelection(prev => {
            const key = fileKey(file)
            const exists = (prev.files || []).some(item => fileKey(item) === key)
            return {
                ...prev,
                files: exists
                    ? prev.files.filter(item => fileKey(item) !== key)
                    : [...prev.files, { id: String(file.id), source: file.source, name: file.name }]
            }
        })
    }, [])

    const clearContext = useCallback(() => {
        setSelection(emptySelection())
        setLastContextStats(null)
    }, [])

    const sendMessage = useCallback(async () => {
        const text = input.trim()
        if (!text || sending) return

        const payloadSelection = buildPayloadSelection(selection)
        let conversation = activeConversation
        if (!conversation) {
            conversation = await createConversation(emptySelection())
            if (!conversation) return
        }

        const tempUser = {
            _id: `u_${Date.now()}`,
            role: 'user',
            content: text,
            contextSelections: payloadSelection,
            createdAt: new Date().toISOString()
        }
        const tempAssistant = { _id: `a_${Date.now()}`, role: 'assistant', content: '', loading: true, createdAt: new Date().toISOString() }
        setMessages(prev => [...prev, tempUser, tempAssistant])
        setInput('')
        setSending(true)
        setError('')
        startAgentStatus(selection)

        try {
            const data = await apiFetch(`/conversations/${conversation._id}/messages`, {
                method: 'POST',
                body: JSON.stringify({
                    message: text,
                    contextSelections: payloadSelection,
                }),
            })
            setActiveConversation(data.conversation)
            setMessages(data.conversation.messages || [])
            setLastContextStats(data.contextStats?.included ? data.contextStats : null)
            setSelection(emptySelection())
            updateConversationList(data.conversation)
        } catch (err) {
            setMessages(prev => prev.filter(item => item._id !== tempAssistant._id))
            setError(err.message || 'Envoi impossible')
        } finally {
            setSending(false)
            stopAgentStatus()
        }
    }, [activeConversation, apiFetch, createConversation, input, selection, sending, startAgentStatus, stopAgentStatus, updateConversationList])

    const upsertAgentRun = useCallback((run) => {
        if (!run?._id) return
        setAgentRuns(prev => {
            const rest = prev.filter(item => item._id !== run._id)
            return [run, ...rest]
        })
    }, [])

    const startAgentRun = useCallback(async () => {
        const text = input.trim()
        if (!text || agentRunning) return

        const payloadSelection = buildPayloadSelection(selection)
        const tempRun = {
            _id: `temp_${Date.now()}`,
            goal: text,
            status: 'drafting',
            summary: 'Analyse de la demande en cours...',
            proposedActions: [],
            plan: { title: 'Plan agent', steps: [{ title: 'Analyse du contexte', detail: '', status: 'ready' }] },
            contextItems: [],
            createdAt: new Date().toISOString()
        }

        setAgentRuns(prev => [tempRun, ...prev])
        setInput('')
        setAgentRunning(true)
        setError('')
        startAgentStatus(selection)

        try {
            const data = await apiFetch('/agent/runs', {
                method: 'POST',
                body: JSON.stringify({
                    goal: text,
                    contextSelections: payloadSelection,
                }),
            })
            setAgentRuns(prev => [data.run, ...prev.filter(item => item._id !== tempRun._id && item._id !== data.run?._id)])
            setSelection(emptySelection())
            setLastContextStats(null)
        } catch (err) {
            setAgentRuns(prev => prev.filter(item => item._id !== tempRun._id))
            setError(err.message || 'Agent impossible')
        } finally {
            setAgentRunning(false)
            stopAgentStatus()
        }
    }, [agentRunning, apiFetch, input, selection, startAgentStatus, stopAgentStatus])

    const applyAgentRun = useCallback(async (run) => {
        if (!run?._id || agentBusyRunId) return
        setAgentBusyRunId(run._id)
        setError('')
        try {
            const data = await apiFetch(`/agent/runs/${run._id}/apply`, { method: 'POST', body: JSON.stringify({}) })
            upsertAgentRun(data.run)
        } catch (err) {
            setError(err.message || 'Application impossible')
        } finally {
            setAgentBusyRunId('')
        }
    }, [agentBusyRunId, apiFetch, upsertAgentRun])

    const undoAgentRun = useCallback(async (run) => {
        if (!run?._id || agentBusyRunId) return
        const ok = window.confirm("Annuler les modifications appliquées par cet agent ?")
        if (!ok) return
        setAgentBusyRunId(run._id)
        setError('')
        try {
            const data = await apiFetch(`/agent/runs/${run._id}/undo`, { method: 'POST', body: JSON.stringify({}) })
            upsertAgentRun(data.run)
        } catch (err) {
            setError(err.message || 'Annulation impossible')
        } finally {
            setAgentBusyRunId('')
        }
    }, [agentBusyRunId, apiFetch, upsertAgentRun])

    const handleUpload = useCallback(async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        setUploading(true)
        setError('')
        try {
            const body = new FormData()
            body.append('file', file)
            body.append('mode', 'auto')
            body.append('maxPages', String(limits.ragMaxPages || limits.ocrMaxPages || 20))
            const res = await fetch(`/account/${accountNumber}/api/ocr/extract`, {
                method: 'POST',
                credentials: 'include',
                body,
            })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || 'OCR impossible')
            const upload = {
                id: `upload:${Date.now()}`,
                name: file.name,
                text: data.text || '',
                charCount: data.meta?.charCount || (data.text || '').length,
            }
            setSelection(prev => ({ ...prev, uploads: [...prev.uploads, upload] }))
        } catch (err) {
            setError(err.message || 'OCR impossible')
        } finally {
            setUploading(false)
        }
    }, [accountNumber, limits.ocrMaxPages, limits.ragMaxPages])

    const removeUpload = useCallback((id) => {
        setSelection(prev => ({ ...prev, uploads: prev.uploads.filter(upload => upload.id !== id) }))
    }, [])

    const removeContextItem = useCallback((item = {}) => {
        setSelection(prev => {
            if (item.type === 'fields') {
                return { ...prev, fields: prev.fields.filter(id => id !== item.id) }
            }
            if (item.type === 'notes') {
                return { ...prev, notes: prev.notes.filter(id => String(id) !== String(item.id)) }
            }
            if (item.type === 'chats') {
                return { ...prev, chats: prev.chats.filter(id => String(id) !== String(item.id)) }
            }
            if (item.type === 'files') {
                return {
                    ...prev,
                    files: prev.files.filter(file => fileKey(file) !== `${item.source}:${item.id}`)
                }
            }
            if (item.type === 'uploads') {
                return { ...prev, uploads: prev.uploads.filter(upload => upload.id !== item.id) }
            }
            return prev
        })
        setLastContextStats(null)
    }, [])

    const buildContextItems = useCallback((contextSelection = {}, fallbackItems = []) => {
        const items = []
        const fallbackByKey = new Map((fallbackItems || []).map(item => [item.key || `${item.type}:${item.id}`, item]))
        const safeSelection = {
            fields: Array.isArray(contextSelection.fields) ? contextSelection.fields : [],
            notes: Array.isArray(contextSelection.notes) ? contextSelection.notes : [],
            chats: Array.isArray(contextSelection.chats) ? contextSelection.chats : [],
            files: Array.isArray(contextSelection.files) ? contextSelection.files : [],
            uploads: Array.isArray(contextSelection.uploads) ? contextSelection.uploads : [],
        }

        safeSelection.fields.forEach(id => {
            const field = fields.find(item => item.id === id)
            const fallback = fallbackByKey.get(`field:${id}`) || fallbackByKey.get(`fields:${id}`)
            if (field || fallback) {
                items.push({
                    key: `field:${id}`,
                    type: 'fields',
                    id,
                    label: field?.label || fallback?.label || 'Champ',
                    icon: fallback?.icon || 'solar:text-field-focus-bold',
                    color: fallback?.color || '#4f46e5',
                    meta: fallback?.meta || 'Fiche',
                })
            }
        })
        safeSelection.notes.forEach(id => {
            const note = notes.find(item => String(item.id) === String(id))
            const fallback = fallbackByKey.get(`note:${id}`) || fallbackByKey.get(`notes:${id}`)
            if (note || fallback) {
                items.push({
                    key: `note:${id}`,
                    type: 'notes',
                    id: String(id),
                    label: note?.title || fallback?.label || 'Note',
                    icon: fallback?.icon || 'solar:notes-bold-duotone',
                    color: fallback?.color || '#8b5cf6',
                    meta: fallback?.meta || 'Note',
                })
            }
        })
        safeSelection.chats.forEach(id => {
            const chat = chats.find(item => String(item.id) === String(id))
            const fallback = fallbackByKey.get(`chat:${id}`) || fallbackByKey.get(`chats:${id}`)
            if (chat || fallback) {
                items.push({
                    key: `chat:${id}`,
                    type: 'chats',
                    id: String(id),
                    label: chat?.name || fallback?.label || 'Chat',
                    icon: fallback?.icon || 'solar:chat-round-dots-bold-duotone',
                    color: fallback?.color || '#f97316',
                    meta: fallback?.meta || 'Chat',
                })
            }
        })
        safeSelection.files.forEach(file => {
            const key = fileKey(file)
            const fallback = fallbackByKey.get(key) || fallbackByKey.get(`file:${file.id}`) || fallbackByKey.get(`files:${file.id}`)
            const fileDetails = files.find(item => fileKey(item) === key) || fallback || file
            const displayFile = { ...file, ...fileDetails }
            const previewType = getFilePreviewType(displayFile)
            items.push({
                key,
                type: 'files',
                id: String(file.id),
                source: file.source,
                label: displayFile.name || displayFile.label || file.name,
                icon: fallback?.icon || fileIcon(displayFile),
                color: fallback?.color || fileColor(displayFile),
                url: displayFile.url || '',
                mimeType: displayFile.mimeType || '',
                previewType: previewType || fallback?.previewType || '',
                meta: fallback?.meta || fileRagMeta(displayFile),
            })
        })
        safeSelection.uploads.forEach(upload => {
            const fallback = fallbackByKey.get(upload.id) || fallbackByKey.get(`upload:${upload.id}`) || fallbackByKey.get(`uploads:${upload.id}`)
            items.push({
                key: upload.id,
                type: 'uploads',
                id: upload.id,
                label: upload.name || fallback?.label || 'Document OCR',
                icon: fallback?.icon || 'solar:file-check-bold-duotone',
                color: fallback?.color || '#0f766e',
                meta: fallback?.meta || 'OCR',
            })
        })
        return items
    }, [chats, fields, files, notes])

    const selectedContextItems = useMemo(() => buildContextItems(selection), [buildContextItems, selection])

    const contextItemsForMessage = useCallback((message = {}) => {
        const fallbackItems = Array.isArray(message.contextItems) ? message.contextItems : []
        const contextSelection = message.contextSelections || {}
        const hasSelection = ['fields', 'notes', 'chats', 'files', 'uploads'].some(key => Array.isArray(contextSelection[key]) && contextSelection[key].length > 0)
        return hasSelection ? buildContextItems(contextSelection, fallbackItems) : fallbackItems
    }, [buildContextItems])

    const openContextItem = useCallback((item) => {
        if (item.type !== 'files' || !item.url || !item.previewType) return
        setPreviewFile({
            url: item.url,
            type: item.previewType,
            label: item.label,
        })
    }, [])

    const openContextPicker = useCallback(() => {
        setContextTab('documents')
        setDocumentScope('record')
        setDrivePath('')
        setContextOpen(true)
    }, [])

    const loadDebugLogs = useCallback(async () => {
        if (!debugAdmin || !activeConversation) return
        setDebugOpen(true)
        setDebugLoading(true)
        setDebugError('')
        try {
            const data = await apiFetch(`/conversations/${activeConversation._id}/debug`)
            setDebugData(data)
        } catch (err) {
            setDebugError(err.message || 'Debug indisponible')
            setDebugData(null)
        } finally {
            setDebugLoading(false)
        }
    }, [activeConversation, apiFetch, debugAdmin])

    const openEngineSettings = useCallback(() => {
        if (!debugAdmin) return
        setEngineDraft({ ...defaultEngineSettings(), ...engineSettings })
        setEngineOpen(true)
    }, [debugAdmin, engineSettings])

    const saveEngineSettings = useCallback(async () => {
        if (!debugAdmin || engineSaving) return
        setEngineSaving(true)
        setError('')
        try {
            const data = await apiFetch('/settings', {
                method: 'PATCH',
                body: JSON.stringify(engineDraft),
            })
            setEngineSettings({ ...defaultEngineSettings(), ...(data.engineSettings || {}) })
            setEngineOptions(data.engineOptions || { responseEngines: [], embeddingEngines: [] })
            setEngineRuntime(data.engineRuntime || {})
            setEngineOpen(false)
        } catch (err) {
            setError(err.message || 'Réglages IA impossibles')
        } finally {
            setEngineSaving(false)
        }
    }, [apiFetch, debugAdmin, engineDraft, engineSaving])

    const closeContextPicker = useCallback(() => {
        setContextOpen(false)
    }, [])

    const contextTabs = useMemo(() => ([
        {
            key: 'documents',
            label: 'Docs',
            icon: 'solar:folder-with-files-bold-duotone',
            color: '#f59e0b',
            total: files.length + selection.uploads.length,
            selected: selection.files.length + selection.uploads.length,
        },
        {
            key: 'fields',
            label: 'Fiche',
            icon: recordEntityIcon,
            color: recordEntityColor,
            total: fields.length,
            selected: selection.fields.length,
        },
        {
            key: 'notes',
            label: 'Notes',
            icon: 'solar:notebook-bold-duotone',
            color: '#8b5cf6',
            total: notes.length,
            selected: selection.notes.length,
        },
        {
            key: 'chats',
            label: 'Chat',
            icon: 'solar:chat-round-dots-bold-duotone',
            color: '#f97316',
            total: chats.length,
            selected: selection.chats.length,
        },
    ]), [chats.length, fields.length, files.length, notes.length, recordEntityColor, recordEntityIcon, selection])

    const activeContextGroup = (() => {
        if (contextTab === 'notes') {
            return (
                <ContextGroup title="Notes" icon="solar:notebook-bold-duotone" color="#8b5cf6" count={`${selection.notes.length}/${notes.length}`}>
                    {filtered.notes.length === 0 && <div className="rai-context-empty">Aucune note</div>}
                    {filtered.notes.map(note => (
                        <SectionItem
                            key={note.id}
                            active={selection.notes.includes(String(note.id))}
                            icon={note.isProtected ? 'solar:lock-keyhole-bold-duotone' : 'solar:notes-bold-duotone'}
                            color="#8b5cf6"
                            title={note.title}
                            preview={note.preview}
                            meta={note.isProtected ? 'protégée' : `${estimateTokensFromChars(note.charCount)} tokens`}
                            disabled={note.isProtected}
                            onToggle={() => toggleArrayValue('notes', String(note.id))}
                        />
                    ))}
                </ContextGroup>
            )
        }

        if (contextTab === 'chats') {
            return (
                <ContextGroup title="Chat" icon="solar:chat-round-dots-bold-duotone" color="#f97316" count={`${selection.chats.length}/${chats.length}`}>
                    {filtered.chats.length === 0 && <div className="rai-context-empty">Aucun chat</div>}
                    {filtered.chats.map(chat => (
                        <SectionItem
                            key={chat.id}
                            active={selection.chats.includes(String(chat.id))}
                            icon="solar:chat-round-dots-bold-duotone"
                            color="#f97316"
                            title={chat.name}
                            preview={shortText(chat.preview, 90)}
                            meta={`${chat.participantsCount || 0} participant${chat.participantsCount > 1 ? 's' : ''}`}
                            onToggle={() => toggleArrayValue('chats', String(chat.id))}
                        />
                    ))}
                </ContextGroup>
            )
        }

        if (contextTab === 'documents') {
            const activeFiles = documentScope === 'drive' ? visibleDriveFiles : recordContextFiles
            const activeTotal = documentScope === 'drive' ? driveContextFiles.length : recordContextFiles.length
            return (
                <ContextGroup
                    title={documentScope === 'drive' ? folderNameFromPath(drivePath) : (record.entityName || 'Fiche')}
                    icon={documentScope === 'drive' ? 'solar:cloud-storage-bold-duotone' : recordEntityIcon}
                    color={documentScope === 'drive' ? '#ec4899' : recordEntityColor}
                    count={`${selection.files.length + selection.uploads.length}/${activeTotal}`}
                >
                    <div className="rai-doc-sourcebar">
                        <button
                            type="button"
                            className={`rai-doc-source ${documentScope === 'record' ? 'active' : ''}`}
                            onClick={() => setDocumentScope('record')}
                            style={{ '--rai-source-color': recordEntityColor }}
                        >
                            <Icon icon={recordEntityIcon} width={15} />
                            <span>Fiche</span>
                            <strong>{recordContextFiles.length}</strong>
                        </button>
                        <button
                            type="button"
                            className={`rai-doc-source drive ${documentScope === 'drive' ? 'active' : ''}`}
                            onClick={() => {
                                if (!canBrowseDrive) return
                                setDocumentScope('drive')
                            }}
                            disabled={!canBrowseDrive}
                            style={{ '--rai-source-color': '#ec4899' }}
                        >
                            <Icon icon="solar:cloud-storage-bold-duotone" width={15} />
                            <span>Drive</span>
                            <strong>{driveContextFiles.length}</strong>
                        </button>
                    </div>

                    {documentScope === 'drive' && (
                        <div className="rai-doc-breadcrumb">
                            <button type="button" onClick={() => setDrivePath('')} className={!drivePath ? 'active' : ''}>
                                <Icon icon="solar:home-2-bold-duotone" width={13} />
                                <span>Drive</span>
                            </button>
                            {drivePath && (
                                <>
                                    <button type="button" onClick={() => setDrivePath(parentFolderPath(drivePath))}>
                                        <Icon icon="solar:arrow-left-linear" width={13} />
                                        <span>Retour</span>
                                    </button>
                                    <strong>{drivePath}</strong>
                                </>
                            )}
                        </div>
                    )}

                    <button type="button" className="rai-upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Icon icon={uploading ? 'line-md:loading-twotone-loop' : 'solar:upload-square-bold'} width={15} />
                        <span>{uploading ? 'OCR...' : 'Upload OCR'}</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept=".pdf,image/*" hidden onChange={handleUpload} />

                    {selection.uploads.map(upload => (
                        <SectionItem
                            key={upload.id}
                            active
                            icon="solar:file-check-bold-duotone"
                            color="#f59e0b"
                            title={upload.name}
                            preview="Upload OCR"
                            meta={`${estimateTokensFromChars(upload.charCount)} tokens`}
                            onToggle={() => removeUpload(upload.id)}
                        />
                    ))}

                    {documentScope === 'drive' && driveFolders.map(folder => {
                        const folderPath = normalizeFolderPath(drivePath ? `${drivePath}/${folder}` : folder)
                        const nestedFiles = driveContextFiles.filter(file => normalizeFolderPath(file.folder || '') === folderPath).length
                        const nestedFolders = new Set(driveContextFiles
                            .map(file => childFolderName(file.folder || '', folderPath))
                            .filter(Boolean)).size
                        return (
                            <button
                                type="button"
                                key={folderPath}
                                className="rai-folder-item"
                                onClick={() => setDrivePath(folderPath)}
                            >
                                <span className="rai-folder-icon"><Icon icon="solar:folder-open-bold-duotone" width={16} /></span>
                                <span className="rai-folder-body">
                                    <span>{folder}</span>
                                    <small>{nestedFiles + nestedFolders} élément{nestedFiles + nestedFolders > 1 ? 's' : ''}</small>
                                </span>
                                <Icon icon="solar:alt-arrow-right-linear" width={15} />
                            </button>
                        )
                    })}

                    {activeFiles.length === 0 && driveFolders.length === 0 && selection.uploads.length === 0 && <div className="rai-context-empty">Aucun document</div>}
                    {activeFiles.map(file => (
                        <SectionItem
                            key={fileKey(file)}
                            active={selectedFileKeys.has(fileKey(file))}
                            icon={fileIcon(file)}
                            color={fileColor(file)}
                            title={file.name}
                            preview={file.folder || (file.source === 'drive' ? 'Drive' : 'Fiche')}
                            meta={fileRagMeta(file)}
                            badges={ragBadges(file)}
                            onToggle={() => toggleFile(file)}
                        />
                    ))}
                </ContextGroup>
            )
        }

        return (
            <ContextGroup title="Fiche" icon={recordEntityIcon} color={recordEntityColor} count={`${selection.fields.length}/${fields.length}`}>
                {filtered.fields.length === 0 && <div className="rai-context-empty">Aucun champ</div>}
                {filtered.fields.map(field => (
                    <SectionItem
                        key={field.id}
                        active={selection.fields.includes(field.id)}
                        icon="solar:text-field-focus-bold"
                        color={recordEntityColor}
                        title={field.label}
                        preview={shortText(field.value, 86)}
                        meta={`${estimateTokensFromChars(field.charCount)} tokens`}
                        onToggle={() => toggleArrayValue('fields', field.id)}
                    />
                ))}
            </ContextGroup>
        )
    })()

    const activeAgentPhrase = agentPhrases[agentPhraseIndex] || 'Analyse de la demande'

    const contextContent = (
        <>
            <div className="rai-budget">
                <div className="rai-budget-line">
                    <span>{estimatedTokens} tokens estimés</span>
                    <span>{selectedCount} sélection</span>
                </div>
                <div className="rai-budget-bar">
                    <span style={{ width: `${Math.min(100, estimatedTokens / 80)}%` }} />
                </div>
            </div>

            <label className="rai-search">
                <Icon icon="solar:magnifer-linear" width={15} />
                <input value={contextSearch} onChange={event => setContextSearch(event.target.value)} placeholder="Rechercher..." />
            </label>

            <div className="rai-context-tabs">
                {contextTabs.map(tab => (
                    <button
                        type="button"
                        key={tab.key}
                        className={`rai-context-tab ${contextTab === tab.key ? 'active' : ''}`}
                        onClick={() => setContextTab(tab.key)}
                        style={{ '--rai-tab-color': tab.color }}
                    >
                        <Icon icon={tab.icon} width={15} />
                        <span>{tab.label}</span>
                        <strong>{tab.selected}/{tab.total}</strong>
                    </button>
                ))}
            </div>

            <div className="rai-context-scroll">
                {activeContextGroup}
            </div>
        </>
    )

    const canSend = input.trim() && !sending && !creating
    const canSubmit = activeMode === 'agent'
        ? Boolean(input.trim()) && !agentRunning
        : canSend
    const responseEngineOptions = engineOptions.responseEngines?.length
        ? engineOptions.responseEngines
        : [{ key: 'openai', label: 'ChatGPT / OpenAI', available: true }]
    const embeddingEngineOptions = engineOptions.embeddingEngines?.length
        ? engineOptions.embeddingEngines
        : [{ key: 'openai', label: 'OpenAI vectoriel', available: true }, { key: 'lexical', label: 'Local lexical', available: true }]
    const runtimeResponseLabel = engineRuntime.response?.model
        ? `${engineRuntime.response.engine || 'openai'}:${engineRuntime.response.model}`
        : ''
    const runtimeEmbeddingLabel = engineRuntime.embedding?.engine === 'lexical'
        ? 'lexical'
        : engineRuntime.embedding?.model
        ? `${engineRuntime.embedding.engine || 'lexical'}:${engineRuntime.embedding.model}`
        : (engineRuntime.embedding?.engine || '')

    return (
        <div className="rai-app">
            <style>{styles}</style>

            <div className="rai-shell">
                <aside className="rai-sidebar">
                    <div className="rai-sidebar-header">
                        <div className="rai-sidebar-title-row">
                            <h3>
                                <Icon icon={activeMode === 'agent' ? 'solar:magic-stick-3-bold-duotone' : 'solar:chat-round-dots-bold-duotone'} width={18} />
                                {activeMode === 'agent' ? 'Runs Agent' : 'Conversations'}
                                <span className="rai-count">{activeMode === 'agent' ? agentRuns.length : conversations.length}</span>
                            </h3>
                            {activeMode === 'chat' && (
                                <button type="button" className="rai-create-btn" title="Nouvelle conversation" onClick={() => createConversation()} disabled={creating}>
                                    <Icon icon={creating ? 'line-md:loading-twotone-loop' : 'solar:add-circle-bold'} width={14} />
                                    <span>Nouvelle</span>
                                </button>
                            )}
                        </div>
                        {activeMode === 'chat' && (
                            <label className="rai-sidebar-search">
                                <Icon icon="solar:magnifer-linear" width={14} />
                                <input
                                    type="text"
                                    value={conversationSearch}
                                    onChange={event => setConversationSearch(event.target.value)}
                                    placeholder="Rechercher une conversation..."
                                />
                            </label>
                        )}
                    </div>

                    <div className="rai-conv-list">
                        {loading && <div className="rai-loading"><Icon icon="line-md:loading-twotone-loop" width={22} /> Chargement...</div>}
                        {activeMode === 'agent' ? (
                            <>
                                {!loading && agentRuns.length === 0 && (
                                    <div className="rai-empty-side">
                                        <Icon icon="solar:magic-stick-3-bold-duotone" width={32} />
                                        <span>Aucun run agent</span>
                                        <small>Décrivez une action dans le champ principal</small>
                                    </div>
                                )}
                                {agentRuns.map(run => (
                                    <div className={`rai-conv rai-agent-mini ${run.status || 'review'}`} key={run._id}>
                                        <span className="rai-conv-icon"><Icon icon="solar:magic-stick-3-bold-duotone" width={18} /></span>
                                        <span className="rai-conv-body">
                                            <span className="rai-conv-title" title={run.goal || 'Run agent'}>{shortText(run.goal || 'Run agent', 48)}</span>
                                            <span className="rai-conv-preview">{agentStatusLabel(run.status)} · {(run.proposedActions || []).length} tool{(run.proposedActions || []).length > 1 ? 's' : ''}</span>
                                        </span>
                                        <span className="rai-conv-date">{formatDate(run.updatedAt || run.createdAt)}</span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {!loading && filteredConversations.length === 0 && (
                                    <div className="rai-empty-side">
                                        <Icon icon="solar:chat-round-dots-bold-duotone" width={32} />
                                        <span>{conversations.length === 0 ? 'Aucune conversation' : 'Aucun résultat'}</span>
                                        {conversations.length === 0 && <small>Cliquez sur Nouvelle pour commencer</small>}
                                    </div>
                                )}
                                {filteredConversations.map(conversation => (
                                    <button
                                        type="button"
                                        key={conversation._id}
                                        className={`rai-conv ${activeConversation?._id === conversation._id ? 'active' : ''}`}
                                        onClick={() => loadConversation(conversation._id)}
                                    >
                                        <span className="rai-conv-icon"><Icon icon="solar:chat-round-dots-bold-duotone" width={18} /></span>
                                        <span className="rai-conv-body">
                                            <span className="rai-conv-title" title={conversation.title || 'Conversation'}>{conversation.title || 'Conversation'}</span>
                                            <span className="rai-conv-preview">{shortText(conversation.lastMessage?.text || 'Aucun message', 54)}</span>
                                        </span>
                                        <span className="rai-conv-date">{formatDate(conversation.updatedAt)}</span>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </aside>

                <main className="rai-chat">
                    <header className="rai-chat-header">
                        <div className="rai-ai-mark">
                            <Icon icon="solar:magic-stick-3-bold-duotone" width={21} />
                        </div>
                        <div className="rai-chat-title-wrap">
                            <div className="rai-chat-title">{activeMode === 'agent' ? 'Agent record' : (activeConversation?.title || record.title || 'IA')}</div>
                            <div className="rai-chat-sub">
                                <span>{record.entityName || 'Fiche'}</span>
                                <span>·</span>
                                <span>{activeMode === 'agent' ? `${agentRuns.length} run${agentRuns.length > 1 ? 's' : ''}` : `${selectedCount} contexte${selectedCount > 1 ? 's' : ''}`}</span>
                                {lastContextStats && (
                                    <>
                                        <span>·</span>
                                        <span>{lastContextStats.included ? 'contexte envoyé' : 'historique utilisé'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="rai-mode-switch" role="tablist" aria-label="Mode IA">
                            <button
                                type="button"
                                className={activeMode === 'chat' ? 'active' : ''}
                                onClick={() => setActiveMode('chat')}
                            >
                                <Icon icon="solar:chat-round-dots-bold-duotone" width={14} />
                                Chat
                            </button>
                            <button
                                type="button"
                                className={activeMode === 'agent' ? 'active' : ''}
                                onClick={() => setActiveMode('agent')}
                            >
                                <Icon icon="solar:magic-stick-3-bold-duotone" width={14} />
                                Agent
                            </button>
                        </div>
                        {debugAdmin && (
                            <>
                                <button type="button" className="rai-debug-btn rai-engine-btn" onClick={openEngineSettings} title="Moteurs IA">
                                    <Icon icon="solar:tuning-2-bold-duotone" width={15} />
                                    <span>Moteurs</span>
                                </button>
                                <button type="button" className="rai-debug-btn" onClick={loadDebugLogs} disabled={!activeConversation || debugLoading} title="Voir les logs debug IA">
                                    <Icon icon={debugLoading ? 'line-md:loading-twotone-loop' : 'solar:bug-bold-duotone'} width={15} />
                                    <span>Debug</span>
                                </button>
                            </>
                        )}
                        {activeMode === 'chat' && (
                            <button type="button" className="rai-clear-btn" onClick={deleteConversation} disabled={!activeConversation} title="Effacer cette conversation IA et son historique">
                                <Icon icon="solar:trash-bin-trash-bold" width={15} />
                                <span>Effacer</span>
                            </button>
                        )}
                    </header>

                    {error && (
                        <div className="rai-error">
                            <Icon icon="solar:danger-circle-linear" width={16} />
                            {error}
                        </div>
                    )}

                    <div className="rai-messages" ref={messagesRef}>
                        {activeMode === 'agent' ? (
                            <div className="rai-agent-board">
                                {agentRunning && (
                                    <div className="rai-agent-running">
                                        <AgentStatus phrase={activeAgentPhrase} />
                                    </div>
                                )}
                                {!agentRunning && agentRuns.length === 0 && (
                                    <div className="rai-empty-chat">
                                        <div className="rai-empty-mark"><Icon icon="solar:magic-stick-3-bold-duotone" width={36} /></div>
                                        <div>Décrivez ce que l’agent doit préparer</div>
                                        <small>Il proposera les notes, champs ou tâches en review avant application.</small>
                                    </div>
                                )}
                                {agentRuns.map(run => (
                                    <AgentRunCard
                                        key={run._id}
                                        run={run}
                                        onApply={applyAgentRun}
                                        onUndo={undoAgentRun}
                                        busy={agentBusyRunId === run._id}
                                        onOpenContext={openContextItem}
                                    />
                                ))}
                            </div>
                        ) : (
                            <>
                                {!activeConversation && !loading && (
                                    <div className="rai-empty-chat">
                                        <div className="rai-empty-mark"><Icon icon="solar:magic-stick-3-bold-duotone" width={36} /></div>
                                        <div>Nouvelle conversation IA</div>
                                    </div>
                                )}
                                {activeConversation && messages.length === 0 && (
                                    <div className="rai-empty-chat">
                                        <div className="rai-empty-mark"><Icon icon="solar:chat-round-line-bold-duotone" width={36} /></div>
                                        <div>{activeConversation.title || 'Conversation'}</div>
                                    </div>
                                )}
                                {messages.map((message, index) => {
                                    const isContextMessage = message.messageType === 'context'
                                    const contextItems = isContextMessage ? contextItemsForMessage(message) : []
                                    const attachedContextItems = !isContextMessage && message.role === 'user'
                                        ? contextItemsForMessage(message)
                                        : []

                                    if (isContextMessage) {
                                        return (
                                            <div key={message._id || `${message.role}_${index}`} className="rai-message context">
                                                <div className="rai-context-event">
                                                    <div className="rai-context-event-head">
                                                        <span className="rai-context-event-icon">
                                                            <Icon icon="solar:layers-minimalistic-bold-duotone" width={15} />
                                                        </span>
                                                        <span>Contexte ajouté</span>
                                                        <strong>{contextItems.length} source{contextItems.length > 1 ? 's' : ''}</strong>
                                                    </div>
                                                    <ContextCardGrid items={contextItems} onOpen={openContextItem} />
                                                    <div className="rai-context-event-time">{formatTime(message.createdAt)}</div>
                                                </div>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div key={message._id || `${message.role}_${index}`} className={`rai-message ${message.role === 'user' ? 'mine' : 'assistant'}`}>
                                            <div className="rai-msg-avatar">
                                                {message.role === 'user' ? 'M' : <Icon icon="solar:magic-stick-3-bold-duotone" width={15} />}
                                            </div>
                                            <div>
                                                <div className="rai-bubble">
                                                    {message.loading ? (
                                                        <AgentStatus phrase={activeAgentPhrase} />
                                                    ) : (
                                                        <>
                                                            <ContextBadgeList items={attachedContextItems} onOpen={openContextItem} className="rai-message-badges" />
                                                            {renderMessageContent(message.content)}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="rai-msg-time">
                                                    {formatTime(message.createdAt)}
                                                    {message.contextStats?.included && message.role === 'user' && (
                                                        <span> · {message.contextStats.estimatedTokens || 0} tokens ctx</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </div>

                    <div className="rai-composer-wrap">
                        <ContextBadgeList items={selectedContextItems} onOpen={openContextItem} onRemove={removeContextItem} />
                        {uploading && (
                            <div className="rai-inline-status">
                                <AgentStatus phrase="Lecture du document" />
                            </div>
                        )}
                        <div className="rai-composer">
                            <button type="button" className="rai-attach-context" onClick={openContextPicker} title="Ajouter du contexte">
                                <Icon icon="solar:layers-minimalistic-bold-duotone" width={17} />
                                {selectedCount > 0 && <strong>{selectedCount}</strong>}
                            </button>
                            <textarea
                                value={input}
                                onChange={event => setInput(event.target.value)}
                                onKeyDown={event => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault()
                                        activeMode === 'agent' ? startAgentRun() : sendMessage()
                                    }
                                }}
                                placeholder={activeMode === 'agent' ? "Décrivez l'action à préparer..." : 'Posez votre question...'}
                                rows={1}
                            />
                            <button type="button" className="rai-send" onClick={activeMode === 'agent' ? startAgentRun : sendMessage} disabled={!canSubmit}>
                                <Icon icon={(sending || agentRunning) ? 'line-md:loading-twotone-loop' : (activeMode === 'agent' ? 'solar:magic-stick-3-bold-duotone' : 'solar:plain-bold')} width={18} />
                            </button>
                        </div>
                    </div>
                </main>

            </div>

            {contextOpen && (
                <div className="rai-modal-backdrop" onClick={() => setContextOpen(false)}>
                    <div className="rai-modal" onClick={event => event.stopPropagation()}>
                        <div className="rai-modal-header">
                            <div className="rai-modal-title">
                                <span className="rai-modal-icon"><Icon icon="solar:layers-minimalistic-bold-duotone" width={18} /></span>
                                <span>Choisir le contexte</span>
                            </div>
                            <div className="rai-modal-actions">
                                <button type="button" className="rai-link-btn" onClick={clearContext} disabled={selectedCount === 0}>
                                    Vider
                                </button>
                                <button type="button" className="rai-icon-btn" onClick={() => setContextOpen(false)} title="Fermer">
                                    <Icon icon="solar:close-circle-linear" width={17} />
                                </button>
                            </div>
                        </div>
                        <div className="rai-modal-body">
                            {contextContent}
                        </div>
                        <div className="rai-modal-footer">
                            <span>{selectedCount} source{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}</span>
                            <button type="button" className="rai-modal-submit" onClick={closeContextPicker}>
                                Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {debugAdmin && engineOpen && (
                <div className="rai-debug-backdrop" onClick={() => setEngineOpen(false)}>
                    <div className="rai-engine-modal" onClick={event => event.stopPropagation()}>
                        <div className="rai-debug-header">
                            <div className="rai-debug-title">
                                <span className="rai-debug-icon"><Icon icon="solar:tuning-2-bold-duotone" width={17} /></span>
                                <span>Moteurs IA</span>
                            </div>
                            <div className="rai-debug-actions">
                                <button type="button" className="rai-preview-action" onClick={() => setEngineOpen(false)} title="Fermer">
                                    <Icon icon="solar:close-circle-linear" width={17} />
                                </button>
                            </div>
                        </div>
                        <div className="rai-engine-body">
                            <div className="rai-engine-grid">
                                <label className="rai-engine-field">
                                    <span>Réponse</span>
                                    <select
                                        value={engineDraft.responseEngine}
                                        onChange={event => setEngineDraft(prev => ({ ...prev, responseEngine: event.target.value }))}
                                    >
                                        {responseEngineOptions.map(option => (
                                            <option key={option.key} value={option.key} disabled={!option.available}>
                                                {option.label}{option.available ? '' : ' (indisponible)'}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {engineDraft.responseEngine === 'local' ? (
                                    <label className="rai-engine-field">
                                        <span>Modèle local</span>
                                        <input
                                            value={engineDraft.localResponseModel}
                                            onChange={event => setEngineDraft(prev => ({ ...prev, localResponseModel: event.target.value }))}
                                            placeholder="llama3.1"
                                        />
                                    </label>
                                ) : (
                                    <label className="rai-engine-field">
                                        <span>Modèle ChatGPT</span>
                                        <input
                                            value={engineDraft.responseModel}
                                            onChange={event => setEngineDraft(prev => ({ ...prev, responseModel: event.target.value }))}
                                            placeholder="gpt-5.5"
                                        />
                                    </label>
                                )}

                                <label className="rai-engine-field">
                                    <span>Embedding</span>
                                    <select
                                        value={engineDraft.embeddingEngine}
                                        onChange={event => setEngineDraft(prev => ({ ...prev, embeddingEngine: event.target.value }))}
                                    >
                                        {embeddingEngineOptions.map(option => (
                                            <option key={option.key} value={option.key} disabled={!option.available}>
                                                {option.label}{option.available ? '' : ' (indisponible)'}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {engineDraft.embeddingEngine === 'local' && (
                                    <label className="rai-engine-field">
                                        <span>Modèle embedding local</span>
                                        <input
                                            value={engineDraft.localEmbeddingModel}
                                            onChange={event => setEngineDraft(prev => ({ ...prev, localEmbeddingModel: event.target.value }))}
                                            placeholder="nomic-embed-text"
                                        />
                                    </label>
                                )}

                                {engineDraft.embeddingEngine === 'openai' && (
                                    <label className="rai-engine-field">
                                        <span>Modèle embedding ChatGPT</span>
                                        <input
                                            value={engineDraft.embeddingModel}
                                            onChange={event => setEngineDraft(prev => ({ ...prev, embeddingModel: event.target.value }))}
                                            placeholder="text-embedding-3-small"
                                        />
                                    </label>
                                )}
                            </div>

                            {(runtimeResponseLabel || runtimeEmbeddingLabel) && (
                                <div className="rai-engine-current">
                                    {runtimeResponseLabel && <span>Réponse <strong>{runtimeResponseLabel}</strong></span>}
                                    {runtimeEmbeddingLabel && <span>Embedding <strong>{runtimeEmbeddingLabel}</strong></span>}
                                </div>
                            )}
                        </div>
                        <div className="rai-engine-footer">
                            <button type="button" className="rai-link-btn" onClick={() => setEngineOpen(false)} disabled={engineSaving}>
                                Annuler
                            </button>
                            <button type="button" className="rai-modal-submit" onClick={saveEngineSettings} disabled={engineSaving}>
                                {engineSaving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {debugAdmin && debugOpen && (
                <div className="rai-debug-backdrop" onClick={() => setDebugOpen(false)}>
                    <div className="rai-debug-modal" onClick={event => event.stopPropagation()}>
                        <div className="rai-debug-header">
                            <div className="rai-debug-title">
                                <span className="rai-debug-icon"><Icon icon="solar:bug-bold-duotone" width={17} /></span>
                                <span>Debug IA</span>
                            </div>
                            <div className="rai-debug-actions">
                                <button type="button" className="rai-preview-action" onClick={loadDebugLogs} title="Rafraîchir">
                                    <Icon icon="solar:refresh-bold" width={15} />
                                </button>
                                <button type="button" className="rai-preview-action" onClick={() => setDebugOpen(false)} title="Fermer">
                                    <Icon icon="solar:close-circle-linear" width={17} />
                                </button>
                            </div>
                        </div>
                        <div className="rai-debug-body">
                            {debugLoading && <div className="rai-loading"><Icon icon="line-md:loading-twotone-loop" width={22} /> Chargement debug...</div>}
                            {!debugLoading && debugError && <div className="rai-error"><Icon icon="solar:danger-circle-linear" width={16} /> {debugError}</div>}
                            {!debugLoading && !debugError && debugData && (
                                <>
                                    <div className="rai-debug-summary">
                                        <span>Modèle <strong>{debugData.conversation?.model || '-'}</strong></span>
                                        <span>OCR max <strong>{debugData.limits?.ocrMaxPages || '-'} pages</strong></span>
                                        <span>RAG <strong>{debugData.limits?.ragEnabled ? `${debugData.limits?.ragMaxPages || '-'} pages` : 'désactivé'}</strong></span>
                                        <span>Vectoriel <strong>{debugData.limits?.vectorEnabled ? (debugData.limits?.embeddingModel || 'actif') : 'désactivé'}</strong></span>
                                        <span>Logs <strong>{debugData.logs?.length || 0}</strong></span>
                                    </div>
                                    {(debugData.logs || []).length === 0 ? (
                                        <div className="rai-context-empty">Aucun log debug pour cette conversation. Les anciens messages n'ont pas forcément été journalisés.</div>
                                    ) : (
                                        <div className="rai-debug-list">
                                            {debugData.logs.map(log => (
                                                <section className="rai-debug-entry" key={`${log.index}-${log.createdAt}`}>
                                                    <div className="rai-debug-entry-head">
                                                        <span>{log.debugPayload?.phase === 'context' ? 'Contexte' : 'Question'}</span>
                                                        <strong>{formatTime(log.createdAt)}</strong>
                                                    </div>
                                                    <DebugPayloadView payload={log.debugPayload} />
                                                </section>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {previewFile && (
                <div className="rai-preview-backdrop" onClick={() => setPreviewFile(null)}>
                    <div className="rai-preview-modal" onClick={event => event.stopPropagation()}>
                        <div className="rai-preview-header">
                            <div className="rai-preview-title">
                                <span className="rai-preview-icon">
                                    <Icon icon={previewFile.type === 'pdf' ? 'solar:file-text-bold-duotone' : 'solar:gallery-bold-duotone'} width={17} />
                                </span>
                                <span>{previewFile.label}</span>
                            </div>
                            <div className="rai-preview-actions">
                                <a className="rai-preview-action" href={previewFile.url} target="_blank" rel="noopener" title="Ouvrir dans un nouvel onglet">
                                    <Icon icon="solar:square-top-up-bold" width={16} />
                                </a>
                                <button type="button" className="rai-preview-action" onClick={() => setPreviewFile(null)} title="Fermer">
                                    <Icon icon="solar:close-circle-linear" width={17} />
                                </button>
                            </div>
                        </div>
                        <div className="rai-preview-body">
                            {previewFile.type === 'pdf' ? (
                                <iframe className="rai-preview-frame" src={previewFile.url} title={previewFile.label} />
                            ) : (
                                <img className="rai-preview-image" src={previewFile.url} alt={previewFile.label} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = `
.rai-app{--rai-ai:#4f46e5;--rai-ai-dark:#4338ca;--rai-ai-soft:#eef2ff;--rai-ai-faint:#4f46e508;--rai-border:#e0e6ed;--rai-text:#0e1726;--rai-muted:#94a3b8;font-family:inherit;color:var(--rai-text);}
.rai-shell{display:grid;grid-template-columns:300px minmax(0,1fr);height:calc(100vh - 220px);min-height:420px;border:1px solid var(--rai-border);border-radius:14px;overflow:hidden;background:#fff;}
.rai-sidebar{background:#fafbfc;display:flex;flex-direction:column;min-width:0;border-right:1px solid var(--rai-border);}
.rai-sidebar-header{padding:16px 16px 12px;border-bottom:1px solid var(--rai-border);flex-shrink:0;}
.rai-sidebar-title-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;}
.rai-sidebar-title-row h3{display:flex;align-items:center;gap:8px;margin:0;font-size:15px;font-weight:700;color:var(--rai-text);line-height:1.2;}
.rai-sidebar-title-row h3 iconify-icon{color:var(--rai-ai);}
.rai-count{font-size:11px;font-weight:600;color:var(--rai-muted);background:#f1f5f9;padding:2px 8px;border-radius:10px;}
.rai-create-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border:none;border-radius:10px;background:linear-gradient(135deg,var(--rai-ai),#7c3aed);color:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s;white-space:nowrap;}
.rai-create-btn:hover{box-shadow:0 4px 14px rgba(79,70,229,.28);transform:translateY(-1px);}
.rai-sidebar-search,.rai-search{display:flex;align-items:center;gap:8px;border:1.5px solid var(--rai-border);border-radius:10px;background:#fff;color:#bfc9d4;transition:border-color .2s,box-shadow .2s;}
.rai-sidebar-search{padding:0 12px;}
.rai-sidebar-search:focus-within,.rai-search:focus-within{border-color:var(--rai-ai);box-shadow:0 0 0 3px rgba(79,70,229,.08);}
.rai-sidebar-search input,.rai-search input{flex:1;border:none;background:transparent;padding:9px 0;font-size:12px;color:var(--rai-text);outline:none;font-family:inherit;min-width:0;}
.rai-sidebar-search input::placeholder,.rai-search input::placeholder{color:#cbd5e1;}
.rai-chat-header{display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--rai-border);background:#fff;min-height:64px;}
.rai-sidebar-title,.rai-context-title,.rai-chat-title{font-size:14px;font-weight:700;color:var(--rai-text);line-height:1.2;}
.rai-chat-sub{display:flex;align-items:center;gap:6px;font-size:11px;color:#888da8;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rai-icon-btn,.rai-send{border:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;font-family:inherit;}
.rai-icon-btn{width:30px;height:30px;border-radius:8px;background:#f1f5f9;color:#94a3b8;margin-left:auto;}
.rai-icon-btn:hover{background:#e2e8f0;color:var(--rai-text);}
.rai-icon-btn:disabled,.rai-send:disabled,.rai-clear-btn:disabled,.rai-link-btn:disabled,.rai-upload-btn:disabled,.rai-attach-context:disabled,.rai-create-btn:disabled,.rai-modal-submit:disabled{opacity:.45;cursor:default;box-shadow:none;transform:none;}
.rai-conv-list{flex:1;overflow-y:auto;padding:8px;min-height:0;}
.rai-conv-list::-webkit-scrollbar,.rai-messages::-webkit-scrollbar,.rai-context-scroll::-webkit-scrollbar{width:4px;}
.rai-conv-list::-webkit-scrollbar-thumb,.rai-messages::-webkit-scrollbar-thumb,.rai-context-scroll::-webkit-scrollbar-thumb{background:var(--rai-border);border-radius:4px;}
.rai-conv{width:100%;display:flex;align-items:center;gap:10px;border:1.5px solid transparent;background:transparent;border-radius:10px;padding:10px 12px;margin-bottom:2px;cursor:pointer;text-align:left;transition:all .15s;font-family:inherit;color:inherit;}
.rai-conv:hover{background:#f1f5f9;}
.rai-conv.active{background:var(--rai-ai-faint);border-color:rgba(79,70,229,.25);}
.rai-conv-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--rai-ai);background:linear-gradient(135deg,rgba(79,70,229,.10),rgba(79,70,229,.04));}
.rai-conv-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
.rai-conv-title{font-size:13px;font-weight:600;color:var(--rai-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rai-conv-preview{font-size:11px;color:var(--rai-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.45;}
.rai-conv-date{font-size:10px;color:#bfc9d4;white-space:nowrap;align-self:flex-start;margin-top:3px;}
.rai-chat{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden;background:#fff;}
.rai-ai-mark{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(79,70,229,.10),rgba(79,70,229,.04));color:var(--rai-ai);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rai-chat-title-wrap{min-width:0;flex:1;}
.rai-clear-btn{display:inline-flex;align-items:center;gap:4px;border:none;background:transparent;color:#94a3b8;border-radius:6px;padding:5px 8px;font-size:11px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;}
.rai-clear-btn:hover{background:#fef2f2;color:#ef4444;}
.rai-debug-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid #e0e7ff;background:#f8faff;color:var(--rai-ai);border-radius:8px;padding:6px 9px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;}
.rai-debug-btn:hover{border-color:#c7d2fe;background:#eef2ff;}
.rai-debug-btn:disabled{opacity:.45;cursor:default;}
.rai-error{display:flex;align-items:center;gap:7px;margin:10px 14px 0;padding:10px 12px;border:1px solid #fecaca;background:#fff1f2;color:#e11d48;border-radius:10px;font-size:12px;font-weight:600;}
.rai-messages{flex:1 1 auto;overflow-y:auto;min-height:0;padding:20px;display:flex;flex-direction:column;gap:8px;background:linear-gradient(180deg,#f8fafc,#fff);overscroll-behavior:contain;}
.rai-message{display:flex;gap:8px;max-width:78%;animation:raiFade .22s ease both;}
.rai-message.mine{margin-left:auto;flex-direction:row-reverse;}
.rai-msg-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:linear-gradient(135deg,#4361ee,#3b82f6);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;}
.rai-message.mine .rai-msg-avatar{background:linear-gradient(135deg,var(--rai-ai),#7c3aed);}
.rai-bubble{padding:10px 14px;border-radius:14px;background:#f1f5f9;border:1px solid var(--rai-border);color:var(--rai-text);font-size:13px;line-height:1.5;white-space:normal;word-break:break-word;}
.rai-message.mine .rai-bubble{background:linear-gradient(135deg,var(--rai-ai),#7c3aed);color:#fff;border:none;}
.rai-msg-time{font-size:10px;color:#bfc9d4;margin-top:3px;padding:0 4px;}
.rai-message.mine .rai-msg-time{text-align:right;}
.rai-message.context{max-width:720px;width:100%;align-self:center;display:block;}
.rai-context-event{border:1px solid #e5e7eb;background:rgba(255,255,255,.9);box-shadow:0 8px 28px rgba(15,23,42,.06);border-radius:14px;padding:10px 12px;}
.rai-context-event-head{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#334155;margin-bottom:9px;}
.rai-context-event-head strong{margin-left:auto;font-size:10px;font-weight:700;color:var(--rai-ai);background:#eef2ff;border-radius:999px;padding:3px 8px;}
.rai-context-event-icon{width:26px;height:26px;border-radius:8px;background:var(--rai-ai-soft);color:var(--rai-ai);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rai-context-event-time{font-size:10px;color:#bfc9d4;margin-top:7px;padding-left:2px;}
.rai-context-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:7px;}
.rai-context-card{min-width:0;border:1px solid #e8edf5;background:#f8fafc;border-radius:10px;padding:8px 10px;display:flex;align-items:center;gap:9px;text-align:left;color:inherit;font-family:inherit;}
.rai-context-card.is-clickable{cursor:pointer;transition:all .15s;}
.rai-context-card.is-clickable:hover{border-color:#c7d2fe;background:#eef2ff;transform:translateY(-1px);}
.rai-context-card-icon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--rai-card-color);background:color-mix(in srgb,var(--rai-card-color) 10%,#fff);}
.rai-context-card-body{min-width:0;display:flex;flex-direction:column;gap:2px;}
.rai-context-card-title{font-size:12px;font-weight:700;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rai-context-card-meta{font-size:10px;font-weight:600;color:#94a3b8;line-height:1.2;}
.rai-agent-status{position:relative;min-width:220px;height:36px;display:inline-flex;align-items:center;gap:10px;overflow:hidden;border:1px solid rgba(79,70,229,.16);border-radius:999px;background:linear-gradient(135deg,#fff,#f8faff);box-shadow:0 8px 24px rgba(79,70,229,.08);padding:0 14px;color:var(--rai-text);}
.rai-agent-status::after{content:"";position:absolute;inset:-1px;background:linear-gradient(110deg,transparent 0%,rgba(255,255,255,.78) 45%,transparent 68%);transform:translateX(-100%);animation:raiSheen 2.2s ease-in-out infinite;pointer-events:none;}
.rai-agent-loader{position:relative;z-index:1;display:inline-flex;align-items:center;gap:3px;flex-shrink:0;}
.rai-agent-loader span{width:5px;height:5px;border-radius:999px;background:var(--rai-ai);animation:raiDot 1.05s ease-in-out infinite;}
.rai-agent-loader span:nth-child(2){animation-delay:.14s;}
.rai-agent-loader span:nth-child(3){animation-delay:.28s;}
.rai-agent-label{position:relative;z-index:1;font-size:12px;font-weight:700;color:#334155;line-height:1;white-space:nowrap;}
.rai-md-p{margin:0 0 6px;}
.rai-md-p:last-child,.rai-md-list:last-child,.rai-md-heading:last-child{margin-bottom:0;}
.rai-md-heading{margin:8px 0 4px;font-size:13px;font-weight:700;color:var(--rai-text);line-height:1.35;}
.rai-message.mine .rai-md-heading{color:#fff;}
.rai-bubble strong{font-weight:600;}
.rai-bubble code{font-size:12px;padding:1px 5px;border-radius:4px;background:rgba(15,23,42,.07);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;}
.rai-message.mine .rai-bubble code{background:rgba(255,255,255,.18);}
.rai-md-list{margin:4px 0 8px;padding-left:18px;}
.rai-md-list li{margin:2px 0;}
.rai-composer-wrap{border-top:1px solid var(--rai-border);background:#fff;padding:10px 16px 14px;flex-shrink:0;}
.rai-inline-status{display:flex;align-items:center;margin:0 0 8px;}
.rai-selected-context,.rai-message-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap;max-height:64px;overflow-y:auto;margin-bottom:8px;padding-right:2px;}
.rai-message-badges{max-height:none;margin-bottom:7px;}
.rai-context-badge{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:230px;height:28px;border:1px solid #e0e7ff;background:#f8faff;color:#475569;border-radius:9px;padding:0 5px 0 8px;font-size:11px;font-weight:600;font-family:inherit;cursor:default;transition:all .16s;}
.rai-context-badge.is-clickable{cursor:pointer;}
.rai-context-badge.is-clickable:hover{border-color:#c7d2fe;background:#eef2ff;color:var(--rai-text);}
.rai-badge-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.rai-badge-remove{width:18px;height:18px;border:none;border-radius:999px;background:transparent;color:#64748b;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;padding:0;font-family:inherit;transition:all .15s;}
.rai-badge-remove:hover{background:#fee2e2;color:#ef4444;}
.rai-composer{display:flex;align-items:flex-end;gap:10px;background:#fff;}
.rai-attach-context{position:relative;width:44px;height:44px;border:1px solid var(--rai-border);border-radius:13px;background:#f8fafc;color:var(--rai-ai);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;font-family:inherit;transition:all .16s;}
.rai-attach-context:hover{border-color:#c7d2fe;background:var(--rai-ai-soft);transform:translateY(-1px);}
.rai-attach-context strong{position:absolute;right:-5px;top:-6px;min-width:18px;height:18px;border-radius:999px;background:var(--rai-ai);color:#fff;border:2px solid #fff;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;line-height:1;}
.rai-composer textarea{flex:1;border:1.5px solid var(--rai-border);border-radius:13px;min-height:44px;max-height:132px;resize:vertical;padding:12px 14px;font-size:13px;line-height:1.4;font-family:inherit;outline:none;color:var(--rai-text);background:#fff;}
.rai-composer textarea:focus{border-color:var(--rai-ai);box-shadow:0 0 0 3px rgba(79,70,229,.10);}
.rai-send{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,var(--rai-ai),#7c3aed);color:#fff;flex-shrink:0;}
.rai-send:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 3px 12px rgba(79,70,229,.28);}
.rai-link-btn{border:none;background:transparent;color:#64748b;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;padding:6px 8px;border-radius:8px;}
.rai-link-btn:hover{background:#eef2f7;color:var(--rai-text);}
.rai-budget{padding:12px 14px;border-bottom:1px solid #edf0f4;background:#fff;}
.rai-budget-line{display:flex;justify-content:space-between;gap:10px;font-size:10.5px;font-weight:600;color:#64748b;margin-bottom:8px;}
.rai-budget-bar{height:5px;border-radius:999px;background:#e5e7eb;overflow:hidden;}
.rai-budget-bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--rai-ai),#10b981);}
.rai-search{margin:12px 12px 8px;padding:0 10px;height:36px;}
.rai-search input{padding:0;}
.rai-context-scroll{flex:1;min-height:0;overflow-y:auto;padding:0 10px 12px;}
.rai-context-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:4px 14px 12px;}
.rai-context-tab{min-width:0;height:40px;border:1px solid #e2e8f0;background:linear-gradient(180deg,#fff,#f8fafc);color:#64748b;border-radius:12px;display:flex;align-items:center;gap:7px;padding:0 9px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .16s;box-shadow:0 1px 2px rgba(15,23,42,.03);}
.rai-context-tab span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.rai-context-tab strong{margin-left:auto;min-width:26px;height:18px;border-radius:999px;background:#eef2f7;color:var(--rai-muted);display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;}
.rai-context-tab:hover{border-color:color-mix(in srgb,var(--rai-tab-color) 28%,var(--rai-border));color:var(--rai-text);background:#fbfdff;}
.rai-context-tab.active{border-color:color-mix(in srgb,var(--rai-tab-color) 46%,#fff);background:linear-gradient(180deg,color-mix(in srgb,var(--rai-tab-color) 12%,#fff),#fff);color:var(--rai-tab-color);box-shadow:inset 0 -2px 0 color-mix(in srgb,var(--rai-tab-color) 62%,#fff),0 4px 12px rgba(15,23,42,.05);}
.rai-context-tab.active strong{background:#fff;color:var(--rai-tab-color);box-shadow:0 1px 4px rgba(15,23,42,.06);}
.rai-context-group{margin-top:10px;}
.rai-group-title{display:flex;align-items:center;gap:7px;padding:6px 4px;font-size:10px;font-weight:700;color:var(--rai-muted);text-transform:uppercase;letter-spacing:.6px;}
.rai-group-icon{display:flex;}
.rai-group-count{margin-left:auto;color:var(--rai-muted);font-size:10px;background:#eef2f7;border-radius:999px;padding:2px 7px;}
.rai-group-list{display:flex;flex-direction:column;gap:4px;}
.rai-context-item{display:flex;align-items:flex-start;gap:8px;width:100%;padding:8px;border:1.5px solid transparent;border-radius:10px;background:#fff;color:inherit;text-align:left;cursor:pointer;font-family:inherit;transition:all .15s;}
.rai-context-item:hover{background:#f1f5f9;}
.rai-context-item.active{border-color:rgba(79,70,229,.25);background:var(--rai-ai-faint);}
.rai-context-item:disabled{opacity:.62;cursor:not-allowed;background:#f8fafc;}
.rai-check{width:18px;height:18px;border-radius:6px;border:1px solid #dbe2ea;background:#fff;color:var(--rai-text);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
.rai-context-item.active .rai-check{background:var(--rai-ai);border-color:var(--rai-ai);color:#fff;}
.rai-item-icon{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--rai-item-color);background:color-mix(in srgb,var(--rai-item-color) 10%,#fff);}
.rai-item-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.rai-item-title-row{display:flex;align-items:center;gap:6px;min-width:0;}
.rai-item-title{font-size:12px;font-weight:600;color:var(--rai-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rai-item-badges{display:inline-flex;align-items:center;gap:4px;flex-shrink:0;}
.rai-rag-badge{display:inline-flex;align-items:center;height:18px;border-radius:999px;padding:0 7px;font-size:9.5px;font-weight:800;letter-spacing:.1px;border:1px solid #dbeafe;background:#eff6ff;color:#2563eb;text-transform:uppercase;}
.rai-rag-badge.canonical{border-color:#bbf7d0;background:#ecfdf5;color:#059669;}
.rai-item-preview,.rai-item-meta{font-size:10.5px;color:var(--rai-muted);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.rai-item-meta{font-weight:500;color:#a8b1bf;-webkit-line-clamp:1;}
.rai-doc-sourcebar{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:7px;}
.rai-doc-source{min-width:0;height:34px;border:1px solid #e2e8f0;background:#fff;color:#64748b;border-radius:10px;display:flex;align-items:center;gap:7px;padding:0 9px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .16s;}
.rai-doc-source strong{margin-left:auto;min-width:22px;height:18px;border-radius:999px;background:#eef2f7;color:#94a3b8;display:inline-flex;align-items:center;justify-content:center;font-size:10px;}
.rai-doc-source:hover{border-color:color-mix(in srgb,var(--rai-source-color) 28%,#e2e8f0);color:#334155;background:#fbfdff;}
.rai-doc-source.active{border-color:color-mix(in srgb,var(--rai-source-color) 42%,#fff);background:color-mix(in srgb,var(--rai-source-color) 10%,#fff);color:var(--rai-source-color);}
.rai-doc-source.active strong{background:#fff;color:var(--rai-source-color);}
.rai-doc-source:disabled{opacity:.48;cursor:not-allowed;}
.rai-doc-breadcrumb{display:flex;align-items:center;gap:6px;min-width:0;margin-bottom:7px;padding:6px;border:1px solid #e2e8f0;background:#fff;border-radius:10px;}
.rai-doc-breadcrumb button{height:26px;border:none;border-radius:8px;background:#f8fafc;color:#64748b;display:inline-flex;align-items:center;gap:5px;padding:0 8px;font-size:10.5px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .15s;}
.rai-doc-breadcrumb button:hover,.rai-doc-breadcrumb button.active{background:#fdf2f8;color:#ec4899;}
.rai-doc-breadcrumb strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;color:#64748b;}
.rai-folder-item{display:flex;align-items:center;gap:9px;width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;color:#334155;text-align:left;cursor:pointer;font-family:inherit;transition:all .15s;}
.rai-folder-item:hover{border-color:#fde68a;background:#fffbeb;}
.rai-folder-icon{width:26px;height:26px;border-radius:8px;background:#fffbeb;color:#f59e0b;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
.rai-folder-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;}
.rai-folder-body span{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rai-folder-body small{font-size:10.5px;color:#94a3b8;font-weight:600;}
.rai-upload-btn{height:34px;display:flex;align-items:center;justify-content:center;gap:7px;border:1px dashed #cbd5e1;background:#fff;color:#f59e0b;border-radius:10px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;}
.rai-upload-btn:hover{border-color:#f59e0b;background:#fffbeb;}
.rai-context-empty{padding:18px 10px;border:1px dashed var(--rai-border);border-radius:10px;background:#fff;color:var(--rai-muted);font-size:12px;font-weight:600;text-align:center;}
.rai-loading,.rai-empty-side,.rai-empty-chat{display:flex;align-items:center;justify-content:center;gap:8px;color:var(--rai-muted);font-size:12px;font-weight:600;text-align:center;}
.rai-empty-side small{font-size:11px;font-weight:400;color:var(--rai-muted);line-height:1.5;}
.rai-loading,.rai-empty-side{padding:30px 16px;flex-direction:column;}
.rai-empty-chat{height:100%;flex-direction:column;color:#888da8;}
.rai-empty-mark{width:56px;height:56px;border-radius:16px;background:var(--rai-ai-soft);color:var(--rai-ai);display:flex;align-items:center;justify-content:center;margin-bottom:2px;opacity:.55;}
.rai-modal-backdrop{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:22px;}
.rai-modal{width:min(940px,96vw);max-height:min(780px,92vh);background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.15);display:flex;flex-direction:column;overflow:hidden;animation:raiFade .18s ease both;}
.rai-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid #f1f3f5;background:#fff;}
.rai-modal-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--rai-text);}
.rai-modal-icon{width:34px;height:34px;border-radius:10px;background:var(--rai-ai-soft);color:var(--rai-ai);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rai-modal-actions{display:flex;align-items:center;gap:6px;}
.rai-modal-body{display:flex;flex-direction:column;min-height:0;overflow:hidden;background:#fafbfc;}
.rai-modal-body .rai-search{margin:12px 14px 8px;}
.rai-modal-body .rai-context-scroll{padding:0 14px 14px;display:block;overflow-y:auto;}
.rai-modal-body .rai-context-group{margin-top:0;}
.rai-modal-body .rai-group-list{gap:5px;}
.rai-modal-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 20px;border-top:1px solid #f1f3f5;background:#fff;color:#64748b;font-size:12px;font-weight:600;}
.rai-modal-submit{border:none;border-radius:10px;background:linear-gradient(135deg,var(--rai-ai),#7c3aed);color:#fff;padding:8px 18px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .16s;}
.rai-modal-submit:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(79,70,229,.25);}
.rai-preview-backdrop{position:fixed;inset:0;z-index:99995;background:rgba(15,23,42,.52);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:22px;}
.rai-preview-modal{width:min(1040px,96vw);height:min(760px,92vh);background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 18px 54px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden;animation:raiFade .18s ease both;}
.rai-preview-header{height:52px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 14px 0 18px;border-bottom:1px solid #edf0f4;background:#fff;flex-shrink:0;}
.rai-preview-title{min-width:0;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--rai-text);}
.rai-preview-title span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.rai-preview-icon{width:30px;height:30px;border-radius:9px;background:var(--rai-ai-soft);color:var(--rai-ai);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rai-preview-actions{display:flex;align-items:center;gap:6px;flex-shrink:0;}
.rai-preview-action{width:30px;height:30px;border:none;border-radius:8px;background:#f1f5f9;color:#64748b;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;text-decoration:none;font-family:inherit;transition:all .15s;}
.rai-preview-action:hover{background:#e2e8f0;color:var(--rai-text);}
.rai-preview-body{flex:1;min-height:0;background:#0f172a;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.rai-preview-frame{width:100%;height:100%;border:none;background:#fff;}
.rai-preview-image{display:block;max-width:100%;max-height:100%;object-fit:contain;}
.rai-debug-backdrop{position:fixed;inset:0;z-index:99996;background:rgba(15,23,42,.48);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;}
.rai-debug-modal{width:min(1120px,96vw);height:min(820px,92vh);background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 18px 56px rgba(15,23,42,.24);display:flex;flex-direction:column;overflow:hidden;animation:raiFade .18s ease both;}
.rai-engine-modal{width:min(560px,94vw);max-height:min(640px,90vh);background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 18px 56px rgba(15,23,42,.24);display:flex;flex-direction:column;overflow:hidden;animation:raiFade .18s ease both;}
.rai-debug-header{height:54px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 14px 0 18px;border-bottom:1px solid #edf0f4;background:#fff;flex-shrink:0;}
.rai-debug-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:var(--rai-text);}
.rai-debug-icon{width:30px;height:30px;border-radius:9px;background:#eef2ff;color:var(--rai-ai);display:flex;align-items:center;justify-content:center;}
.rai-debug-actions{display:flex;align-items:center;gap:6px;}
.rai-debug-body{flex:1;min-height:0;overflow-y:auto;background:#f8fafc;padding:14px;}
.rai-engine-body{flex:1;min-height:0;overflow-y:auto;background:#f8fafc;padding:14px;}
.rai-engine-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.rai-engine-field{display:flex;flex-direction:column;gap:6px;min-width:0;}
.rai-engine-field span{font-size:11px;font-weight:800;color:#475569;}
.rai-engine-field select,.rai-engine-field input{height:38px;border:1px solid #dbe3ee;border-radius:10px;background:#fff;color:var(--rai-text);font-size:12px;font-weight:600;font-family:inherit;padding:0 11px;outline:none;min-width:0;}
.rai-engine-field select:focus,.rai-engine-field input:focus{border-color:var(--rai-ai);box-shadow:0 0 0 3px rgba(79,70,229,.10);}
.rai-engine-current{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px;}
.rai-engine-current span{font-size:11px;color:#64748b;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:5px 9px;}
.rai-engine-current strong{color:#0f172a;}
.rai-engine-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #edf0f4;background:#fff;}
.rai-debug-summary{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
.rai-debug-summary span,.rai-debug-kpis span{font-size:11px;color:#64748b;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:5px 9px;}
.rai-debug-summary strong,.rai-debug-kpis strong{color:#0f172a;}
.rai-debug-list{display:flex;flex-direction:column;gap:12px;}
.rai-debug-entry{border:1px solid #e5e7eb;background:#fff;border-radius:12px;overflow:hidden;}
.rai-debug-entry-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid #edf0f4;font-size:12px;font-weight:800;color:#334155;}
.rai-debug-entry-head strong{font-size:10px;color:#94a3b8;font-weight:700;}
.rai-debug-payload{display:flex;flex-direction:column;gap:8px;padding:10px;}
.rai-debug-kpis{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.rai-debug-kpis .is-warn{color:#b45309;background:#fffbeb;border-color:#fde68a;font-weight:800;}
.rai-debug-block{border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc;overflow:hidden;}
.rai-debug-block summary{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;padding:8px 10px;font-size:11px;font-weight:800;color:#334155;list-style:none;}
.rai-debug-block summary::-webkit-details-marker{display:none;}
.rai-debug-block summary strong{font-size:10px;color:#94a3b8;font-weight:700;white-space:nowrap;}
.rai-debug-block pre{margin:0;padding:10px;border-top:1px solid #e5e7eb;background:#0f172a;color:#dbeafe;max-height:340px;overflow:auto;font-size:11px;line-height:1.45;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;}
.rai-mode-switch{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid #e0e7ff;background:#f8faff;border-radius:10px;flex-shrink:0;}
.rai-mode-switch button{height:28px;border:none;border-radius:7px;background:transparent;color:#64748b;display:inline-flex;align-items:center;gap:5px;padding:0 9px;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer;transition:all .15s;}
.rai-mode-switch button:hover{color:var(--rai-ai);background:#eef2ff;}
.rai-mode-switch button.active{background:#fff;color:var(--rai-ai);box-shadow:0 1px 5px rgba(79,70,229,.12);}
.rai-agent-board{width:100%;max-width:940px;margin:0 auto;display:flex;flex-direction:column;gap:12px;}
.rai-agent-running{align-self:flex-start;margin:4px 0 6px;}
.rai-agent-run{border:1px solid #e5e7eb;background:rgba(255,255,255,.96);box-shadow:0 10px 30px rgba(15,23,42,.06);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px;animation:raiFade .22s ease both;}
.rai-agent-run.applied{border-color:#bbf7d0;background:linear-gradient(180deg,#f0fdf4,#fff);}
.rai-agent-run.partial{border-color:#fde68a;background:linear-gradient(180deg,#fffbeb,#fff);}
.rai-agent-run.error{border-color:#fecaca;background:linear-gradient(180deg,#fff1f2,#fff);}
.rai-agent-run.undone{opacity:.82;}
.rai-agent-run-head{display:flex;align-items:center;gap:9px;min-width:0;}
.rai-agent-run-mark{width:34px;height:34px;border-radius:10px;background:#eef2ff;color:var(--rai-ai);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rai-agent-run-title{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.rai-agent-run-title strong{font-size:13px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rai-agent-run-title small{font-size:10.5px;color:#94a3b8;font-weight:700;}
.rai-agent-run-status{height:24px;border-radius:999px;padding:0 9px;display:inline-flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:900;color:#4f46e5;background:#eef2ff;border:1px solid #dbeafe;white-space:nowrap;}
.rai-agent-run-status.applied{color:#059669;background:#ecfdf5;border-color:#bbf7d0;}
.rai-agent-run-status.partial{color:#b45309;background:#fffbeb;border-color:#fde68a;}
.rai-agent-run-status.error{color:#e11d48;background:#fff1f2;border-color:#fecaca;}
.rai-agent-run-status.undone{color:#64748b;background:#f8fafc;border-color:#e2e8f0;}
.rai-agent-summary{margin:0;font-size:12.5px;line-height:1.55;color:#334155;background:#f8fafc;border:1px solid #edf2f7;border-radius:10px;padding:9px 10px;}
.rai-agent-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:7px;}
.rai-agent-step{display:flex;align-items:flex-start;gap:8px;border:1px solid #edf2f7;background:#fff;border-radius:10px;padding:8px;}
.rai-agent-step>span{width:20px;height:20px;border-radius:999px;background:#eef2ff;color:var(--rai-ai);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0;}
.rai-agent-step div{min-width:0;display:flex;flex-direction:column;gap:2px;}
.rai-agent-step strong{font-size:11.5px;color:#334155;}
.rai-agent-step small{font-size:10.5px;color:#94a3b8;line-height:1.35;}
.rai-agent-actions{display:flex;flex-direction:column;gap:8px;}
.rai-agent-action{border:1px solid #e5e7eb;background:#fff;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;}
.rai-agent-action.applied{border-color:#bbf7d0;background:#f0fdf4;}
.rai-agent-action.failed{border-color:#fecaca;background:#fff1f2;}
.rai-agent-action.undone{background:#f8fafc;opacity:.78;}
.rai-agent-action-head{display:flex;align-items:center;gap:9px;min-width:0;}
.rai-agent-action-icon{width:30px;height:30px;border-radius:9px;background:color-mix(in srgb,var(--agent-action-color) 11%,#fff);color:var(--agent-action-color);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.rai-agent-action-title{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.rai-agent-action-title strong{font-size:12.5px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rai-agent-action-title small{font-size:10.5px;color:#64748b;line-height:1.35;}
.rai-agent-action-status{height:22px;border-radius:999px;padding:0 8px;display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:900;color:#4f46e5;background:#eef2ff;border:1px solid #dbeafe;white-space:nowrap;}
.rai-agent-action-status.applied{color:#059669;background:#ecfdf5;border-color:#bbf7d0;}
.rai-agent-action-status.failed{color:#e11d48;background:#fff1f2;border-color:#fecaca;}
.rai-agent-action-status.undone{color:#64748b;background:#f8fafc;border-color:#e2e8f0;}
.rai-agent-preview{border:1px solid #edf2f7;background:#f8fafc;border-radius:10px;padding:8px 10px;}
.rai-agent-preview strong{display:block;font-size:12px;color:#334155;margin-bottom:3px;}
.rai-agent-preview p{margin:0;font-size:11px;color:#64748b;line-height:1.45;}
.rai-agent-preview.compact{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.rai-agent-preview.compact strong{margin:0;}
.rai-agent-diff{display:flex;flex-direction:column;gap:5px;}
.rai-agent-diff-row{border:1px solid #edf2f7;background:#f8fafc;border-radius:9px;padding:8px;display:flex;flex-direction:column;gap:5px;}
.rai-agent-diff-row>span{font-size:11px;font-weight:900;color:#334155;}
.rai-agent-diff-row div{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap;}
.rai-agent-diff-row em{font-style:normal;color:#94a3b8;text-decoration:line-through;font-size:11px;}
.rai-agent-diff-row strong{color:#0f172a;font-size:11.5px;}
.rai-agent-diff-row small{font-size:10.5px;color:#64748b;line-height:1.35;}
.rai-agent-action-error{display:flex;align-items:center;gap:6px;border:1px solid #fecaca;background:#fff1f2;color:#e11d48;border-radius:9px;padding:8px 10px;font-size:11px;font-weight:700;}
.rai-agent-run-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #edf2f7;padding-top:10px;color:#94a3b8;font-size:10.5px;font-weight:800;}
.rai-agent-run-footer>div{display:flex;align-items:center;gap:7px;}
.rai-agent-primary,.rai-agent-secondary{height:32px;border-radius:9px;display:inline-flex;align-items:center;gap:6px;padding:0 12px;font-size:11px;font-weight:900;font-family:inherit;cursor:pointer;transition:all .15s;}
.rai-agent-primary{border:none;background:linear-gradient(135deg,var(--rai-ai),#7c3aed);color:#fff;}
.rai-agent-primary:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(79,70,229,.24);}
.rai-agent-secondary{border:1px solid #e2e8f0;background:#fff;color:#64748b;}
.rai-agent-secondary:hover{border-color:#fecaca;background:#fff1f2;color:#e11d48;}
.rai-agent-primary:disabled,.rai-agent-secondary:disabled{opacity:.5;cursor:default;transform:none;box-shadow:none;}
.rai-agent-mini{cursor:default;}
.rai-agent-mini.review{border-color:rgba(79,70,229,.18);background:#f8faff;}
.rai-agent-mini.applied{border-color:#bbf7d0;background:#f0fdf4;}
@keyframes raiFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes raiDot{0%,80%,100%{opacity:.35;transform:translateY(0) scale(.88)}40%{opacity:1;transform:translateY(-2px) scale(1)}}
@keyframes raiSheen{0%{transform:translateX(-100%)}45%,100%{transform:translateX(100%)}}
@media(max-width:1050px){.rai-shell{grid-template-columns:280px minmax(0,1fr);height:calc(100vh - 190px);min-height:640px}.rai-message{max-width:88%;}.rai-context-tabs{grid-template-columns:repeat(2,minmax(0,1fr));}.rai-create-btn span{display:none;}.rai-create-btn{padding:7px 10px;}}
@media(max-width:760px){.rai-shell{grid-template-columns:1fr;height:auto;min-height:0}.rai-sidebar{border-right:none;border-bottom:1px solid var(--rai-border);max-height:290px}.rai-chat{min-height:560px}.rai-message{max-width:94%;}.rai-message.context{max-width:100%;}.rai-agent-status{min-width:0;max-width:100%;}.rai-agent-label{overflow:hidden;text-overflow:ellipsis;}.rai-clear-btn span,.rai-debug-btn span{display:none;}.rai-context-tabs{grid-template-columns:1fr 1fr}.rai-context-badge{max-width:170px}.rai-modal-backdrop,.rai-preview-backdrop,.rai-debug-backdrop{padding:10px}.rai-modal{max-height:94vh}.rai-modal-footer{align-items:stretch;flex-direction:column}.rai-modal-submit{width:100%;}.rai-preview-modal,.rai-debug-modal{width:100%;height:92vh;}.rai-engine-modal{width:100%;max-height:92vh}.rai-engine-grid{grid-template-columns:1fr}.rai-engine-footer{align-items:stretch;flex-direction:column}.rai-context-card-grid{grid-template-columns:1fr;}}
`

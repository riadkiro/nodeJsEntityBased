import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const emptySelection = () => ({
    fields: [],
    notes: [],
    chats: [],
    files: [],
    uploads: [],
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
        uploads: [],
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

function Icon({ icon, width = 16, color }) {
    return <iconify-icon icon={icon} width={width} style={color ? { color } : undefined}></iconify-icon>
}

function SectionItem({ active, icon, color, title, meta, preview, onToggle, disabled = false }) {
    return (
        <button type="button" className={`rai-context-item ${active ? 'active' : ''}`} onClick={onToggle} disabled={disabled} title={title}>
            <span className="rai-check" aria-hidden="true">
                {active && <Icon icon="solar:check-bold" width={12} />}
            </span>
            <span className="rai-item-icon" style={{ '--rai-item-color': color || '#111827' }}>
                <Icon icon={icon} width={15} />
            </span>
            <span className="rai-item-body">
                <span className="rai-item-title">{title}</span>
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

export default function RecordAI({ accountNumber, recordId, recordTitle }) {
    const apiBase = `/account/${accountNumber}/api/record-ai/${recordId}`
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [record, setRecord] = useState({ title: recordTitle })
    const [fields, setFields] = useState([])
    const [notes, setNotes] = useState([])
    const [chats, setChats] = useState([])
    const [files, setFiles] = useState([])
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
    const [contextTab, setContextTab] = useState('fields')
    const [lastContextStats, setLastContextStats] = useState(null)
    const messagesRef = useRef(null)
    const fileInputRef = useRef(null)

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

    const loadConversation = useCallback(async (conversationId) => {
        const data = await apiFetch(`/conversations/${conversationId}`)
        const conversation = data.conversation
        setActiveConversation(conversation)
        setMessages(conversation.messages || [])
        setSelection(cleanConversationSelection(conversation.contextSelections || {}))
        setLastContextStats(null)
        scrollToBottom()
    }, [apiFetch, scrollToBottom])

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
            setConversations(data.conversations || [])
            if (data.conversations?.[0]) {
                await loadConversation(data.conversations[0]._id)
            }
        } catch (err) {
            setError(err.message || 'Chargement impossible')
        } finally {
            setLoading(false)
        }
    }, [apiFetch, loadConversation, recordTitle])

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

        let conversation = activeConversation
        if (!conversation) {
            conversation = await createConversation(selection)
            if (!conversation) return
        }

        const tempUser = { _id: `u_${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() }
        const tempAssistant = { _id: `a_${Date.now()}`, role: 'assistant', content: '', loading: true, createdAt: new Date().toISOString() }
        setMessages(prev => [...prev, tempUser, tempAssistant])
        setInput('')
        setSending(true)
        setError('')

        try {
            const payloadSelection = {
                ...selection,
                uploads: (selection.uploads || []).filter(upload => upload.text),
            }
            const data = await apiFetch(`/conversations/${conversation._id}/messages`, {
                method: 'POST',
                body: JSON.stringify({
                    message: text,
                    contextSelections: payloadSelection,
                }),
            })
            setActiveConversation(data.conversation)
            setMessages(data.conversation.messages || [])
            setLastContextStats(data.contextStats || null)
            updateConversationList(data.conversation)
        } catch (err) {
            setMessages(prev => prev.filter(item => item._id !== tempAssistant._id))
            setError(err.message || 'Envoi impossible')
        } finally {
            setSending(false)
        }
    }, [activeConversation, apiFetch, createConversation, input, selection, sending, updateConversationList])

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
            body.append('maxPages', '12')
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
    }, [accountNumber])

    const removeUpload = useCallback((id) => {
        setSelection(prev => ({ ...prev, uploads: prev.uploads.filter(upload => upload.id !== id) }))
    }, [])

    const selectedContextItems = useMemo(() => {
        const items = []
        selection.fields.forEach(id => {
            const field = fields.find(item => item.id === id)
            if (field) items.push({ key: `field:${id}`, type: 'fields', id, label: field.label, icon: 'solar:text-field-focus-bold', color: '#4f46e5' })
        })
        selection.notes.forEach(id => {
            const note = notes.find(item => String(item.id) === String(id))
            if (note) items.push({ key: `note:${id}`, type: 'notes', id: String(id), label: note.title, icon: 'solar:notes-bold-duotone', color: '#8b5cf6' })
        })
        selection.chats.forEach(id => {
            const chat = chats.find(item => String(item.id) === String(id))
            if (chat) items.push({ key: `chat:${id}`, type: 'chats', id: String(id), label: chat.name, icon: 'solar:chat-round-dots-bold-duotone', color: '#f97316' })
        })
        selection.files.forEach(file => {
            const key = fileKey(file)
            items.push({
                key,
                type: 'files',
                id: String(file.id),
                label: file.name,
                icon: file.source === 'drive' ? 'solar:cloud-storage-bold-duotone' : 'solar:file-text-bold-duotone',
                color: file.source === 'drive' ? '#ec4899' : '#0f766e',
            })
        })
        selection.uploads.forEach(upload => {
            items.push({ key: upload.id, type: 'uploads', id: upload.id, label: upload.name, icon: 'solar:file-check-bold-duotone', color: '#0f766e' })
        })
        return items
    }, [chats, fields, notes, selection])

    const removeContextItem = useCallback((item) => {
        setSelection(prev => {
            if (item.type === 'files') {
                return { ...prev, files: prev.files.filter(file => fileKey(file) !== item.key) }
            }
            if (item.type === 'uploads') {
                return { ...prev, uploads: prev.uploads.filter(upload => upload.id !== item.id) }
            }
            return { ...prev, [item.type]: (prev[item.type] || []).filter(id => String(id) !== String(item.id)) }
        })
    }, [])

    const contextTabs = useMemo(() => ([
        {
            key: 'fields',
            label: 'Fiche',
            icon: 'solar:card-bold-duotone',
            color: '#4f46e5',
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
        {
            key: 'documents',
            label: 'Docs',
            icon: 'solar:document-text-bold-duotone',
            color: '#0f766e',
            total: files.length + selection.uploads.length,
            selected: selection.files.length + selection.uploads.length,
        },
    ]), [chats.length, fields.length, files.length, notes.length, selection])

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
            return (
                <ContextGroup title="Documents" icon="solar:document-text-bold-duotone" color="#0f766e" count={`${selection.files.length + selection.uploads.length}/${files.length}`}>
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
                            color="#0f766e"
                            title={upload.name}
                            preview="Upload OCR"
                            meta={`${estimateTokensFromChars(upload.charCount)} tokens`}
                            onToggle={() => removeUpload(upload.id)}
                        />
                    ))}

                    {filtered.files.length === 0 && selection.uploads.length === 0 && <div className="rai-context-empty">Aucun document</div>}
                    {filtered.files.map(file => (
                        <SectionItem
                            key={fileKey(file)}
                            active={selectedFileKeys.has(fileKey(file))}
                            icon={file.source === 'drive' ? 'solar:cloud-storage-bold-duotone' : 'solar:file-text-bold-duotone'}
                            color={file.source === 'drive' ? '#ec4899' : '#0f766e'}
                            title={file.name}
                            preview={file.folder || (file.source === 'drive' ? 'Drive' : 'Fiche')}
                            meta="OCR à l'envoi"
                            onToggle={() => toggleFile(file)}
                        />
                    ))}
                </ContextGroup>
            )
        }

        return (
            <ContextGroup title="Fiche" icon="solar:card-bold-duotone" color="#4f46e5" count={`${selection.fields.length}/${fields.length}`}>
                {filtered.fields.length === 0 && <div className="rai-context-empty">Aucun champ</div>}
                {filtered.fields.map(field => (
                    <SectionItem
                        key={field.id}
                        active={selection.fields.includes(field.id)}
                        icon="solar:text-field-focus-bold"
                        color="#4f46e5"
                        title={field.label}
                        preview={shortText(field.value, 86)}
                        meta={`${estimateTokensFromChars(field.charCount)} tokens`}
                        onToggle={() => toggleArrayValue('fields', field.id)}
                    />
                ))}
            </ContextGroup>
        )
    })()

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

    return (
        <div className="rai-app">
            <style>{styles}</style>

            <div className="rai-shell">
                <aside className="rai-sidebar">
                    <div className="rai-sidebar-header">
                        <div className="rai-sidebar-title-row">
                            <h3>
                                <Icon icon="solar:magic-stick-3-bold-duotone" width={18} />
                                Conversations
                                <span className="rai-count">{conversations.length}</span>
                            </h3>
                            <button type="button" className="rai-create-btn" title="Nouvelle conversation" onClick={() => createConversation()} disabled={creating}>
                                <Icon icon={creating ? 'line-md:loading-twotone-loop' : 'solar:add-circle-bold'} width={14} />
                                <span>Nouvelle</span>
                            </button>
                        </div>
                        <label className="rai-sidebar-search">
                            <Icon icon="solar:magnifer-linear" width={14} />
                            <input
                                type="text"
                                value={conversationSearch}
                                onChange={event => setConversationSearch(event.target.value)}
                                placeholder="Rechercher une conversation..."
                            />
                        </label>
                    </div>

                    <div className="rai-conv-list">
                        {loading && <div className="rai-loading"><Icon icon="line-md:loading-twotone-loop" width={22} /> Chargement...</div>}
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
                    </div>
                </aside>

                <main className="rai-chat">
                    <header className="rai-chat-header">
                        <div className="rai-ai-mark">
                            <Icon icon="solar:magic-stick-3-bold-duotone" width={21} />
                        </div>
                        <div className="rai-chat-title-wrap">
                            <div className="rai-chat-title">{activeConversation?.title || record.title || 'IA'}</div>
                            <div className="rai-chat-sub">
                                <span>{record.entityName || 'Fiche'}</span>
                                <span>·</span>
                                <span>{selectedCount} contexte{selectedCount > 1 ? 's' : ''}</span>
                                {lastContextStats && (
                                    <>
                                        <span>·</span>
                                        <span>{lastContextStats.included ? 'contexte envoyé' : 'historique utilisé'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button type="button" className="rai-clear-btn" onClick={deleteConversation} disabled={!activeConversation} title="Effacer cette conversation IA et son historique">
                            <Icon icon="solar:trash-bin-trash-bold" width={15} />
                            <span>Effacer</span>
                        </button>
                    </header>

                    {error && (
                        <div className="rai-error">
                            <Icon icon="solar:danger-circle-linear" width={16} />
                            {error}
                        </div>
                    )}

                    <div className="rai-messages" ref={messagesRef}>
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
                        {messages.map((message, index) => (
                            <div key={message._id || `${message.role}_${index}`} className={`rai-message ${message.role === 'user' ? 'mine' : 'assistant'}`}>
                                <div className="rai-msg-avatar">
                                    {message.role === 'user' ? 'M' : <Icon icon="solar:magic-stick-3-bold-duotone" width={15} />}
                                </div>
                                <div>
                                    <div className="rai-bubble">
                                        {message.loading ? (
                                            <span className="rai-thinking"><Icon icon="line-md:loading-twotone-loop" width={16} /> Réflexion...</span>
                                        ) : (
                                            renderMessageContent(message.content)
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
                        ))}
                    </div>

                    <div className="rai-composer-wrap">
                        {selectedContextItems.length > 0 && (
                            <div className="rai-selected-context" aria-label="Contexte sélectionné">
                                {selectedContextItems.map(item => (
                                    <button type="button" key={item.key} className="rai-context-badge" title={item.label} onClick={() => removeContextItem(item)}>
                                        <Icon icon={item.icon} width={13} color={item.color} />
                                        <span>{item.label}</span>
                                        <Icon icon="solar:close-circle-bold" width={12} />
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="rai-composer">
                            <button type="button" className="rai-attach-context" onClick={() => setContextOpen(true)} title="Ajouter du contexte">
                                <Icon icon="solar:layers-minimalistic-bold-duotone" width={17} />
                                {selectedCount > 0 && <strong>{selectedCount}</strong>}
                            </button>
                            <textarea
                                value={input}
                                onChange={event => setInput(event.target.value)}
                                onKeyDown={event => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault()
                                        sendMessage()
                                    }
                                }}
                                placeholder="Posez votre question..."
                                rows={1}
                            />
                            <button type="button" className="rai-send" onClick={sendMessage} disabled={!canSend}>
                                <Icon icon={sending ? 'line-md:loading-twotone-loop' : 'solar:plain-bold'} width={18} />
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
                            <button type="button" className="rai-modal-submit" onClick={() => setContextOpen(false)}>
                                Appliquer
                            </button>
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
.rai-icon-btn:disabled,.rai-send:disabled,.rai-clear-btn:disabled,.rai-link-btn:disabled,.rai-upload-btn:disabled,.rai-attach-context:disabled,.rai-create-btn:disabled{opacity:.45;cursor:default;box-shadow:none;transform:none;}
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
.rai-thinking{display:inline-flex;align-items:center;gap:7px;color:#64748b;font-weight:600;}
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
.rai-selected-context{display:flex;align-items:center;gap:6px;flex-wrap:wrap;max-height:64px;overflow-y:auto;margin-bottom:8px;padding-right:2px;}
.rai-context-badge{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:230px;height:28px;border:1px solid #e0e7ff;background:#f8faff;color:#475569;border-radius:9px;padding:0 8px;font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .16s;}
.rai-context-badge:hover{border-color:#c7d2fe;background:#eef2ff;color:var(--rai-text);}
.rai-context-badge span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
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
.rai-context-tab{min-width:0;height:38px;border:1px solid var(--rai-border);background:#fff;color:#64748b;border-radius:10px;display:flex;align-items:center;gap:7px;padding:0 9px;font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .16s;}
.rai-context-tab span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.rai-context-tab strong{margin-left:auto;min-width:26px;height:18px;border-radius:999px;background:#eef2f7;color:var(--rai-muted);display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;}
.rai-context-tab:hover{border-color:color-mix(in srgb,var(--rai-tab-color) 28%,var(--rai-border));color:var(--rai-text);background:#fbfdff;}
.rai-context-tab.active{border-color:color-mix(in srgb,var(--rai-tab-color) 42%,#fff);background:color-mix(in srgb,var(--rai-tab-color) 10%,#fff);color:var(--rai-tab-color);}
.rai-context-tab.active strong{background:#fff;color:var(--rai-tab-color);}
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
.rai-item-title{font-size:12px;font-weight:600;color:var(--rai-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rai-item-preview,.rai-item-meta{font-size:10.5px;color:var(--rai-muted);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.rai-item-meta{font-weight:500;color:#a8b1bf;-webkit-line-clamp:1;}
.rai-upload-btn{height:34px;display:flex;align-items:center;justify-content:center;gap:7px;border:1px dashed #cbd5e1;background:#fff;color:#0f766e;border-radius:10px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;}
.rai-upload-btn:hover{border-color:#0f766e;background:#ecfdf5;}
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
@keyframes raiFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:1050px){.rai-shell{grid-template-columns:280px minmax(0,1fr);height:calc(100vh - 190px);min-height:640px}.rai-message{max-width:88%;}.rai-context-tabs{grid-template-columns:repeat(2,minmax(0,1fr));}.rai-create-btn span{display:none;}.rai-create-btn{padding:7px 10px;}}
@media(max-width:760px){.rai-shell{grid-template-columns:1fr;height:auto;min-height:0}.rai-sidebar{border-right:none;border-bottom:1px solid var(--rai-border);max-height:290px}.rai-chat{min-height:560px}.rai-message{max-width:94%;}.rai-clear-btn span{display:none;}.rai-context-tabs{grid-template-columns:1fr 1fr}.rai-context-badge{max-width:170px}.rai-modal-backdrop{padding:10px}.rai-modal{max-height:94vh}.rai-modal-footer{align-items:stretch;flex-direction:column}.rai-modal-submit{width:100%;}}
`

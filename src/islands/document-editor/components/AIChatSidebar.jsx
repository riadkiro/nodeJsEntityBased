/**
 * AIChatSidebar Component
 * AI Assistant chat interface for the document editor
 * Supports: Assistant mode (simple chat) and Agent mode (document-aware with MULTI-ACTIONS)
 * Uses OpenAI via Integration Engine
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'

// ========== AGENT SYSTEM PROMPT - MULTI-ACTIONS ==========
const AGENT_SYSTEM_PROMPT = `Tu es un agent d'analyse et correction de documents.

OBJECTIF:
Analyser le document et proposer TOUTES les corrections nécessaires en une seule réponse.

FORMAT DE RÉPONSE OBLIGATOIRE:
Tu DOIS répondre UNIQUEMENT avec un bloc JSON \`\`\`actions contenant:
{
  "message": "Résumé court des corrections proposées",
  "actions": [
    {
      "id": "1",
      "type": "replace_between_anchors",
      "description": "Description de la correction",
      "target": { "pageIndex": 0, "matchText": "texte EXACT à remplacer" },
      "patch": { "replacement": "nouveau texte" },
      "confidence": 0.9
    }
  ]
}

TYPES D'ACTIONS:
- replace_between_anchors: Remplace matchText par replacement
- insert_content: Insère du contenu (pour document vide)

RÈGLES STRICTES:
1. matchText DOIT être EXACTEMENT copié du document (sensible à la casse et aux espaces)
2. RECHERCHE EXHAUSTIVE: Parcours TOUT le document et trouve CHAQUE occurrence d'une faute
   - Si "Résiliatione" apparaît 3 fois, crée 3 actions séparées avec le matchText EXACT de chaque occurrence
   - Ne rate aucune occurrence!
3. RESPECT DE LA CASSE dans les corrections:
   - Si le mot original commence par une majuscule -> correction avec majuscule
   - "Resiliation" -> "Résiliation" (garde la majuscule)
   - "resiliation" -> "résiliation" (garde la minuscule)
4. Maximum 10 actions par réponse
5. Trie les actions par ordre d'apparition dans le document
6. Confidence: 0.9+ pour fautes évidentes, 0.7-0.9 pour améliorations
7. NE PAS ajouter de texte en dehors du bloc \`\`\`actions
8. Chaque action doit avoir un id unique (1, 2, 3...)

EXEMPLE DE RÉPONSE VALIDE:
\`\`\`actions
{
  "message": "J'ai trouvé 3 fautes d'orthographe à corriger.",
  "actions": [
    {
      "id": "1",
      "type": "replace_between_anchors",
      "description": "Corriger 'Résiliatione' dans le titre",
      "target": { "pageIndex": 0, "matchText": "Résiliatione" },
      "patch": { "replacement": "Résiliation" },
      "confidence": 0.95
    },
    {
      "id": "2", 
      "type": "replace_between_anchors",
      "description": "Corriger 'résiliatione' dans le sous-titre",
      "target": { "pageIndex": 0, "matchText": "résiliatione" },
      "patch": { "replacement": "résiliation" },
      "confidence": 0.95
    },
    {
      "id": "3", 
      "type": "replace_between_anchors",
      "description": "Corriger 'Résiliatione' dans le paragraphe",
      "target": { "pageIndex": 0, "matchText": "Résiliatione" },
      "patch": { "replacement": "Résiliation" },
      "confidence": 0.95
    }
  ]
}
\`\`\``

// ========== EMPTY DOC PROMPT ==========
const EMPTY_DOC_PROMPT = `Tu es un générateur de documents professionnels.
Le document est actuellement VIDE.

Génère du contenu HTML structuré et retourne-le dans ce format:
\`\`\`actions
{
  "message": "Voici le contenu généré",
  "actions": [
    {
      "id": "1",
      "type": "insert_content",
      "description": "Insérer le document généré",
      "target": {},
      "patch": { "content": "<h1>Titre</h1><p>Contenu...</p>" },
      "confidence": 1.0
    }
  ]
}
\`\`\`

FORMAT HTML:
- Titres: <h1>, <h2>, <h3>
- Paragraphes: <p>
- Listes: <ul><li> ou <ol><li>
- Mise en forme: <strong>, <em>, <u>

Le champ "content" contient UNIQUEMENT le HTML, aucun texte d'explication.`

export default function AIChatSidebar({
    accountNumber,
    getDocumentSnapshot,
    getSelectionText,
    applyPatch,
    pageRefs // Reference to page elements for highlighting
}) {
    // ========== STATE ==========
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [mode, setMode] = useState('agent') // 'assistant' | 'agent' - agent by default
    const [model, setModel] = useState('gpt-4o')

    // Multi-actions state
    const [pendingActions, setPendingActions] = useState([]) // Array of actions
    const [actionStatus, setActionStatus] = useState({}) // { [id]: 'pending' | 'applied' | 'ignored' | 'failed' }
    const [isApplying, setIsApplying] = useState(false)
    const [hoveredActionId, setHoveredActionId] = useState(null) // For highlight emphasis

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const messagesEndRef = useRef(null)

    // Available models
    const MODELS = [
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Plus intelligent' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Rapide' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5', description: 'Économique' }
    ]

    // Get account number from URL if not passed as prop
    const getAccountNumber = useCallback(() => {
        if (accountNumber) return accountNumber
        const match = window.location.pathname.match(/\/account\/([^/]+)/)
        return match ? match[1] : null
    }, [accountNumber])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, pendingActions])

    // ========== DOCUMENT HIGHLIGHTING ==========
    // Clear all highlights
    const clearHighlights = useCallback(() => {
        document.querySelectorAll('.ai-highlight').forEach(mark => {
            // Remove preview span BEFORE getting textContent
            const previewSpan = mark.querySelector('.ai-preview-new')
            if (previewSpan) {
                previewSpan.remove()
            }

            const parent = mark.parentNode
            if (parent) {
                parent.replaceChild(document.createTextNode(mark.textContent), mark)
                parent.normalize() // Merge adjacent text nodes
            }
        })
    }, [])

    // Highlight matching text in document when actions are proposed
    const highlightMatches = useCallback(() => {
        if (!pageRefs?.current) return

        // Clear existing highlights first (inline to avoid circular deps)
        document.querySelectorAll('.ai-highlight').forEach(mark => {
            // Remove event listeners
            mark.onmouseenter = null
            mark.onmouseleave = null

            // IMPORTANT: Remove preview span BEFORE getting textContent
            const previewSpan = mark.querySelector('.ai-preview-new')
            if (previewSpan) {
                previewSpan.remove()
            }

            const parent = mark.parentNode
            if (parent) {
                parent.replaceChild(document.createTextNode(mark.textContent), mark)
                parent.normalize()
            }
        })

        // Only highlight pending actions
        const actionsToHighlight = pendingActions.filter(a =>
            actionStatus[a.id] === 'pending' && a.target?.matchText
        )

        actionsToHighlight.forEach(action => {
            const pageIndex = action.target?.pageIndex || 0
            const pageEl = pageRefs.current[pageIndex]
            if (!pageEl) return

            const matchText = action.target.matchText

            // Find ALL occurrences using a different approach
            const highlightAllOccurrences = () => {
                const walker = document.createTreeWalker(
                    pageEl,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                )

                const nodesToHighlight = []

                while (walker.nextNode()) {
                    const node = walker.currentNode
                    const content = node.textContent

                    // Try exact match first, then case-insensitive
                    let idx = content.indexOf(matchText)
                    let actualMatchText = matchText

                    if (idx === -1) {
                        idx = content.toLowerCase().indexOf(matchText.toLowerCase())
                        if (idx !== -1) {
                            actualMatchText = content.substring(idx, idx + matchText.length)
                        }
                    }

                    if (idx !== -1) {
                        nodesToHighlight.push({ node, idx, length: actualMatchText.length })
                    }
                }

                // Process in reverse order to not mess up indices
                nodesToHighlight.reverse().forEach(({ node, idx, length }) => {
                    try {
                        const range = document.createRange()
                        range.setStart(node, idx)
                        range.setEnd(node, idx + length)

                        const highlight = document.createElement('mark')
                        highlight.className = 'ai-highlight'
                        highlight.dataset.actionId = action.id
                        highlight.style.cssText = `
                            background: linear-gradient(to bottom, #fef08a 0%, #fde047 100%);
                            padding: 1px 2px;
                            border-radius: 2px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: inline;
                        `

                        // Add hover events on the highlight itself
                        highlight.onmouseenter = () => {
                            setHoveredActionId(action.id)
                            // Scroll to the corresponding card in sidebar
                            const card = document.querySelector(`[data-action-card-id="${action.id}"]`)
                            if (card) {
                                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                            }
                        }
                        highlight.onmouseleave = () => setHoveredActionId(null)

                        range.surroundContents(highlight)
                    } catch (e) {
                        console.warn('Cannot highlight occurrence:', matchText)
                    }
                })
            }

            highlightAllOccurrences()
        })
    }, [pendingActions, actionStatus, pageRefs])

    // Apply highlights when actions change
    useEffect(() => {
        if (pendingActions.length > 0) {
            // Small delay to ensure DOM is ready
            requestAnimationFrame(() => {
                highlightMatches()
            })
        } else {
            clearHighlights()
        }

        // Cleanup on unmount or when actions cleared
        return () => {
            clearHighlights()
        }
    }, [pendingActions, actionStatus, highlightMatches, clearHighlights])

    // Update highlight emphasis on hover - show strikethrough + new text
    useEffect(() => {
        document.querySelectorAll('.ai-highlight').forEach(mark => {
            const actionId = mark.dataset.actionId
            const isHovered = actionId === hoveredActionId

            // Find the corresponding action to get replacement text
            const action = pendingActions.find(a => a.id === actionId)
            const replacement = action?.patch?.replacement

            // Remove any existing preview
            const existingPreview = mark.querySelector('.ai-preview-new')
            if (existingPreview) {
                existingPreview.remove()
            }

            if (isHovered && replacement) {
                // Style the original text as strikethrough
                mark.style.cssText = `
                    background: linear-gradient(to bottom, #fecaca 0%, #fca5a5 100%);
                    padding: 1px 2px;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline;
                    text-decoration: line-through;
                    text-decoration-color: #dc2626;
                    color: #991b1b;
                `

                // Add the new text preview next to it
                const preview = document.createElement('span')
                preview.className = 'ai-preview-new'
                preview.textContent = ` ${replacement}`
                preview.style.cssText = `
                    color: #16a34a !important;
                    font-weight: 600;
                    background: linear-gradient(to bottom, #dcfce7 0%, #bbf7d0 100%);
                    padding: 2px 6px;
                    border-radius: 3px;
                    margin-left: 4px;
                    text-decoration: none !important;
                    display: inline-block;
                    font-style: normal;
                    border: 1px solid #86efac;
                    cursor: pointer;
                `

                // Click on preview to apply correction
                preview.onclick = (e) => {
                    e.stopPropagation()
                    if (applyPatch && actionStatus[action.id] === 'pending') {
                        const result = applyPatch(action)
                        if (result.success) {
                            setActionStatus(prev => ({ ...prev, [action.id]: 'applied' }))
                            setMessages(prev => [...prev, {
                                role: 'system',
                                content: `✅ ${action.description}`
                            }])
                        } else {
                            setActionStatus(prev => ({ ...prev, [action.id]: 'failed' }))
                        }
                    }
                }

                mark.appendChild(preview)

            } else {
                // Reset to normal highlight style
                mark.style.cssText = `
                    background: linear-gradient(to bottom, #fef08a 0%, #fde047 100%);
                    padding: 1px 2px;
                    border-radius: 2px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline;
                    text-decoration: none;
                `
            }
        })
    }, [hoveredActionId, pendingActions, applyPatch, actionStatus])

    // Scroll to highlighted text when hovering action
    const scrollToHighlight = useCallback((actionId) => {
        const highlight = document.querySelector(`.ai-highlight[data-action-id="${actionId}"]`)
        if (highlight) {
            highlight.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [])

    // ========== API CALL ==========
    const callOpenAI = async (conversationHistory, isAgent = false) => {
        const accNum = getAccountNumber()
        if (!accNum) throw new Error('Numéro de compte introuvable')

        const response = await fetch(`/account/${accNum}/integrations/openai/actions/chat-completion/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                input: {
                    model: model,
                    messages: conversationHistory,
                    temperature: isAgent ? 0.2 : 0.7,
                    max_tokens: 3000
                }
            })
        })

        const result = await response.json()

        if (!result.success) {
            const errorMsg = result.error || 'Erreur API'
            if (errorMsg.includes('Not connected') || errorMsg.includes('connection')) {
                throw new Error('OpenAI non connecté. Configurez votre clé API dans Intégrations.')
            }
            throw new Error(errorMsg)
        }

        return result.data?.content || result.data?.choices?.[0]?.message?.content || ''
    }

    // ========== PARSE MULTI-ACTIONS FROM RESPONSE ==========
    const parseActionsFromResponse = (content) => {
        console.log('📥 Parsing response:', content.substring(0, 200))

        // Try to find ```actions block
        const actionsMatch = content.match(/```actions\s*([\s\S]*?)```/)

        if (actionsMatch) {
            try {
                const jsonStr = actionsMatch[1].trim()
                const parsed = JSON.parse(jsonStr)

                // Validate structure
                if (parsed.actions && Array.isArray(parsed.actions)) {
                    // Ensure each action has an id
                    const actions = parsed.actions.map((action, index) => ({
                        ...action,
                        id: action.id || `${Date.now()}_${index}`
                    }))

                    console.log('✅ Parsed', actions.length, 'actions')
                    return {
                        messageText: parsed.message || 'Actions proposées',
                        actions
                    }
                }
            } catch (e) {
                console.warn('❌ JSON parse failed:', e.message)
            }
        }

        // Fallback: try single action format (backward compatibility)
        const singleActionMatch = content.match(/```action\s*([\s\S]*?)```/)
        if (singleActionMatch) {
            try {
                const action = JSON.parse(singleActionMatch[1].trim())
                if (action.type) {
                    action.id = action.id || Date.now().toString()
                    const text = content.replace(/```action\s*[\s\S]*?```/, '').trim()
                    console.log('✅ Single action parsed (legacy)')
                    return {
                        messageText: text || action.description || 'Action proposée',
                        actions: [action]
                    }
                }
            } catch (e) {
                console.warn('❌ Legacy action parse failed:', e.message)
            }
        }

        // No actions found
        console.log('ℹ️ No actions found in response')
        return { messageText: content, actions: [] }
    }

    // ========== SEND MESSAGE ==========
    const sendMessage = async (userMessage) => {
        setIsLoading(true)
        setError(null)
        setPendingActions([])
        setActionStatus({})

        const userMsg = { role: 'user', content: userMessage }
        setMessages(prev => [...prev, userMsg])

        try {
            let systemPrompt = 'Tu es un assistant d\'écriture professionnel. Tu aides l\'utilisateur à rédiger, corriger et améliorer ses documents. Réponds de manière concise et utile en français.'
            let contextMessage = ''

            // In agent mode, ALWAYS include document context
            let documentIsEmpty = false
            if (mode === 'agent' && getDocumentSnapshot) {
                setIsAnalyzing(true)
                const { snapshot, selection, activePageIndex, totalPages } = getDocumentSnapshot()

                documentIsEmpty = !snapshot.trim()

                if (snapshot.trim()) {
                    systemPrompt = AGENT_SYSTEM_PROMPT
                    contextMessage = `\n\n[DOCUMENT - ${totalPages} pages, page active: ${activePageIndex + 1}]\n${snapshot}`
                    if (selection) {
                        contextMessage += `\n\n[SÉLECTION]\n${selection}`
                    }
                } else {
                    systemPrompt = EMPTY_DOC_PROMPT
                }
                setIsAnalyzing(false)
            }

            const conversationHistory = [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userMessage + contextMessage }
            ]

            const content = await callOpenAI(conversationHistory, mode === 'agent')

            // Parse actions if in agent mode
            if (mode === 'agent') {
                const { messageText, actions } = parseActionsFromResponse(content)

                // Handle empty document case: auto-create insert action if needed
                if (actions.length === 0 && documentIsEmpty && messageText.length > 50) {
                    const isQuestion = /\?$|voulez-vous|souhaitez-vous/i.test(messageText.trim())
                    if (!isQuestion) {
                        actions.push({
                            id: Date.now().toString(),
                            type: 'insert_content',
                            description: 'Insérer ce contenu dans le document',
                            target: {},
                            patch: { content: messageText },
                            confidence: 0.8
                        })
                    }
                }

                setMessages(prev => [...prev, { role: 'assistant', content: messageText }])

                if (actions.length > 0) {
                    setPendingActions(actions)
                    // Initialize all as pending
                    const initialStatus = {}
                    actions.forEach(a => { initialStatus[a.id] = 'pending' })
                    setActionStatus(initialStatus)
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content }])
            }
        } catch (err) {
            console.error('AI Chat error:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
            setIsAnalyzing(false)
        }
    }

    // ========== ACTION HANDLERS ==========
    const handleApplyAction = useCallback(async (action) => {
        if (!applyPatch || isApplying) return
        if (actionStatus[action.id] !== 'pending') return

        setIsApplying(true)

        try {
            const result = applyPatch(action)

            if (result.success) {
                setActionStatus(prev => ({ ...prev, [action.id]: 'applied' }))
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: `✅ ${action.description}`
                }])
            } else {
                setActionStatus(prev => ({ ...prev, [action.id]: 'failed' }))
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: `❌ Échec: ${result.message}`
                }])
            }
        } finally {
            setIsApplying(false)
        }
    }, [applyPatch, actionStatus, isApplying])

    const handleIgnoreAction = useCallback((action) => {
        setActionStatus(prev => ({ ...prev, [action.id]: 'ignored' }))
    }, [])

    const handleApplyAll = useCallback(async () => {
        if (!applyPatch || isApplying) return

        setIsApplying(true)

        const pendingToApply = pendingActions.filter(a => actionStatus[a.id] === 'pending')

        for (const action of pendingToApply) {
            try {
                const result = applyPatch(action)

                if (result.success) {
                    setActionStatus(prev => ({ ...prev, [action.id]: 'applied' }))
                } else {
                    setActionStatus(prev => ({ ...prev, [action.id]: 'failed' }))
                }
            } catch (e) {
                setActionStatus(prev => ({ ...prev, [action.id]: 'failed' }))
            }

            // Small delay between actions for visual feedback
            await new Promise(r => setTimeout(r, 100))
        }

        const appliedCount = pendingToApply.filter(a => actionStatus[a.id] !== 'failed').length
        setMessages(prev => [...prev, {
            role: 'system',
            content: `✅ ${appliedCount} correction(s) appliquée(s)`
        }])

        setIsApplying(false)
    }, [applyPatch, pendingActions, actionStatus, isApplying])

    const handleIgnoreAll = useCallback(() => {
        const newStatus = { ...actionStatus }
        pendingActions.forEach(a => {
            if (newStatus[a.id] === 'pending') {
                newStatus[a.id] = 'ignored'
            }
        })
        setActionStatus(newStatus)
    }, [pendingActions, actionStatus])

    // ========== FORM HANDLERS ==========
    const handleSubmit = (e) => {
        e.preventDefault()
        if (!message.trim() || isLoading) return
        sendMessage(message.trim())
        setMessage('')
    }

    const handleQuickAction = (action) => {
        const prompts = {
            'improve': 'Améliore le style et la clarté du texte',
            'correct': 'Analyse et corrige toutes les fautes d\'orthographe et de grammaire',
            'summarize': 'Résume le contenu du document',
            'analyze': 'Analyse le document et propose toutes les corrections nécessaires'
        }
        sendMessage(prompts[action])
    }

    const clearChat = () => {
        setMessages([])
        setPendingActions([])
        setActionStatus({})
        setError(null)
    }

    // Count pending actions
    const pendingCount = Object.values(actionStatus).filter(s => s === 'pending').length

    // ========== RENDER ==========
    return (
        <div className="w-80 bg-white dark:bg-gray-900 border-l dark:border-gray-800 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${mode === 'agent'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20'
                            : 'bg-gradient-to-br from-primary to-primary/60 shadow-primary/20'
                            }`}>
                            <iconify-icon
                                icon={mode === 'agent' ? "tabler:robot" : "tabler:sparkles"}
                                width="22"
                                className="text-white"
                            ></iconify-icon>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                {mode === 'agent' ? 'Agent' : 'Assistant'}
                            </h3>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">IA</h2>
                        </div>
                    </div>
                    {/* Clear Chat */}
                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Nouvelle conversation"
                        >
                            <iconify-icon icon="tabler:refresh" width="18"></iconify-icon>
                        </button>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                    <div className="flex items-start gap-2">
                        <iconify-icon icon="tabler:alert-circle" width="18" className="text-danger shrink-0 mt-0.5"></iconify-icon>
                        <p className="text-xs text-danger">{error}</p>
                    </div>
                </div>
            )}

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-auto p-4" style={{ scrollbarColor: '#64748b transparent', scrollbarWidth: 'thin' }}>
                {messages.length === 0 ? (
                    // Empty State
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${mode === 'agent'
                            ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5'
                            : 'bg-gradient-to-br from-primary/10 to-primary/5'
                            }`}>
                            <iconify-icon
                                icon={mode === 'agent' ? "tabler:robot" : "tabler:message-chatbot"}
                                width="32"
                                className={mode === 'agent' ? "text-amber-500" : "text-primary"}
                            ></iconify-icon>
                        </div>
                        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                            {mode === 'agent'
                                ? 'Mode Agent activé'
                                : 'Comment puis-je vous aider ?'}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                            {mode === 'agent'
                                ? 'L\'agent analysera le document et proposera TOUTES les corrections en une fois.'
                                : 'Posez une question ou demandez-moi de vous aider à rédiger.'}
                        </p>

                        {/* Quick Actions */}
                        <div className="mt-6 space-y-2 w-full">
                            {mode === 'agent' && (
                                <button
                                    onClick={() => handleQuickAction('analyze')}
                                    className="w-full px-4 py-2.5 text-xs text-left text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-3 group font-medium"
                                >
                                    <iconify-icon icon="tabler:scan" width="16"></iconify-icon>
                                    Analyser et corriger
                                </button>
                            )}
                            <button
                                onClick={() => handleQuickAction('correct')}
                                className="w-full px-4 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group"
                            >
                                <iconify-icon icon="tabler:language" width="16" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                Corriger l'orthographe
                            </button>
                            <button
                                onClick={() => handleQuickAction('improve')}
                                className="w-full px-4 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group"
                            >
                                <iconify-icon icon="tabler:wand" width="16" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                Améliorer le style
                            </button>
                        </div>
                    </div>
                ) : (
                    // Messages List
                    <div className="space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'dark:bg-gray-800 bg-gray-100 dark:text-white rounded-xl'
                                        : msg.role === 'system'
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-lg'
                                            : 'bg-[#1e3a5f] text-gray-300 rounded-2xl rounded-bl-sm'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}

                        {/* Multi-Actions Cards */}
                        {pendingActions.length > 0 && (
                            <div className="space-y-2">
                                {/* Header with Apply All / Ignore All */}
                                {pendingCount > 1 && (
                                    <div className="flex items-center justify-between p-2 bg-amber-500/5 rounded-lg border dark:border-gray-800 border-gray-800">
                                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                            {pendingCount} correction(s) en attente
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={handleApplyAll}
                                                disabled={isApplying}
                                                className="px-2 py-1 text-[10px] bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50 font-medium"
                                            >
                                                Tout appliquer
                                            </button>
                                            <button
                                                onClick={handleIgnoreAll}
                                                className="px-2 py-1 text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300"
                                            >
                                                Tout ignorer
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Individual Action Cards */}
                                {pendingActions.map((action) => {
                                    const status = actionStatus[action.id]
                                    const isPending = status === 'pending'
                                    const isApplied = status === 'applied'
                                    const isFailed = status === 'failed'
                                    const isIgnored = status === 'ignored'

                                    return (
                                        <div
                                            key={action.id}
                                            data-action-card-id={action.id}
                                            className={`p-2 rounded-lg border transition-all cursor-pointer ${isApplied ? 'bg-success/10 border-success/20 opacity-60' :
                                                isFailed ? 'bg-danger/10 border-danger/20' :
                                                    isIgnored ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50' :
                                                        hoveredActionId === action.id
                                                            ? 'bg-amber-500/15 border-amber-500/40'
                                                            : 'bg-amber-500/5 dark:border-gray-800 border-gray-800'
                                                }`}
                                            onMouseEnter={() => {
                                                setHoveredActionId(action.id)
                                                scrollToHighlight(action.id)
                                            }}
                                            onMouseLeave={() => setHoveredActionId(null)}
                                        >
                                            {/* Header: description + confidence */}
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">
                                                    {action.description}
                                                </p>
                                                {action.confidence && (
                                                    <span className={`text-[9px] px-1 py-0.5 rounded flex-shrink-0 ${action.confidence >= 0.9 ? 'bg-success/20 text-success' :
                                                        action.confidence >= 0.7 ? 'bg-amber-500/20 text-amber-600' :
                                                            'bg-gray-200 text-gray-500'
                                                        }`}>
                                                        {Math.round(action.confidence * 100)}%
                                                    </span>
                                                )}
                                            </div>

                                            {/* Show old -> new preview INLINE */}
                                            {action.target?.matchText && action.patch?.replacement && (
                                                <div className="text-[10px] mb-1.5 flex items-center gap-1.5 font-mono flex-wrap">
                                                    <span className="text-danger line-through">{action.target.matchText}</span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="text-success">{action.patch.replacement}</span>
                                                </div>
                                            )}

                                            {/* Status badges */}
                                            {isApplied && (
                                                <div className="text-xs text-success flex items-center gap-1">
                                                    <iconify-icon icon="tabler:check" width="14"></iconify-icon>
                                                    Appliqué
                                                </div>
                                            )}
                                            {isFailed && (
                                                <div className="text-xs text-danger flex items-center gap-1">
                                                    <iconify-icon icon="tabler:x" width="14"></iconify-icon>
                                                    Échec - texte non trouvé
                                                </div>
                                            )}
                                            {isIgnored && (
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <iconify-icon icon="tabler:minus" width="14"></iconify-icon>
                                                    Ignoré
                                                </div>
                                            )}

                                            {/* Action buttons */}
                                            {isPending && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApplyAction(action)}
                                                        disabled={isApplying}
                                                        className="flex-1 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 font-medium disabled:opacity-50"
                                                    >
                                                        <iconify-icon icon="tabler:check" width="14"></iconify-icon>
                                                        Appliquer
                                                    </button>
                                                    <button
                                                        onClick={() => handleIgnoreAction(action)}
                                                        className="flex-1 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <iconify-icon icon="tabler:x" width="14"></iconify-icon>
                                                        Ignorer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Loading / Analyzing indicators */}
                        {(isLoading || isAnalyzing) && (
                            <div className="flex justify-start">
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm ${mode === 'agent' ? 'bg-amber-500/10' : 'bg-[#1e3a5f]'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <iconify-icon
                                            icon="tabler:loader-2"
                                            width="16"
                                            className={`animate-spin ${mode === 'agent' ? 'text-amber-500' : 'text-primary'}`}
                                        ></iconify-icon>
                                        <span className={`text-sm ${mode === 'agent' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                                            {isAnalyzing ? 'Analyse du document...' : 'Réflexion...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit(e)
                            }
                        }}
                        placeholder={mode === 'agent' ? "Demandez une analyse..." : "Posez une question..."}
                        className="w-full px-4 py-3 pr-12 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:outline-none transition-all text-gray-900 dark:text-gray-300"
                        rows="2"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isLoading}
                        className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                    >
                        {isLoading ? (
                            <iconify-icon icon="tabler:loader-2" width="16" className="animate-spin"></iconify-icon>
                        ) : (
                            <iconify-icon icon="tabler:send" width="16"></iconify-icon>
                        )}
                    </button>
                </form>

                {/* Model & Mode Selectors */}
                <div className="mt-3 flex items-center justify-between gap-2">
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="text-[11px] px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-md text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                        title="Modèle IA"
                    >
                        {MODELS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="text-[11px] px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-md text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                    >
                        <option value="assistant">💬 Assistant</option>
                        <option value="agent">🤖 Agent</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

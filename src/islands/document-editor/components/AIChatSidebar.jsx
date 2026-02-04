/**
 * AIChatSidebar Component
 * AI Assistant chat interface for the document editor
 * Supports: Assistant mode (simple chat) and Agent mode (document-aware with actions)
 * Uses OpenAI via Integration Engine
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'

// Agent system prompt - conversational with action proposals
const AGENT_SYSTEM_PROMPT = `Tu es un assistant d'écriture intelligent qui analyse et modifie des documents.

COMPORTEMENT:
1. Analyse le document et identifie les corrections/améliorations possibles
2. Propose-les UNE PAR UNE avec le bloc action JSON correspondant
3. Demande confirmation: "Voulez-vous que je [action] ?"

RÈGLE CRITIQUE:
⚠️ Si tu proposes une correction, tu DOIS TOUJOURS inclure le bloc \`\`\`action avec le JSON complet.
Sans ce bloc, l'utilisateur ne pourra PAS appliquer la correction.

FORMAT DE PROPOSITION (OBLIGATOIRE):
\`\`\`action
{
  "type": "replace_between_anchors",
  "description": "Corriger [description]",
  "target": { "pageIndex": 0, "matchText": "texte EXACT à remplacer" },
  "patch": { "replacement": "nouveau texte corrigé" }
}
\`\`\`

EXEMPLE CORRECT:
"Le titre contient une faute: 'denettoyage' devrait être 'de nettoyage'. Voulez-vous que je corrige ?
\`\`\`action
{
  "type": "replace_between_anchors",
  "description": "Corriger la faute de frappe dans le titre",
  "target": { "pageIndex": 0, "matchText": "denettoyage" },
  "patch": { "replacement": "de nettoyage" }
}
\`\`\`"

RÈGLES:
- matchText = texte EXACT copié du document (sensible à la casse)
- Une seule action par message
- Sois conversationnel et amical`

export default function AIChatSidebar({
    accountNumber,
    getDocumentSnapshot,
    getSelectionText,
    applyPatch
}) {
    // ========== STATE ==========
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [mode, setMode] = useState('assistant') // 'assistant' | 'agent'
    const [model, setModel] = useState('gpt-4o-mini') // AI model selection
    const [pendingAction, setPendingAction] = useState(null)
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
    }, [messages, pendingAction])

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
                    temperature: isAgent ? 0.3 : 0.7,
                    max_tokens: 2000
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

    // ========== PARSE ACTION FROM RESPONSE ==========
    const parseActionFromResponse = (content) => {
        // Try multiple patterns to find action JSON
        const patterns = [
            /```action\s*([\s\S]*?)```/,      // ```action ... ```
            /```json\s*([\s\S]*?)```/,         // ```json ... ```
            /\{[\s\S]*"type"\s*:\s*"[^"]+_anchor[^"]*"[\s\S]*\}/  // Raw JSON with type
        ]

        for (const pattern of patterns) {
            const match = content.match(pattern)
            if (match) {
                const jsonStr = match[1] || match[0]
                const text = content.replace(pattern, '').trim()

                try {
                    const action = JSON.parse(jsonStr.trim())
                    // Validate action structure
                    if (action.type && (action.target || action.patch)) {
                        action.id = Date.now().toString()
                        console.log('✅ Action parsed:', action)
                        return { text, action }
                    }
                } catch (e) {
                    console.warn('JSON parse attempt failed:', e.message)
                }
            }
        }

        console.log('ℹ️ No action found in response')
        return { text: content, action: null }
    }

    // ========== SEND MESSAGE ==========
    const sendMessage = async (userMessage) => {
        setIsLoading(true)
        setError(null)
        setPendingAction(null)

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
                    contextMessage = `\n\n[CONTEXTE - Document actuel (${totalPages} pages, page active: ${activePageIndex + 1})]\n${snapshot}`
                    if (selection) {
                        contextMessage += `\n\n[TEXTE SÉLECTIONNÉ]\n${selection}`
                    }
                } else {
                    // Document is empty - use a strict generation prompt
                    systemPrompt = `Tu es un générateur de documents professionnels.
Le document est actuellement VIDE.

RÈGLES STRICTES:
1. Génère UNIQUEMENT du HTML structuré style Word
2. Le champ "content" doit contenir UNIQUEMENT le HTML du document
3. PAS de commentaires, PAS d'explications, PAS de texte avant/après
4. PAS de markdown (\`\`\`html), juste le HTML brut

FORMAT HTML:
- Titres: <h1>, <h2>, <h3>
- Paragraphes: <p>
- Listes: <ul><li> ou <ol><li>
- Mise en forme: <strong>, <em>, <u>

TOUJOURS répondre avec ce format JSON:
\`\`\`action
{
  "type": "insert_content",
  "description": "Description courte",
  "patch": { "content": "<h1>Titre</h1><p>Contenu...</p>" }
}
\`\`\`

Le champ "content" contient UNIQUEMENT le HTML, aucun texte d'explication.`
                }
                setIsAnalyzing(false)
            }

            const conversationHistory = [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userMessage + contextMessage }
            ]

            const content = await callOpenAI(conversationHistory, mode === 'agent')

            // Parse action if in agent mode
            if (mode === 'agent') {
                let { text, action } = parseActionFromResponse(content)

                // If document is empty and no action but response looks like content to insert
                if (!action && documentIsEmpty && text.length > 50) {
                    // Check if the response is NOT a question or clarification
                    const isQuestion = /\?$|voulez-vous|souhaitez-vous|pouvez-vous|avez-vous|puis-je|quel|quelle/i.test(text.trim())
                    const isError = /pas trouvé|introuvable|erreur|impossible|désolé/i.test(text)

                    if (!isQuestion && !isError) {
                        // Create an insert action automatically
                        action = {
                            id: Date.now().toString(),
                            type: 'insert_content',
                            description: 'Insérer ce contenu dans le document',
                            patch: { content: text }
                        }
                        text = "J'ai généré ce contenu pour vous. Voulez-vous l'insérer dans le document ?"
                    }
                }

                setMessages(prev => [...prev, { role: 'assistant', content: text }])
                if (action) {
                    setPendingAction(action)
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
    const handleApplyAction = useCallback(() => {
        if (!pendingAction || !applyPatch) return

        const result = applyPatch(pendingAction)

        if (result.success) {
            setMessages(prev => [...prev, {
                role: 'system',
                content: `✅ ${result.message}`
            }])
            setPendingAction(null)
        } else {
            setError(`Échec: ${result.message}`)
        }
    }, [pendingAction, applyPatch])

    const handleRejectAction = useCallback(() => {
        setMessages(prev => [...prev, {
            role: 'system',
            content: '❌ Action annulée'
        }])
        setPendingAction(null)
    }, [])

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
            'correct': 'Corrige les fautes d\'orthographe et de grammaire',
            'summarize': 'Résume le contenu du document'
        }
        sendMessage(prompts[action])
    }

    const clearChat = () => {
        setMessages([])
        setPendingAction(null)
        setError(null)
    }

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
                                ? 'Posez une question sur votre document. L\'agent analysera le contenu et proposera des modifications.'
                                : 'Posez une question ou demandez-moi de vous aider à rédiger.'}
                        </p>

                        {/* Quick Actions */}
                        <div className="mt-6 space-y-2 w-full">
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
                            <button
                                onClick={() => handleQuickAction('summarize')}
                                className="w-full px-4 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group"
                            >
                                <iconify-icon icon="tabler:file-text" width="16" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                Résumer le document
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

                        {/* Pending Action Card */}
                        {pendingAction && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
                                    📝 Action proposée
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                                    {pendingAction.description}
                                </p>
                                {pendingAction.target?.matchText && pendingAction.patch?.replacement && (
                                    <div className="text-[11px] mb-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-1">
                                        <div className="text-danger line-through">{pendingAction.target.matchText}</div>
                                        <div className="text-success">{pendingAction.patch.replacement}</div>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleApplyAction}
                                        className="flex-1 py-2 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 font-medium"
                                    >
                                        <iconify-icon icon="tabler:check" width="14"></iconify-icon>
                                        Appliquer
                                    </button>
                                    <button
                                        onClick={handleRejectAction}
                                        className="flex-1 py-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <iconify-icon icon="tabler:x" width="14"></iconify-icon>
                                        Refuser
                                    </button>
                                </div>
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

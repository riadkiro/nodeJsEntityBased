/**
 * AIChatSidebar Component
 * AI Assistant chat interface for the document editor
 * Supports: Assistant mode (simple chat) and Agent mode (document-aware with MULTI-ACTIONS)
 * Uses OpenAI via Integration Engine
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'

// ========== AGENT SYSTEM PROMPT - REFERENCE-BASED LOCATOR SYSTEM ==========
const AGENT_SYSTEM_PROMPT = `Tu es un agent intelligent de manipulation de documents.

OBJECTIF:
Analyser le message de l'utilisateur, DÉTECTER SON INTENTION, et proposer les actions appropriées.
Tu reçois le contenu avec des RÉFÉRENCES (data-loc) pour cibler précisément chaque élément.

INTENTIONS POSSIBLES (détecte automatiquement):
- CORRIGER: "corrige", "orthographe", "fautes", "grammaire" → corrections orthographiques
- REFORMULER: "reformule", "réécris", "améliore le style", "rephrase" → réécrire avec meilleur style
- TRADUIRE: "traduis", "translate", "en anglais", "en espagnol", "in english" → traduction
- RÉSUMER: "résume", "summarize", "raccourcis", "condensé" → version courte
- DÉVELOPPER: "développe", "expand", "enrichis", "détaille", "plus long" → ajouter du contenu
- SIMPLIFIER: "simplifie", "plus simple", "vulgarise" → langage plus accessible
- FORMALISER: "formalise", "plus formel", "professionnel" → ton plus professionnel

FORMAT DE RÉPONSE OBLIGATOIRE:
Tu DOIS répondre UNIQUEMENT avec un bloc JSON \`\`\`actions contenant:
{
  "message": "Description de ce que tu proposes",
  "intent": "corriger|reformuler|traduire|resumer|developper|simplifier|formaliser",
  "actions": [
    {
      "id": "1",
      "type": "replace_ref",
      "description": "Description de l'action",
      "target": { "ref": "loc-xxx", "pageIndex": 0 },
      "patch": { "replacement": "nouveau contenu" },
      "confidence": 0.9
    }
  ]
}

TYPES D'ACTIONS:
- replace_ref: Remplace le CONTENU de l'élément ciblé par ref (PRÉFÉRÉ - plus fiable)
- replace_text: Remplace un texte DANS l'élément ref (pour corrections ponctuelles)
- insert_content: Insère du contenu (pour document vide)

SYSTÈME DE RÉFÉRENCES (CRITIQUE):
- Chaque élément du document a un attribut data-loc="loc-xxx"
- Tu DOIS utiliser ces refs exactement comme reçues
- Pour replace_ref: remplace tout le contenu de l'élément
- Pour replace_text: utilise target.ref + target.matchText pour cibler un mot précis

RÈGLES PAR INTENTION:

📝 CORRIGER (orthographe/grammaire):
- Utilise replace_text avec ref + matchText
- target: { ref: "loc-xxx", matchText: "fote" }
- patch: { replacement: "faute" }
- Confidence: 0.95

🔄 REFORMULER / 🌍 TRADUIRE / 📋 RÉSUMER / ✨ SIMPLIFIER / 👔 FORMALISER:
- Utilise replace_ref pour remplacer tout le contenu
- target: { ref: "loc-xxx" } ou { ref: "sel-xxx" } pour sélection
- patch: { replacement: "Nouveau contenu HTML" }
- ⚠️ PRÉSERVE LE HTML: Si le contenu reçu contient des balises HTML (<strong>, <em>, <a>, <br>, etc.), garde-les EXACTEMENT dans le replacement
- Traduis/modifie UNIQUEMENT le texte, pas les balises
- Confidence: 0.85

RÈGLES TECHNIQUES:
1. Les refs sont OBLIGATOIRES - pas de texte sans ref
2. Maximum 5 actions par réponse
3. Chaque action a un id unique (1, 2, 3...)
4. NE PAS ajouter de texte en dehors du bloc \`\`\`actions
5. Si ref commence par "sel-", c'est une SÉLECTION spécifique de l'utilisateur

EXEMPLE - REFORMULATION:
\`\`\`actions
{
  "message": "Voici le paragraphe reformulé.",
  "intent": "reformuler",
  "actions": [
    {
      "id": "1",
      "type": "replace_ref",
      "description": "Reformuler le paragraphe sélectionné",
      "target": { "ref": "sel-a1b2c3", "pageIndex": 0 },
      "patch": { "replacement": "Je me permets de vous contacter afin de solliciter la résiliation de mon contrat." },
      "confidence": 0.85
    }
  ]
}
\`\`\`

EXEMPLE - CORRECTION ORTHOGRAPHE:
\`\`\`actions
{
  "message": "J'ai trouvé 2 fautes.",
  "intent": "corriger",
  "actions": [
    {
      "id": "1",
      "type": "replace_text",
      "description": "Corriger 'Resiliation'",
      "target": { "ref": "loc-p1", "matchText": "Resiliation", "pageIndex": 0 },
      "patch": { "replacement": "Résiliation" },
      "confidence": 0.95
    },
    {
      "id": "2",
      "type": "replace_text",
      "description": "Corriger 'infomation'",
      "target": { "ref": "loc-p3", "matchText": "infomation", "pageIndex": 0 },
      "patch": { "replacement": "information" },
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
    pageRefs, // Reference to page elements for highlighting
    selectedPageIndex = 0 // Current page index for "page" scope
}) {
    // ========== STATE ==========
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [mode, setMode] = useState('agent') // 'assistant' | 'agent' - agent by default
    const [model, setModel] = useState('gpt-4o')

    // Scope: what to analyze - 'selection' | 'page' | 'document'
    const [scope, setScope] = useState('page') // Default to page
    const [hasSelection, setHasSelection] = useState(false)
    const [lockedSelection, setLockedSelection] = useState(null) // Store selection text when focusing input
    const inputRef = useRef(null)
    const lockedElementRef = useRef(null) // Store the locked element for selection mode

    // Multi-actions state
    const [pendingActions, setPendingActions] = useState([]) // Array of actions
    const [actionStatus, setActionStatus] = useState({}) // { [id]: 'pending' | 'applied' | 'ignored' | 'failed' }
    const [isApplying, setIsApplying] = useState(false)
    const [hoveredActionId, setHoveredActionId] = useState(null) // For highlight emphasis
    const [previewOriginals, setPreviewOriginals] = useState({}) // { [ref]: originalHTML } - store original content for preview

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [batchProgress, setBatchProgress] = useState(null) // { current: 1, total: 3, startPage: 1, endPage: 2, totalPages: 6 }
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

    // Track selection state (but don't auto-switch scope)
    useEffect(() => {
        const handleSelectionChange = () => {
            const selText = getSelectionText?.()
            const hasText = selText && selText.length > 0
            setHasSelection(hasText)

            // If selection is cleared while in selection scope, revert to page
            // Note: This only fires when there's no lockedSelection - if we have a locked
            // selection, we keep the indicator visible until user clicks outside or changes scope
            if (!hasText && scope === 'selection' && !lockedSelection) {
                setScope('page')
            }
        }

        document.addEventListener('selectionchange', handleSelectionChange)
        return () => document.removeEventListener('selectionchange', handleSelectionChange)
    }, [getSelectionText, scope, lockedSelection])

    // Clear selection lock - remove refs and styling from locked blocks
    const clearSelectionLock = useCallback(() => {
        // Remove overlay indicators (if any)
        document.querySelectorAll('.ai-selection-indicator').forEach(el => el.remove())

        // Get refs that are still needed by pending actions
        const pendingRefs = new Set()
        pendingActions.forEach(action => {
            if (actionStatus[action.id] === 'pending' && action.target?.ref) {
                pendingRefs.add(action.target.ref)
            }
        })

        // Remove selection-locked class and data-loc from locked elements
        // BUT keep data-loc if it's needed by a pending action
        document.querySelectorAll('.selection-locked, [data-loc^="sel-"]').forEach(el => {
            el.classList.remove('selection-locked')
            const ref = el.getAttribute('data-loc')
            if (ref && !pendingRefs.has(ref)) {
                el.removeAttribute('data-loc')
            }
        })

        lockedElementRef.current = null
    }, [pendingActions, actionStatus])

    // Handle input focus - lock selection and add refs to selected blocks
    const handleInputFocus = useCallback(() => {
        const selText = getSelectionText?.()
        if (selText && selText.length > 0) {
            setLockedSelection(selText)
            setScope('selection')

            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0)
                if (!range.collapsed) {
                    // Generate unique base ref for this selection
                    const selRefBase = 'sel-' + Math.random().toString(36).substring(2, 8)

                    // Find all block elements that intersect with the selection
                    const container = range.commonAncestorContainer
                    const root = container.nodeType === Node.ELEMENT_NODE
                        ? container
                        : container.parentElement

                    // Get all blocks within the common ancestor
                    const blockSelector = 'p, h1, h2, h3, h4, h5, h6, li, blockquote'
                    let blocks = []

                    // If the root itself is a block, include it
                    if (root.matches?.(blockSelector)) {
                        blocks = [root]
                    } else {
                        blocks = Array.from(root.querySelectorAll(blockSelector))
                    }

                    // Filter to only blocks that intersect with the selection
                    const selectedBlocks = blocks.filter(block => {
                        if (!block.textContent.trim()) return false
                        return range.intersectsNode(block)
                    })

                    // Add refs to each selected block
                    selectedBlocks.forEach((block, index) => {
                        const ref = selectedBlocks.length === 1
                            ? selRefBase
                            : `${selRefBase}-${index}`
                        block.setAttribute('data-loc', ref)
                        block.classList.add('selection-locked')
                    })

                    // Store refs for cleanup
                    lockedElementRef.current = selectedBlocks

                    // Clear browser selection
                    sel.removeAllRanges()
                }
            }
        }
    }, [getSelectionText])

    // Handle scope change - clear locked selection if switching away from selection
    const handleScopeChange = useCallback((newScope) => {
        setScope(newScope)
        if (newScope !== 'selection') {
            setLockedSelection(null)
            // Remove selection indicators and locked class
            clearSelectionLock()
        }
    }, [clearSelectionLock])

    // Detect clicks outside the chat sidebar to revert to page scope
    useEffect(() => {
        if (scope !== 'selection' || !lockedSelection) return

        const handleDocumentClick = (e) => {
            // Check if click is inside the sidebar (contains the chat input)
            const sidebar = e.target.closest('.ai-chat-sidebar')
            const isClickInSidebar = sidebar !== null

            // If click is outside sidebar, revert to page scope
            if (!isClickInSidebar) {
                // Check if there are pending actions that target selection refs
                const hasPendingSelectionActions = pendingActions.some(action =>
                    actionStatus[action.id] === 'pending' &&
                    action.target?.ref?.startsWith('sel-')
                )

                // Change scope
                setScope('page')
                setLockedSelection(null)

                // Always remove the visual highlight class
                document.querySelectorAll('.selection-locked').forEach(el => {
                    el.classList.remove('selection-locked')
                })

                // Only remove refs if NO pending actions need them
                if (!hasPendingSelectionActions) {
                    clearSelectionLock()
                }
            }
        }

        // Add listener with a small delay to avoid catching the initial focus click
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleDocumentClick)
        }, 100)

        return () => {
            clearTimeout(timeoutId)
            document.removeEventListener('mousedown', handleDocumentClick)
        }
    }, [scope, lockedSelection, pendingActions, actionStatus, clearSelectionLock])

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

        // Helper: Find the best occurrence in text using before/after locators
        const findBestOccurrence = (text, matchText, beforeHint, afterHint) => {
            const hits = []
            let start = 0
            while (true) {
                let idx = text.indexOf(matchText, start)
                if (idx === -1) {
                    // Try case-insensitive
                    idx = text.toLowerCase().indexOf(matchText.toLowerCase(), start)
                    if (idx === -1) break
                }
                const actualText = text.substring(idx, idx + matchText.length)
                const before = text.slice(Math.max(0, idx - 30), idx)
                const after = text.slice(idx + matchText.length, idx + matchText.length + 30)
                hits.push({ idx, before, after, actualText })
                start = idx + matchText.length
            }

            if (!hits.length) return null
            if (!beforeHint && !afterHint) return hits[0] // fallback to first

            // Score each hit by how well it matches before/after hints
            let best = hits[0], bestScore = -1
            for (const h of hits) {
                const score =
                    (beforeHint && h.before.includes(beforeHint) ? 2 : 0) +
                    (afterHint && h.after.includes(afterHint) ? 2 : 0) +
                    (beforeHint && h.before.toLowerCase().includes(beforeHint.toLowerCase()) ? 1 : 0) +
                    (afterHint && h.after.toLowerCase().includes(afterHint.toLowerCase()) ? 1 : 0)
                if (score > bestScore) { best = h; bestScore = score }
            }

            return best
        }

        actionsToHighlight.forEach(action => {
            const pageIndex = action.target?.pageIndex || 0
            const pageEl = pageRefs.current[pageIndex]
            if (!pageEl) return

            const matchText = action.target.matchText
            const beforeHint = action.target.before
            const afterHint = action.target.after

            // Find the best matching occurrence for this action
            const highlightBestMatch = () => {
                const walker = document.createTreeWalker(
                    pageEl,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                )

                let bestNode = null
                let bestOcc = null
                let bestScore = -1

                // First pass: find all text nodes and score occurrences
                while (walker.nextNode()) {
                    const node = walker.currentNode
                    const content = node.textContent

                    const occ = findBestOccurrence(content, matchText, beforeHint, afterHint)
                    if (occ) {
                        // Calculate score for this occurrence
                        const score =
                            (beforeHint && occ.before.includes(beforeHint) ? 2 : 0) +
                            (afterHint && occ.after.includes(afterHint) ? 2 : 0)

                        if (score > bestScore || bestNode === null) {
                            bestNode = node
                            bestOcc = occ
                            bestScore = score
                        }

                        // Perfect match found
                        if (score >= 4) break
                    }
                }

                if (!bestNode || !bestOcc) return false

                try {
                    const range = document.createRange()
                    range.setStart(bestNode, bestOcc.idx)
                    range.setEnd(bestNode, bestOcc.idx + bestOcc.actualText.length)

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

                    // Add hover events
                    highlight.onmouseenter = () => {
                        setHoveredActionId(action.id)
                        const card = document.querySelector(`[data-action-card-id="${action.id}"]`)
                        if (card) {
                            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                        }
                    }
                    highlight.onmouseleave = () => setHoveredActionId(null)

                    range.surroundContents(highlight)
                    return true
                } catch (e) {
                    console.warn('Cannot highlight occurrence:', matchText, e)
                    return false
                }
            }

            highlightBestMatch()
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
            const isHovered = actionId === hoveredActionId // 1 action = 1 highlight now

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
        // Also scroll to replace_ref elements
        const action = pendingActions.find(a => a.id === actionId)
        if (action?.type === 'replace_ref' && action.target?.ref) {
            const refEl = document.querySelector(`[data-loc="${action.target.ref}"]`)
            if (refEl) {
                refEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [pendingActions])

    // Capture original content for replace_ref actions when they arrive
    useEffect(() => {
        const replaceRefActions = pendingActions.filter(a =>
            a.type === 'replace_ref' && actionStatus[a.id] === 'pending'
        )

        replaceRefActions.forEach(action => {
            const ref = action.target?.ref
            if (!ref || previewOriginals[ref]) return // Skip if already stored

            const refEl = document.querySelector(`[data-loc="${ref}"]`)
            if (refEl) {
                setPreviewOriginals(prev => ({
                    ...prev,
                    [ref]: refEl.innerHTML
                }))
            }
        })
    }, [pendingActions, actionStatus])

    // Handle hover preview - swap content when hovering a card
    useEffect(() => {
        if (!hoveredActionId) {
            // Restore all previewed content when not hovering
            Object.entries(previewOriginals).forEach(([ref, originalHTML]) => {
                const refEl = document.querySelector(`[data-loc="${ref}"]`)
                if (refEl && refEl.classList.contains('ai-preview-active')) {
                    refEl.innerHTML = originalHTML
                    refEl.classList.remove('ai-preview-active')
                }
            })
            return
        }

        const action = pendingActions.find(a => a.id === hoveredActionId)
        if (!action || action.type !== 'replace_ref' || actionStatus[action.id] !== 'pending') return

        const ref = action.target?.ref
        if (!ref || !previewOriginals[ref]) return

        const refEl = document.querySelector(`[data-loc="${ref}"]`)
        if (!refEl) return

        // Show the new content as preview
        refEl.innerHTML = action.patch?.replacement || ''
        refEl.classList.add('ai-preview-active')
    }, [hoveredActionId, pendingActions, actionStatus, previewOriginals])

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

        // NOTE: Do NOT clear selection indicator here - keep it visible while in selection mode
        // The indicator will be cleared when exiting selection mode (clicking outside or changing scope)

        const userMsg = { role: 'user', content: userMessage }
        setMessages(prev => [...prev, userMsg])

        try {
            let systemPrompt = 'Tu es un assistant d\'écriture professionnel. Tu aides l\'utilisateur à rédiger, corriger et améliorer ses documents. Réponds de manière concise et utile en français.'
            let contextMessage = ''

            // In agent mode, ALWAYS include document context based on scope
            let documentIsEmpty = false
            if (mode === 'agent' && getDocumentSnapshot) {
                setIsAnalyzing(true)
                const { snapshot, selection, selectionRefs, activePageIndex, totalPages, pages, pagesWithRefs } = getDocumentSnapshot()

                // Determine content based on scope
                let contentToAnalyze = ''
                let scopeLabel = ''

                // Use locked selection (from focus) or fresh selection
                const selectionText = lockedSelection || selection

                if (scope === 'selection' && selectionText && selectionText.trim()) {
                    // For selection scope, include the refs if available
                    if (selectionRefs && selectionRefs.length > 0) {
                        // Get each block's HTML content with its ref (to preserve formatting)
                        const lockedBlocks = document.querySelectorAll('[data-loc^="sel-"]')
                        contentToAnalyze = Array.from(lockedBlocks)
                            .map(el => `[${el.getAttribute('data-loc')}]\n${el.innerHTML.trim()}`)
                            .join('\n\n')
                    } else {
                        contentToAnalyze = selectionText
                    }
                    scopeLabel = 'SÉLECTION (HTML - PRÉSERVE LA STRUCTURE)'
                } else if (scope === 'page' && pagesWithRefs && pagesWithRefs[selectedPageIndex]) {
                    // Use pagesWithRefs which includes refs and HTML
                    contentToAnalyze = pagesWithRefs[selectedPageIndex]
                    scopeLabel = `PAGE ${selectedPageIndex + 1}/${totalPages} (HTML - PRÉSERVE LA STRUCTURE)`
                } else if (scope === 'document' && pagesWithRefs && pagesWithRefs.length > 2) {
                    // Detect if this is a SUMMARY/ANALYSIS request (needs full document context)
                    const isSummaryRequest = /r[eé]sum|synth[eè]s|summarize|summary|analyse globale|vue d'ensemble|overview/i.test(userMessage)

                    setIsAnalyzing(false)

                    // Build batches of 2 pages
                    const batches = []
                    for (let i = 0; i < pagesWithRefs.length; i += 2) {
                        batches.push({
                            pages: pagesWithRefs.slice(i, Math.min(i + 2, pagesWithRefs.length)),
                            startPage: i,
                            endPage: Math.min(i + 2, pagesWithRefs.length)
                        })
                    }

                    if (isSummaryRequest) {
                        // ========== SUMMARY MODE: Batch summaries → Merge → Insert ==========
                        const partialSummaries = []

                        for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
                            const batch = batches[batchIdx]

                            // Update progress - Phase 1: Lecture
                            setBatchProgress({
                                current: batchIdx + 1,
                                total: batches.length + 1, // +1 for merge step
                                startPage: batch.startPage + 1,
                                endPage: batch.endPage,
                                totalPages: pagesWithRefs.length,
                                phase: 'Lecture'
                            })

                            // Build context for this batch - ask for PARTIAL summary only
                            const batchContent = batch.pages.map((pageContent, idx) => {
                                const pageNum = batch.startPage + idx + 1
                                return `=== PAGE ${pageNum}/${totalPages} ===\n${pageContent}`
                            }).join('\n\n')

                            const summaryPrompt = `Tu es un assistant de résumé. Extrais les points clés des pages suivantes en 2-3 phrases maximum.
Ne formate pas, donne juste les idées principales de manière concise.

${batchContent}`

                            const batchConversationHistory = [
                                { role: 'system', content: 'Tu extrais les points clés d\'un document. Sois très concis (2-3 phrases max).' },
                                { role: 'user', content: summaryPrompt }
                            ]

                            try {
                                const batchResponse = await callOpenAI(batchConversationHistory, false)
                                if (batchResponse && batchResponse.trim()) {
                                    partialSummaries.push({
                                        pages: `${batch.startPage + 1}-${batch.endPage}`,
                                        summary: batchResponse.trim()
                                    })
                                }
                            } catch (batchErr) {
                                console.error(`[Summary Batch ${batchIdx + 1}] Error:`, batchErr)
                            }
                        }

                        // Phase 2: Merge all partial summaries into one
                        setBatchProgress({
                            current: batches.length + 1,
                            total: batches.length + 1,
                            startPage: 1,
                            endPage: pagesWithRefs.length,
                            totalPages: pagesWithRefs.length,
                            phase: 'Synthèse finale'
                        })

                        // Build merge prompt
                        const mergeInput = partialSummaries
                            .map(ps => `[Pages ${ps.pages}]: ${ps.summary}`)
                            .join('\n\n')

                        const mergePrompt = `Voici des résumés partiels d'un document de ${totalPages} pages.
Fusionne-les en UN SEUL résumé cohérent et structuré.
Format: utilise des paragraphes HTML (<p>, <strong> si besoin) pour une mise en forme propre.
Longueur cible: 1 paragraphe par tranche de 5 pages environ.

${mergeInput}

Résumé final (HTML):`

                        const mergeHistory = [
                            { role: 'system', content: 'Tu es un assistant de synthèse. Tu fusionne des résumés partiels en un résumé global cohérent et bien structuré.' },
                            { role: 'user', content: mergePrompt }
                        ]

                        try {
                            let finalSummary = await callOpenAI(mergeHistory, false)

                            // Clean up markdown code blocks if present
                            finalSummary = finalSummary
                                .replace(/^```html\s*/i, '')
                                .replace(/^```\s*/gm, '')
                                .replace(/```$/gm, '')
                                .trim()

                            // Clear progress
                            setBatchProgress(null)

                            // Create insert action to add summary at cursor
                            const insertAction = {
                                id: `summary_${Date.now()}`,
                                type: 'insert_content',
                                description: `Résumé du document (${totalPages} pages)`,
                                target: {},
                                patch: { content: finalSummary },
                                confidence: 1.0
                            }

                            setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: `📄 Résumé généré pour ${totalPages} pages. Cliquez "Appliquer" pour l'insérer à la position du curseur.`
                            }])

                            setPendingActions([insertAction])
                            setActionStatus({ [insertAction.id]: 'pending' })

                        } catch (mergeErr) {
                            console.error('[Summary Merge] Error:', mergeErr)
                            setError('Erreur lors de la synthèse finale')
                            setBatchProgress(null)
                        }

                        setIsLoading(false)
                        return // Exit early, summary handled
                    }

                    // ========== CORRECTION MODE: Standard batching with actions ==========
                    const allActions = []
                    let lastMessage = ''

                    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
                        const batch = batches[batchIdx]

                        // Update progress
                        setBatchProgress({
                            current: batchIdx + 1,
                            total: batches.length,
                            startPage: batch.startPage + 1,
                            endPage: batch.endPage,
                            totalPages: pagesWithRefs.length
                        })

                        // Build context for this batch
                        const batchContent = batch.pages.map((pageContent, idx) => {
                            const pageNum = batch.startPage + idx + 1
                            return `=== PAGE ${pageNum}/${totalPages} ===\n${pageContent}`
                        }).join('\n\n')

                        const batchContextMessage = `\n\n[DOCUMENT - Pages ${batch.startPage + 1}-${batch.endPage} sur ${totalPages} (HTML - PRÉSERVE LA STRUCTURE)]\n${batchContent}`

                        const batchConversationHistory = [
                            { role: 'system', content: AGENT_SYSTEM_PROMPT },
                            ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
                            { role: 'user', content: userMessage + batchContextMessage }
                        ]

                        try {
                            const batchResponse = await callOpenAI(batchConversationHistory, true)
                            const { messageText, actions } = parseActionsFromResponse(batchResponse)

                            // Accumulate actions with unique IDs
                            actions.forEach((action, actionIdx) => {
                                action.id = `batch${batchIdx}_${action.id || actionIdx}`
                                allActions.push(action)
                            })

                            if (messageText) lastMessage = messageText
                        } catch (batchErr) {
                            console.error(`[AI Batch ${batchIdx + 1}] Error:`, batchErr)
                        }
                    }

                    // Clear progress
                    setBatchProgress(null)

                    // Show final message with all actions
                    const finalMessage = allActions.length > 0
                        ? `${lastMessage || 'Analyse terminée.'} (${allActions.length} actions sur ${totalPages} pages)`
                        : lastMessage || 'Aucune correction trouvée.'

                    setMessages(prev => [...prev, { role: 'assistant', content: finalMessage }])

                    if (allActions.length > 0) {
                        setPendingActions(allActions)
                        const initialStatus = {}
                        allActions.forEach(a => { initialStatus[a.id] = 'pending' })
                        setActionStatus(initialStatus)
                    }

                    setIsLoading(false)
                    return // Exit early, batching handled everything
                } else {
                    contentToAnalyze = snapshot
                    scopeLabel = `DOCUMENT COMPLET - ${totalPages} pages`
                }

                documentIsEmpty = !contentToAnalyze.trim()

                if (contentToAnalyze.trim()) {
                    systemPrompt = AGENT_SYSTEM_PROMPT
                    contextMessage = `\n\n[${scopeLabel}]\n${contentToAnalyze}`
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
            setBatchProgress(null) // Clear progress on error
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
            const ref = action.target?.ref

            // For replace_ref, handle the preview state
            if (action.type === 'replace_ref' && ref && previewOriginals[ref]) {
                // Content might already be showing (if hovered), apply it permanently
                const refEl = document.querySelector(`[data-loc="${ref}"]`)
                if (refEl) {
                    refEl.innerHTML = action.patch?.replacement || ''
                    refEl.removeAttribute('data-loc')
                    refEl.classList.remove('selection-locked', 'ai-preview-active')
                }

                // Clean up preview state
                setPreviewOriginals(prev => {
                    const next = { ...prev }
                    delete next[ref]
                    return next
                })

                setActionStatus(prev => ({ ...prev, [action.id]: 'applied' }))
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: `✅ ${action.description}`
                }])
            } else {
                // Standard apply for replace_text and other types
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
            }
        } finally {
            setIsApplying(false)
        }
    }, [applyPatch, actionStatus, isApplying, previewOriginals])

    const handleIgnoreAction = useCallback((action) => {
        const ref = action.target?.ref

        // For replace_ref, restore original content if we have it stored
        if (action.type === 'replace_ref' && ref && previewOriginals[ref]) {
            const refEl = document.querySelector(`[data-loc="${ref}"]`)
            if (refEl) {
                refEl.innerHTML = previewOriginals[ref]
                refEl.classList.remove('ai-preview-active')
            }
            // Clean up preview state
            setPreviewOriginals(prev => {
                const next = { ...prev }
                delete next[ref]
                return next
            })
        }

        setActionStatus(prev => ({ ...prev, [action.id]: 'ignored' }))
    }, [previewOriginals])

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

    // ========== FLOATING PANEL STATE ==========
    const [isOpen, setIsOpen] = useState(false)

    // ========== RENDER ==========
    return (
        <>
            {/* Floating Toggle Button - shown when panel is closed */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed z-50 flex items-center justify-center w-11 h-11 rounded-xl shadow-lg transition-all hover:scale-110 active:scale-95 bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:shadow-amber-500/30"
                    style={{ bottom: '140px', right: '24px' }}
                    title="Assistant IA"
                >
                    <iconify-icon icon="tabler:robot" width="22"></iconify-icon>
                </button>
            )}

            {/* Floating Panel - overlay, does not take layout space */}
            {isOpen && (
                <div
                    className="ai-chat-sidebar fixed z-50 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col"
                    style={{ bottom: '80px', right: '24px', width: '380px', height: 'calc(100vh - 160px)', maxHeight: '680px' }}
                >
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
                            {/* Close / Clear Chat */}
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <button
                                        onClick={clearChat}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Nouvelle conversation"
                                    >
                                        <iconify-icon icon="tabler:refresh" width="18"></iconify-icon>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Fermer"
                                >
                                    <iconify-icon icon="tabler:x" width="18"></iconify-icon>
                                </button>
                            </div>
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

                    {/* Scope Selector - Only in Agent mode */}
                    {mode === 'agent' && (
                        <div className="px-4 py-2 border-b dark:border-gray-800">
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                                <button
                                    onClick={() => handleScopeChange('selection')}
                                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${scope === 'selection'
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        } ${!hasSelection && !lockedSelection && scope !== 'selection' ? 'opacity-50' : ''}`}
                                    title="Analyser uniquement la sélection"
                                >
                                    <iconify-icon icon="tabler:text-wrap" width="12"></iconify-icon>
                                    <span>Sélection</span>
                                    {(hasSelection || lockedSelection) && scope === 'selection' && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleScopeChange('page')}
                                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${scope === 'page'
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    title="Analyser la page en cours"
                                >
                                    <iconify-icon icon="tabler:file-text" width="12"></iconify-icon>
                                    <span>Page</span>
                                </button>
                                <button
                                    onClick={() => handleScopeChange('document')}
                                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${scope === 'document'
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    title="Analyser tout le document"
                                >
                                    <iconify-icon icon="tabler:files" width="12"></iconify-icon>
                                    <span>Tout</span>
                                </button>
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
                                                            isIgnored ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-800 opacity-50' :
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

                                                    {/* Show old -> new preview INLINE for replace_text */}
                                                    {action.target?.matchText && action.patch?.replacement && (
                                                        <div className="text-[10px] mb-1.5 flex items-center gap-1.5 font-mono flex-wrap">
                                                            <span className="text-danger line-through">{action.target.matchText}</span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="text-success">{action.patch.replacement}</span>
                                                        </div>
                                                    )}

                                                    {/* Preview for replace_ref (translations/reformulations) - show on hover */}
                                                    {action.type === 'replace_ref' && action.patch?.replacement && isPending && hoveredActionId === action.id && (
                                                        <div className="mt-2 p-2 bg-success/10 rounded-lg border border-success/20">
                                                            <div className="text-[9px] text-success font-medium mb-1 flex items-center gap-1">
                                                                <iconify-icon icon="tabler:arrow-right" width="10"></iconify-icon>
                                                                Nouveau contenu
                                                            </div>
                                                            <div
                                                                className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed"
                                                                style={{
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: action.patch.replacement }}
                                                            />
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
                                {(isLoading || isAnalyzing || batchProgress) && (
                                    <div className="flex justify-start">
                                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm ${mode === 'agent' ? 'bg-amber-500/10' : 'bg-[#1e3a5f]'
                                            }`}>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <iconify-icon
                                                        icon="tabler:loader-2"
                                                        width="16"
                                                        className={`animate-spin ${mode === 'agent' ? 'text-amber-500' : 'text-primary'}`}
                                                    ></iconify-icon>
                                                    <span className={`text-sm ${mode === 'agent' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                                                        {batchProgress
                                                            ? batchProgress.phase
                                                                ? `${batchProgress.phase} - Pages ${batchProgress.startPage}-${batchProgress.endPage} sur ${batchProgress.totalPages}...`
                                                                : `Pages ${batchProgress.startPage}-${batchProgress.endPage} sur ${batchProgress.totalPages}...`
                                                            : isAnalyzing
                                                                ? 'Analyse du document...'
                                                                : 'Réflexion...'}
                                                    </span>
                                                </div>
                                                {batchProgress && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                                                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                            {batchProgress.current}/{batchProgress.total}
                                                        </span>
                                                    </div>
                                                )}
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
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onFocus={handleInputFocus}
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
            )}
        </>
    )
}

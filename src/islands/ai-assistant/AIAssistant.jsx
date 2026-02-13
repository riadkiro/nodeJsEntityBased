/**
 * AIAssistant - Main floating chat widget component
 * 
 * Architecture:
 * - Floating FAB button (bottom-right) → expands to chat panel
 * - Auto context detection from current page URL & workspace data
 * - Streams responses from the backend AI agent
 * - Supports action cards (create record, validate plan, etc.)
 * - Conversation history per session
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import ChatPanel from './components/ChatPanel'
import ChatFAB from './components/ChatFAB'

// ── SessionStorage keys for conversation persistence across page navigations ──
const STORAGE_KEY = 'ai-assistant-session'

function saveSession(data) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) { /* quota exceeded — silently fail */ }
}

function loadSession() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch (e) { return null }
}

function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY)
}

export default function AIAssistant({ accountNumber, userId, userName, userAvatar, currentPath }) {
    // ── Restore session from sessionStorage ──────────────────
    const savedSession = useMemo(() => loadSession(), [])

    const [isOpen, setIsOpen] = useState(savedSession?.isOpen || false)
    const [messages, setMessages] = useState(savedSession?.messages || [])
    const [isLoading, setIsLoading] = useState(false)
    const [conversationId, setConversationId] = useState(savedSession?.conversationId || null)
    const [context, setContext] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [emailContext, setEmailContext] = useState(null) // email context from mailbox IA button
    const [hasGreeted, setHasGreeted] = useState(savedSession?.hasGreeted || false)

    // ── Auto-detect context from current page ─────────────────
    const detectedContext = useMemo(() => {
        const ctx = {
            currentPath,
            accountNumber,
            page: null,
            entitySlug: null,
            recordId: null,
            section: null,
            timestamp: new Date().toISOString(),
            timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
        }

        // Parse URL pattern: /account/:id/entity/:slug/records/:recordId
        const parts = currentPath.split('/').filter(Boolean)
        const accountIdx = parts.indexOf('account')

        if (accountIdx >= 0 && parts[accountIdx + 2]) {
            const section = parts[accountIdx + 2]

            if (section === 'entity' && parts[accountIdx + 3]) {
                ctx.page = 'entity'
                ctx.entitySlug = parts[accountIdx + 3]

                if (parts[accountIdx + 4] === 'records' && parts[accountIdx + 5]) {
                    ctx.page = 'record-detail'
                    ctx.recordId = parts[accountIdx + 5]
                } else if (parts[accountIdx + 4] === 'records') {
                    ctx.page = 'records-list'
                } else if (parts[accountIdx + 4] === 'kanban') {
                    ctx.page = 'kanban'
                }
            } else if (section === 'home') {
                ctx.page = 'home'
            } else if (section === 'admin') {
                ctx.page = 'admin'
                ctx.section = parts[accountIdx + 3] || 'dashboard'
            } else if (section === 'dashboard') {
                ctx.page = 'dashboard'
                ctx.section = parts[accountIdx + 3] || null
            } else if (section === 'tasks') {
                ctx.page = 'tasks'
            } else if (section === 'mailbox') {
                ctx.page = 'mailbox'
            } else if (section === 'settings' || section === 'studio') {
                ctx.page = section
            } else {
                ctx.page = section
            }
        }

        if (currentPath.startsWith('/superadmin')) {
            ctx.page = 'superadmin'
            ctx.section = parts[1] || 'dashboard'
        }

        return ctx
    }, [currentPath, accountNumber])

    // ── Fetch workspace context on first open ──────────────────
    const fetchContext = useCallback(async () => {
        try {
            const res = await fetch(`/account/${accountNumber}/api/ai-assistant/context`, {
                credentials: 'include',
            })
            if (res.ok) {
                const data = await res.json()
                setContext(data)
            }
        } catch (err) {
            console.error('[AIAssistant] Failed to fetch context:', err)
        }
    }, [accountNumber])

    // ── Send message ───────────────────────────────────────────
    const sendMessage = useCallback(async (text) => {
        if (!text.trim() || isLoading) return

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        }

        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)

        try {
            const res = await fetch(`/account/${accountNumber}/api/ai-assistant/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message: text,
                    conversationId,
                    context: {
                        ...detectedContext,
                        workspace: context,
                        ...(emailContext ? { emailDetail: emailContext } : {}),
                    },
                    history: messages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            })

            if (!res.ok) throw new Error('Failed to send message')

            const data = await res.json()

            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId)
            }

            const assistantMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString(),
                actions: data.actions || null,
                plan: data.plan || null,
            }

            setMessages(prev => [...prev, assistantMsg])

            if (!isOpen) {
                setUnreadCount(prev => prev + 1)
            }
        } catch (err) {
            console.error('[AIAssistant] Send error:', err)
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
                timestamp: new Date().toISOString(),
                isError: true,
            }])
        } finally {
            setIsLoading(false)
        }
    }, [accountNumber, conversationId, context, detectedContext, emailContext, isLoading, isOpen, messages])

    // ── Handle navigate action (client-side) ─────────────────
    // NOTE: This function reads from sessionStorage directly to avoid
    // stale closure issues with `messages` state on repeated navigations
    const handleNavigate = useCallback((action) => {
        const { url, pageName } = action.data || {}
        if (!url) {
            console.warn('[AIAssistant] No URL in navigate action')
            return
        }

        // Read CURRENT session from storage (not from stale state closure)
        const currentSession = loadSession() || {}
        const currentMessages = currentSession.messages || []

        // Add navigation system message
        const navMsg = {
            id: Date.now(),
            role: 'system',
            content: `🧭 Navigation vers **${pageName || url}**...`,
            timestamp: new Date().toISOString(),
            actionType: 'navigating',
        }

        // Save session synchronously BEFORE navigating
        saveSession({
            messages: [...currentMessages, navMsg].slice(-50),
            conversationId: currentSession.conversationId || conversationId,
            isOpen: true,
            hasGreeted: true,
        })

        // Navigate immediately — no React state update needed
        window.location.href = url
    }, [conversationId])

    // ── Execute action (from action card) ──────────────────────
    const executeAction = useCallback(async (action) => {
        // Handle navigate actions client-side (no backend call needed)
        if (action.type === 'navigate') {
            handleNavigate(action)
            return
        }

        setIsLoading(true)

        // Add system message showing action execution
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'system',
            content: `⚡ Exécution: ${action.label}...`,
            timestamp: new Date().toISOString(),
            actionType: 'executing',
        }])

        try {
            const res = await fetch(`/account/${accountNumber}/api/ai-assistant/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    action,
                    conversationId,
                    context: { ...detectedContext, workspace: context },
                }),
            })

            const data = await res.json()

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString(),
                actions: data.nextActions || null,
                result: data.result || null,
            }])
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "❌ L'action a échoué. Veuillez réessayer.",
                timestamp: new Date().toISOString(),
                isError: true,
            }])
        } finally {
            setIsLoading(false)
        }
    }, [accountNumber, conversationId, context, detectedContext, handleNavigate])

    // ── Save session on every state change ────────────────────
    useEffect(() => {
        if (messages.length > 0 || hasGreeted) {
            saveSession({
                messages: messages.slice(-50), // Keep last 50 messages max
                conversationId,
                isOpen,
                hasGreeted,
            })
        }
    }, [messages, conversationId, isOpen, hasGreeted])

    // ── Auto-fetch context if panel was restored open ────────
    useEffect(() => {
        if (isOpen && !context) {
            fetchContext()
        }
    }, []) // only on mount

    // ── Listen for external open-with-context event (from mailbox IA button) ──
    useEffect(() => {
        const handler = (e) => {
            const detail = e.detail || {}
            console.log('[AIAssistant] Received open-with-context event:', detail)

            // Store the email context
            if (detail.emailContext) {
                setEmailContext(detail.emailContext)
            }

            // Clear previous conversation to start fresh with email context
            setMessages([])
            setConversationId(null)
            setHasGreeted(false)
            clearSession()

            // Open the panel
            setIsOpen(true)
            setUnreadCount(0)
            if (!context) fetchContext()

            // If there's an auto-send prompt, send it after a small delay
            if (detail.autoSend) {
                setTimeout(() => {
                    sendMessage(detail.autoSend)
                }, 300)
            }
        }

        window.addEventListener('ai-assistant:open-with-context', handler)
        return () => window.removeEventListener('ai-assistant:open-with-context', handler)
    }, [context, fetchContext, sendMessage])

    // ── Validate/modify plan ───────────────────────────────────
    const validatePlan = useCallback(async (plan, modifications = null) => {
        setIsLoading(true)

        const userResponse = modifications
            ? `✏️ Plan modifié: ${modifications}`
            : '✅ Plan validé, on y va !'

        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'user',
            content: userResponse,
            timestamp: new Date().toISOString(),
        }])

        try {
            const res = await fetch(`/account/${accountNumber}/api/ai-assistant/validate-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    plan,
                    modifications,
                    conversationId,
                    context: { ...detectedContext, workspace: context },
                }),
            })

            const data = await res.json()

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString(),
                actions: data.actions || null,
                plan: data.updatedPlan || null,
            }])
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: "❌ Erreur lors de la validation du plan.",
                timestamp: new Date().toISOString(),
                isError: true,
            }])
        } finally {
            setIsLoading(false)
        }
    }, [accountNumber, conversationId, context, detectedContext])

    // ── Toggle open/close ──────────────────────────────────────
    const toggleOpen = useCallback(() => {
        setIsOpen(prev => {
            const next = !prev
            if (next) {
                setUnreadCount(0)
                if (!context) fetchContext()
                if (!hasGreeted) {
                    setHasGreeted(true)
                    // Greeting is handled by initial message
                }
            }
            return next
        })
    }, [context, fetchContext, hasGreeted])

    // ── Initial greeting message ──────────────────────────────
    useEffect(() => {
        if (isOpen && messages.length === 0 && !hasGreeted) {
            const greeting = detectedContext.timeOfDay === 'morning' ? 'Bonjour' :
                detectedContext.timeOfDay === 'afternoon' ? 'Bon après-midi' : 'Bonsoir'

            let contextHint = ''
            let capabilities = ''

            if (emailContext) {
                contextHint = `📧 J'ai chargé l'email **"${emailContext.subject || '(sans objet)'}"** de ${emailContext.from || emailContext.fromEmail || 'expéditeur inconnu'}. `
                capabilities = `\n\n• 📋 **Résumer** — Obtenir les points clés du mail\n• ✍️ **Répondre** — Rédiger une réponse professionnelle\n• 🔍 **Analyser** — Évaluer le ton et l'urgence\n• 🌐 **Traduire** — Traduire le mail en anglais`
            } else {
                contextHint = detectedContext.entitySlug
                    ? `Je vois que vous êtes sur **${detectedContext.entitySlug}**. `
                    : detectedContext.page === 'home'
                        ? "Vous êtes sur la page d'accueil. "
                        : detectedContext.page === 'tasks'
                            ? "Vous êtes dans les tâches. "
                            : detectedContext.page === 'mailbox'
                                ? "Vous êtes dans la messagerie. "
                                : ''
                capabilities = `\n\n• 📊 **Interroger vos données** — "Combien de patients aujourd'hui ?"\n• ✏️ **Créer des fiches** — "Crée un patient nommé Karim Ali"\n• 🔍 **Chercher** — "Trouve le dossier de François Dupont"\n• 📅 **Planifier** — "Planifie un suivi pour demain"`
            }

            setMessages([{
                id: 1,
                role: 'assistant',
                content: `${greeting} ${userName ? userName.split(' ')[0] : ''} ! 👋\n\n${contextHint}Comment puis-je vous aider ?${capabilities}`,
                timestamp: new Date().toISOString(),
            }])
            setHasGreeted(true)
        }
    }, [isOpen, messages.length, hasGreeted, detectedContext, userName, emailContext])

    // ── Clear conversation ────────────────────────────────────
    const clearConversation = useCallback(() => {
        setMessages([])
        setConversationId(null)
        setHasGreeted(false)
        clearSession()
    }, [])

    return (
        <>
            <ChatFAB
                isOpen={isOpen}
                onClick={toggleOpen}
                unreadCount={unreadCount}
                isLoading={isLoading}
            />

            {isOpen && (
                <ChatPanel
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={sendMessage}
                    onExecuteAction={executeAction}
                    onValidatePlan={validatePlan}
                    onClose={toggleOpen}
                    onClear={clearConversation}
                    userName={userName}
                    userAvatar={userAvatar}
                    detectedContext={detectedContext}
                    emailContext={emailContext}
                />
            )}
        </>
    )
}

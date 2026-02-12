/**
 * ChatPanel - Main chat panel with messages, input, and context indicator
 */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import ChatMessage from './ChatMessage'
import ActionCard from './ActionCard'
import PlanCard from './PlanCard'

export default function ChatPanel({
    messages,
    isLoading,
    onSendMessage,
    onExecuteAction,
    onValidatePlan,
    onClose,
    onClear,
    userName,
    userAvatar,
    detectedContext,
}) {
    const [input, setInput] = useState('')
    const [showContext, setShowContext] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const panelRef = useRef(null)

    // ── Auto-scroll on new messages ───────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // ── Focus input on open ──────────────────────────────────
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    // ── Send on Enter ────────────────────────────────────────
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (input.trim()) {
                onSendMessage(input)
                setInput('')
            }
        }
    }, [input, onSendMessage])

    const handleSubmit = useCallback(() => {
        if (input.trim()) {
            onSendMessage(input)
            setInput('')
        }
    }, [input, onSendMessage])

    // ── Quick actions ────────────────────────────────────────
    const quickActions = [
        { label: "📊 Stats du jour", prompt: "Donne-moi un résumé de l'activité d'aujourd'hui" },
        { label: "➕ Nouveau patient", prompt: "Je veux créer un nouveau patient" },
        { label: "🔍 Chercher", prompt: "Je cherche un dossier" },
    ]

    // ── Context label ────────────────────────────────────────
    const contextLabel = (() => {
        if (!detectedContext) return null
        if (detectedContext.entitySlug) return `📂 ${detectedContext.entitySlug}`
        if (detectedContext.page === 'home') return '🏠 Accueil'
        if (detectedContext.page === 'tasks') return '📋 Tâches'
        if (detectedContext.page === 'admin') return '⚙️ Admin'
        if (detectedContext.page === 'superadmin') return '🛡️ SuperAdmin'
        if (detectedContext.page === 'dashboard') return '📊 Dashboard'
        return null
    })()

    return (
        <div className="ai-panel" ref={panelRef}>
            {/* ── Header ─────────────────────────────────── */}
            <div className="ai-panel__header">
                <div className="ai-panel__header-left">
                    <div className="ai-panel__avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5-1.34C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="ai-panel__title">Assistant IA</h3>
                        <span className="ai-panel__status">
                            {isLoading ? (
                                <>
                                    <span className="ai-panel__status-dot ai-panel__status-dot--active" />
                                    En réflexion...
                                </>
                            ) : (
                                <>
                                    <span className="ai-panel__status-dot ai-panel__status-dot--online" />
                                    En ligne
                                </>
                            )}
                        </span>
                    </div>
                </div>
                <div className="ai-panel__header-actions">
                    {contextLabel && (
                        <button
                            className="ai-panel__context-badge"
                            onClick={() => setShowContext(!showContext)}
                            title="Contexte détecté"
                        >
                            {contextLabel}
                        </button>
                    )}
                    <button className="ai-panel__btn-icon" onClick={onClear} title="Nouvelle conversation">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                    </button>
                    <button className="ai-panel__btn-icon" onClick={onClose} title="Fermer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 14 10 14 10 20" />
                            <polyline points="20 10 14 10 14 4" />
                            <line x1="14" y1="10" x2="21" y2="3" />
                            <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Context Dropdown ────────────────────────── */}
            {showContext && (
                <div className="ai-panel__context-dropdown">
                    <div className="ai-panel__context-row">
                        <span className="ai-panel__context-label">Page</span>
                        <span className="ai-panel__context-value">{detectedContext?.page || '—'}</span>
                    </div>
                    {detectedContext?.entitySlug && (
                        <div className="ai-panel__context-row">
                            <span className="ai-panel__context-label">Collection</span>
                            <span className="ai-panel__context-value">{detectedContext.entitySlug}</span>
                        </div>
                    )}
                    {detectedContext?.recordId && (
                        <div className="ai-panel__context-row">
                            <span className="ai-panel__context-label">Fiche</span>
                            <span className="ai-panel__context-value">{detectedContext.recordId.slice(0, 8)}...</span>
                        </div>
                    )}
                    <div className="ai-panel__context-row">
                        <span className="ai-panel__context-label">Workspace</span>
                        <span className="ai-panel__context-value">#{detectedContext?.accountNumber}</span>
                    </div>
                </div>
            )}

            {/* ── Messages ───────────────────────────────── */}
            <div className="ai-panel__messages">
                {messages.map(msg => (
                    <React.Fragment key={msg.id}>
                        <ChatMessage
                            message={msg}
                            userName={userName}
                            userAvatar={userAvatar}
                        />

                        {/* Action buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                            <div className="ai-panel__actions-container">
                                {msg.actions.map((action, i) => (
                                    <ActionCard
                                        key={i}
                                        action={action}
                                        onExecute={() => onExecuteAction(action)}
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Plan card */}
                        {msg.plan && (
                            <PlanCard
                                plan={msg.plan}
                                onValidate={(mods) => onValidatePlan(msg.plan, mods)}
                                disabled={isLoading}
                            />
                        )}
                    </React.Fragment>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="ai-panel__typing">
                        <div className="ai-panel__typing-dots">
                            <span /><span /><span />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ── Quick actions (only if no messages yet or few messages) ─ */}
            {messages.length <= 1 && (
                <div className="ai-panel__quick-actions">
                    {quickActions.map((qa, i) => (
                        <button
                            key={i}
                            className="ai-panel__quick-btn"
                            onClick={() => onSendMessage(qa.prompt)}
                            disabled={isLoading}
                        >
                            {qa.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Input ──────────────────────────────────── */}
            <div className="ai-panel__input-container">
                <textarea
                    ref={inputRef}
                    className="ai-panel__input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez votre question..."
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    className="ai-panel__send-btn"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

/**
 * AIChatSidebar Component
 * AI Assistant chat interface for the document editor
 * Uses OpenAI via Integration Engine
 */
import React, { useState, useRef, useEffect } from 'react'

export default function AIChatSidebar({ accountNumber }) {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)

    // Get account number from URL if not passed as prop
    const getAccountNumber = () => {
        if (accountNumber) return accountNumber
        const match = window.location.pathname.match(/\/account\/([^/]+)/)
        return match ? match[1] : null
    }

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Send message to OpenAI via Integration Engine
    const sendMessage = async (userMessage) => {
        const accNum = getAccountNumber()
        if (!accNum) {
            setError('Numéro de compte introuvable')
            return
        }

        setIsLoading(true)
        setError(null)

        // Add user message to chat
        const userMsg = { role: 'user', content: userMessage }
        setMessages(prev => [...prev, userMsg])

        try {
            // Build conversation history for context
            const conversationHistory = [
                {
                    role: 'system',
                    content: 'Tu es un assistant d\'écriture professionnel. Tu aides l\'utilisateur à rédiger, corriger et améliorer ses documents. Réponds de manière concise et utile en français.'
                },
                ...messages.map(m => ({ role: m.role, content: m.content })),
                userMsg
            ]

            // Call Integration Engine to execute OpenAI action
            const response = await fetch(`/account/${accNum}/integrations/openai/actions/chat-completion/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    input: {
                        model: 'gpt-4o-mini',
                        messages: conversationHistory,
                        temperature: 0.7,
                        max_tokens: 1000
                    }
                })
            })

            const result = await response.json()

            if (result.success && result.data) {
                // Extract content from mapped response
                const assistantContent = result.data.content || result.data.choices?.[0]?.message?.content || 'Pas de réponse'

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: assistantContent
                }])
            } else {
                // Handle error
                const errorMsg = result.error || 'Erreur lors de la communication avec l\'IA'
                setError(errorMsg)

                // Check if it's a connection error
                if (errorMsg.includes('Not connected') || errorMsg.includes('connection')) {
                    setError('OpenAI non connecté. Allez dans Intégrations > OpenAI pour configurer votre clé API.')
                }
            }
        } catch (err) {
            console.error('AI Chat error:', err)
            setError('Erreur de connexion au service IA')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!message.trim() || isLoading) return

        sendMessage(message.trim())
        setMessage('')
    }

    // Quick action handlers
    const handleQuickAction = (action) => {
        const prompts = {
            'improve': 'Améliore le style et la clarté du texte suivant :',
            'correct': 'Corrige les fautes d\'orthographe et de grammaire du texte suivant :',
            'summarize': 'Résume le contenu suivant de manière concise :'
        }

        // Get selected text if any
        const selection = window.getSelection()
        const selectedText = selection?.toString()?.trim()

        if (selectedText) {
            sendMessage(`${prompts[action]}\n\n"${selectedText}"`)
        } else {
            sendMessage(prompts[action] + ' (Sélectionnez du texte dans le document puis réessayez)')
        }
    }

    const clearChat = () => {
        setMessages([])
        setError(null)
    }

    return (
        <div className="w-80 bg-white dark:bg-gray-900 border-l dark:border-gray-800 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                            <iconify-icon icon="tabler:sparkles" width="22" className="text-white"></iconify-icon>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Assistant</h3>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">IA</h2>
                        </div>
                    </div>
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
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                            <iconify-icon icon="tabler:message-chatbot" width="32" className="text-primary"></iconify-icon>
                        </div>
                        <h3 className="text-sm font-bold text-gray-200 mb-2">
                            Comment puis-je vous aider ?
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                            Posez une question sur votre document ou demandez-moi de vous aider à rédiger, corriger ou améliorer votre contenu.
                        </p>

                        {/* Quick Actions */}
                        <div className="mt-6 space-y-2 w-full">
                            <button
                                onClick={() => handleQuickAction('improve')}
                                className="w-full px-4 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group"
                            >
                                <iconify-icon icon="tabler:wand" width="16" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                Améliorer le style
                            </button>
                            <button
                                onClick={() => handleQuickAction('correct')}
                                className="w-full px-4 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group"
                            >
                                <iconify-icon icon="tabler:language" width="16" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                Corriger l'orthographe
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
                                        : 'bg-[#1e3a5f] text-gray-300 rounded-2xl rounded-bl-sm'
                                        }`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-[#1e3a5f]">
                                    <div className="flex items-center gap-2">
                                        <iconify-icon icon="tabler:loader-2" width="16" className="animate-spin text-primary"></iconify-icon>
                                        <span className="text-sm text-gray-400">Réflexion en cours...</span>
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
                        placeholder="Posez une question..."
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
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
                    Entrée pour envoyer • Shift+Entrée pour nouvelle ligne
                </p>
            </div>
        </div>
    )
}

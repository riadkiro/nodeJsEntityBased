/**
 * AIChatSidebar Component
 * AI Assistant chat interface for the document editor
 * Replaces the old RightSidebar (document settings)
 */
import React, { useState } from 'react'

export default function AIChatSidebar() {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!message.trim()) return

        // Add user message (AI functionality to be implemented later)
        setMessages(prev => [...prev, { role: 'user', content: message }])
        setMessage('')
    }

    return (
        <div className="w-80 bg-white dark:bg-gray-900 border-l dark:border-gray-800 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                        <iconify-icon icon="tabler:sparkles" width="22" className="text-white"></iconify-icon>
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Assistant</h3>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">IA</h2>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-auto p-4" style={{ scrollbarColor: '#64748b transparent', scrollbarWidth: 'thin' }}>
                {messages.length === 0 ? (
                    // Empty State
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                            <iconify-icon icon="tabler:message-chatbot" width="32" className="text-primary"></iconify-icon>
                        </div>
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                            Comment puis-je vous aider ?
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                            Posez une question sur votre document ou demandez-moi de vous aider à rédiger, corriger ou améliorer votre contenu.
                        </p>

                        {/* Quick Actions */}
                        <div className="mt-6 space-y-2 w-full">
                            <button className="w-full px-4 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group">
                                <iconify-icon icon="tabler:wand" width="16" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                Améliorer le style
                            </button>
                            <button className="w-full px-4 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group">
                                <iconify-icon icon="tabler:language" width="16" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                Corriger l'orthographe
                            </button>
                            <button className="w-full px-4 py-2.5 text-xs text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group">
                                <iconify-icon icon="tabler:file-text" width="16" className="text-gray-400 group-hover:text-primary transition-colors"></iconify-icon>
                                Résumer le document
                            </button>
                        </div>
                    </div>
                ) : (
                    // Messages List
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-br-md'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-md'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
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
                        className="w-full px-4 py-3 pr-12 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 focus:border-transparent focus:outline-none transition-all"
                        rows="2"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                    >
                        <iconify-icon icon="tabler:send" width="16"></iconify-icon>
                    </button>
                </form>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
                    Entrée pour envoyer • Shift+Entrée pour nouvelle ligne
                </p>
            </div>
        </div>
    )
}

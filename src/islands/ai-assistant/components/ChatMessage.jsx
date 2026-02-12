/**
 * ChatMessage - Individual message bubble with markdown-like rendering
 */
import React, { useMemo } from 'react'

export default function ChatMessage({ message, userName, userAvatar }) {
    const isUser = message.role === 'user'
    const isSystem = message.role === 'system'

    // Simple markdown-like rendering (bold, bullet points, line breaks)
    const formattedContent = useMemo(() => {
        if (!message.content) return ''

        let html = message.content
            // Escape HTML
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Line breaks
            .replace(/\n/g, '<br/>')
            // Bullet points
            .replace(/^• /gm, '<span class="ai-msg__bullet">•</span> ')

        return html
    }, [message.content])

    if (isSystem) {
        return (
            <div className="ai-msg ai-msg--system">
                <div className="ai-msg__system-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
        )
    }

    const timeStr = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <div className={`ai-msg ${isUser ? 'ai-msg--user' : 'ai-msg--assistant'} ${message.isError ? 'ai-msg--error' : ''}`}>
            {!isUser && (
                <div className="ai-msg__avatar ai-msg__avatar--bot">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5-1.34C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                </div>
            )}
            <div className="ai-msg__bubble">
                <div className="ai-msg__content" dangerouslySetInnerHTML={{ __html: formattedContent }} />
                <span className="ai-msg__time">{timeStr}</span>
            </div>
            {isUser && (
                <div className="ai-msg__avatar ai-msg__avatar--user">
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} />
                    ) : (
                        <span>{(userName || 'U').charAt(0).toUpperCase()}</span>
                    )}
                </div>
            )}
        </div>
    )
}

/**
 * ChatFAB - Floating Action Button for AI Assistant
 * Sits in bottom-right corner. Pulse animation when idle, loading ring when processing.
 * Shows a contextual email indicator when an email is selected in the mailbox.
 */
import React from 'react'

export default function ChatFAB({ isOpen, onClick, unreadCount, isLoading, hasEmailContext }) {
    return (
        <button
            className={`ai-fab ${isOpen ? 'ai-fab--open' : ''} ${isLoading ? 'ai-fab--loading' : ''} ${hasEmailContext && !isOpen ? 'ai-fab--has-context' : ''}`}
            onClick={onClick}
            aria-label={isOpen ? 'Fermer l\'assistant' : 'Ouvrir l\'assistant IA'}
        >
            {/* Pulse ring */}
            {!isOpen && !isLoading && !hasEmailContext && (
                <span className="ai-fab__pulse" />
            )}

            {/* Context pulse (email detected) */}
            {!isOpen && !isLoading && hasEmailContext && (
                <span className="ai-fab__context-pulse" />
            )}

            {/* Loading ring */}
            {isLoading && (
                <span className="ai-fab__spinner" />
            )}

            {/* Icon */}
            <span className="ai-fab__icon">
                {isOpen ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5-1.34C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 .9 3 2s-1.34 2-3 2-3-.9-3-2 1.34-2 3-2zm-4.5 8.5c0-1.1 2.01-2 4.5-2s4.5.9 4.5 2v.5h-9v-.5z" />
                        <circle cx="9" cy="10" r="1.2" />
                        <circle cx="15" cy="10" r="1.2" />
                    </svg>
                )}
            </span>

            {/* Email context badge */}
            {hasEmailContext && !isOpen && !unreadCount && (
                <span className="ai-fab__context-badge" title="Email détecté — cliquez pour des suggestions IA">
                    📧
                </span>
            )}

            {/* Unread badge */}
            {unreadCount > 0 && !isOpen && (
                <span className="ai-fab__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
        </button>
    )
}

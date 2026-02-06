import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * ChatPanelIsland - Pixel-perfect React island replicating the doctor dashboard communication panel.
 * 
 * Props:
 * - title: string (default: "Coordination — Secrétariat")
 * - teamMembers: array of { id, name, initial, color, gradient, isOnline }
 * - activities: array of { id, author, title, time, type, icon, badge }
 * - quickActions: array of { id, label, icon, type, action }
 * - onSendMessage: function(message)
 * - onQuickAction: function(actionId)
 * - onFilterChange: function(filterId)
 */
export default function ChatPanelIsland({
    title = "Coordination — Secrétariat",
    teamMembers = [],
    activities: initialActivities = [],
    quickActions = [],
    onSendMessage,
    onQuickAction,
    onFilterChange
}) {
    const [filter, setFilter] = useState('all');
    const [actionsOpen, setActionsOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState(initialActivities);
    const chatMessagesRef = useRef(null);

    // Sync with props when they change
    useEffect(() => {
        setMessages(initialActivities);
    }, [initialActivities]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFilterChange = useCallback((filterId) => {
        setFilter(filterId);
        if (onFilterChange) onFilterChange(filterId);
    }, [onFilterChange]);

    const handleSendMessage = useCallback(() => {
        if (newMessage.trim()) {
            // Add message to local state
            const newMsg = {
                id: Date.now(),
                author: 'Dr',
                title: newMessage.trim(),
                time: "à l'instant",
                type: 'primary',
                icon: 'Dr'
            };
            setMessages(prev => [...prev, newMsg]);

            // Call parent callback
            if (onSendMessage) onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    }, [newMessage, onSendMessage]);

    const handleQuickAction = useCallback((actionId, quickActions) => {
        // Map action IDs to display labels
        const actionLabels = {
            next_patient: 'Patient suivant',
            rdv_3m: 'RDV dans 3 mois',
            rdv_6m: 'RDV dans 6 mois',
            control_15d: 'Contrôle dans 15 jours',
            come_now: 'Viens maintenant !'
        };

        const actionTypes = {
            next_patient: 'primary',
            rdv_3m: 'info',
            rdv_6m: 'info',
            control_15d: 'warning',
            come_now: 'danger'
        };

        // Add action message to chat
        const newMsg = {
            id: Date.now(),
            author: 'Dr',
            title: actionLabels[actionId] || actionId,
            time: "à l'instant",
            type: actionTypes[actionId] || 'primary',
            icon: 'Dr'
        };
        setMessages(prev => [...prev, newMsg]);

        // Call parent callback
        if (onQuickAction) onQuickAction(actionId);
        setActionsOpen(false);
    }, [onQuickAction]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Count online members
    const onlineCount = teamMembers.filter(m => m.isOnline).length;

    return (
        <div className="panel h-full p-0 flex flex-col">
            {/* Unified Header */}
            <div className="flex items-center justify-between border-b border-[#e0e6ed] px-5 py-4 dark:border-[#1b2e4b]">
                <h5 className="text-lg font-semibold dark:text-white-light">{title}</h5>
                {/* Filter Avatars with online indicator */}
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-success/20 text-success">
                        {onlineCount} en ligne
                    </span>
                    <div className="flex items-center gap-1">
                        {/* All team filter */}
                        <div className={`flex items-center gap-1.5 rounded-full transition-all duration-200 ${filter === 'all' ? 'bg-primary/20 pr-3' : ''}`}>
                            <button
                                onClick={() => handleFilterChange('all')}
                                className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[11px] font-bold transition-all duration-200 ${filter === 'all' ? '' : 'opacity-60 hover:opacity-100'}`}
                                title="Toute l'équipe">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </button>
                            {filter === 'all' && (
                                <span className="text-xs text-primary font-medium">Équipe</span>
                            )}
                        </div>
                        {/* Team members */}
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className={`flex items-center gap-1.5 rounded-full transition-all duration-200 ${filter === member.id ? `bg-${member.color}/20 pr-3` : ''}`}>
                                <button
                                    onClick={() => handleFilterChange(member.id)}
                                    className={`relative h-7 w-7 shrink-0 rounded-full text-white text-[11px] font-bold transition-all duration-200 flex items-center justify-center shadow-sm ${filter === member.id ? '' : 'opacity-60 hover:opacity-100'}`}
                                    style={{ background: member.gradient }}
                                    title={member.name}>
                                    {member.initial}
                                    {member.isOnline && (
                                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-[#0e1726]"></span>
                                    )}
                                </button>
                                {filter === member.id && (
                                    <span className={`text-xs text-${member.color} font-medium`}>{member.name}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Width Chat Area */}
            <div className="p-5">
                {/* Chat Messages - Container avec hauteur fixe et scroll permanent */}
                <div ref={chatMessagesRef} className="overflow-y-auto space-y-3" style={{ maxHeight: '400px' }}>
                    {messages.map((activity) => (
                        <div
                            key={activity.id}
                            className={`flex gap-2 ${activity.author === 'Dr' ? 'justify-end' : 'justify-start'}`}>
                            {/* Avatar for left messages (Secrétariat/Système) */}
                            {activity.author !== 'Dr' && (
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-${activity.type}/20 text-${activity.type}`}>
                                    <span>{activity.icon}</span>
                                </div>
                            )}

                            {/* Message bubble */}
                            <div className="max-w-[70%]">
                                {/* Author name (only for non-Dr messages) */}
                                {activity.author !== 'Dr' && (
                                    <div className="text-xs text-white-dark mb-1 px-1">{activity.author}</div>
                                )}

                                {/* Bubble content */}
                                <div className={`rounded-lg px-3 mb-2 py-2 text-white-light ${activity.author === 'Dr' ? `bg-${activity.type}/20` : 'bg-dark'}`}>
                                    <div className="text-sm">{activity.title}</div>
                                    <div className="flex items-center justify-between gap-3 mt-1">
                                        {activity.badge && (
                                            <span className="badge text-[10px] px-2 py-0.5 bg-danger">{activity.badge}</span>
                                        )}
                                        <span className="text-[10px] opacity-70 ml-auto">{activity.time}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Avatar for right messages (Dr) */}
                            {activity.author === 'Dr' && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                                    Dr
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Section at bottom */}
                <div className="border-t border-[#e0e6ed] dark:border-[#1b2e4b] relative">
                    {/* Dropup Menu */}
                    {actionsOpen && (
                        <div
                            style={{ width: '350px', left: 0 }}
                            className="absolute bottom-full z-50 mb-3 p-4 bg-[#1b2e4b] border border-white-dark/20 dark:border-[#1b2e4b] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] rounded-xl backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-2">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleQuickAction(action.id)}
                                        className={`rounded-lg px-2 py-2.5 text-xs text-white-light hover:bg-${action.type}/20 transition flex flex-col items-center justify-center gap-1 ${index === quickActions.length - 1 ? 'col-span-2' : ''}`}
                                        style={{ background: action.bgColor }}>
                                        <span className={`h-4 w-4 text-${action.type}`} dangerouslySetInnerHTML={{ __html: action.icon }}></span>
                                        <span className="text-[10px]">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input row */}
                    <div className="flex gap-2 items-center p-4">
                        {/* Plus button to toggle actions */}
                        <button
                            onClick={() => setActionsOpen(!actionsOpen)}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${actionsOpen ? 'bg-primary text-white rotate-45' : 'bg-[#1b2e4b] text-white-dark hover:text-white'}`}>
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message..."
                            className="form-input text-sm py-2 flex-1"
                        />
                        <button onClick={handleSendMessage} className="btn btn-primary px-4 shrink-0">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

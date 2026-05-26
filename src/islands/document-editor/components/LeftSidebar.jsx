/**
 * LeftSidebar Component
 * Icon buttons for text, gallery, layout, dynamic content panels
 * Enhanced with: more draggable blocks, professional content elements,
 * table templates, callout boxes, signature blocks
 */
import React, { useState, useEffect } from 'react'
import SettingsPanel from './SettingsPanel'
import useTouchDrag from '../hooks/useTouchDrag'

// Detect dark mode reliably - checks localStorage first (Alpine.$persist stores theme there)
// then falls back to DOM class detection. Uses MutationObserver for reactivity.
function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage first - Alpine.$persist stores theme as '_x_theme'
        // This is available immediately, even before Alpine processes :class bindings
        try {
            const stored = localStorage.getItem('_x_theme');
            if (stored) {
                // Handle both JSON format ("dark") and plain string (dark)
                let theme;
                try { theme = JSON.parse(stored); } catch (e) { theme = stored; }
                if (theme === 'dark') return true;
                if (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) return true;
                if (theme === 'light') return false;
            }
        } catch (e) { /* ignore */ }
        // Fallback to DOM class check
        return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    });

    useEffect(() => {
        // Watch for Alpine adding/removing 'dark' class on body
        const observer = new MutationObserver(() => {
            const dark = document.body.classList.contains('dark') || document.documentElement.classList.contains('dark');
            setIsDark(dark);
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Also do an immediate re-check after a short delay (Alpine init)
        const timer = setTimeout(() => {
            const dark = document.body.classList.contains('dark') || document.documentElement.classList.contains('dark');
            setIsDark(dark);
        }, 100);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, []);

    return isDark;
}

export default function LeftSidebar({
    activeTab,
    setActiveTab,
    insertVariableToken,
    insertDynamicTable,
    isSettingsOpen,
    onSettingsToggle,
    settingsPanelProps,
    doc,
    setDoc,
    triggerSave,
    accountNumber,
    isTemplateMode
}) {
    const toggleTab = (tab) => {
        setActiveTab(activeTab === tab ? null : tab)
    }

    // Detect dark mode reactively - works even before Alpine applies :class
    const isDark = useDarkMode();
    const panelBg = isDark ? '#0e1726' : '#ffffff';
    const borderColor = isDark ? '#1b2e4b' : '#e0e6ed';
    const textColor = isDark ? '#e0e6ed' : '#374151';

    return (
        <div className="relative flex" style={{ zIndex: 30 }}>
            {/* Toolbar (Left) */}
            <div className="w-12 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col items-center py-2 gap-1.5">
                {/* Text Tool */}
                <button
                    className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${activeTab === 'text'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Texte et Contenu"
                    onClick={() => toggleTab('text')}
                >
                    <iconify-icon icon="solar:text-bold-duotone" width="18"></iconify-icon>
                </button>

                {/* Gallery Tool */}
                <button
                    className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${activeTab === 'gallery'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Médiathèque"
                    onClick={() => toggleTab('gallery')}
                >
                    <iconify-icon icon="solar:gallery-bold-duotone" width="18"></iconify-icon>
                </button>

                <div className="h-px w-6 bg-gray-200 dark:bg-gray-700"></div>

                {/* Blocks Tool */}
                <button
                    className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${activeTab === 'blocks'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Blocs de contenu"
                    onClick={() => toggleTab('blocks')}
                >
                    <iconify-icon icon="solar:widget-4-bold-duotone" width="18"></iconify-icon>
                </button>

                {/* Layout Tools */}
                <button
                    className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${activeTab === 'layouts'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Mises en page"
                    onClick={() => toggleTab('layouts')}
                >
                    <iconify-icon icon="solar:layers-minimalistic-bold-duotone" width="18"></iconify-icon>
                </button>

                <div className="h-px w-6 bg-gray-200 dark:bg-gray-700"></div>

                {/* Dynamic Content */}
                <button
                    className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${
                        !isTemplateMode
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : activeTab === 'dynamic-nav'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                    }`}
                    title={isTemplateMode ? 'Contenu Dynamique' : 'Disponible uniquement en mode template'}
                    onClick={() => isTemplateMode && toggleTab('dynamic-nav')}
                    style={!isTemplateMode ? { opacity: 0.5 } : {}}
                >
                    <iconify-icon icon="solar:database-bold-duotone" width="18"></iconify-icon>
                </button>

                <div className="h-px w-6 bg-gray-200 dark:bg-gray-700"></div>

                {/* Page Settings */}
                <button
                    className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${activeTab === 'page-settings'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Paramètres de page"
                    onClick={() => toggleTab('page-settings')}
                >
                    <iconify-icon icon="solar:settings-minimalistic-bold-duotone" width="18"></iconify-icon>
                </button>

                {/* Spacer to push settings to bottom */}
                <div className="flex-1"></div>

                {/* Settings Button */}
                <button
                    className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${isSettingsOpen
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white-light/40 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 text-gray-400'
                        }`}
                    title="Paramètres du document"
                    onClick={onSettingsToggle}
                >
                    <iconify-icon icon="solar:settings-bold-duotone" width="18"></iconify-icon>
                </button>
            </div>

            {/* Panel Content */}
            {activeTab && (
                <div className="absolute top-0 bottom-0 flex flex-col shadow-xl" style={{ width: '240px', marginLeft: '49px', background: panelBg, borderRight: `1px solid ${borderColor}`, zIndex: 50 }}>
                    {/* Panel Header */}
                    <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 600, color: textColor, margin: 0 }}>
                            {activeTab === 'text' && 'Texte et Contenu'}
                            {activeTab === 'gallery' && 'Médiathèque'}
                            {activeTab === 'blocks' && 'Blocs de contenu'}
                            {activeTab === 'layouts' && 'Mises en page'}
                            {activeTab === 'dynamic-nav' && 'Contenu Dynamique'}
                            {activeTab === 'page-settings' && 'Paramètres de page'}
                        </h3>
                        <button
                            onClick={() => setActiveTab(null)}
                            style={{ padding: '4px', borderRadius: '4px', cursor: 'pointer', border: 'none', background: 'transparent', color: isDark ? '#6b7280' : '#9ca3af' }}
                        >
                            <iconify-icon icon="tabler:x" width="16"></iconify-icon>
                        </button>
                    </div>

                    {/* Panel Body */}
                    <div className="flex-1 overflow-auto" style={{ padding: '16px', scrollbarColor: '#64748b transparent', scrollbarWidth: 'thin', background: panelBg }}>
                        {activeTab === 'text' && (
                            <TextPanel />
                        )}
                        {activeTab === 'gallery' && (
                            <GalleryPanel accountNumber={accountNumber} doc={doc} />
                        )}
                        {activeTab === 'blocks' && (
                            <BlocksPanel insertDynamicTable={insertDynamicTable} accountNumber={accountNumber} doc={doc} />
                        )}
                        {activeTab === 'layouts' && (
                            <LayoutsPanel doc={doc} setDoc={setDoc} triggerSave={triggerSave} />
                        )}
                        {activeTab === 'dynamic-nav' && (
                            <DynamicNavPanel insertVariableToken={insertVariableToken} insertDynamicTable={insertDynamicTable} accountNumber={accountNumber} doc={doc} />
                        )}
                        {activeTab === 'page-settings' && (
                            <PageSettingsPanel doc={doc} setDoc={setDoc} triggerSave={triggerSave} settingsPanelProps={settingsPanelProps} />
                        )}
                    </div>
                </div>
            )}
            {/* Settings Panel - rendered here to share relative positioning context */}
            {settingsPanelProps && <SettingsPanel {...settingsPanelProps} />}
        </div>
    )
}

// Draggable block component - supports both mouse drag (HTML5) and touch drag (long press)
function DraggableBlock({ icon, label, description, html, plainText }) {
    const isDark = useDarkMode();
    const { elRef, touchHandlers } = useTouchDrag({ html, label, icon, isDark });

    return (
        <div
            ref={elRef}
            className="sortable-source"
            style={{
                padding: '10px 12px',
                border: `1px dashed ${isDark ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '8px',
                cursor: 'move',
                transition: 'border-color 0.15s, background-color 0.15s, transform 0.2s, box-shadow 0.2s, opacity 0.2s',
                marginBottom: '6px',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                touchAction: 'auto',
            }}
            draggable="true"
            onDragStart={(e) => {
                e.dataTransfer.setData('text/html', html)
                e.dataTransfer.setData('text/plain', plainText || label)
                e.dataTransfer.effectAllowed = 'copy'
            }}
            {...touchHandlers}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4361ee';
                e.currentTarget.style.backgroundColor = 'rgba(67,97,238,0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? '#4b5563' : '#d1d5db';
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isDark ? '#1f2937' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isDark ? '#9ca3af' : '#6b7280', flexShrink: 0
                }}>
                    <iconify-icon icon={icon} width="18"></iconify-icon>
                </div>
                <div style={{ minWidth: 0 }}>
                    <span style={{
                        fontSize: '13px', fontWeight: 500, display: 'block',
                        color: isDark ? '#e5e7eb' : '#374151'
                    }}>{label}</span>
                    {description && (
                        <span style={{
                            fontSize: '10px', display: 'block', marginTop: '2px',
                            color: isDark ? '#6b7280' : '#9ca3af'
                        }}>{description}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

// Touchable image wrapper for gallery items — adds touch drag support
function TouchableImage({ html, children, className, style, title }) {
    const isDark = useDarkMode();
    const { elRef, touchHandlers } = useTouchDrag({
        html,
        label: '📷 Image',
        icon: 'tabler:photo',
        isDark,
    });

    return (
        <div
            ref={elRef}
            draggable="true"
            onDragStart={(e) => {
                e.dataTransfer.setData('text/html', html)
                e.dataTransfer.effectAllowed = 'copy'
            }}
            {...touchHandlers}
            className={className}
            style={{ ...style, touchAction: 'auto', WebkitUserSelect: 'none' }}
            title={title}
        >
            {children}
        </div>
    )
}


function TextPanel() {
    return (
        <div>
            <p style={{ fontSize: '11px', color: '#888ea8', marginBottom: '12px' }}>
                Glissez un élément sur la page pour l'ajouter.
            </p>

            <DraggableBlock
                icon="tabler:heading"
                label="Titre"
                description="Titre principal H1"
                html='<h1 style="font-size:2em;font-weight:bold;margin-bottom:0.5em;">Titre</h1><p><br></p>'
                plainText="Titre"
            />

            <DraggableBlock
                icon="tabler:h-2"
                label="Sous-titre"
                description="Titre secondaire H2"
                html='<h2 style="font-size:1.5em;font-weight:bold;margin-bottom:0.5em;">Sous-titre</h2><p><br></p>'
                plainText="Sous-titre"
            />

            <DraggableBlock
                icon="tabler:text-size"
                label="Paragraphe"
                description="Bloc de texte standard"
                html='<p style="margin-bottom:1em;line-height:1.6;">Paragraphe de texte. Cliquez pour modifier le contenu.</p>'
                plainText="Paragraphe"
            />

            <DraggableBlock
                icon="tabler:list"
                label="Liste à puces"
                description="Liste non ordonnée"
                html='<ul style="padding-left:2em;margin-bottom:1em;"><li style="margin-bottom:0.3em;">Premier élément</li><li style="margin-bottom:0.3em;">Deuxième élément</li><li style="margin-bottom:0.3em;">Troisième élément</li></ul><p><br></p>'
                plainText="Liste"
            />

            <DraggableBlock
                icon="tabler:list-numbers"
                label="Liste numérotée"
                description="Liste ordonnée"
                html='<ol style="padding-left:2em;margin-bottom:1em;"><li style="margin-bottom:0.3em;">Premier élément</li><li style="margin-bottom:0.3em;">Deuxième élément</li><li style="margin-bottom:0.3em;">Troisième élément</li></ol><p><br></p>'
                plainText="Liste numérotée"
            />

            <DraggableBlock
                icon="tabler:separator-horizontal"
                label="Séparateur"
                description="Ligne horizontale"
                html={`<div class="doc-separator-container" style="width: 100%; display: block; margin: 16px 0;" tabindex="0">
                    <div class="doc-separator-line" style="border-top: 2px solid #e5e7eb; display: inline-block; position: relative; min-height: 8px; width: 100%; cursor: pointer;">
                        <div class="doc-resize-handle" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 8px; height: 20px; background: #3b82f6; border-radius: 4px; cursor: ew-resize; opacity: 0; transition: opacity 0.2s;" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0'" onmousedown="(function(e){e.preventDefault();e.stopPropagation();const line=e.target.parentElement;const startX=e.clientX;const startW=line.offsetWidth;const onMouseMove=function(ev){const dx=ev.clientX-startX;const newW=Math.max(50,startW+dx);line.style.width=newW+'px';};const onMouseUp=function(){document.removeEventListener('mousemove',onMouseMove);document.removeEventListener('mouseup',onMouseUp);};document.addEventListener('mousemove',onMouseMove);document.addEventListener('mouseup',onMouseUp);})(event)"></div>
                    </div>
                </div><br><br>`}
                plainText="---"
            />
        </div>
    )
}

// Blocks Panel - Professional content blocks
function BlocksPanel({ insertDynamicTable, accountNumber, doc }) {
    const isDark = useDarkMode();
    const [lineSchemas, setLineSchemas] = useState([]);

    // Fetch line schemas for dynamic tables section
    useEffect(() => {
        if (!doc?._id || !accountNumber) return;
        const fetchSchemas = async () => {
            try {
                const res = await fetch(`/account/${accountNumber}/api/smartdoc/variables/${doc._id}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success && data.variables?.lineSchemas) {
                    setLineSchemas(data.variables.lineSchemas);
                }
            } catch (e) {
                console.warn('[BlocksPanel] Could not load line schemas:', e);
            }
        };
        fetchSchemas();
    }, [doc?._id, accountNumber, JSON.stringify(doc?.entityIds || []), JSON.stringify((doc?.linkedRecords || []).map(r => r.entityId))]);

    return (
        <div>
            <p style={{ fontSize: '11px', color: '#888ea8', marginBottom: '12px' }}>
                Blocs professionnels prêts à l'emploi.
            </p>

            <DraggableBlock
                icon="tabler:table"
                label="Tableau simple"
                description="3 colonnes × 4 lignes"
                html={`<table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <thead><tr>
                        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#f3f4f6;text-align:left;font-weight:600;font-size:14px;">Colonne 1</th>
                        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#f3f4f6;text-align:left;font-weight:600;font-size:14px;">Colonne 2</th>
                        <th style="border:1px solid #d1d5db;padding:8px 12px;background:#f3f4f6;text-align:left;font-weight:600;font-size:14px;">Colonne 3</th>
                    </tr></thead>
                    <tbody>
                        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td></tr>
                        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td></tr>
                        <tr><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td><td style="border:1px solid #d1d5db;padding:8px 12px;font-size:14px;">&nbsp;</td></tr>
                    </tbody>
                </table><p><br></p>`}
                plainText="Tableau"
            />

            <DraggableBlock
                icon="tabler:blockquote"
                label="Citation"
                description="Bloc citation avec bordure"
                html={`<blockquote style="margin:1em 0;padding:12px 16px;border-left:4px solid #3b82f6;background:#eff6ff;font-style:italic;color:#374151;border-radius:0 8px 8px 0;">
                    <p style="margin:0;">Insérez votre citation ici. Les mots ont le pouvoir de changer le monde.</p>
                    <footer style="margin-top:8px;font-style:normal;font-size:0.85em;color:#6b7280;">— Auteur</footer>
                </blockquote><p><br></p>`}
                plainText="Citation"
            />

            <DraggableBlock
                icon="tabler:alert-triangle"
                label="Encadré attention"
                description="Bloc d'avertissement jaune"
                html={`<div style="margin:16px 0;padding:16px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;display:flex;align-items:flex-start;gap:12px;">
                    <span style="font-size:20px;">⚠️</span>
                    <div>
                        <p style="margin:0 0 4px 0;font-weight:600;color:#92400e;">Attention</p>
                        <p style="margin:0;color:#78350f;font-size:14px;">Description de l'avertissement ou note importante.</p>
                    </div>
                </div><p><br></p>`}
                plainText="Attention"
            />

            <DraggableBlock
                icon="tabler:info-circle"
                label="Note d'info"
                description="Bloc informatif bleu"
                html={`<div style="margin:16px 0;padding:16px;background:#dbeafe;border:1px solid #3b82f6;border-radius:8px;display:flex;align-items:flex-start;gap:12px;">
                    <span style="font-size:20px;">ℹ️</span>
                    <div>
                        <p style="margin:0 0 4px 0;font-weight:600;color:#1e40af;">Information</p>
                        <p style="margin:0;color:#1e3a5f;font-size:14px;">Information complémentaire ou note explicative.</p>
                    </div>
                </div><p><br></p>`}
                plainText="Info"
            />

            <DraggableBlock
                icon="tabler:circle-check"
                label="Note de succès"
                description="Bloc de confirmation vert"
                html={`<div style="margin:16px 0;padding:16px;background:#dcfce7;border:1px solid #22c55e;border-radius:8px;display:flex;align-items:flex-start;gap:12px;">
                    <span style="font-size:20px;">✅</span>
                    <div>
                        <p style="margin:0 0 4px 0;font-weight:600;color:#166534;">Validé</p>
                        <p style="margin:0;color:#14532d;font-size:14px;">Cette action a été confirmée avec succès.</p>
                    </div>
                </div><p><br></p>`}
                plainText="Succès"
            />

            <DraggableBlock
                icon="tabler:signature"
                label="Bloc signature"
                description="Zone de signature professionnelle"
                html={`<div style="margin:40px 0 16px 0;">
                    <div style="display:flex;justify-content:space-between;gap:40px;">
                        <div style="flex:1;text-align:center;">
                            <div style="border-bottom:1px solid #9ca3af;margin-bottom:8px;min-height:60px;"></div>
                            <p style="margin:0;font-size:12px;color:#6b7280;">Signature</p>
                            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Date : ___/___/______</p>
                        </div>
                        <div style="flex:1;text-align:center;">
                            <div style="border-bottom:1px solid #9ca3af;margin-bottom:8px;min-height:60px;"></div>
                            <p style="margin:0;font-size:12px;color:#6b7280;">Signature</p>
                            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Date : ___/___/______</p>
                        </div>
                    </div>
                </div><p><br></p>`}
                plainText="Signature"
            />

            <DraggableBlock
                icon="tabler:code"
                label="Bloc de code"
                description="Zone de code avec fond gris"
                html={`<pre style="margin:16px 0;padding:16px;background:#1f2937;color:#e5e7eb;border-radius:8px;font-family:'Courier New',monospace;font-size:13px;line-height:1.6;overflow-x:auto;white-space:pre-wrap;"><code>// Votre code ici
function example() {
    return "Hello World";
}</code></pre><p><br></p>`}
                plainText="Code"
            />

            <DraggableBlock
                icon="tabler:checklist"
                label="Liste de validation"
                description="Checklist avec cases à cocher"
                html={`<div style="margin:16px 0;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                    <p style="margin:0 0 12px;font-weight:600;font-size:14px;">Checklist</p>
                    <p style="margin:0 0 6px;font-size:14px;">☐ Premier point à vérifier</p>
                    <p style="margin:0 0 6px;font-size:14px;">☐ Deuxième point à vérifier</p>
                    <p style="margin:0 0 6px;font-size:14px;">☐ Troisième point à vérifier</p>
                    <p style="margin:0;font-size:14px;">☐ Quatrième point à vérifier</p>
                </div><p><br></p>`}
                plainText="Checklist"
            />

            <DraggableBlock
                icon="tabler:columns-2"
                label="Deux colonnes"
                description="Texte en 2 colonnes côte à côte"
                html={`<div style="display:flex;gap:24px;margin:16px 0;">
                    <div style="flex:1;">
                        <p style="margin:0;font-size:14px;line-height:1.6;">Contenu de la première colonne. Modifiez ce texte selon vos besoins.</p>
                    </div>
                    <div style="flex:1;">
                        <p style="margin:0;font-size:14px;line-height:1.6;">Contenu de la deuxième colonne. Modifiez ce texte selon vos besoins.</p>
                    </div>
                </div><p><br></p>`}
                plainText="2 colonnes"
            />

            <DraggableBlock
                icon="tabler:receipt-2"
                label="Tableau de prix"
                description="Tableau tarifaire professionnel"
                html={`<table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <thead><tr>
                        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#1e40af;color:white;text-align:left;font-weight:600;font-size:14px;">Désignation</th>
                        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#1e40af;color:white;text-align:center;font-weight:600;font-size:14px;width:80px;">Qté</th>
                        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#1e40af;color:white;text-align:right;font-weight:600;font-size:14px;width:120px;">Prix unit.</th>
                        <th style="border:1px solid #d1d5db;padding:10px 14px;background:#1e40af;color:white;text-align:right;font-weight:600;font-size:14px;width:120px;">Total</th>
                    </tr></thead>
                    <tbody>
                        <tr><td style="border:1px solid #d1d5db;padding:8px 14px;font-size:14px;">Service / Produit 1</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:center;font-size:14px;">1</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">0,00 €</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">0,00 €</td></tr>
                        <tr><td style="border:1px solid #d1d5db;padding:8px 14px;font-size:14px;">Service / Produit 2</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:center;font-size:14px;">1</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">0,00 €</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">0,00 €</td></tr>
                    </tbody>
                    <tfoot>
                        <tr><td colspan="3" style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:600;font-size:14px;">Sous-total HT</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:600;font-size:14px;">0,00 €</td></tr>
                        <tr><td colspan="3" style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">TVA (20%)</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-size:14px;">0,00 €</td></tr>
                        <tr><td colspan="3" style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:700;font-size:15px;background:#f3f4f6;">Total TTC</td><td style="border:1px solid #d1d5db;padding:8px 14px;text-align:right;font-weight:700;font-size:15px;background:#f3f4f6;">0,00 €</td></tr>
                    </tfoot>
                </table><p><br></p>`}
                plainText="Tableau de prix"
            />

            {/* Dynamic Tables Section */}
            {lineSchemas.length > 0 && (
                <DynamicTablesSection
                    lineSchemas={lineSchemas}
                    insertDynamicTable={insertDynamicTable}
                    isDark={isDark}
                />
            )}
        </div>
    )
}

// Layouts Panel - Pre-built page section layouts
function LayoutsPanel({ doc, setDoc, triggerSave }) {
    const isDark = useDarkMode()
    const hasHeader = !!doc?.headerHtml
    const hasFooter = !!doc?.footerHtml

    const HEADER_HTML = `<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:2px solid #1e40af;margin-bottom:0;">
        <div>
            <h2 style="margin:0;font-size:24px;font-weight:700;color:#1e40af;">Nom de l'entreprise</h2>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Slogan ou activité</p>
        </div>
        <div style="text-align:right;font-size:12px;color:#6b7280;">
            <p style="margin:0;">123 Rue Exemple, 75000 Paris</p>
            <p style="margin:2px 0;">Tél : 01 23 45 67 89</p>
            <p style="margin:0;">contact@entreprise.fr</p>
        </div>
    </div>`

    const FOOTER_HTML = `<div style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:0;text-align:center;font-size:11px;color:#9ca3af;">
        <p style="margin:0;">Nom de l'entreprise — SIRET : 000 000 000 00000 — TVA : FR00 000000000</p>
        <p style="margin:4px 0 0;">123 Rue Exemple, 75000 Paris — Tél : 01 23 45 67 89 — contact@entreprise.fr</p>
    </div>`

    const setHeader = (html) => {
        if (setDoc) {
            setDoc(prev => ({ ...prev, headerHtml: html }))
            triggerSave?.()
        }
    }

    const setFooter = (html) => {
        if (setDoc) {
            setDoc(prev => ({ ...prev, footerHtml: html }))
            triggerSave?.()
        }
    }

    return (
        <div>
            <p style={{ fontSize: '11px', color: '#888ea8', marginBottom: '12px' }}>
                Mises en page prédéfinies pour votre document.
            </p>

            {/* ===== GLOBAL HEADER/FOOTER (click to set on all pages) ===== */}
            <p style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                En-tête / Pied de page global
            </p>

            {/* Header toggle */}
            <button
                onClick={() => setHeader(hasHeader ? '' : HEADER_HTML)}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${hasHeader ? '#3b82f6' : (isDark ? '#4b5563' : '#d1d5db')}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    marginBottom: '6px',
                    background: hasHeader ? 'rgba(59,130,246,0.08)' : 'transparent',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: hasHeader ? '#3b82f6' : (isDark ? '#1f2937' : '#f3f4f6'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: hasHeader ? 'white' : (isDark ? '#9ca3af' : '#6b7280'), flexShrink: 0
                }}>
                    <iconify-icon icon={hasHeader ? 'tabler:check' : 'tabler:layout-navbar'} width="18"></iconify-icon>
                </div>
                <div style={{ minWidth: 0 }}>
                    <span style={{
                        fontSize: '13px', fontWeight: 500, display: 'block',
                        color: hasHeader ? '#3b82f6' : (isDark ? '#e5e7eb' : '#374151')
                    }}>{hasHeader ? 'En-tête activé ✓' : 'Ajouter un en-tête'}</span>
                    <span style={{
                        fontSize: '10px', display: 'block', marginTop: '2px',
                        color: isDark ? '#6b7280' : '#9ca3af'
                    }}>{hasHeader ? 'Cliquez pour retirer' : 'Apparaît sur toutes les pages'}</span>
                </div>
            </button>

            {/* Footer toggle */}
            <button
                onClick={() => setFooter(hasFooter ? '' : FOOTER_HTML)}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${hasFooter ? '#3b82f6' : (isDark ? '#4b5563' : '#d1d5db')}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    marginBottom: '16px',
                    background: hasFooter ? 'rgba(59,130,246,0.08)' : 'transparent',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: hasFooter ? '#3b82f6' : (isDark ? '#1f2937' : '#f3f4f6'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: hasFooter ? 'white' : (isDark ? '#9ca3af' : '#6b7280'), flexShrink: 0
                }}>
                    <iconify-icon icon={hasFooter ? 'tabler:check' : 'tabler:layout-bottombar'} width="18"></iconify-icon>
                </div>
                <div style={{ minWidth: 0 }}>
                    <span style={{
                        fontSize: '13px', fontWeight: 500, display: 'block',
                        color: hasFooter ? '#3b82f6' : (isDark ? '#e5e7eb' : '#374151')
                    }}>{hasFooter ? 'Pied de page activé ✓' : 'Ajouter un pied de page'}</span>
                    <span style={{
                        fontSize: '10px', display: 'block', marginTop: '2px',
                        color: isDark ? '#6b7280' : '#9ca3af'
                    }}>{hasFooter ? 'Cliquez pour retirer' : 'Apparaît sur toutes les pages'}</span>
                </div>
            </button>

            {/* ===== DRAGGABLE BLOCKS (dropped per-page) ===== */}
            <p style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Blocs de mise en page
            </p>

            <DraggableBlock
                icon="tabler:file-invoice"
                label="En-tête de facture"
                description="Émetteur + Destinataire + N° facture"
                html={`<div style="margin-bottom:32px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
                        <div>
                            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e40af;">ENTREPRISE</h2>
                            <p style="margin:0;font-size:13px;color:#374151;">123 Rue Exemple</p>
                            <p style="margin:0;font-size:13px;color:#374151;">75000 Paris, France</p>
                            <p style="margin:4px 0 0;font-size:13px;color:#374151;">contact@entreprise.fr</p>
                        </div>
                        <div style="text-align:right;">
                            <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#374151;">FACTURE</h1>
                            <p style="margin:0;font-size:13px;color:#6b7280;">N° : FAC-2026-001</p>
                            <p style="margin:0;font-size:13px;color:#6b7280;">Date : ../../....</p>
                            <p style="margin:0;font-size:13px;color:#6b7280;">Échéance : ../../....</p>
                        </div>
                    </div>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
                        <p style="margin:0 0 4px;font-weight:600;font-size:13px;color:#64748b;">FACTURER À :</p>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">Nom du client</p>
                        <p style="margin:2px 0 0;font-size:13px;color:#475569;">Adresse du client</p>
                        <p style="margin:0;font-size:13px;color:#475569;">Code postal, Ville</p>
                    </div>
                </div>`}
                plainText="En-tête facture"
            />

            <DraggableBlock
                icon="tabler:file-description"
                label="En-tête de devis"
                description="Structure devis avec conditions"
                html={`<div style="margin-bottom:32px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
                        <div>
                            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#059669;">ENTREPRISE</h2>
                            <p style="margin:0;font-size:13px;color:#374151;">123 Rue Exemple</p>
                            <p style="margin:0;font-size:13px;color:#374151;">75000 Paris, France</p>
                        </div>
                        <div style="text-align:right;">
                            <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#374151;">DEVIS</h1>
                            <p style="margin:0;font-size:13px;color:#6b7280;">Réf : DEV-2026-001</p>
                            <p style="margin:0;font-size:13px;color:#6b7280;">Date : ../../....</p>
                            <p style="margin:0;font-size:13px;color:#6b7280;">Validité : 30 jours</p>
                        </div>
                    </div>
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
                        <p style="margin:0 0 4px;font-weight:600;font-size:13px;color:#16a34a;">DESTINATAIRE :</p>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">Nom du client</p>
                        <p style="margin:2px 0 0;font-size:13px;color:#475569;">Adresse du client</p>
                    </div>
                </div>`}
                plainText="En-tête devis"
            />

            <DraggableBlock
                icon="tabler:mail"
                label="Bloc de coordonnées"
                description="Carte de contact avec icônes"
                html={`<div style="margin:16px 0;padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                    <p style="margin:0 0 12px;font-weight:700;font-size:16px;color:#1e293b;">Coordonnées</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#475569;">📍 123 Rue Exemple, 75000 Paris</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#475569;">📞 01 23 45 67 89</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#475569;">✉️ contact@entreprise.fr</p>
                    <p style="margin:0;font-size:14px;color:#475569;">🌐 www.entreprise.fr</p>
                </div><p><br></p>`}
                plainText="Coordonnées"
            />

            <DraggableBlock
                icon="tabler:writing"
                label="Conditions générales"
                description="Bloc CGV/CGA compact"
                html={`<div style="margin:24px 0 0;padding:16px;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;font-size:10px;color:#9ca3af;line-height:1.5;">
                    <p style="margin:0 0 4px;font-weight:600;font-size:11px;color:#6b7280;">CONDITIONS GÉNÉRALES</p>
                    <p style="margin:0;">Paiement à réception de facture. Tout retard de paiement entraînera des pénalités de retard au taux de 3 fois le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement (Art. L.441-10 du Code de commerce). Pas d'escompte pour paiement anticipé.</p>
                </div>`}
                plainText="CGV"
            />
        </div>
    )
}

// Page Settings Panel - Format, Margins, Dimensions, Background
function PageSettingsPanel({ doc, setDoc, triggerSave, settingsPanelProps }) {
    const isDark = useDarkMode()
    const [showWarning, setShowWarning] = useState(false)
    const labelColor = isDark ? '#9ca3af' : '#6b7280'
    const inputBg = isDark ? '#1f2937' : '#f9fafb'
    const inputBorder = isDark ? '#374151' : '#e5e7eb'
    const cardBg = isDark ? '#111827' : '#f3f4f6'

    // Detect if we're in a record/draft context (not the Docs Hub)
    const isDraftContext = /\/record\//.test(window.location.pathname)

    const FORMAT_DIMENSIONS = {
        A4: { portrait: { width: 794, height: 1123 }, landscape: { width: 1123, height: 794 } },
        A5: { portrait: { width: 559, height: 794 }, landscape: { width: 794, height: 559 } },
        A3: { portrait: { width: 1123, height: 1587 }, landscape: { width: 1587, height: 1123 } },
        Letter: { portrait: { width: 816, height: 1056 }, landscape: { width: 1056, height: 816 } },
        Legal: { portrait: { width: 816, height: 1344 }, landscape: { width: 1344, height: 816 } }
    }

    const handleFormatChange = (format) => {
        const dim = FORMAT_DIMENSIONS[format]?.[doc.orientation || 'portrait'] || FORMAT_DIMENSIONS.A4.portrait
        setDoc(prev => ({ ...prev, format, dimensions: dim }))
        triggerSave?.()
    }

    const handleOrientationChange = (orientation) => {
        const dim = FORMAT_DIMENSIONS[doc.format || 'A4']?.[orientation] || FORMAT_DIMENSIONS.A4.portrait
        setDoc(prev => ({ ...prev, orientation, dimensions: dim }))
        triggerSave?.()
    }

    const handleMarginChange = (side, value) => {
        const numValue = Math.max(0, Math.min(200, parseInt(value) || 0))
        setDoc(prev => ({
            ...prev,
            margins: { ...(prev.margins || { top: 40, right: 40, bottom: 40, left: 40 }), [side]: numValue }
        }))
    }

    const handleMarginBlur = () => {
        triggerSave?.()
    }

    const margins = doc.margins || { top: 40, right: 40, bottom: 40, left: 40 }
    const dims = doc.dimensions || { width: 794, height: 1123 }

    // Margin presets
    const MARGIN_PRESETS = [
        { label: 'Normal', values: { top: 40, right: 40, bottom: 40, left: 40 } },
        { label: 'Étroit', values: { top: 20, right: 20, bottom: 20, left: 20 } },
        { label: 'Large', values: { top: 60, right: 60, bottom: 60, left: 60 } },
        { label: 'Aucune', values: { top: 0, right: 0, bottom: 0, left: 0 } },
    ]

    const applyMarginPreset = (preset) => {
        setDoc(prev => ({ ...prev, margins: { ...preset.values } }))
        triggerSave?.()
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Format Section */}
            <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: labelColor, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Format de page
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {['A4', 'A5', 'A3', 'Letter', 'Legal'].map(fmt => (
                        <button
                            key={fmt}
                            onClick={() => handleFormatChange(fmt)}
                            style={{
                                padding: '8px 12px',
                                border: `1.5px solid ${doc.format === fmt ? '#4361ee' : inputBorder}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                background: doc.format === fmt ? 'rgba(67,97,238,0.08)' : 'transparent',
                                textAlign: 'center',
                                fontSize: '12px',
                                fontWeight: doc.format === fmt ? 600 : 400,
                                color: doc.format === fmt ? '#4361ee' : (isDark ? '#e5e7eb' : '#374151'),
                            }}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orientation */}
            <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: labelColor, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Orientation
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button
                        onClick={() => handleOrientationChange('portrait')}
                        style={{
                            padding: '10px 12px',
                            border: `1.5px solid ${doc.orientation === 'portrait' ? '#4361ee' : inputBorder}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            background: doc.orientation === 'portrait' ? 'rgba(67,97,238,0.08)' : 'transparent',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                    >
                        <div style={{ width: '16px', height: '22px', border: `2px solid ${doc.orientation === 'portrait' ? '#4361ee' : (isDark ? '#6b7280' : '#9ca3af')}`, borderRadius: '2px' }} />
                        <span style={{ fontSize: '11px', fontWeight: doc.orientation === 'portrait' ? 600 : 400, color: doc.orientation === 'portrait' ? '#4361ee' : (isDark ? '#e5e7eb' : '#374151') }}>Portrait</span>
                    </button>
                    <button
                        onClick={() => handleOrientationChange('landscape')}
                        style={{
                            padding: '10px 12px',
                            border: `1.5px solid ${doc.orientation === 'landscape' ? '#4361ee' : inputBorder}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            background: doc.orientation === 'landscape' ? 'rgba(67,97,238,0.08)' : 'transparent',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                    >
                        <div style={{ width: '22px', height: '16px', border: `2px solid ${doc.orientation === 'landscape' ? '#4361ee' : (isDark ? '#6b7280' : '#9ca3af')}`, borderRadius: '2px' }} />
                        <span style={{ fontSize: '11px', fontWeight: doc.orientation === 'landscape' ? 600 : 400, color: doc.orientation === 'landscape' ? '#4361ee' : (isDark ? '#e5e7eb' : '#374151') }}>Paysage</span>
                    </button>
                </div>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', background: isDark ? '#1f2937' : '#e5e7eb' }} />

            {/* Margins */}
            <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: labelColor, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Marges de page
                </p>

                {/* Visual margin preview */}
                <div style={{
                    width: '100%',
                    aspectRatio: doc.orientation === 'landscape' ? '1.414/1' : '1/1.414',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '8px',
                    position: 'relative',
                    background: isDark ? '#0d1321' : '#ffffff',
                    marginBottom: '10px',
                    maxHeight: '120px',
                    overflow: 'hidden',
                }}>
                    {/* Inner content area showing margins */}
                    <div style={{
                        position: 'absolute',
                        top: `${Math.min(margins.top / 4, 20)}px`,
                        left: `${Math.min(margins.left / 4, 20)}px`,
                        right: `${Math.min(margins.right / 4, 20)}px`,
                        bottom: `${Math.min(margins.bottom / 4, 20)}px`,
                        border: '1px dashed #4361ee',
                        borderRadius: '2px',
                        opacity: 0.5,
                    }} />
                    {/* Fake content lines */}
                    <div style={{
                        position: 'absolute',
                        top: `${Math.min(margins.top / 4, 20) + 6}px`,
                        left: `${Math.min(margins.left / 4, 20) + 6}px`,
                        right: `${Math.min(margins.right / 4, 20) + 6}px`,
                        display: 'flex', flexDirection: 'column', gap: '3px',
                    }}>
                        {[100, 80, 95, 60, 90, 70].map((w, i) => (
                            <div key={i} style={{ width: `${w}%`, height: '2px', background: isDark ? '#374151' : '#d1d5db', borderRadius: '1px' }} />
                        ))}
                    </div>
                </div>

                {/* Margin Presets */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {MARGIN_PRESETS.map(preset => {
                        const isActive = margins.top === preset.values.top && margins.right === preset.values.right &&
                                         margins.bottom === preset.values.bottom && margins.left === preset.values.left
                        return (
                            <button
                                key={preset.label}
                                onClick={() => applyMarginPreset(preset)}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: `1px solid ${isActive ? '#4361ee' : inputBorder}`,
                                    background: isActive ? 'rgba(67,97,238,0.08)' : 'transparent',
                                    fontSize: '10px',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? '#4361ee' : (isDark ? '#9ca3af' : '#6b7280'),
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {preset.label}
                            </button>
                        )
                    })}
                </div>

                {/* Margin inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[
                        { key: 'top', label: 'Haut', icon: 'tabler:arrow-bar-up' },
                        { key: 'bottom', label: 'Bas', icon: 'tabler:arrow-bar-down' },
                        { key: 'left', label: 'Gauche', icon: 'tabler:arrow-bar-left' },
                        { key: 'right', label: 'Droite', icon: 'tabler:arrow-bar-right' },
                    ].map(({ key, label, icon }) => (
                        <div key={key}>
                            <label style={{ fontSize: '10px', color: labelColor, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                                <iconify-icon icon={icon} width="12"></iconify-icon>
                                {label}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    value={margins[key]}
                                    onChange={(e) => handleMarginChange(key, e.target.value)}
                                    onBlur={handleMarginBlur}
                                    min="0"
                                    max="200"
                                    style={{
                                        width: '100%',
                                        padding: '6px 24px 6px 8px',
                                        border: `1px solid ${inputBorder}`,
                                        borderRadius: '6px',
                                        background: inputBg,
                                        color: isDark ? '#e5e7eb' : '#1f2937',
                                        fontSize: '12px',
                                        outline: 'none',
                                    }}
                                />
                                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', color: labelColor }}>px</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', background: isDark ? '#1f2937' : '#e5e7eb' }} />

            {/* Page Info */}
            <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: labelColor, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Dimensions
                </p>
                <div style={{
                    padding: '10px 12px',
                    background: cardBg,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: labelColor }}>Largeur</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#e5e7eb' : '#374151' }}>{dims.width}px <span style={{ fontSize: '9px', color: labelColor }}>({(dims.width / 96 * 25.4).toFixed(0)}mm)</span></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: labelColor }}>Hauteur</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#e5e7eb' : '#374151' }}>{dims.height}px <span style={{ fontSize: '9px', color: labelColor }}>({(dims.height / 96 * 25.4).toFixed(0)}mm)</span></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: labelColor }}>Zone contenu</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#e5e7eb' : '#374151' }}>{dims.width - margins.left - margins.right} × {dims.height - margins.top - margins.bottom}px</span>
                    </div>
                </div>
            </div>

            {/* Background Color */}
            <div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: labelColor, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Arrière-plan
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="color"
                        value={doc.pages?.[0]?.background?.color || doc.pages?.[0]?.background || '#ffffff'}
                        onChange={(e) => {
                            setDoc(prev => ({
                                ...prev,
                                pages: prev.pages.map(p => ({ ...p, background: { ...(typeof p.background === 'object' ? p.background : { color: p.background }), color: e.target.value } }))
                            }))
                            triggerSave?.()
                        }}
                        style={{
                            width: '32px', height: '32px', border: `1px solid ${inputBorder}`, borderRadius: '6px',
                            cursor: 'pointer', padding: '2px',
                        }}
                    />
                    <span style={{ fontSize: '11px', color: isDark ? '#e5e7eb' : '#374151' }}>
                        {doc.pages?.[0]?.background?.color || doc.pages?.[0]?.background || '#ffffff'}
                    </span>
                </div>
            </div>

            {/* Pages count info */}
            <div style={{
                padding: '10px 12px',
                background: cardBg,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}>
                <iconify-icon icon="solar:documents-bold-duotone" width="18" style={{ color: '#4361ee' }}></iconify-icon>
                <span style={{ fontSize: '11px', color: isDark ? '#e5e7eb' : '#374151' }}>
                    {doc.pages?.length || 1} page{(doc.pages?.length || 1) > 1 ? 's' : ''}
                </span>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', background: isDark ? '#1f2937' : '#e5e7eb' }} />

            {/* Save Button */}
            <button
                onClick={() => {
                    if (isDraftContext) {
                        setShowWarning(true)
                    } else {
                        triggerSave?.()
                    }
                }}
                style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isDraftContext ? (isDark ? '#1f2937' : '#f3f4f6') : '#4361ee',
                    color: isDraftContext ? (isDark ? '#e5e7eb' : '#374151') : '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                }}
            >
                <iconify-icon icon={isDraftContext ? 'solar:shield-warning-bold-duotone' : 'solar:diskette-bold-duotone'} width="16"></iconify-icon>
                {isDraftContext ? 'Sauvegarder le template' : 'Sauvegarder'}
            </button>

            {/* Warning Banner */}
            {showWarning && (
                <div style={{
                    padding: '12px',
                    background: isDark ? '#1c1917' : '#fffbeb',
                    border: `1px solid ${isDark ? '#854d0e' : '#fbbf24'}`,
                    borderRadius: '8px',
                    position: 'relative',
                }}>
                    <button
                        onClick={() => setShowWarning(false)}
                        style={{
                            position: 'absolute', top: '6px', right: '6px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: isDark ? '#a16207' : '#92400e', padding: '2px',
                        }}
                    >
                        <iconify-icon icon="tabler:x" width="14"></iconify-icon>
                    </button>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <iconify-icon icon="solar:danger-triangle-bold-duotone" width="20" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }}></iconify-icon>
                        <div>
                            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: isDark ? '#fbbf24' : '#92400e' }}>
                                Modification non autorisée
                            </p>
                            <p style={{ margin: '0 0 8px', fontSize: '10px', lineHeight: 1.5, color: isDark ? '#d97706' : '#78350f' }}>
                                Vous ne pouvez pas modifier le template global depuis cette vue. Rendez-vous dans la section <strong>Documents Hub</strong> pour apporter des modifications au template.
                            </p>
                            <a
                                href={window.location.pathname.replace(/\/record\/.*/, '/documents')}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    fontSize: '10px', fontWeight: 600, color: '#4361ee',
                                    textDecoration: 'none',
                                }}
                            >
                                <iconify-icon icon="solar:arrow-right-bold" width="12"></iconify-icon>
                                Aller au Documents Hub
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Gallery Panel Component with Integration Engine Search
function GalleryPanel({ accountNumber: accountNumberProp, doc }) {
    const [searchQuery, setSearchQuery] = React.useState('')
    const [photos, setPhotos] = React.useState([])
    const [recordImages, setRecordImages] = React.useState([])
    const [driveImages, setDriveImages] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [libraryLoading, setLibraryLoading] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [hasMore, setHasMore] = React.useState(false)
    const [searched, setSearched] = React.useState(false)
    const [error, setError] = React.useState(null)
    const uploadInputRef = React.useRef(null)

    const demoImages = [
        '/images/blog_1st.png',
        '/images/blog_2nd.png',
        '/images/blog_4th.png',
        '/images/blog_5th.png',
        '/images/blog_6th.png',
        '/images/blog_7th.png',
        '/images/test.png',
        '/images/test2.png'
    ]

    // Get account number from URL
    const getAccountNumber = () => {
        if (accountNumberProp) return accountNumberProp
        const match = window.location.pathname.match(/\/account\/([^/]+)/)
        return match ? match[1] : null
    }

    const sourceRecordId = doc?.draftRecordId || doc?.generatedFile?.recordId || doc?.linkedRecords?.[0]?.recordId || null

    const placeholderBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23dbeafe'/%3E%3Cstop offset='1' stop-color='%23f8fafc'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23sky)'/%3E%3Ccircle cx='500' cy='80' r='46' fill='%23ffffff' fill-opacity='.88'/%3E%3Cpath d='M0 260 105 178l83 58 128-108 134 132 83-68 107 86v82H0z' fill='%23cbd5e1'/%3E%3Cpath d='M0 304 160 214l118 64 92-46 100 54 170-90v164H0z' fill='%2394a3b8' fill-opacity='.72'/%3E%3C/svg%3E")`

    const placeholderHtml = `<span class="doc-image-placeholder" contenteditable="false" data-image-placeholder="1" style="width:500px;max-width:100%;height:281px;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;vertical-align:top;border:0;border-radius:8px;background-color:#f8fafc;background-image:${placeholderBg};background-size:cover;background-position:center;margin:12px 0;cursor:pointer;box-sizing:border-box;position:relative;resize:none;"></span>`

    const imageHtml = (url, alt = '') => `<img src="${url}" alt="${String(alt || '').replace(/"/g, '&quot;')}" style="max-width: 100%; height: auto; display: inline-block; vertical-align: top;" />`

    React.useEffect(() => {
        const accountNumber = getAccountNumber()
        if (!accountNumber) return
        let cancelled = false

        const loadLibraries = async () => {
            setLibraryLoading(true)
            try {
                const requests = [
                    fetch(`/account/${accountNumber}/api/drive/files`, { credentials: 'include' }).then(r => r.json()).catch(() => null)
                ]
                if (sourceRecordId) {
                    requests.unshift(
                        fetch(`/account/${accountNumber}/api/records/${sourceRecordId}/attachments`, { credentials: 'include' }).then(r => r.json()).catch(() => null)
                    )
                }
                const results = await Promise.all(requests)
                if (cancelled) return

                const recordData = sourceRecordId ? results[0] : null
                const driveData = sourceRecordId ? results[1] : results[0]

                setRecordImages((recordData?.attachments || []).filter(f => f.category === 'image' || String(f.mimeType || '').startsWith('image/')).slice(0, 8))
                setDriveImages((driveData?.files || []).filter(f => f.category === 'image' || String(f.mimeType || '').startsWith('image/')).slice(0, 8))
            } finally {
                if (!cancelled) setLibraryLoading(false)
            }
        }

        loadLibraries()
        return () => { cancelled = true }
    }, [accountNumberProp, sourceRecordId])

    const uploadFiles = async (files) => {
        const file = files?.[0]
        const accountNumber = getAccountNumber()
        if (!file || !accountNumber) return

        setLibraryLoading(true)
        try {
            const formData = new FormData()
            formData.append('files', file)
            const url = sourceRecordId
                ? `/account/${accountNumber}/api/records/${sourceRecordId}/attachments`
                : `/account/${accountNumber}/api/drive/upload`
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            const data = await res.json()
            const uploaded = sourceRecordId ? data.attachments?.[0] : data.files?.[0]
            if (uploaded) {
                if (sourceRecordId) setRecordImages(prev => [uploaded, ...prev])
                else setDriveImages(prev => [uploaded, ...prev])
            }
        } catch (e) {
            setError(e.message || 'Erreur upload')
        } finally {
            setLibraryLoading(false)
        }
    }

    const searchPhotos = async (query, pageNum = 1, append = false) => {
        if (!query.trim()) return

        setLoading(true)
        setError(null)

        try {
            const accountNumber = getAccountNumber()
            if (!accountNumber) {
                throw new Error('Account number not found')
            }

            // Call Integration Engine action
            const response = await fetch(`/account/${accountNumber}/integrations/unsplash/actions/search-photos/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    input: {
                        query,
                        per_page: 8,
                        page: pageNum
                    }
                })
            })

            const result = await response.json()

            if (result.success && result.data) {
                // Transform Unsplash response (mapped via responseMapping: photos, total, totalPages)
                const rawPhotos = result.data.photos || result.data.results || []
                const newPhotos = rawPhotos.map(photo => ({
                    id: photo.id,
                    url: photo.urls?.regular || photo.urls?.small,
                    thumb: photo.urls?.thumb || photo.urls?.small,
                    alt: photo.alt_description || photo.description || 'Photo',
                    author: photo.user?.name || 'Unknown'
                }))

                if (append) {
                    setPhotos(prev => [...prev, ...newPhotos])
                } else {
                    setPhotos(newPhotos)
                }

                const totalPages = result.data.totalPages || result.data.total_pages || 1
                setHasMore(pageNum < totalPages)
                setPage(pageNum)
                setSearched(true)
            } else {
                setError(result.error || 'Erreur lors de la recherche')
            }
        } catch (err) {
            console.error('Search error:', err)
            setError(err.message || 'Erreur de connexion')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        searchPhotos(searchQuery, 1, false)
    }

    const loadMore = () => {
        searchPhotos(searchQuery, page + 1, true)
    }

    const clearSearch = () => {
        setSearchQuery('')
        setPhotos([])
        setSearched(false)
        setPage(1)
        setHasMore(false)
        setError(null)
    }

    return (
        <div className="space-y-4">
            <TouchableImage
                html={placeholderHtml}
                className="group border-2 border-dashed border-primary/40 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors cursor-move"
                title="Glisser un placeholder image"
            >
                <iconify-icon icon="solar:gallery-add-bold-duotone" width="24" className="text-primary"></iconify-icon>
                <div className="text-center">
                    <p className="text-sm font-semibold dark:text-white-light">Zone image</p>
                    <p className="text-[11px] text-gray-500">Glissez, redimensionnez, puis cliquez</p>
                </div>
            </TouchableImage>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des photos..."
                    className="form-input w-full pr-8 text-sm dark:bg-gray-800 dark:border-gray-800"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <iconify-icon icon="tabler:x" width="14"></iconify-icon>
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                    <iconify-icon icon="tabler:search" width="16"></iconify-icon>
                </button>
            </form>

            {/* Error */}
            {error && (
                <div className="text-xs text-danger bg-danger/10 p-2 rounded">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && !photos.length && (
                <div className="flex items-center justify-center py-8">
                    <iconify-icon icon="tabler:loader-2" width="24" className="animate-spin text-primary"></iconify-icon>
                </div>
            )}

            {/* Unsplash Results */}
            {searched && photos.length > 0 && (
                <>
                    <p className="text-xs text-gray-500">
                        Résultats Unsplash — Glissez une image sur la page.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {photos.map((photo) => {
                            const imgHtml = imageHtml(photo.url, photo.alt)
                            return (
                                <TouchableImage
                                    key={photo.id}
                                    html={imgHtml}
                                    className="relative group cursor-move rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors aspect-video"
                                    title={`Photo par ${photo.author}`}
                                >
                                    <img
                                        src={photo.thumb}
                                        alt={photo.alt}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                                        <iconify-icon
                                            icon="tabler:grip-horizontal"
                                            width="20"
                                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                                        ></iconify-icon>
                                    </div>
                                </TouchableImage>
                            )
                        })}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <iconify-icon icon="tabler:loader-2" width="16" className="animate-spin"></iconify-icon>
                                    Chargement...
                                </>
                            ) : (
                                <>
                                    <iconify-icon icon="tabler:chevron-down" width="16"></iconify-icon>
                                    Charger plus
                                </>
                            )}
                        </button>
                    )}
                </>
            )}

            {/* No Results */}
            {searched && photos.length === 0 && !loading && (
                <div className="text-center py-6 text-gray-500">
                    <iconify-icon icon="tabler:photo-off" width="32" className="mb-2"></iconify-icon>
                    <p className="text-sm">Aucun résultat trouvé</p>
                </div>
            )}

            {/* Demo Images (shown when no search) */}
            {!searched && (
                <>
                    <p className="text-xs text-gray-500">Record drive</p>
                    {libraryLoading && (
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                            <iconify-icon icon="tabler:loader-2" width="14" className="animate-spin"></iconify-icon>
                            Chargement...
                        </div>
                    )}
                    {recordImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {recordImages.map((file) => (
                                <TouchableImage
                                    key={file._id || file.url}
                                    html={imageHtml(file.url, file.originalName)}
                                    className="relative group cursor-move rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors aspect-video"
                                    title={file.originalName}
                                >
                                    <img src={file.url} alt={file.originalName || ''} className="w-full h-full object-cover" style={{ pointerEvents: 'none' }} />
                                </TouchableImage>
                            ))}
                        </div>
                    )}

                    <input
                        ref={uploadInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            uploadFiles(e.target.files)
                            e.target.value = ''
                        }}
                    />
                    <button type="button" onClick={() => uploadInputRef.current?.click()} className="w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                        <div className="flex items-center justify-between gap-2 text-gray-500">
                            <iconify-icon icon="tabler:upload" width="20"></iconify-icon>
                            <span className="text-sm">Importer</span>
                        </div>
                    </button>

                    {driveImages.length > 0 && (
                        <>
                            <p className="text-xs text-gray-500 mt-3">Drive global</p>
                            <div className="grid grid-cols-4 gap-2">
                                {driveImages.map((file) => (
                                    <TouchableImage
                                        key={file._id || file.url}
                                        html={imageHtml(file.url, file.originalName)}
                                        className="relative group cursor-move rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors aspect-video"
                                        title={file.originalName}
                                    >
                                        <img src={file.url} alt={file.originalName || ''} className="w-full h-full object-cover" style={{ pointerEvents: 'none' }} />
                                    </TouchableImage>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Demo Images Grid */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        {demoImages.map((imageSrc, index) => {
                            const imgHtml = imageHtml(imageSrc, `Demo ${index + 1}`)
                            return (
                                <TouchableImage
                                    key={index}
                                    html={imgHtml}
                                    className="relative group cursor-move rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary transition-colors aspect-video"
                                >
                                    <img
                                        src={imageSrc}
                                        alt={`Demo ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                                        <iconify-icon
                                            icon="tabler:grip-horizontal"
                                            width="20"
                                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        ></iconify-icon>
                                    </div>
                                </TouchableImage>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

// ===== Dynamic Variables Panel =====
function DynamicNavPanel({ insertVariableToken, insertDynamicTable, accountNumber, doc }) {
    const isDark = useDarkMode();
    const [variables, setVariables] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({ system: true, user: true, company: true });

    // Fetch variables from the SmartDoc API
    useEffect(() => {
        if (!doc?._id || !accountNumber) return;

        const fetchVariables = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/account/${accountNumber}/api/smartdoc/variables/${doc._id}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success && data.variables) {
                    setVariables(data.variables);
                    // Only expand entity sections by default, system/user/company collapsed
                    const expanded = { system: false, user: false, company: false };
                    (data.variables.entities || []).forEach(e => {
                        expanded['entity_' + e.entityId] = true;
                    });
                    setExpandedSections(expanded);
                } else {
                    setError(data.error || 'Erreur de chargement');
                }
            } catch (err) {
                console.error('[Variables] Fetch error:', err);
                setError('Impossible de charger les variables');
            } finally {
                setLoading(false);
            }
        };
        fetchVariables();
    // Also re-fetch when entityIds or linkedRecords change (user links/unlinks entities)
    // Using JSON.stringify to create stable dependency values from arrays
    }, [doc?._id, accountNumber, JSON.stringify(doc?.entityIds || []), JSON.stringify((doc?.linkedRecords || []).map(r => r.entityId))]);

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInsert = (variable) => {
        insertVariableToken(variable.path, {
            fieldId: variable.fieldId || null,
            label: variable.label,
            type: variable.type || 'text'
        });
    };

    // Filter variables by search query
    const matchesSearch = (label, path) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (label && label.toLowerCase().includes(q)) ||
            (path && path.toLowerCase().includes(q));
    };

    const sectionHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 10px',
        borderRadius: '8px',
        cursor: 'pointer',
        border: 'none',
        background: isDark ? '#1b2e4b' : '#f1f5f9',
        width: '100%',
        textAlign: 'left',
        transition: 'background 0.15s',
        marginBottom: '4px'
    };

    const varButtonStyle = {
        width: '100%',
        padding: '6px 10px',
        textAlign: 'left',
        borderRadius: '6px',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        transition: 'background 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px'
    };

    const renderVariableButton = (v, i) => (
        <button
            key={v.path + '_' + i}
            style={varButtonStyle}
            onClick={() => handleInsert(v)}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(67,97,238,0.15)' : 'rgba(67,97,238,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title={`Insérer {{${v.path}}}`}
        >
            <span style={{
                padding: '2px 6px',
                background: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7',
                color: isDark ? '#fbbf24' : '#b45309',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                flexShrink: 0
            }}>
                {v.label}
            </span>
        </button>
    );

    const renderSection = (key, title, icon, items, iconColor) => {
        const filtered = items.filter(v => matchesSearch(v.label, v.path));
        if (filtered.length === 0 && searchQuery) return null;

        return (
            <div key={key} style={{ marginBottom: '8px' }}>
                <button
                    style={sectionHeaderStyle}
                    onClick={() => toggleSection(key)}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#243b5e' : '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = isDark ? '#1b2e4b' : '#f1f5f9'}
                >
                    <iconify-icon icon={expandedSections[key] ? 'tabler:chevron-down' : 'tabler:chevron-right'} width="14" style={{ color: isDark ? '#64748b' : '#94a3b8', flexShrink: 0 }}></iconify-icon>
                    <iconify-icon icon={icon} width="16" style={{ color: iconColor, flexShrink: 0 }}></iconify-icon>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155', flex: 1 }}>{title}</span>
                    <span style={{ fontSize: '10px', color: isDark ? '#4b5563' : '#9ca3af', fontWeight: 500 }}>{filtered.length}</span>
                </button>
                {expandedSections[key] && (
                    <div style={{ paddingLeft: '12px' }}>
                        {filtered.map((v, i) => renderVariableButton(v, i))}
                    </div>
                )}
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', gap: '12px' }}>
                <div style={{
                    width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#4361ee',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <span style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Chargement des variables...</span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <iconify-icon icon="solar:danger-triangle-bold-duotone" width="32" style={{ color: '#ef4444', marginBottom: '8px' }}></iconify-icon>
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '0 0 8px' }}>{error}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); /* re-trigger useEffect */ }}
                    style={{
                        padding: '6px 16px', borderRadius: '6px', border: '1px solid #e5e7eb',
                        background: 'transparent', cursor: 'pointer', fontSize: '12px',
                        color: isDark ? '#e2e8f0' : '#374151'
                    }}
                >Réessayer</button>
            </div>
        );
    }

    // No document saved yet
    if (!doc?._id) {
        return (
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <iconify-icon icon="solar:document-add-bold-duotone" width="40" style={{ color: isDark ? '#4b5563' : '#d1d5db', marginBottom: '12px' }}></iconify-icon>
                <p style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#6b7280', margin: 0 }}>
                    Sauvegardez d'abord le document pour accéder aux variables dynamiques.
                </p>
            </div>
        );
    }

    // Variables loaded
    if (!variables) return null;

    const hasEntities = variables.entities && variables.entities.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '8px' }}>
                <iconify-icon icon="tabler:search" width="14" style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    color: isDark ? '#4b5563' : '#9ca3af'
                }}></iconify-icon>
                <input
                    type="text"
                    placeholder="Rechercher une variable..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '7px 10px 7px 30px', borderRadius: '8px',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        background: isDark ? '#0e1726' : '#ffffff',
                        color: isDark ? '#e2e8f0' : '#374151',
                        fontSize: '12px', outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        style={{
                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                            border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px',
                            color: isDark ? '#6b7280' : '#9ca3af'
                        }}
                    >
                        <iconify-icon icon="tabler:x" width="12"></iconify-icon>
                    </button>
                )}
            </div>

            {/* Hint */}
            <p style={{ fontSize: '10px', color: isDark ? '#4b5563' : '#94a3b8', margin: '0 0 8px', lineHeight: 1.4 }}>
                Cliquez sur une variable pour l'insérer dans le document à la position du curseur.
            </p>

            {/* System Variables */}
            {renderSection('system', 'Système', 'solar:settings-bold-duotone', variables.system || [], '#6366f1')}

            {/* User Variables */}
            {renderSection('user', 'Utilisateur', 'solar:user-bold-duotone', variables.user || [], '#0ea5e9')}

            {/* Company Variables */}
            {variables.company && variables.company.length > 0 && renderSection('company', 'Mon Entreprise', 'solar:buildings-bold-duotone', variables.company || [], '#10b981')}

            {/* Entity Variables */}
            {hasEntities && variables.entities.map(entity => {
                // Merge classifications into entity fields
                const entityFieldsWithClassifications = [
                    ...(entity.fields || []),
                    ...(entity.classifications || []).map(c => ({
                        path: c.path,
                        label: c.label,
                        type: 'classification',
                        fieldId: c.classificationId
                    }))
                ];

                return (
                    <div key={entity.entityId}>
                        {/* Entity Fields + Classifications merged */}
                        {renderSection(
                            'entity_' + entity.entityId,
                            entity.name,
                            entity.icon || 'solar:layers-bold-duotone',
                            entityFieldsWithClassifications,
                            '#f59e0b'
                        )}

                        {/* Relation sub-sections (entity-level + custom relation fields) */}
                        {entity.relations && entity.relations.length > 0 && (
                            <div style={{ paddingLeft: '12px' }}>
                                {entity.relations.map(rel => {
                                    // Merge relation classifications into relation fields
                                    const relFieldsWithClassifications = [
                                        ...(rel.fields || []),
                                        ...(rel.classifications || []).map(c => ({
                                            path: c.path,
                                            label: c.label,
                                            type: 'classification',
                                            fieldId: c.classificationId
                                        }))
                                    ];

                                    return (
                                        <div key={rel.relationKey}>
                                            {renderSection(
                                                'rel_' + rel.relationKey,
                                                rel.label,
                                                rel.entityIcon || 'solar:link-bold-duotone',
                                                relFieldsWithClassifications,
                                                rel.isCustomField ? '#6366f1' : '#10b981'
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* No entities linked */}
            {!hasEntities && (
                <div style={{
                    padding: '16px',
                    background: isDark ? '#1b2e4b' : '#fffbeb',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? '#374151' : '#fde68a'}`,
                    textAlign: 'center'
                }}>
                    <iconify-icon icon="solar:link-broken-bold-duotone" width="28" style={{ color: '#f59e0b', marginBottom: '8px' }}></iconify-icon>
                    <p style={{ fontSize: '11px', color: isDark ? '#fbbf24' : '#92400e', margin: '0 0 4px', fontWeight: 600 }}>
                        Aucune entité liée
                    </p>
                    <p style={{ fontSize: '10px', color: isDark ? '#94a3b8' : '#78350f', margin: 0 }}>
                        Liez des entités au document pour accéder à leurs champs comme variables.
                    </p>
                </div>
            )}

            {/* Dynamic Tables Section */}
            {variables.lineSchemas && variables.lineSchemas.length > 0 && (
                <DynamicTablesSection
                    lineSchemas={variables.lineSchemas}
                    insertDynamicTable={insertDynamicTable}
                    isDark={isDark}
                />
            )}
        </div>
    );
}

// ===== Helper: Build dynamic table placeholder HTML for drag-and-drop =====
function buildDynamicTableHtml(schema, style = 'professional') {
    const visibleCols = (schema.columns || []).filter(c => c.visible !== false)
    const colHeaders = visibleCols.map(c => c.label).join(' | ')
    const styleLabels = { minimal: 'Minimal', professional: 'Professionnel', modern: 'Moderne' }
    const styleColors = {
        minimal: { bg: '#f5f5f5', border: '#333', accent: '#333' },
        professional: { bg: '#f3f4f6', border: '#d1d5db', accent: '#1f2937' },
        modern: { bg: '#eef2ff', border: '#c7d2fe', accent: '#4338ca' }
    }
    const sc = styleColors[style] || styleColors.professional
    const dataAttr = JSON.stringify({
        schemaId: schema._id,
        schemaName: schema.name,
        style: style,
        showTotals: true,
        title: ''
    })

    return `<div class="dynamic-table" contenteditable="false" data-table='${dataAttr.replace(/'/g, '&#39;')}'>
        <div style="border:2px dashed ${sc.border};border-radius:8px;padding:16px;margin:12px 0;background:${sc.bg};">
            <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">📊</span>
                <span style="font-weight:700;font-size:12pt;color:${sc.accent};">${schema.name}</span>
                <span style="font-size:9pt;color:#6b7280;background:#fff;padding:1px 8px;border-radius:10px;border:1px solid #e5e7eb;">${styleLabels[style] || style}</span>
            </div>
        </div>
    </div><p><br></p>`
}

// ===== Dynamic Tables Section =====
function DynamicTablesSection({ lineSchemas, insertDynamicTable, isDark }) {
    const [expandedSchema, setExpandedSchema] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState('professional');

    const tableStyles = [
        {
            key: 'minimal',
            label: 'Minimal',
            preview: { border: '#333', bg: 'transparent', header: '#f5f5f5' }
        },
        {
            key: 'professional',
            label: 'Professionnel',
            preview: { border: '#d1d5db', bg: '#f9fafb', header: '#f3f4f6' }
        },
        {
            key: 'modern',
            label: 'Moderne',
            preview: { border: '#c7d2fe', bg: '#f5f3ff', header: '#4f46e5' }
        }
    ];

    return (
        <div style={{ marginTop: '12px' }}>
            {/* Section Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 10px',
                borderRadius: '8px',
                background: isDark ? '#1a2332' : '#f0fdf4',
                border: `1px solid ${isDark ? '#22543d' : '#bbf7d0'}`,
                marginBottom: '10px'
            }}>
                <iconify-icon icon="solar:chart-2-bold-duotone" width="18" style={{ color: '#10b981', flexShrink: 0 }}></iconify-icon>
                <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#86efac' : '#166534', display: 'block' }}>
                        Tableaux dynamiques
                    </span>
                    <span style={{ fontSize: '10px', color: isDark ? '#4ade80' : '#15803d' }}>
                        Glissez ou cliquez pour insérer
                    </span>
                </div>
            </div>

            {lineSchemas.map(schema => (
                <div key={schema._id} style={{ marginBottom: '8px' }}>
                    {/* Schema Item — DRAGGABLE */}
                    <div
                        style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            borderRadius: expandedSchema === schema._id ? '8px 8px 0 0' : '8px',
                            cursor: 'move',
                            border: `1px dashed ${isDark ? '#4b5563' : '#bbf7d0'}`,
                            background: expandedSchema === schema._id
                                ? (isDark ? '#1b2e4b' : '#eff6ff')
                                : (isDark ? '#0e1726' : '#ffffff'),
                            transition: 'all 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            WebkitUserSelect: 'none',
                            userSelect: 'none'
                        }}
                        draggable="true"
                        onDragStart={(e) => {
                            const html = buildDynamicTableHtml(schema, selectedStyle)
                            e.dataTransfer.setData('text/html', html)
                            e.dataTransfer.setData('text/plain', `[Tableau: ${schema.name}]`)
                            e.dataTransfer.effectAllowed = 'copy'
                        }}
                        onMouseEnter={e => {
                            if (expandedSchema !== schema._id) {
                                e.currentTarget.style.background = isDark ? '#1b2e4b' : '#f0fdf4';
                                e.currentTarget.style.borderColor = '#10b981';
                            }
                        }}
                        onMouseLeave={e => {
                            if (expandedSchema !== schema._id) {
                                e.currentTarget.style.background = isDark ? '#0e1726' : '#ffffff';
                                e.currentTarget.style.borderColor = isDark ? '#4b5563' : '#bbf7d0';
                            }
                        }}
                    >
                        <iconify-icon
                            icon="solar:table-bold-duotone"
                            width="18"
                            style={{ color: '#10b981', flexShrink: 0 }}
                        ></iconify-icon>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1f2937' }}>
                                {schema.name}
                            </div>
                            {schema.columns && schema.columns.length > 0 && (
                                <div style={{ fontSize: '10px', color: isDark ? '#6b7280' : '#9ca3af', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {schema.columns.map(c => c.label).join(', ')}
                                </div>
                            )}
                        </div>
                        {/* Expand button */}
                        <button
                            style={{
                                padding: '4px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: 'none',
                                background: 'transparent',
                                color: isDark ? '#6b7280' : '#9ca3af',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                setExpandedSchema(expandedSchema === schema._id ? null : schema._id)
                            }}
                            title="Options de style"
                        >
                            <iconify-icon
                                icon={expandedSchema === schema._id ? 'tabler:chevron-up' : 'tabler:settings'}
                                width="14"
                            ></iconify-icon>
                        </button>
                    </div>

                    {/* Expanded: Style Picker & Insert */}
                    {expandedSchema === schema._id && (
                        <div style={{
                            padding: '12px',
                            background: isDark ? '#111827' : '#f8fafc',
                            borderRadius: '0 0 8px 8px',
                            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                            borderTop: 'none'
                        }}>
                            {/* Style Picker */}
                            <div style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Style du tableau
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                                {tableStyles.map(s => (
                                    <button
                                        key={s.key}
                                        style={{
                                            flex: 1,
                                            padding: '8px 4px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            border: selectedStyle === s.key
                                                ? `2px solid ${isDark ? '#4361ee' : '#3b82f6'}`
                                                : `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                                            background: selectedStyle === s.key
                                                ? (isDark ? 'rgba(67,97,238,0.1)' : 'rgba(59,130,246,0.05)')
                                                : (isDark ? '#0e1726' : '#fff'),
                                            transition: 'all 0.15s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                        onClick={() => setSelectedStyle(s.key)}
                                    >
                                        {/* Mini Table Preview */}
                                        <div style={{
                                            width: '100%',
                                            height: '28px',
                                            borderRadius: '3px',
                                            overflow: 'hidden',
                                            border: `1px solid ${s.preview.border}`,
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <div style={{
                                                height: '10px',
                                                background: s.preview.header,
                                                borderBottom: `1px solid ${s.preview.border}`
                                            }} />
                                            <div style={{ flex: 1, background: '#fff' }} />
                                            <div style={{ height: '8px', background: s.preview.bg || '#fff', borderTop: `1px solid ${s.preview.border}` }} />
                                        </div>
                                        <span style={{
                                            fontSize: '9px',
                                            fontWeight: selectedStyle === s.key ? 700 : 500,
                                            color: selectedStyle === s.key
                                                ? (isDark ? '#93c5fd' : '#2563eb')
                                                : (isDark ? '#6b7280' : '#9ca3af')
                                        }}>
                                            {s.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Column Preview */}
                            <div style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Colonnes
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                                {(schema.columns || []).map((col, i) => (
                                    <span key={i} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: isDark ? '#1b2e4b' : '#e0e7ff',
                                        color: isDark ? '#93c5fd' : '#3730a3',
                                        fontSize: '10px',
                                        fontWeight: 500
                                    }}>
                                        {col.label}
                                        <span style={{ fontSize: '8px', color: isDark ? '#4b5563' : '#a5b4fc', fontWeight: 400 }}>
                                            ({col.type})
                                        </span>
                                    </span>
                                ))}
                            </div>

                            {/* Insert Button */}
                            <button
                                style={{
                                    width: '100%',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.15s'
                                }}
                                onClick={() => {
                                    if (insertDynamicTable) {
                                        insertDynamicTable(schema, selectedStyle);
                                    }
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <iconify-icon icon="solar:add-circle-bold" width="16"></iconify-icon>
                                Insérer le tableau
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

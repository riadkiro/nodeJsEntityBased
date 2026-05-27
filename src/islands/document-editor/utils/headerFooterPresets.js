export const EMPTY_HEADER_HTML = '<p style="margin:0;"><br></p>'
export const EMPTY_FOOTER_HTML = '<p style="margin:0;text-align:center;font-size:11px;color:#9ca3af;"><br></p>'

export const BUSINESS_HEADER_HTML = `<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:2px solid #1e40af;margin-bottom:0;">
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

export const SIMPLE_HEADER_HTML = `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:0;">
    <div>
        <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Nom de l'entreprise</p>
        <p style="margin:3px 0 0;font-size:11px;color:#6b7280;">Slogan ou activité</p>
    </div>
    <div style="text-align:right;font-size:11px;color:#6b7280;line-height:1.45;">
        <p style="margin:0;">123 Rue Exemple, 75000 Paris</p>
        <p style="margin:0;">contact@entreprise.fr</p>
    </div>
</div>`

export const BUSINESS_FOOTER_HTML = `<div style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:0;text-align:center;font-size:11px;color:#9ca3af;">
    <p style="margin:0;">Nom de l'entreprise — SIRET : 000 000 000 00000 — TVA : FR00 000000000</p>
    <p style="margin:4px 0 0;">123 Rue Exemple, 75000 Paris — Tél : 01 23 45 67 89 — contact@entreprise.fr</p>
</div>`

export const SIMPLE_FOOTER_HTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:18px;font-size:10px;color:#9ca3af;line-height:1.35;">
    <p style="margin:0;">Nom de l'entreprise</p>
    <p style="margin:0;text-align:right;">contact@entreprise.fr</p>
</div>`

export const HEADER_PRESETS = [
    {
        id: 'blank',
        name: 'Partir de zéro',
        description: 'Zone libre, sans ligne ni structure imposée.',
        icon: 'tabler:edit',
        html: EMPTY_HEADER_HTML
    },
    {
        id: 'business',
        name: 'Modèle entreprise',
        description: 'Nom, slogan, coordonnées et ligne basse.',
        icon: 'tabler:building',
        html: BUSINESS_HEADER_HTML
    },
    {
        id: 'simple',
        name: 'Simple sans ligne',
        description: 'Coordonnées sobres, aucune bordure.',
        icon: 'tabler:layout-navbar',
        html: SIMPLE_HEADER_HTML
    }
]

export const FOOTER_PRESETS = [
    {
        id: 'blank',
        name: 'Partir de zéro',
        description: 'Zone libre, sans ligne ni structure imposée.',
        icon: 'tabler:edit',
        html: EMPTY_FOOTER_HTML
    },
    {
        id: 'business',
        name: 'Modèle entreprise',
        description: 'Mentions, adresse et ligne haute.',
        icon: 'tabler:building',
        html: BUSINESS_FOOTER_HTML
    },
    {
        id: 'simple',
        name: 'Simple sans ligne',
        description: 'Nom et contact, aucune bordure.',
        icon: 'tabler:layout-bottombar',
        html: SIMPLE_FOOTER_HTML
    }
]

export function normalizeHeaderFooterHtml(type, html) {
    const value = String(html || '')
    const visibleMarkup = value
        .replace(/<br\s*\/?>/gi, '')
        .replace(/&nbsp;/gi, '')
        .trim()

    if (!visibleMarkup) {
        return type === 'footer' ? EMPTY_FOOTER_HTML : EMPTY_HEADER_HTML
    }

    return value
}

export function headerFooterHasLine(html, type) {
    const value = String(html || '')
    const edge = type === 'footer' ? 'top' : 'bottom'
    const edgePattern = new RegExp(`border-${edge}\\s*:\\s*(?!0\\b|none\\b)`, 'i')
    return edgePattern.test(value) || /border\s*:\s*(?!0\b|none\b)/i.test(value)
}

export function stripHeaderFooterLineFromElement(root, type) {
    if (!root) return ''

    const edge = type === 'footer' ? 'Top' : 'Bottom'
    const elements = [root, ...Array.from(root.querySelectorAll('*'))]

    elements.forEach(el => {
        if (!el?.style) return
        el.style[`border${edge}`] = 'none'
        el.style[`border${edge}Width`] = '0'
        el.style[`border${edge}Style`] = 'none'
    })

    return root.innerHTML
}

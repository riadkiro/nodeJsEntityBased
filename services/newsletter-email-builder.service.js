function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function numberBetween(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
}

function color(value, fallback) {
    const str = String(value || '').trim();
    if (/^#[0-9a-f]{3,8}$/i.test(str)) return str;
    return fallback;
}

function defaultLayout() {
    return {
        version: '1.0',
        canvas: {
            background: '#f4f6fb',
            contentWidth: 640,
            fontFamily: 'Arial, Helvetica, sans-serif',
            accentColor: '#4361ee'
        },
        blocks: [
            {
                id: makeBlockId(),
                type: 'brand',
                props: {
                    label: 'Dexapp',
                    subtitle: 'Newsletter',
                    align: 'left',
                    background: '#ffffff',
                    color: '#4361ee'
                }
            },
            {
                id: makeBlockId(),
                type: 'hero',
                props: {
                    title: 'Bonjour {{title}}',
                    subtitle: 'Nous voulions vous contacter avec une information utile.',
                    background: '#eef2ff',
                    color: '#0f172a',
                    align: 'left'
                }
            },
            {
                id: makeBlockId(),
                type: 'text',
                props: {
                    text: '<p>Bonjour,</p><p>Nous voulions vous contacter au sujet de <strong>{{title}}</strong>.</p>',
                    color: '#334155',
                    fontSize: 15,
                    lineHeight: 1.65
                }
            },
            {
                id: makeBlockId(),
                type: 'button',
                props: {
                    label: 'En savoir plus',
                    url: '{{link}}',
                    align: 'center',
                    background: '#4361ee',
                    color: '#ffffff'
                }
            },
            {
                id: makeBlockId(),
                type: 'footer',
                props: {
                    text: 'Vous recevez cet email car votre contact est present dans un espace Dexapp.',
                    color: '#94a3b8',
                    background: '#ffffff'
                }
            }
        ]
    };
}

function makeBlockId() {
    return `blk_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function defaultBlock(type = 'text') {
    const id = makeBlockId();
    const blocks = {
        brand: {
            id,
            type: 'brand',
            props: { label: 'Dexapp', subtitle: 'Newsletter', align: 'left', background: '#ffffff', color: '#4361ee' }
        },
        hero: {
            id,
            type: 'hero',
            props: { title: 'Titre principal', subtitle: 'Texte court de presentation.', background: '#eef2ff', color: '#0f172a', align: 'left' }
        },
        text: {
            id,
            type: 'text',
            props: { text: '<p>Nouveau paragraphe...</p>', color: '#334155', fontSize: 15, lineHeight: 1.65 }
        },
        image: {
            id,
            type: 'image',
            props: { url: '', alt: '', width: 100, radius: 12, align: 'center' }
        },
        button: {
            id,
            type: 'button',
            props: { label: 'Action', url: 'https://', align: 'center', background: '#4361ee', color: '#ffffff' }
        },
        divider: {
            id,
            type: 'divider',
            props: { color: '#e5eaf3', size: 1 }
        },
        spacer: {
            id,
            type: 'spacer',
            props: { height: 24 }
        },
        footer: {
            id,
            type: 'footer',
            props: { text: 'Vous recevez cet email car votre contact est present dans un espace Dexapp.', color: '#94a3b8', background: '#ffffff' }
        }
    };
    return blocks[type] || blocks.text;
}

function normalizeBlock(block) {
    const type = ['brand', 'hero', 'text', 'image', 'button', 'divider', 'spacer', 'footer'].includes(block?.type)
        ? block.type
        : 'text';
    const defaults = defaultBlock(type);
    const props = { ...defaults.props, ...(block?.props || {}) };

    if (type === 'hero') {
        props.background = color(props.background, '#eef2ff');
        props.color = color(props.color, '#0f172a');
        props.align = ['left', 'center', 'right'].includes(props.align) ? props.align : 'left';
    }
    if (type === 'brand') {
        props.background = color(props.background, '#ffffff');
        props.color = color(props.color, '#4361ee');
        props.align = ['left', 'center', 'right'].includes(props.align) ? props.align : 'left';
    }
    if (type === 'text') {
        props.color = color(props.color, '#334155');
        props.fontSize = numberBetween(props.fontSize, 11, 28, 15);
        props.lineHeight = numberBetween(props.lineHeight, 1, 2.4, 1.65);
    }
    if (type === 'image') {
        props.width = numberBetween(props.width, 10, 100, 100);
        props.radius = numberBetween(props.radius, 0, 28, 12);
        props.align = ['left', 'center', 'right'].includes(props.align) ? props.align : 'center';
    }
    if (type === 'button') {
        props.background = color(props.background, '#4361ee');
        props.color = color(props.color, '#ffffff');
        props.align = ['left', 'center', 'right'].includes(props.align) ? props.align : 'center';
    }
    if (type === 'divider') {
        props.color = color(props.color, '#e5eaf3');
        props.size = numberBetween(props.size, 1, 8, 1);
    }
    if (type === 'spacer') {
        props.height = numberBetween(props.height, 8, 96, 24);
    }
    if (type === 'footer') {
        props.color = color(props.color, '#94a3b8');
        props.background = color(props.background, '#ffffff');
    }

    return {
        id: String(block?.id || defaults.id || makeBlockId()),
        type,
        props
    };
}

function normalizeLayout(layout) {
    const source = layout && typeof layout === 'object' ? layout : defaultLayout();
    const defaults = defaultLayout();
    const canvas = {
        ...defaults.canvas,
        ...(source.canvas || {})
    };
    canvas.background = color(canvas.background, defaults.canvas.background);
    canvas.accentColor = color(canvas.accentColor, defaults.canvas.accentColor);
    canvas.contentWidth = numberBetween(canvas.contentWidth, 480, 760, defaults.canvas.contentWidth);
    canvas.fontFamily = String(canvas.fontFamily || defaults.canvas.fontFamily);

    const blocks = Array.isArray(source.blocks) && source.blocks.length
        ? source.blocks.map(normalizeBlock)
        : defaults.blocks.map(normalizeBlock);

    return {
        version: '1.0',
        canvas,
        blocks
    };
}

function resolve(value, options = {}, html = true) {
    if (typeof options.renderToken === 'function') {
        return options.renderToken(String(value || ''), { html });
    }
    return html ? escapeHtml(value) : String(value || '');
}

function alignCss(align) {
    return ['left', 'center', 'right'].includes(align) ? align : 'left';
}

function blockHtml(block, layout, options = {}) {
    const p = block.props || {};
    const pad = 'padding:0 32px;';

    if (block.type === 'brand') {
        return `<tr><td style="${pad}padding-top:28px;padding-bottom:18px;background:${p.background};text-align:${alignCss(p.align)};">
            <div style="font-size:15px;font-weight:800;color:${p.color};letter-spacing:0;">${resolve(p.label, options)}</div>
            ${p.subtitle ? `<div style="font-size:12px;color:#94a3b8;margin-top:4px;">${resolve(p.subtitle, options)}</div>` : ''}
        </td></tr>`;
    }

    if (block.type === 'hero') {
        return `<tr><td style="${pad}padding-top:30px;padding-bottom:30px;background:${p.background};text-align:${alignCss(p.align)};">
            <h1 style="margin:0;font-size:28px;line-height:1.22;color:${p.color};font-weight:800;letter-spacing:0;">${resolve(p.title, options)}</h1>
            ${p.subtitle ? `<div style="margin-top:12px;font-size:15px;line-height:1.6;color:#64748b;">${resolve(p.subtitle, options)}</div>` : ''}
        </td></tr>`;
    }

    if (block.type === 'text') {
        return `<tr><td style="${pad}padding-top:18px;padding-bottom:18px;background:#ffffff;color:${p.color};font-size:${p.fontSize}px;line-height:${p.lineHeight};">
            ${resolve(p.text, options)}
        </td></tr>`;
    }

    if (block.type === 'image') {
        const url = resolve(p.url, options, false);
        if (!url) return '';
        return `<tr><td style="${pad}padding-top:18px;padding-bottom:18px;background:#ffffff;text-align:${alignCss(p.align)};">
            <img src="${escapeHtml(url)}" alt="${escapeHtml(resolve(p.alt, options, false))}" style="display:inline-block;width:${p.width}%;max-width:100%;height:auto;border-radius:${p.radius}px;border:0;">
        </td></tr>`;
    }

    if (block.type === 'button') {
        const url = resolve(p.url, options, false) || '#';
        return `<tr><td style="${pad}padding-top:20px;padding-bottom:24px;background:#ffffff;text-align:${alignCss(p.align)};">
            <a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 24px;background:${p.background};color:${p.color};font-size:14px;font-weight:800;text-decoration:none;border-radius:10px;">${resolve(p.label, options)}</a>
        </td></tr>`;
    }

    if (block.type === 'divider') {
        return `<tr><td style="${pad}background:#ffffff;"><div style="border-top:${p.size}px solid ${p.color};height:0;line-height:0;font-size:0;">&nbsp;</div></td></tr>`;
    }

    if (block.type === 'spacer') {
        return `<tr><td style="height:${p.height}px;line-height:${p.height}px;font-size:${p.height}px;background:#ffffff;">&nbsp;</td></tr>`;
    }

    if (block.type === 'footer') {
        return `<tr><td style="${pad}padding-top:18px;padding-bottom:22px;background:${p.background};color:${p.color};font-size:11px;line-height:1.5;text-align:center;border-top:1px solid #eef2f7;">
            ${resolve(p.text, options)}
        </td></tr>`;
    }

    return '';
}

function renderLayoutHtml(layout, options = {}) {
    const normalized = normalizeLayout(layout);
    const preheader = resolve(options.preheader || '', options, false);
    const rows = normalized.blocks.map(block => blockHtml(block, normalized, options)).join('');

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${normalized.canvas.background};font-family:${normalized.canvas.fontFamily};color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${normalized.canvas.background};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="${normalized.canvas.contentWidth}" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:${normalized.canvas.contentWidth}px;background:#ffffff;border:1px solid #e5eaf3;border-radius:16px;overflow:hidden;">
          ${rows}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function stripTags(value) {
    return String(value || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function layoutToText(layout) {
    const normalized = normalizeLayout(layout);
    return normalized.blocks
        .map(block => {
            const p = block.props || {};
            if (block.type === 'brand') return [p.label, p.subtitle].filter(Boolean).join(' - ');
            if (block.type === 'hero') return [p.title, p.subtitle].filter(Boolean).join('\n');
            if (block.type === 'text') return stripTags(p.text);
            if (block.type === 'button') return [p.label, p.url].filter(Boolean).join(': ');
            if (block.type === 'footer') return stripTags(p.text);
            return '';
        })
        .filter(Boolean)
        .join('\n\n');
}

module.exports = {
    defaultBlock,
    defaultLayout,
    layoutToText,
    makeBlockId,
    normalizeBlock,
    normalizeLayout,
    renderLayoutHtml
};

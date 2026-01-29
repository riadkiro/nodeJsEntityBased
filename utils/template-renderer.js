/**
 * Template Renderer - Production Safe
 * Single-pass template rendering with global token replacement
 */

const { extractTokens } = require('./template-parser');
const { resolveToken, indexCustomFields } = require('./field-resolver');

/**
 * Pre-process bindings to index custom fields for O(1) access
 * Call this BEFORE rendering to ensure all records have cf index
 * 
 * @param {Object} context - Context with bindings
 * @returns {Object} Same context with indexed custom fields
 */
function prepareContext(context) {
    // Index all binding records
    if (context.bindings) {
        for (const key of Object.keys(context.bindings)) {
            const record = context.bindings[key];
            if (record && record.customFields && !record.cf) {
                record.cf = indexCustomFields(record);
            }
        }
    }
    return context;
}

/**
 * Build context object for template rendering
 * 
 * @param {Object} options - Context options
 * @param {Object} options.bindings - Entity records { client, company, invoice }
 * @param {Object} options.document - Document metadata
 * @param {Object} options.user - Current user
 * @param {Object} options.queries - Query results { paymentModes, etc }
 * @returns {Object} Prepared context
 */
function buildContext({ bindings = {}, document = {}, user = {}, queries = {} }) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const context = {
        bindings: { ...bindings },
        globals: {
            date: {
                today: now.toLocaleDateString('fr-FR'),
                yesterday: yesterday.toLocaleDateString('fr-FR'),
                tomorrow: tomorrow.toLocaleDateString('fr-FR'),
                nextMonth: nextMonth.toLocaleDateString('fr-FR'),
                year: now.getFullYear().toString()
            },
            doc: {
                name: document.name || '',
                number: document.number || '',
                format: document.format || '',
                createdAt: document.createdAt ? new Date(document.createdAt).toLocaleDateString('fr-FR') : ''
            },
            user: {
                name: user.name || user.firstName || '',
                email: user.email || ''
            },
            company: {
                name: user.company?.name || '',
                vat: user.company?.vat || '',
                address: user.company?.address || '',
                phone: user.company?.phone || '',
                email: user.company?.email || ''
            }
        },
        queries: { ...queries }
    };

    return prepareContext(context);
}

/**
 * Render template with single-pass token replacement
 * 
 * @param {string} templateContent - Template HTML with tokens
 * @param {Object} context - Resolution context from buildContext()
 * @param {Function} tenantCollectionFn - Function to get tenant collections
 * @returns {Promise<string>} Rendered template
 * 
 * @example
 * const context = buildContext({ bindings: { client }, document, user });
 * const html = await renderTemplate(template, context, tenantCollection);
 */
async function renderTemplate(templateContent, context, tenantCollectionFn) {
    // 1. Extract all tokens from template
    const tokens = extractTokens(templateContent);

    if (tokens.length === 0) {
        return templateContent;
    }

    // 2. Build token → value resolution map (deduplicated)
    const tokenMap = {};
    for (const token of tokens) {
        if (!(token.raw in tokenMap)) {
            try {
                const value = await resolveToken(token.parsed, context, tenantCollectionFn);
                tokenMap[token.raw] = value ?? '';
            } catch (error) {
                console.error(`[TemplateRenderer] Error resolving token ${token.raw}: ${error.message}`);
                tokenMap[token.raw] = '';
            }
        }
    }

    // 3. Single-pass replace all tokens using global regex
    let result = templateContent;
    for (const [tokenRaw, value] of Object.entries(tokenMap)) {
        // Escape special regex characters in token
        const escaped = tokenRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'g');
        result = result.replace(regex, value);
    }

    return result;
}

/**
 * Render template synchronously for simple cases (no relations)
 * Only works if all tokens are standard fields or pre-resolved
 * 
 * @param {string} templateContent - Template HTML
 * @param {Object} context - Resolution context
 * @returns {string} Rendered template
 */
function renderTemplateSync(templateContent, context) {
    const tokens = extractTokens(templateContent);

    if (tokens.length === 0) {
        return templateContent;
    }

    const tokenMap = {};
    for (const token of tokens) {
        if (!(token.raw in tokenMap)) {
            const { alias, path, isCustomField, fieldId } = token.parsed;

            // Only handle standard fields synchronously
            if (!isCustomField) {
                const record = context.bindings?.[alias] ||
                    context.globals?.[alias] ||
                    context.queries?.[alias];
                if (record) {
                    const value = path.split('.').reduce((acc, part) => acc?.[part], record) ?? '';
                    tokenMap[token.raw] = value;
                } else {
                    tokenMap[token.raw] = '';
                }
            } else {
                // Custom field - check if already indexed
                const record = context.bindings?.[alias];
                if (record?.cf?.[fieldId]) {
                    tokenMap[token.raw] = record.cf[fieldId].value ?? '';
                } else {
                    tokenMap[token.raw] = '';
                }
            }
        }
    }

    let result = templateContent;
    for (const [tokenRaw, value] of Object.entries(tokenMap)) {
        const escaped = tokenRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'g');
        result = result.replace(regex, value);
    }

    return result;
}

module.exports = {
    renderTemplate,
    renderTemplateSync,
    buildContext,
    prepareContext
};

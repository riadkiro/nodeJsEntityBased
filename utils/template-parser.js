/**
 * Template Parser - Production Safe
 * Strict regex-based token parser for template variable resolution
 * 
 * Token Formats:
 * - Standard: {{alias.field}}
 * - Custom: {{alias.cf.fieldName@fieldId}}
 * - Custom Relation: {{alias.cf.relation@fieldId.property}}
 */

// Match all tokens in template
const TOKEN_REGEX = /\{\{([a-zA-Z0-9_]+)\.(.+?)\}\}/g;

// Match custom field with @fieldId
// Captures: cf.fieldName@fieldId.chainedPath
const FIELD_ID_REGEX = /^(cf\.[a-zA-Z0-9_]+)@([a-zA-Z0-9_]+)(.*)$/;

/**
 * Parse a single token
 * 
 * @param {string} token - Full token including {{ }}
 * @returns {Object|null} Parsed token object
 * 
 * @example
 * parseToken("{{client.cf.nom@field_abc123}}")
 * // Returns: {
 * //   alias: "client",
 * //   path: "cf.nom",
 * //   fieldId: "field_abc123",
 * //   isCustomField: true,
 * //   chainedPath: null
 * // }
 * 
 * @example
 * parseToken("{{client.cf.country@field_rel.name}}")
 * // Returns: {
 * //   alias: "client",
 * //   path: "cf.country",
 * //   fieldId: "field_rel",
 * //   isCustomField: true,
 * //   chainedPath: "name"
 * // }
 * 
 * @example
 * parseToken("{{client.name}}")
 * // Returns: {
 * //   alias: "client",
 * //   path: "name",
 * //   fieldId: null,
 * //   isCustomField: false,
 * //   chainedPath: null
 * // }
 */
function parseToken(token) {
    // Remove {{ }}
    const content = token.replace(/^\{\{|\}\}$/g, '');

    // Split alias from rest
    const firstDot = content.indexOf('.');
    if (firstDot === -1) return null;

    const alias = content.substring(0, firstDot);
    const rest = content.substring(firstDot + 1);

    // Check if it's a custom field (has cf. prefix and @fieldId)
    const fieldIdMatch = rest.match(FIELD_ID_REGEX);

    if (fieldIdMatch) {
        // Custom field with fieldId
        return {
            alias: alias,
            path: fieldIdMatch[1], // "cf.nom"
            fieldId: fieldIdMatch[2], // "field_abc123"
            isCustomField: true,
            chainedPath: fieldIdMatch[3] ? fieldIdMatch[3].substring(1) : null // ".name" -> "name"
        };
    } else {
        // Standard field
        return {
            alias: alias,
            path: rest,
            fieldId: null,
            isCustomField: false,
            chainedPath: null
        };
    }
}

/**
 * Extract all tokens from template content
 * 
 * @param {string} content - Template content with tokens
 * @returns {Array} Array of { raw, parsed } objects
 * 
 * @example
 * extractTokens("Hello {{client.name}}, your invoice is {{invoice.number}}")
 * // Returns: [
 * //   { raw: "{{client.name}}", parsed: {...} },
 * //   { raw: "{{invoice.number}}", parsed: {...} }
 * // ]
 */
function extractTokens(content) {
    const tokens = [];
    let match;

    // Reset regex lastIndex for fresh iteration
    TOKEN_REGEX.lastIndex = 0;

    while ((match = TOKEN_REGEX.exec(content)) !== null) {
        const parsed = parseToken(match[0]);
        if (parsed) {
            tokens.push({
                raw: match[0],
                parsed: parsed
            });
        }
    }

    return tokens;
}

module.exports = {
    parseToken,
    extractTokens,
    TOKEN_REGEX,
    FIELD_ID_REGEX
};

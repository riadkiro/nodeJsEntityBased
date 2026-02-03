/**
 * Secrets Redaction Utility
 * Masks sensitive data in headers and query params before logging
 */

// Headers to always redact (case-insensitive)
const SENSITIVE_HEADERS = [
    'authorization',
    'x-api-key',
    'x-auth-token',
    'api-key',
    'bearer'
];

// Query params to always redact (case-insensitive)
const SENSITIVE_PARAMS = [
    'token',
    'api_key',
    'apikey',
    'client_id',
    'client_secret',
    'access_token',
    'secret',
    'key',
    'password'
];

// Patterns to match in any key name
const SENSITIVE_PATTERNS = [
    /token/i,
    /secret/i,
    /password/i,
    /apikey/i,
    /api_key/i
];

const REDACTED = '***REDACTED***';

/**
 * Check if a key is sensitive
 * @param {string} key - Header or param name
 * @param {string[]} sensitiveList - List of sensitive names
 * @returns {boolean}
 */
function isSensitiveKey(key, sensitiveList) {
    const lowerKey = key.toLowerCase();

    // Check exact match
    if (sensitiveList.includes(lowerKey)) {
        return true;
    }

    // Check patterns
    for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(key)) {
            return true;
        }
    }

    return false;
}

/**
 * Redact sensitive headers
 * @param {object} headers - Request/response headers
 * @returns {object} - Redacted headers copy
 */
function redactHeaders(headers) {
    if (!headers || typeof headers !== 'object') {
        return headers;
    }

    const redacted = {};
    for (const [key, value] of Object.entries(headers)) {
        if (isSensitiveKey(key, SENSITIVE_HEADERS)) {
            redacted[key] = REDACTED;
        } else {
            redacted[key] = value;
        }
    }
    return redacted;
}

/**
 * Redact sensitive query parameters
 * @param {object} params - Query parameters object
 * @returns {object} - Redacted params copy
 */
function redactQueryParams(params) {
    if (!params || typeof params !== 'object') {
        return params;
    }

    const redacted = {};
    for (const [key, value] of Object.entries(params)) {
        if (isSensitiveKey(key, SENSITIVE_PARAMS)) {
            redacted[key] = REDACTED;
        } else {
            redacted[key] = value;
        }
    }
    return redacted;
}

/**
 * Redact sensitive URL query string
 * @param {string} url - Full URL with query string
 * @returns {string} - URL with redacted query params
 */
function redactUrl(url) {
    if (!url || typeof url !== 'string') {
        return url;
    }

    try {
        const urlObj = new URL(url);
        for (const key of urlObj.searchParams.keys()) {
            if (isSensitiveKey(key, SENSITIVE_PARAMS)) {
                urlObj.searchParams.set(key, REDACTED);
            }
        }
        return urlObj.toString();
    } catch {
        // If URL parsing fails, return original
        return url;
    }
}

/**
 * Truncate string to max bytes
 * @param {string} str - String to truncate
 * @param {number} maxBytes - Maximum bytes (default 2KB)
 * @returns {string} - Truncated string
 */
function truncateBody(str, maxBytes = 2048) {
    if (!str || typeof str !== 'string') {
        return str;
    }

    if (Buffer.byteLength(str, 'utf8') <= maxBytes) {
        return str;
    }

    // Truncate by bytes, not characters
    const buffer = Buffer.from(str, 'utf8');
    const truncated = buffer.slice(0, maxBytes).toString('utf8');
    return truncated + '... [TRUNCATED]';
}

module.exports = {
    redactHeaders,
    redactQueryParams,
    redactUrl,
    truncateBody,
    REDACTED
};

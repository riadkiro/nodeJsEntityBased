/**
 * Template Resolver
 * Recursively resolves {{variable}} placeholders in strings, objects, and arrays
 * Supports: {{input.field}}, {{input.nested.value}}, {{input.items[0].id}}, {{secrets.token}}
 */

const { getValueByPath } = require('./pathUtils');

/**
 * Resolve all {{variable}} placeholders in a value
 * @param {string|object|array} value - Value to resolve
 * @param {object} context - Context with input, secrets, etc.
 * @returns {any} - Resolved value
 */
function resolveTemplate(value, context) {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return value;
    }

    // Handle strings - replace {{placeholders}}
    if (typeof value === 'string') {
        return resolveString(value, context);
    }

    // Handle arrays - resolve each element
    if (Array.isArray(value)) {
        return value.map(item => resolveTemplate(item, context));
    }

    // Handle objects - resolve each value
    if (typeof value === 'object') {
        const resolved = {};
        for (const [key, val] of Object.entries(value)) {
            resolved[key] = resolveTemplate(val, context);
        }
        return resolved;
    }

    // Return primitives as-is (numbers, booleans)
    return value;
}

/**
 * Resolve placeholders in a string
 * @param {string} str - String with {{placeholders}}
 * @param {object} context - Context object
 * @returns {string|any} - Resolved value (may return non-string if entire string is one placeholder)
 */
function resolveString(str, context) {
    // Check if entire string is a single placeholder
    const singleMatch = str.match(/^\{\{([^}]+)\}\}$/);
    if (singleMatch) {
        // Return actual value (preserves type: number, boolean, object)
        return getValueByPath(context, singleMatch[1].trim());
    }

    // Replace multiple placeholders in string
    return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const value = getValueByPath(context, path.trim());
        // Convert to string for concatenation
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    });
}

module.exports = {
    resolveTemplate,
    resolveString
};

/**
 * Path Utilities
 * Extract values from objects using dot notation and array access
 */

/**
 * Get value from object by path string
 * Supports: a.b.c, a[0].b, a.b[2].c
 * @param {object} obj - Source object
 * @param {string} path - Path string (e.g., "input.items[0].name")
 * @returns {any} - Extracted value or undefined
 */
function getValueByPath(obj, path) {
    if (!obj || !path) {
        return undefined;
    }

    // Normalize path: convert [0] to .0
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    const parts = normalizedPath.split('.');

    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[part];
    }

    return current;
}

/**
 * Set value in object by path string
 * Creates intermediate objects/arrays as needed
 * @param {object} obj - Target object
 * @param {string} path - Path string
 * @param {any} value - Value to set
 */
function setValueByPath(obj, path, value) {
    if (!obj || !path) {
        return;
    }

    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    const parts = normalizedPath.split('.');

    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];

        if (current[part] === undefined) {
            // Create array or object based on next part
            current[part] = /^\d+$/.test(nextPart) ? [] : {};
        }
        current = current[part];
    }

    current[parts[parts.length - 1]] = value;
}

/**
 * Apply response mapping to extract values
 * @param {object} response - API response object
 * @param {object} mapping - Mapping config { outputKey: "path.to.value" }
 * @returns {object} - Mapped output
 */
function applyResponseMapping(response, mapping) {
    if (!mapping || typeof mapping !== 'object') {
        return response;
    }

    const result = {};
    for (const [outputKey, path] of Object.entries(mapping)) {
        if (typeof path === 'string') {
            result[outputKey] = getValueByPath(response, path);
        }
    }
    return result;
}

module.exports = {
    getValueByPath,
    setValueByPath,
    applyResponseMapping
};

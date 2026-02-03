/**
 * HTTP Runner Service
 * Generic HTTP executor for integration actions
 * Handles auth injection, template resolution, response mapping, and logging
 */

const axios = require('axios');
const { resolveTemplate } = require('../utils/templateResolver');
const { applyResponseMapping } = require('../utils/pathUtils');
const { redactHeaders, redactQueryParams, redactUrl, truncateBody } = require('../utils/redactSecrets');

// Default timeout (30 seconds)
const DEFAULT_TIMEOUT = 30000;

/**
 * Execute an HTTP request for an integration action
 * @param {object} options
 * @param {object} options.provider - IntegrationProvider document
 * @param {object} options.action - IntegrationAction document
 * @param {object} options.input - User input data
 * @param {object} options.secrets - Decrypted secrets (e.g., { token: "xyz" })
 * @returns {Promise<object>} - Execution result
 */
async function execute({ provider, action, input = {}, secrets = {} }) {
    const startTime = Date.now();

    // Build resolution context
    const context = {
        input,
        secrets
    };

    try {
        // 1. Build URL
        const basePath = provider.baseUrl.replace(/\/$/, '');
        const actionPath = action.http.path.startsWith('/')
            ? action.http.path
            : '/' + action.http.path;
        let url = basePath + actionPath;

        // 2. Resolve request template
        const resolvedQuery = resolveTemplate(action.requestTemplate?.query || {}, context);
        const resolvedHeaders = resolveTemplate(action.requestTemplate?.headers || {}, context);
        const resolvedBody = resolveTemplate(action.requestTemplate?.body || {}, context);

        // 3. Build headers (merge default + action + auth)
        const headers = {
            ...objectFromMap(provider.defaultHeaders),
            ...resolvedHeaders
        };

        // 4. Inject authentication
        injectAuth(provider, secrets, headers, resolvedQuery);

        // 5. Build axios config
        const config = {
            method: action.http.method.toLowerCase(),
            url,
            headers,
            params: resolvedQuery,
            timeout: DEFAULT_TIMEOUT
        };

        // Add body for methods that support it
        if (['post', 'put', 'patch'].includes(config.method)) {
            if (Object.keys(resolvedBody).length > 0) {
                config.data = resolvedBody;
                // Default to JSON
                if (!headers['Content-Type'] && !headers['content-type']) {
                    headers['Content-Type'] = 'application/json';
                }
            }
        }

        // 6. Execute request
        const response = await axios(config);

        const latencyMs = Date.now() - startTime;

        // 7. Apply response mapping
        const mappedData = action.responseMapping && Object.keys(action.responseMapping).length > 0
            ? applyResponseMapping(response.data, action.responseMapping)
            : response.data;

        return {
            success: true,
            httpStatus: response.status,
            data: mappedData,
            raw: response.data,
            latencyMs,
            errorType: null,
            // Metadata for logging (redacted)
            meta: buildRequestMeta(config, response, latencyMs)
        };

    } catch (error) {
        const latencyMs = Date.now() - startTime;
        const result = handleError(error, latencyMs);

        // Add request meta if available
        if (error.config) {
            result.meta = buildRequestMeta(error.config, error.response, latencyMs);
        }

        return result;
    }
}

/**
 * Inject authentication into request
 */
function injectAuth(provider, secrets, headers, query) {
    if (provider.authType === 'none' || !secrets.token) {
        return;
    }

    const injection = provider.authInjection || {};
    const format = injection.format || '{{token}}';
    const value = format.replace('{{token}}', secrets.token);
    const name = injection.name || 'Authorization';

    if (injection.mode === 'query') {
        query[name] = value;
    } else {
        // Default to header
        headers[name] = value;
    }
}

/**
 * Convert Mongoose Map to plain object
 */
function objectFromMap(map) {
    if (!map) return {};
    if (map instanceof Map) {
        return Object.fromEntries(map);
    }
    if (typeof map.toObject === 'function') {
        return map.toObject();
    }
    return map;
}

/**
 * Handle axios errors and classify them
 */
function handleError(error, latencyMs) {
    let httpStatus = null;
    let errorType = 'network';
    let errorMessage = error.message;

    if (error.response) {
        // Server responded with error
        httpStatus = error.response.status;

        if (httpStatus === 401 || httpStatus === 403) {
            errorType = 'auth';
        } else if (httpStatus === 429) {
            errorType = 'rate_limit';
        }

        // Try to extract error message from response
        if (error.response.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
                errorMessage = typeof error.response.data.error === 'string'
                    ? error.response.data.error
                    : JSON.stringify(error.response.data.error);
            }
        }
    } else if (error.code === 'ECONNABORTED') {
        errorType = 'network';
        errorMessage = 'Request timeout';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorType = 'network';
    }

    return {
        success: false,
        httpStatus,
        data: null,
        raw: error.response?.data || null,
        latencyMs,
        errorType,
        errorMessage
    };
}

/**
 * Build request metadata for logging (redacted)
 */
function buildRequestMeta(config, response, latencyMs) {
    const requestMeta = {
        method: config.method?.toUpperCase(),
        url: redactUrl(config.url + (config.params ? '?' + new URLSearchParams(config.params).toString() : '')),
        headers: redactHeaders(config.headers || {}),
        query: redactQueryParams(config.params || {}),
        bodySize: config.data ? JSON.stringify(config.data).length : 0
    };

    let responseMeta = null;
    if (response) {
        const bodyStr = typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data || '');

        responseMeta = {
            status: response.status,
            headers: redactHeaders(response.headers || {}),
            bodyPreview: truncateBody(bodyStr),
            bodySize: bodyStr.length
        };
    }

    return { requestMeta, responseMeta, latencyMs };
}

module.exports = {
    execute
};

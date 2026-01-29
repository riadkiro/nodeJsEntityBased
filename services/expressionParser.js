/**
 * Safe Expression Parser
 * NO eval() or Function() - uses recursive descent parsing
 */
const dayjs = require('dayjs');

// ============================================
// Built-in Functions (safe, whitelisted)
// ============================================
const FUNCTIONS = {
    // Aggregation
    sum: (arr, field) => {
        if (!Array.isArray(arr)) return 0;
        return arr.reduce((acc, item) => acc + (parseFloat(getPath(item, field)) || 0), 0);
    },
    avg: (arr, field) => {
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        return FUNCTIONS.sum(arr, field) / arr.length;
    },
    count: (arr) => Array.isArray(arr) ? arr.length : 0,
    min: (arr, field) => {
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        const values = arr.map(item => parseFloat(getPath(item, field)) || 0);
        return Math.min(...values);
    },
    max: (arr, field) => {
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        const values = arr.map(item => parseFloat(getPath(item, field)) || 0);
        return Math.max(...values);
    },

    // Formatting
    formatCurrency: (value, currency = 'EUR') => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency
        }).format(num);
    },
    formatNumber: (value, decimals = 2) => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },
    formatDate: (value, format = 'DD/MM/YYYY') => {
        if (!value) return '';
        return dayjs(value).format(format);
    },
    formatPercent: (value, decimals = 0) => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('fr-FR', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num / 100);
    },

    // Math
    round: (value, decimals = 2) => {
        const num = parseFloat(value) || 0;
        const factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
    },
    floor: (value) => Math.floor(parseFloat(value) || 0),
    ceil: (value) => Math.ceil(parseFloat(value) || 0),
    abs: (value) => Math.abs(parseFloat(value) || 0),

    // String
    uppercase: (value) => String(value || '').toUpperCase(),
    lowercase: (value) => String(value || '').toLowerCase(),
    capitalize: (value) => {
        const str = String(value || '');
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Conditional
    ifEmpty: (value, defaultValue) => {
        return (value === undefined || value === null || value === '')
            ? defaultValue
            : value;
    }
};

// ============================================
// Path Utilities
// ============================================

/**
 * Get nested value from object: "client.address.city"
 * @param {Object} obj - Source object
 * @param {string} path - Dot-separated path
 * @returns {*} - Value at path or undefined
 */
function getPath(obj, path) {
    if (!obj || !path) return undefined;
    if (typeof path !== 'string') return undefined;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
    }

    return current;
}

/**
 * Set nested value in object
 */
function setPath(obj, path, value) {
    if (!obj || !path) return;
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        if (current[parts[i]] === undefined) {
            current[parts[i]] = {};
        }
        current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
}

// ============================================
// Expression Tokenizer
// ============================================

/**
 * Tokenize math expression
 */
function tokenize(expr) {
    const tokens = [];
    let i = 0;

    while (i < expr.length) {
        const char = expr[i];

        // Skip whitespace
        if (/\s/.test(char)) {
            i++;
            continue;
        }

        // Number (including decimals)
        if (/[\d.]/.test(char)) {
            let num = '';
            while (i < expr.length && /[\d.]/.test(expr[i])) {
                num += expr[i++];
            }
            tokens.push({ type: 'number', value: parseFloat(num) });
            continue;
        }

        // Operator
        if (['+', '-', '*', '/', '(', ')'].includes(char)) {
            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
        }

        // Variable reference (alphanumeric + dots + underscores)
        if (/[a-zA-Z_]/.test(char)) {
            let name = '';
            while (i < expr.length && /[\w.]/.test(expr[i])) {
                name += expr[i++];
            }
            tokens.push({ type: 'variable', value: name });
            continue;
        }

        // Unknown character, skip
        i++;
    }

    return tokens;
}

// ============================================
// Safe Math Parser (Recursive Descent)
// ============================================

/**
 * Parse and evaluate math expression safely
 * @param {string} expr - Math expression
 * @param {Object} scope - Variable scope
 * @returns {number} - Result
 */
function safeMathEval(expr, scope = {}) {
    const tokens = tokenize(expr);
    let pos = 0;

    function peek() {
        return tokens[pos];
    }

    function consume() {
        return tokens[pos++];
    }

    function parseExpression() {
        let left = parseTerm();

        while (peek() && (peek().value === '+' || peek().value === '-')) {
            const op = consume().value;
            const right = parseTerm();
            left = op === '+' ? left + right : left - right;
        }

        return left;
    }

    function parseTerm() {
        let left = parseFactor();

        while (peek() && (peek().value === '*' || peek().value === '/')) {
            const op = consume().value;
            const right = parseFactor();
            left = op === '*' ? left * right : (right !== 0 ? left / right : 0);
        }

        return left;
    }

    function parseFactor() {
        const token = peek();

        if (!token) return 0;

        // Parentheses
        if (token.value === '(') {
            consume(); // (
            const result = parseExpression();
            consume(); // )
            return result;
        }

        // Number
        if (token.type === 'number') {
            consume();
            return token.value;
        }

        // Variable
        if (token.type === 'variable') {
            consume();
            const value = getPath(scope, token.value);
            return parseFloat(value) || 0;
        }

        // Unary minus
        if (token.value === '-') {
            consume();
            return -parseFactor();
        }

        return 0;
    }

    return parseExpression();
}

// ============================================
// Function Parser
// ============================================

/**
 * Parse function call: sum(lineItems, 'line_total')
 */
function parseFunction(expr, scope) {
    const match = expr.match(/^(\w+)\s*\(\s*(.+)\s*\)$/);
    if (!match) return null;

    const [, funcName, argsStr] = match;
    if (!FUNCTIONS[funcName]) return `[Unknown: ${funcName}]`;

    const args = parseFunctionArgs(argsStr, scope);

    try {
        return FUNCTIONS[funcName](...args);
    } catch (e) {
        return `[Error: ${funcName}]`;
    }
}

/**
 * Parse function arguments with proper handling of strings and nested calls
 */
function parseFunctionArgs(argsStr, scope) {
    const args = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let depth = 0;

    for (let i = 0; i < argsStr.length; i++) {
        const char = argsStr[i];

        if ((char === '"' || char === "'") && !inString) {
            inString = true;
            stringChar = char;
            current += char;
        } else if (char === stringChar && inString) {
            inString = false;
            current += char;
        } else if (char === '(' && !inString) {
            depth++;
            current += char;
        } else if (char === ')' && !inString) {
            depth--;
            current += char;
        } else if (char === ',' && !inString && depth === 0) {
            args.push(resolveArg(current.trim(), scope));
            current = '';
        } else {
            current += char;
        }
    }

    if (current.trim()) {
        args.push(resolveArg(current.trim(), scope));
    }

    return args;
}

/**
 * Resolve a single argument
 */
function resolveArg(arg, scope) {
    // String literal
    if ((arg.startsWith('"') && arg.endsWith('"')) ||
        (arg.startsWith("'") && arg.endsWith("'"))) {
        return arg.slice(1, -1);
    }

    // Number
    if (/^-?\d+(\.\d+)?$/.test(arg)) {
        return parseFloat(arg);
    }

    // Nested function
    if (/^\w+\s*\(/.test(arg)) {
        return parseFunction(arg, scope);
    }

    // Variable reference
    return getPath(scope, arg);
}

// ============================================
// Main Expression Evaluator
// ============================================

/**
 * Evaluate a single token expression (without {{ }})
 * @param {string} expression - Expression like "client.name" or "record.price * row.qty"
 * @param {Object} scope - Variable scope
 * @returns {*} - Evaluated result
 */
function evaluateToken(expression, scope) {
    if (!expression || typeof expression !== 'string') return '';
    expression = expression.trim();

    // 1. Function call: sum(lineItems, 'line_total')
    if (/^\w+\s*\(/.test(expression)) {
        const result = parseFunction(expression, scope);
        return result !== null ? result : '';
    }

    // 2. Math expression: record.price * row.qty
    if (/[+\-*/]/.test(expression) && !/^[\w.]+$/.test(expression)) {
        return safeMathEval(expression, scope);
    }

    // 3. Simple property access: client.name
    const value = getPath(scope, expression);
    return value !== undefined ? value : '';
}

/**
 * Replace all {{tokens}} in a string
 * @param {string} str - String with {{tokens}}
 * @param {Object} scope - Variable scope
 * @returns {string} - String with tokens replaced
 */
function resolveTokens(str, scope) {
    if (!str || typeof str !== 'string') return str;

    return str.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
        const result = evaluateToken(expr, scope);
        // Return empty string for undefined/null, otherwise convert to string
        if (result === undefined || result === null) return '';
        return String(result);
    });
}

/**
 * Find all tokens in a string
 * @param {string} str - String to search
 * @returns {Array} - Array of token strings (without {{ }})
 */
function findTokens(str) {
    if (!str || typeof str !== 'string') return [];
    const matches = str.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(match => match.slice(2, -2).trim());
}

/**
 * Check if a string contains tokens
 */
function hasTokens(str) {
    if (!str || typeof str !== 'string') return false;
    return /\{\{[^}]+\}\}/.test(str);
}

module.exports = {
    // Core
    evaluateToken,
    resolveTokens,

    // Utilities
    getPath,
    setPath,
    findTokens,
    hasTokens,

    // For testing
    safeMathEval,
    parseFunction,
    FUNCTIONS
};

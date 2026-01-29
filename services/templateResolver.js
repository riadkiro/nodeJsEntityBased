/**
 * Template Resolver Service
 * Main rendering pipeline for dynamic templates
 */
const mongoose = require('mongoose');
const { resolveAllGlobals } = require('./globalVariables');
const { resolveTokens, evaluateToken, getPath } = require('./expressionParser');
const Record = require('../models/record.model');

// ============================================
// Main Resolution Pipeline
// ============================================

/**
 * Resolve a document instance from template
 * @param {Object} instance - DocumentInstance document
 * @param {Object} template - Document template
 * @param {Object} options - { user, workspace }
 * @returns {string} - Rendered HTML
 */
async function resolveDocument(instance, template, options = {}) {
    // Build initial context
    const context = {
        document: template,
        instance,
        user: options.user,
        workspace: options.workspace
    };

    // Step 1: Resolve globals (nested object)
    context.globals = resolveAllGlobals(context);

    // Step 2: Resolve single bindings (fetch full records)
    context.bindings = await resolveSingleBindings(template, instance);

    // Step 3: Resolve query collections (evaluate filter tokens first)
    context.queries = await resolveQueries(template, context);

    // Step 4: Batch fetch records for editable tables
    context.recordsById = await batchFetchRecords(instance);

    // Step 5: Build computed datasets from editable tables (for sum, etc.)
    context.datasets = buildDatasets(template, instance, context);

    // Step 6: Render all blocks
    const html = renderBlocks(template.contentBlocks, context, instance);

    return html;
}

// ============================================
// Binding Resolution
// ============================================

/**
 * Resolve single bindings to full record objects
 */
async function resolveSingleBindings(template, instance) {
    const bindings = {};
    const recordsToFetch = [];

    for (const col of template.collections || []) {
        if (col.type !== 'single') continue;

        const recordId = col.selectionMode === 'fixed'
            ? col.fixedRecordId
            : instance.bindingsSelected?.[col.alias];

        if (recordId) {
            recordsToFetch.push({ alias: col.alias, id: recordId });
        }
    }

    if (recordsToFetch.length === 0) return bindings;

    // Batch fetch all single binding records
    const records = await Record.find({
        _id: { $in: recordsToFetch.map(r => r.id) }
    }).populate('customFields.field_id').lean();

    // Map by ID
    const recordMap = {};
    for (const r of records) {
        recordMap[r._id.toString()] = flattenRecord(r);
    }

    // Assign to bindings
    for (const { alias, id } of recordsToFetch) {
        bindings[alias] = recordMap[id.toString()] || {};
    }

    return bindings;
}

/**
 * Resolve query collections
 * Filter tokens are evaluated before running Mongo query
 */
async function resolveQueries(template, context) {
    const queries = {};

    for (const col of template.collections || []) {
        if (col.type !== 'query') continue;

        // Build Mongo query
        const mongoQuery = { entityId: col.entityId };

        // Process filters
        for (const filter of col.query?.filters || []) {
            let value = filter.value;

            // Evaluate token values: "{{invoice._id}}" → actual ID
            if (filter.valueIsToken && typeof value === 'string') {
                const scope = { ...context.globals, ...context.bindings };
                value = resolveTokens(value, scope);
            }

            // Build field path for custom fields
            const fieldPath = filter.fieldId
                ? `customFields.${filter.fieldId}`
                : filter.field;

            // Apply operator
            switch (filter.operator) {
                case 'eq':
                    mongoQuery[fieldPath] = value;
                    break;
                case 'ne':
                    mongoQuery[fieldPath] = { $ne: value };
                    break;
                case 'gt':
                    mongoQuery[fieldPath] = { $gt: value };
                    break;
                case 'gte':
                    mongoQuery[fieldPath] = { $gte: value };
                    break;
                case 'lt':
                    mongoQuery[fieldPath] = { $lt: value };
                    break;
                case 'lte':
                    mongoQuery[fieldPath] = { $lte: value };
                    break;
                case 'contains':
                    mongoQuery[fieldPath] = { $regex: value, $options: 'i' };
                    break;
                case 'in':
                    mongoQuery[fieldPath] = { $in: Array.isArray(value) ? value : [value] };
                    break;
                case 'ref':
                    // Reference to another record
                    mongoQuery[fieldPath] = new mongoose.Types.ObjectId(value);
                    break;
            }
        }

        // Build sort
        const sort = {};
        for (const s of col.query?.sort || []) {
            const sortField = s.fieldId ? `customFields.${s.fieldId}` : s.field;
            sort[sortField] = s.direction === 'desc' ? -1 : 1;
        }

        // Execute query
        const records = await Record.find(mongoQuery)
            .sort(sort)
            .limit(col.query?.limit || 500)
            .populate('customFields.field_id')
            .lean();

        // Flatten and store
        queries[col.alias] = records.map(r => flattenRecord(r));
    }

    return queries;
}

/**
 * Batch fetch all records referenced in editable tables
 */
async function batchFetchRecords(instance) {
    const recordIds = new Set();

    // Collect all record IDs from editable tables
    for (const tableData of Object.values(instance.editableTablesData || {})) {
        for (const row of tableData.rows || []) {
            if (row.recordId) {
                recordIds.add(row.recordId.toString());
            }
        }
    }

    if (recordIds.size === 0) return {};

    // Batch fetch
    const records = await Record.find({
        _id: { $in: Array.from(recordIds).map(id => new mongoose.Types.ObjectId(id)) }
    }).populate('customFields.field_id').lean();

    // Map by ID
    const recordsById = {};
    for (const r of records) {
        recordsById[r._id.toString()] = flattenRecord(r);
    }

    return recordsById;
}

// ============================================
// Dataset Building
// ============================================

/**
 * Build computed datasets from editable tables
 * Exposed via datasetAlias for sum(), count(), etc.
 */
function buildDatasets(template, instance, context) {
    const datasets = {};

    for (const block of template.contentBlocks || []) {
        if (block.type !== 'table' || block.mode !== 'editable') continue;
        if (!block.datasetAlias) continue;

        const tableData = instance.editableTablesData?.[block._id.toString()];
        if (!tableData?.rows) {
            datasets[block.datasetAlias] = [];
            continue;
        }

        const computedRows = [];

        for (const row of tableData.rows) {
            const record = context.recordsById[row.recordId?.toString()] || {};
            const cells = row.cells || {};

            // Build scope for this row
            const rowScope = {
                record,
                row: cells,
                ...context.globals,
                ...context.bindings
            };

            // Compute each column value
            const computedRow = {
                _id: row._id,
                _recordId: row.recordId
            };

            for (const col of block.columns || []) {
                if (col.expr) {
                    // Extract expression without {{ }}
                    const expr = col.expr.replace(/^\{\{|\}\}$/g, '');
                    computedRow[col.key] = evaluateToken(expr, rowScope);
                } else if (col.input) {
                    computedRow[col.key] = cells[col.key] ?? col.inputDefault ?? 0;
                }
            }

            computedRows.push(computedRow);
        }

        datasets[block.datasetAlias] = computedRows;
    }

    return datasets;
}

// ============================================
// Record Flattening
// ============================================

/**
 * Flatten record with custom fields as cf.slug
 */
function flattenRecord(record) {
    if (!record) return {};

    const flat = { ...record };

    // Flatten custom fields to cf.slug format
    if (record.customFields && Array.isArray(record.customFields)) {
        flat.cf = {};
        for (const cf of record.customFields) {
            const slug = cf.field_id?.slug || cf.field_id?.toString();
            if (slug) {
                flat.cf[slug] = cf.value;
            }
        }
    }

    // Keep _id as string for easier comparison
    if (flat._id) {
        flat._id = flat._id.toString();
    }

    return flat;
}

// ============================================
// Block Rendering
// ============================================

/**
 * Render all content blocks to HTML
 */
function renderBlocks(blocks, context, instance) {
    let html = '';

    // Build full scope with datasets
    const scope = {
        ...context.globals,
        ...context.bindings,
        ...context.datasets
    };

    for (const block of blocks || []) {
        switch (block.type) {
            case 'text':
                html += renderTextBlock(block, scope);
                break;
            case 'table':
                if (block.mode === 'query') {
                    html += renderQueryTable(block, context, scope);
                } else if (block.mode === 'editable') {
                    html += renderEditableTable(block, context, instance, scope);
                }
                break;
            case 'divider':
                html += '<hr class="template-divider" />';
                break;
            case 'image':
                html += renderImageBlock(block, scope);
                break;
        }
    }

    return html;
}

/**
 * Render text block
 */
function renderTextBlock(block, scope) {
    return resolveTokens(block.html || '', scope);
}

/**
 * Render image block
 */
function renderImageBlock(block, scope) {
    const src = resolveTokens(block.content?.src || '', scope);
    const alt = resolveTokens(block.content?.alt || '', scope);
    const style = block.style || {};

    return `<img src="${src}" alt="${alt}" style="${styleToCSS(style)}" class="template-image" />`;
}

/**
 * Render query-based table
 */
function renderQueryTable(block, context, scope) {
    const rows = context.queries[block.source] || [];
    let html = '<table class="dynamic-table">';

    // Header
    if (block.showHeader !== false) {
        html += '<thead><tr>';
        for (const col of block.columns || []) {
            const width = col.width ? `style="width:${col.width}"` : '';
            html += `<th ${width}>${col.label || ''}</th>`;
        }
        html += '</tr></thead>';
    }

    // Body
    html += '<tbody>';
    for (const item of rows) {
        const cellScope = { item, ...scope };

        html += '<tr>';
        for (const col of block.columns || []) {
            const value = resolveTokens(col.expr || '', cellScope);
            html += `<td>${value}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';

    return html;
}

/**
 * Render editable table
 */
function renderEditableTable(block, context, instance, scope) {
    const tableData = instance.editableTablesData?.[block._id.toString()];
    let html = `<table class="editable-table" data-block-id="${block._id}">`;

    // Header
    if (block.showHeader !== false) {
        html += '<thead><tr>';
        for (const col of block.columns || []) {
            const width = col.width ? `style="width:${col.width}"` : '';
            html += `<th ${width}>${col.label || ''}</th>`;
        }
        html += '</tr></thead>';
    }

    // Body
    html += '<tbody>';
    for (const row of tableData?.rows || []) {
        const record = context.recordsById[row.recordId?.toString()] || {};
        const rowScope = {
            record,
            row: row.cells || {},
            ...scope
        };

        html += `<tr data-row-id="${row._id}">`;
        for (const col of block.columns || []) {
            const value = resolveTokens(col.expr || '', rowScope);
            html += `<td data-col="${col.key}">${value}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';

    return html;
}

/**
 * Convert style object to CSS string
 */
function styleToCSS(style) {
    return Object.entries(style || {})
        .map(([key, value]) => {
            // Convert camelCase to kebab-case
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}:${value}`;
        })
        .join(';');
}

// ============================================
// Exports
// ============================================

module.exports = {
    resolveDocument,
    resolveSingleBindings,
    resolveQueries,
    batchFetchRecords,
    buildDatasets,
    renderBlocks,
    flattenRecord
};

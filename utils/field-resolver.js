/**
 * Field Resolver - Production Safe
 * Context-based resolver with O(1) custom field access
 * 
 * Context Structure:
 * {
 *   bindings: { client, company, invoice },
 *   globals: { date, doc, user },
 *   queries: { paymentModes }
 * }
 */

/**
 * Index custom fields by fieldId for O(1) access
 * MUST be called before resolving custom fields
 * 
 * @param {Object} record - Record with customFields array
 * @returns {Object} Indexed custom fields { fieldId: cfObject }
 * 
 * @example
 * const indexed = indexCustomFields(record);
 * const value = indexed['field_abc123']?.value;
 */
function indexCustomFields(record) {
    const index = {};
    for (const cf of record.customFields || []) {
        const fieldIdStr = cf.fieldId?.toString() || cf.fieldId;
        index[fieldIdStr] = cf;
    }
    return index;
}

/**
 * Get nested property from object using dot notation
 * 
 * @param {Object} obj - Object to access
 * @param {string} path - Dot-notated path (e.g., "address.city")
 * @returns {*} Value at path or empty string
 */
function getNestedProperty(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? '';
}

/**
 * Resolve a parsed token against context
 * 
 * @param {Object} parsedToken - Parsed token from template-parser
 * @param {Object} context - Resolution context { bindings, globals, queries }
 * @param {Function} tenantCollectionFn - Function to get tenant collections
 * @returns {Promise<string>} Resolved value
 */
async function resolveToken(parsedToken, context, tenantCollectionFn) {
    const { alias, path, fieldId, isCustomField, chainedPath } = parsedToken;

    // 1. Get binding, global, or query result
    let record = context.bindings?.[alias] ||
        context.globals?.[alias] ||
        context.queries?.[alias];

    if (!record) {
        console.warn(`[FieldResolver] Binding not found: ${alias}`);
        return '';
    }

    // 2. Handle standard field (no @fieldId)
    if (!isCustomField) {
        return getNestedProperty(record, path);
    }

    // 3. Handle custom field with fieldId
    // Ensure record has indexed custom fields
    if (!record.cf) {
        record.cf = indexCustomFields(record);
    }

    return await resolveCustomField(record, fieldId, chainedPath, tenantCollectionFn);
}

/**
 * Resolve a custom field value using O(1) fieldId lookup
 * 
 * @param {Object} record - Record with indexed cf property
 * @param {string} fieldId - Custom field ID
 * @param {string|null} chainedPath - Chained property path for relations
 * @param {Function} tenantCollectionFn - Function to get tenant collections
 * @returns {Promise<string>} Resolved value
 */
async function resolveCustomField(record, fieldId, chainedPath, tenantCollectionFn) {
    // O(1) lookup - NEVER use find() on array
    const customField = record.cf?.[fieldId];

    if (!customField) {
        console.warn(`[FieldResolver] Custom field not found: ${fieldId}`);
        return '';
    }

    // Simple value (no chaining)
    if (!chainedPath) {
        return customField.value ?? '';
    }

    // Relation chaining - fetch related record
    if (customField.fieldType === 'relation' && customField.value) {
        const { entityId, recordId } = customField.value;

        if (!entityId || !recordId) {
            console.warn(`[FieldResolver] Invalid relation value for field: ${fieldId}`);
            return '';
        }

        try {
            // Fetch related entity metadata
            const EntityModel = await tenantCollectionFn("Entity");
            const relatedEntityMeta = await EntityModel.findById(entityId).lean();

            if (!relatedEntityMeta) {
                console.warn(`[FieldResolver] Related entity not found: ${entityId}`);
                return '';
            }

            // Fetch related record using entity slug as collection name
            const RelatedRecordModel = await tenantCollectionFn(relatedEntityMeta.slug);
            const relatedRecord = await RelatedRecordModel.findById(recordId).lean();

            if (!relatedRecord) {
                console.warn(`[FieldResolver] Related record not found: ${recordId}`);
                return '';
            }

            // Index related record's custom fields for O(1) access
            relatedRecord.cf = indexCustomFields(relatedRecord);

            // Resolve chained path (e.g., "name" or "cf.capital@fieldId.name")
            return await resolveChainedPath(relatedRecord, chainedPath, tenantCollectionFn);
        } catch (error) {
            console.error(`[FieldResolver] Error resolving relation: ${error.message}`);
            return '';
        }
    }

    return '';
}

/**
 * Resolve a chained path on a related record
 * Supports both standard fields and nested custom fields
 * 
 * @param {Object} record - Related record with indexed cf
 * @param {string} chainedPath - Chained path (e.g., "name" or "cf.capital@fieldId.name")
 * @param {Function} tenantCollectionFn - Function to get tenant collections
 * @returns {Promise<string>} Resolved value
 */
async function resolveChainedPath(record, chainedPath, tenantCollectionFn) {
    // Check if chained path is a custom field (cf.fieldName@fieldId)
    const fieldIdMatch = chainedPath.match(/^cf\.([a-zA-Z0-9_]+)@([a-zA-Z0-9_]+)(.*)$/);

    if (fieldIdMatch) {
        // Nested custom field
        const nestedFieldId = fieldIdMatch[2];
        const nestedChain = fieldIdMatch[3] ? fieldIdMatch[3].substring(1) : null;
        return await resolveCustomField(record, nestedFieldId, nestedChain, tenantCollectionFn);
    } else {
        // Standard field - direct property access
        return getNestedProperty(record, chainedPath);
    }
}

module.exports = {
    resolveToken,
    resolveCustomField,
    resolveChainedPath,
    indexCustomFields,
    getNestedProperty
};

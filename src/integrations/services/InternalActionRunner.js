/**
 * Internal Action Runner
 * Executes internal app actions (create/update/delete record, set status)
 * Same return contract as HttpRunner: { success, data, errorMessage?, httpStatus? }
 * 
 * Multi-tenant guardrails:
 *  - All DB access via tenantCollection (tenant-isolated)
 *  - Record ownership verified via entityId belonging to tenant
 *  - Standardized error codes
 */

const { tenantCollection } = require('../../../middleware/tenant');
const mongoose = require('mongoose');

/**
 * Execute an internal action
 * @param {object} options
 * @param {object} options.action - IntegrationAction document
 * @param {object} options.input - Resolved input data (after template resolution)
 * @param {object} options.tenantReq - Fake req object with tenantDbConnection for tenantCollection
 * @returns {Promise<object>} - { success, data, errorMessage?, error? }
 */
async function execute({ action, input, tenantReq }) {
    const actionKey = action.actionKey;
    const startTime = Date.now();

    console.log(`[InternalRunner] Executing "${actionKey}" with input:`, JSON.stringify(input).slice(0, 200));

    try {
        let result;
        switch (actionKey) {
            case 'create-record':
                result = await createRecord(input, tenantReq);
                break;
            case 'update-record':
                result = await updateRecord(input, tenantReq);
                break;
            case 'delete-record':
                result = await deleteRecord(input, tenantReq);
                break;
            case 'set-status':
                result = await setStatus(input, tenantReq);
                break;
            default:
                return {
                    success: false,
                    data: null,
                    errorMessage: `Unknown internal action: ${actionKey}`,
                    error: { code: 'UNKNOWN_ACTION', message: `Action "${actionKey}" not found` }
                };
        }

        const latencyMs = Date.now() - startTime;
        console.log(`[InternalRunner] "${actionKey}" completed in ${latencyMs}ms — success: ${result.success}`);

        return result;

    } catch (error) {
        const latencyMs = Date.now() - startTime;
        console.error(`[InternalRunner] "${actionKey}" failed in ${latencyMs}ms:`, error.message);

        return {
            success: false,
            data: null,
            errorMessage: error.message,
            error: { code: 'INTERNAL_ERROR', message: error.message }
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Create Record
 */
async function createRecord(input, tenantReq) {
    const { entityId, title, description, status, customFields } = input;

    if (!entityId) {
        return fail('MISSING_INPUT', 'entityId is required');
    }

    const Entity = await tenantCollection(tenantReq, 'Entity');
    const Record = await tenantCollection(tenantReq, 'Record');

    // Guardrail: verify entity exists in this tenant
    const entity = await Entity.findById(entityId).lean();
    if (!entity) {
        return fail('ENTITY_NOT_FOUND', `Entity "${entityId}" not found in this workspace`);
    }

    // Build record data
    const recordData = {
        entityId: new mongoose.Types.ObjectId(entityId),
        title: title || '',
        status: status || 'draft'
    };

    if (description) recordData.description = description;

    // Parse custom fields: { "fieldId": value } → [{ field_id, value }]
    if (customFields && typeof customFields === 'object') {
        recordData.customFields = Object.entries(customFields).map(([field_id, value]) => ({
            field_id: new mongoose.Types.ObjectId(field_id),
            value
        }));
    }

    const record = await Record.create(recordData);

    return {
        success: true,
        data: {
            recordId: record._id.toString(),
            entityId: entityId,
            title: record.title,
            status: record.status,
            createdAt: record.createdAt
        }
    };
}

/**
 * Update Record
 */
async function updateRecord(input, tenantReq) {
    const { recordId, title, description, status, customFields } = input;

    if (!recordId) {
        return fail('MISSING_INPUT', 'recordId is required');
    }

    const Record = await tenantCollection(tenantReq, 'Record');

    // Guardrail: verify record exists in this tenant
    const record = await Record.findById(recordId);
    if (!record) {
        return fail('RECORD_NOT_FOUND', `Record "${recordId}" not found`);
    }

    // Build update
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;

    // Custom fields: merge, don't replace
    if (customFields && typeof customFields === 'object') {
        for (const [fieldId, value] of Object.entries(customFields)) {
            const existingIdx = record.customFields.findIndex(
                cf => cf.field_id.toString() === fieldId
            );
            if (existingIdx >= 0) {
                record.customFields[existingIdx].value = value;
            } else {
                record.customFields.push({
                    field_id: new mongoose.Types.ObjectId(fieldId),
                    value
                });
            }
        }
        update.customFields = record.customFields;
    }

    const updated = await Record.findByIdAndUpdate(recordId, { $set: update }, { new: true }).lean();

    return {
        success: true,
        data: {
            recordId: updated._id.toString(),
            title: updated.title,
            status: updated.status,
            updatedAt: updated.updatedAt
        }
    };
}

/**
 * Delete Record
 */
async function deleteRecord(input, tenantReq) {
    const { recordId } = input;

    if (!recordId) {
        return fail('MISSING_INPUT', 'recordId is required');
    }

    const Record = await tenantCollection(tenantReq, 'Record');

    // Guardrail: verify record exists
    const record = await Record.findById(recordId).lean();
    if (!record) {
        return fail('RECORD_NOT_FOUND', `Record "${recordId}" not found`);
    }

    await Record.deleteOne({ _id: recordId });

    return {
        success: true,
        data: {
            recordId: recordId,
            entityId: record.entityId?.toString(),
            deleted: true
        }
    };
}

/**
 * Set Status (Classification)
 * Updates record.classificationValues — the standard classification system
 */
async function setStatus(input, tenantReq) {
    const { recordId, classificationId, optionId } = input;

    if (!recordId || !classificationId || !optionId) {
        return fail('MISSING_INPUT', 'recordId, classificationId, and optionId are all required');
    }

    const Record = await tenantCollection(tenantReq, 'Record');
    const Classification = await tenantCollection(tenantReq, 'Classification');

    // Guardrail: verify record exists
    const record = await Record.findById(recordId);
    if (!record) {
        return fail('RECORD_NOT_FOUND', `Record "${recordId}" not found`);
    }

    // Guardrail: verify classification + option exists
    const classification = await Classification.findById(classificationId).lean();
    if (!classification) {
        return fail('CLASSIFICATION_NOT_FOUND', `Classification "${classificationId}" not found`);
    }

    const option = classification.options?.find(o => o._id.toString() === optionId);
    if (!option) {
        return fail('OPTION_NOT_FOUND', `Option "${optionId}" not found in classification "${classification.name}"`);
    }

    // Update classificationValues on the record
    const classificationValues = record.classificationValues || [];
    const existingIdx = classificationValues.findIndex(
        cv => cv.classificationId?.toString() === classificationId
    );

    if (existingIdx >= 0) {
        classificationValues[existingIdx].optionId = new mongoose.Types.ObjectId(optionId);
    } else {
        classificationValues.push({
            classificationId: new mongoose.Types.ObjectId(classificationId),
            optionId: new mongoose.Types.ObjectId(optionId)
        });
    }

    await Record.updateOne(
        { _id: recordId },
        { $set: { classificationValues } }
    );

    return {
        success: true,
        data: {
            recordId: recordId,
            classificationId: classificationId,
            classificationName: classification.name,
            optionId: optionId,
            optionLabel: option.label,
            optionColor: option.color
        }
    };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function fail(code, message) {
    return {
        success: false,
        data: null,
        errorMessage: message,
        error: { code, message }
    };
}

module.exports = {
    execute
};

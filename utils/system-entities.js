/**
 * System Entities — Auto-provisioned for every new account
 * 
 * Creates system entities (Tâches, Notes) with their classifications and fields.
 * All system entities are marked isSystem: true and cannot be deleted by users.
 * 
 * Usage:
 *   const { ensureSystemEntities } = require('../utils/system-entities');
 *   await ensureSystemEntities(tenantDb);
 */

const mongoose = require('mongoose');

// ============ STABLE IDS (same across all tenants) ============
const TASK_ENTITY_ID   = new mongoose.Types.ObjectId('697e0000000000000000e001');
const NOTE_ENTITY_ID   = new mongoose.Types.ObjectId('697e0000000000000000e002');

const TASK_CLASSIFICATIONS = {
    progression: new mongoose.Types.ObjectId('697e0010000000000000010a'),
    priority:    new mongoose.Types.ObjectId('697e0010000000000000010b'),
    tags:        new mongoose.Types.ObjectId('697e0010000000000000010c'),
    list:        new mongoose.Types.ObjectId('697e0010000000000000010d'),
};

const TASK_FIELD_IDS = {
    dueDate:    new mongoose.Types.ObjectId('697e0020000000000000020a'),
    progress:   new mongoose.Types.ObjectId('697e0020000000000000020b'),
    assignedTo: new mongoose.Types.ObjectId('697e0020000000000000020c'),
};

// ============ CLASSIFICATION OPTIONS ============
const PROGRESSION_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001a'), label: 'À faire',  color: '#9ca3af', icon: 'tabler:circle' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001b'), label: 'En cours',  color: '#3b82f6', icon: 'tabler:progress' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001c'), label: 'En revue',  color: '#f59e0b', icon: 'tabler:eye' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001d'), label: 'Terminé',   color: '#22c55e', icon: 'tabler:check' },
    { _id: new mongoose.Types.ObjectId('697e0001000000000000001e'), label: 'Bloqué',    color: '#ef4444', icon: 'tabler:alert-circle' },
];

const PRIORITY_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002a'), label: 'Basse',   color: '#6b7280', icon: 'tabler:arrow-down' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002b'), label: 'Moyenne', color: '#f59e0b', icon: 'tabler:minus' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002c'), label: 'Haute',   color: '#ef4444', icon: 'tabler:arrow-up' },
    { _id: new mongoose.Types.ObjectId('697e0002000000000000002d'), label: 'Urgent',  color: '#dc2626', icon: 'tabler:alert-triangle' },
];

const TAG_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003a'), label: 'Backend',  color: '#8b5cf6', icon: 'tabler:server' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003b'), label: 'Frontend', color: '#06b6d4', icon: 'tabler:layout' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003c'), label: 'Design',   color: '#ec4899', icon: 'tabler:palette' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003d'), label: 'DevOps',   color: '#f97316', icon: 'tabler:cloud' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003e'), label: 'Docs',     color: '#14b8a6', icon: 'tabler:file-text' },
    { _id: new mongoose.Types.ObjectId('697e0003000000000000003f'), label: 'Bug',      color: '#ef4444', icon: 'tabler:bug' },
];

const LIST_OPTIONS = [
    { _id: new mongoose.Types.ObjectId('697e0004000000000000004a'), label: 'Général',     color: '#6366f1', icon: 'tabler:list' },
    { _id: new mongoose.Types.ObjectId('697e0004000000000000004b'), label: 'Frontend',    color: '#06b6d4', icon: 'tabler:layout' },
    { _id: new mongoose.Types.ObjectId('697e0004000000000000004c'), label: 'Backend',     color: '#8b5cf6', icon: 'tabler:server' },
    { _id: new mongoose.Types.ObjectId('697e0004000000000000004d'), label: 'App mobile',  color: '#10b981', icon: 'tabler:device-mobile' },
    { _id: new mongoose.Types.ObjectId('697e0004000000000000004e'), label: 'Design',      color: '#ec4899', icon: 'tabler:palette' },
];

/**
 * Ensure all system entities exist in a tenant database.
 * Idempotent — safe to call multiple times.
 * 
 * @param {mongoose.Connection} tenantDb - The tenant database connection
 */
async function ensureSystemEntities(tenantDb) {
    const Entity = tenantDb.model('Entity', require('../models/entity.model').schema);
    const Classification = tenantDb.model('Classification', require('../models/classification.model').schema);
    const FieldTemplate = tenantDb.model('FieldTemplate', require('../models/field-template.model').schema);

    console.log('[SystemEntities] Ensuring system entities...');

    // ════════════════════════════════════════════════════════════════
    // 1. TÂCHES ENTITY
    // ════════════════════════════════════════════════════════════════

    // Fields
    await FieldTemplate.findOneAndUpdate(
        { _id: TASK_FIELD_IDS.progress },
        {
            _id: TASK_FIELD_IDS.progress,
            name: 'Progression',
            key: 'progress',
            type: 'number',
            entityId: TASK_ENTITY_ID,
            config: { min: 0, max: 100, suffix: '%' },
        },
        { upsert: true, setDefaultsOnInsert: true }
    );
    await FieldTemplate.findOneAndUpdate(
        { _id: TASK_FIELD_IDS.assignedTo },
        {
            _id: TASK_FIELD_IDS.assignedTo,
            name: 'Assigné à',
            key: 'assignedTo',
            type: 'text',
            entityId: TASK_ENTITY_ID,
            config: {},
        },
        { upsert: true, setDefaultsOnInsert: true }
    );

    // Classifications
    await Classification.findOneAndUpdate(
        { _id: TASK_CLASSIFICATIONS.progression },
        {
            _id: TASK_CLASSIFICATIONS.progression,
            name: 'Progression',
            key: 'tache_progression',
            description: 'Statut de progression',
            type: 'simple',
            allowMultiple: false,
            options: PROGRESSION_OPTIONS,
        },
        { upsert: true, setDefaultsOnInsert: true }
    );
    await Classification.findOneAndUpdate(
        { _id: TASK_CLASSIFICATIONS.priority },
        {
            _id: TASK_CLASSIFICATIONS.priority,
            name: 'Priorité',
            key: 'tache_priority',
            description: 'Niveau de priorité',
            type: 'simple',
            allowMultiple: false,
            options: PRIORITY_OPTIONS,
        },
        { upsert: true, setDefaultsOnInsert: true }
    );
    await Classification.findOneAndUpdate(
        { _id: TASK_CLASSIFICATIONS.tags },
        {
            _id: TASK_CLASSIFICATIONS.tags,
            name: 'Tags',
            key: 'tache_tags',
            description: 'Tags de catégorisation',
            type: 'simple',
            allowMultiple: true,
            options: TAG_OPTIONS,
        },
        { upsert: true, setDefaultsOnInsert: true }
    );
    await Classification.findOneAndUpdate(
        { _id: TASK_CLASSIFICATIONS.list },
        {
            _id: TASK_CLASSIFICATIONS.list,
            name: 'Liste',
            key: 'task_list',
            description: 'Liste / groupe de tâches',
            type: 'simple',
            allowMultiple: false,
            options: LIST_OPTIONS,
        },
        { upsert: true, setDefaultsOnInsert: true }
    );

    // Entity
    await Entity.findOneAndUpdate(
        { _id: TASK_ENTITY_ID },
        {
            _id: TASK_ENTITY_ID,
            name: 'Tâches',
            nameSingular: 'Tâche',
            namePlural: 'Tâches',
            slug: 'taches',
            description: 'Gestion des tâches et suivi de projet',
            icon: 'solar:checklist-minimalistic-bold-duotone',
            color: '#4361ee',
            isSystem: true,
            enabledStandardFields: ['title', 'description', 'dueDate', 'attachments'],
            customFields: [TASK_FIELD_IDS.progress, TASK_FIELD_IDS.assignedTo],
            statusClassification: TASK_CLASSIFICATIONS.progression,
            classifications: [
                TASK_CLASSIFICATIONS.priority,
                TASK_CLASSIFICATIONS.tags,
                TASK_CLASSIFICATIONS.list,
            ],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
        },
        { upsert: true, setDefaultsOnInsert: true }
    );
    console.log('   ✅ Tâches entity ready');

    // ════════════════════════════════════════════════════════════════
    // 2. NOTES ENTITY
    // ════════════════════════════════════════════════════════════════

    await Entity.findOneAndUpdate(
        { _id: NOTE_ENTITY_ID },
        {
            _id: NOTE_ENTITY_ID,
            name: 'Notes',
            nameSingular: 'Note',
            namePlural: 'Notes',
            slug: 'notes',
            description: 'Bloc-notes et mémos',
            icon: 'solar:notes-bold-duotone',
            color: '#f59e0b',
            isSystem: true,
            enabledStandardFields: ['title', 'description'],
            referenceTitleTokens: [{ t: 'field', id: 'title' }],
        },
        { upsert: true, setDefaultsOnInsert: true }
    );
    console.log('   ✅ Notes entity ready');

    console.log('[SystemEntities] All system entities provisioned.');
}

module.exports = {
    ensureSystemEntities,
    TASK_ENTITY_ID,
    NOTE_ENTITY_ID,
    TASK_CLASSIFICATIONS,
    TASK_FIELD_IDS,
    LIST_OPTIONS,
    PROGRESSION_OPTIONS,
    PRIORITY_OPTIONS,
    TAG_OPTIONS,
};

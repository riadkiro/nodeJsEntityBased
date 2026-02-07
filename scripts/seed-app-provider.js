/**
 * Seed Script: App (Internal) Provider
 * Creates the built-in "app" provider with internal actions for workflow builder.
 * Idempotent — safe to run multiple times.
 * 
 * Usage: node scripts/seed-app-provider.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const IntegrationProvider = require('../src/integrations/models/IntegrationProvider.model');
const IntegrationAction = require('../src/integrations/models/IntegrationAction.model');

const PROVIDER = {
    key: 'app',
    name: 'App (Internal)',
    logo: '⚡',
    category: 'internal',
    baseUrl: 'internal://',
    authType: 'none',
    status: 'published',
    defaultHeaders: {}
};

const ACTIONS = [
    {
        providerKey: 'app',
        actionKey: 'create-record',
        name: 'Create Record',
        description: 'Créer un nouveau record dans une entity',
        http: { method: 'POST', path: '/internal/create-record' },
        inputSchema: {
            type: 'object',
            properties: {
                entityId: { type: 'string', label: 'Entity ID', required: true, description: 'ID de l\'entity cible' },
                title: { type: 'string', label: 'Titre', description: 'Titre du record' },
                description: { type: 'string', label: 'Description' },
                status: { type: 'string', label: 'Statut', default: 'draft' },
                customFields: { type: 'object', label: 'Champs personnalisés', description: 'Objet { field_id: value }' }
            },
            required: ['entityId']
        },
        requestTemplate: { body: {} },
        responseMapping: {
            recordId: 'recordId',
            title: 'title',
            createdAt: 'createdAt'
        },
        uiHints: {
            recommendedVariables: ['{{trigger.entityId}}', '{{trigger.payload.title}}'],
            supportsEntityContext: true,
            icon: 'solar:add-circle-bold-duotone',
            color: '#10b981'
        },
        isPublished: true
    },
    {
        providerKey: 'app',
        actionKey: 'update-record',
        name: 'Update Record',
        description: 'Modifier un record existant',
        http: { method: 'PUT', path: '/internal/update-record' },
        inputSchema: {
            type: 'object',
            properties: {
                recordId: { type: 'string', label: 'Record ID', required: true, description: 'ID du record à modifier' },
                title: { type: 'string', label: 'Titre' },
                description: { type: 'string', label: 'Description' },
                status: { type: 'string', label: 'Statut' },
                customFields: { type: 'object', label: 'Champs personnalisés', description: 'Objet { field_id: value }' }
            },
            required: ['recordId']
        },
        requestTemplate: { body: {} },
        responseMapping: {
            recordId: 'recordId',
            title: 'title',
            updatedAt: 'updatedAt'
        },
        uiHints: {
            recommendedVariables: ['{{trigger.recordId}}', '{{steps.step_1.recordId}}'],
            supportsEntityContext: false,
            icon: 'solar:pen-bold-duotone',
            color: '#3b82f6'
        },
        isPublished: true
    },
    {
        providerKey: 'app',
        actionKey: 'delete-record',
        name: 'Delete Record',
        description: 'Supprimer un record',
        http: { method: 'DELETE', path: '/internal/delete-record' },
        inputSchema: {
            type: 'object',
            properties: {
                recordId: { type: 'string', label: 'Record ID', required: true, description: 'ID du record à supprimer' }
            },
            required: ['recordId']
        },
        requestTemplate: { body: {} },
        responseMapping: {
            recordId: 'recordId',
            deleted: 'deleted'
        },
        uiHints: {
            recommendedVariables: ['{{trigger.recordId}}', '{{steps.step_1.recordId}}'],
            supportsEntityContext: false,
            icon: 'solar:trash-bin-trash-bold-duotone',
            color: '#ef4444'
        },
        isPublished: true
    },
    {
        providerKey: 'app',
        actionKey: 'set-status',
        name: 'Set Status',
        description: 'Changer le statut/classification d\'un record',
        http: { method: 'PUT', path: '/internal/set-status' },
        inputSchema: {
            type: 'object',
            properties: {
                recordId: { type: 'string', label: 'Record ID', required: true },
                classificationId: { type: 'string', label: 'Classification ID', required: true, description: 'ID de la classification (ex: statusClassification)' },
                optionId: { type: 'string', label: 'Option ID', required: true, description: 'ID de l\'option cible' }
            },
            required: ['recordId', 'classificationId', 'optionId']
        },
        requestTemplate: { body: {} },
        responseMapping: {
            recordId: 'recordId',
            classificationId: 'classificationId',
            optionId: 'optionId',
            optionLabel: 'optionLabel'
        },
        uiHints: {
            recommendedVariables: ['{{trigger.recordId}}'],
            supportsEntityContext: true,
            icon: 'solar:flag-bold-duotone',
            color: '#f59e0b'
        },
        isPublished: true
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/saas_main');
        console.log('✅ Connected to MongoDB');

        // Upsert provider
        const provider = await IntegrationProvider.findOneAndUpdate(
            { key: PROVIDER.key },
            { $set: PROVIDER },
            { upsert: true, new: true }
        );
        console.log(`✅ Provider "${provider.name}" (${provider.key}) — ${provider._id}`);

        // Upsert actions
        for (const actionData of ACTIONS) {
            const action = await IntegrationAction.findOneAndUpdate(
                { providerKey: actionData.providerKey, actionKey: actionData.actionKey },
                { $set: actionData },
                { upsert: true, new: true }
            );
            console.log(`  ✅ Action "${action.name}" (${action.actionKey}) — ${action._id}`);
        }

        console.log('\n🎉 Seed complete! Provider "App (Internal)" ready.');
    } catch (error) {
        console.error('❌ Seed error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();

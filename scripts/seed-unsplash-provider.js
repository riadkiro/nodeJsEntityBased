/**
 * Seed Unsplash Provider and Search Photos Action
 * Run: node scripts/seed-unsplash-provider.js
 */

const mongoose = require('mongoose');
const dbConfig = require('../config/db');

// Import models
const IntegrationProvider = require('../src/integrations/models/IntegrationProvider.model');
const IntegrationAction = require('../src/integrations/models/IntegrationAction.model');

async function seedUnsplash() {
    try {
        // Connect to global DB
        await mongoose.connect(dbConfig.globalDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Create or update Unsplash provider
        const providerData = {
            key: 'unsplash',
            name: 'Unsplash',
            logo: 'https://unsplash.com/favicon-32x32.png',
            category: 'Media',
            baseUrl: 'https://api.unsplash.com',
            authType: 'api_key',
            authInjection: {
                mode: 'query',
                name: 'client_id',
                format: '{{token}}'
            },
            defaultHeaders: {
                'Accept-Version': 'v1'
            },
            status: 'published'
        };

        const provider = await IntegrationProvider.findOneAndUpdate(
            { key: 'unsplash' },
            providerData,
            { upsert: true, new: true }
        );
        console.log('✅ Unsplash provider created/updated:', provider.key);

        // Create or update Search Photos action
        const actionData = {
            providerKey: 'unsplash',
            actionKey: 'search-photos',
            name: 'Search Photos',
            description: 'Search for photos on Unsplash by keyword',
            http: {
                method: 'GET',
                path: '/search/photos'
            },
            inputSchema: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        title: 'Search Query',
                        description: 'Keywords to search for'
                    },
                    per_page: {
                        type: 'number',
                        title: 'Results per page',
                        default: 10
                    }
                },
                required: ['query']
            },
            requestTemplate: {
                query: {
                    query: '{{input.query}}',
                    per_page: '{{input.per_page}}'
                },
                headers: {},
                body: {}
            },
            responseMapping: {
                photos: 'results',
                total: 'total',
                totalPages: 'total_pages'
            },
            testPayload: {
                query: 'mountains',
                per_page: 5
            },
            isPublished: true
        };

        const action = await IntegrationAction.findOneAndUpdate(
            { providerKey: 'unsplash', actionKey: 'search-photos' },
            actionData,
            { upsert: true, new: true }
        );
        console.log('✅ Search Photos action created/updated:', action.actionKey);

        // Set as test action for the provider
        await IntegrationProvider.findByIdAndUpdate(provider._id, {
            testActionId: action._id
        });
        console.log('✅ Test action configured');

        console.log('\n🎉 Unsplash provider seeded successfully!');
        console.log('\nTo use:');
        console.log('1. Go to https://unsplash.com/developers');
        console.log('2. Create an app to get your Access Key (API Key)');
        console.log('3. Navigate to /account/{id}/integrations/unsplash');
        console.log('4. Enter your Access Key and connect');

    } catch (error) {
        console.error('Error seeding Unsplash:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedUnsplash();

/**
 * Seed OpenAI Provider, Chat Completion Action, and Responses Action
 * Run: node scripts/seed-openai-provider.js
 */

const mongoose = require('mongoose');
const dbConfig = require('../config/db');

// Import models
const IntegrationProvider = require('../src/integrations/models/IntegrationProvider.model');
const IntegrationAction = require('../src/integrations/models/IntegrationAction.model');
const { buildOpenAIResponsesActionData } = require('../src/integrations/openaiActions');

async function seedOpenAI() {
    try {
        // Connect to global DB
        await mongoose.connect(dbConfig.globalDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // ============================================
        // 1. Create/Update OpenAI Provider
        // ============================================
        const providerData = {
            key: 'openai',
            name: 'OpenAI',
            logo: 'https://openai.com/favicon.ico',
            category: 'AI',
            baseUrl: 'https://api.openai.com/v1',
            authType: 'bearer',
            authInjection: {
                mode: 'header',
                name: 'Authorization',
                format: 'Bearer {{token}}'
            },
            defaultHeaders: {
                'Content-Type': 'application/json'
            },
            status: 'published'
        };

        const provider = await IntegrationProvider.findOneAndUpdate(
            { key: 'openai' },
            providerData,
            { upsert: true, new: true }
        );
        console.log('✅ OpenAI provider created/updated:', provider.key);

        // ============================================
        // 2. Create/Update Chat Completion Action
        // ============================================
        const chatActionData = {
            providerKey: 'openai',
            actionKey: 'chat-completion',
            name: 'Chat Completion',
            description: 'Generate text using GPT models (GPT-5.5, GPT-4, GPT-3.5-turbo)',
            http: {
                method: 'POST',
                path: '/chat/completions'
            },
            inputSchema: {
                type: 'object',
                properties: {
                    model: {
                        type: 'string',
                        title: 'Model',
                        description: 'ID of the model to use',
                        enum: ['gpt-5.5', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
                        default: 'gpt-5.5'
                    },
                    messages: {
                        type: 'array',
                        title: 'Messages',
                        description: 'List of messages in the conversation',
                        items: {
                            type: 'object',
                            properties: {
                                role: {
                                    type: 'string',
                                    enum: ['system', 'user', 'assistant']
                                },
                                content: {
                                    type: 'string'
                                }
                            }
                        }
                    },
                    temperature: {
                        type: 'number',
                        title: 'Temperature',
                        description: 'Creativity level (0-2)',
                        default: 0.7,
                        minimum: 0,
                        maximum: 2
                    },
                    max_tokens: {
                        type: 'number',
                        title: 'Max Tokens',
                        description: 'Maximum tokens in response',
                        default: 1000
                    },
                    max_completion_tokens: {
                        type: 'number',
                        title: 'Max Completion Tokens',
                        description: 'Maximum completion tokens for GPT-5 and reasoning models',
                        default: 1000
                    }
                },
                required: ['model', 'messages']
            },
            requestTemplate: {
                query: {},
                headers: {},
                body: {
                    model: '{{input.model}}',
                    messages: '{{input.messages}}',
                    temperature: '{{input.temperature}}',
                    max_tokens: '{{input.max_tokens}}',
                    max_completion_tokens: '{{input.max_completion_tokens}}',
                    response_format: '{{input.response_format}}'
                }
            },
            responseMapping: {
                content: 'choices[0].message.content',
                role: 'choices[0].message.role',
                model: 'model',
                usage: 'usage',
                finishReason: 'choices[0].finish_reason'
            },
            // Simple test payload for connection test
            testPayload: {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'user', content: 'Say hello in French' }
                ],
                max_tokens: 50
            },
            isPublished: true
        };

        const chatAction = await IntegrationAction.findOneAndUpdate(
            { providerKey: 'openai', actionKey: 'chat-completion' },
            chatActionData,
            { upsert: true, new: true }
        );
        console.log('✅ Chat Completion action created/updated:', chatAction.actionKey);

        // ============================================
        // 3. Create/Update Responses Action
        // ============================================
        const responsesActionData = buildOpenAIResponsesActionData('gpt-5.5');
        const responsesAction = await IntegrationAction.findOneAndUpdate(
            { providerKey: 'openai', actionKey: 'responses' },
            responsesActionData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('✅ Responses action created/updated:', responsesAction.actionKey);

        // ============================================
        // 4. Set as test action for the provider
        // ============================================
        await IntegrationProvider.findByIdAndUpdate(provider._id, {
            testActionId: chatAction._id
        });
        console.log('✅ Test action configured');

        // ============================================
        // Summary
        // ============================================
        console.log('\n🎉 OpenAI provider seeded successfully!');
        console.log('\n📋 To use:');
        console.log('1. Get your API key from https://platform.openai.com/api-keys');
        console.log('2. Navigate to /account/{id}/integrations/openai');
        console.log('3. Enter your API Key and click "Connect"');
        console.log('4. Test the connection to verify it works');

    } catch (error) {
        console.error('❌ Error seeding OpenAI:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

seedOpenAI();

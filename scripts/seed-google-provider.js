/**
 * Seed Google Provider with OAuth2 Configuration
 * Run: node scripts/seed-google-provider.js
 * 
 * IMPORTANT: Before running, set these in your .env:
 *   GOOGLE_CLIENT_ID=your-client-id
 *   GOOGLE_CLIENT_SECRET=your-client-secret
 */

const mongoose = require('mongoose');
const dbConfig = require('../config/db');

// Import models
const IntegrationProvider = require('../src/integrations/models/IntegrationProvider.model');
const IntegrationAction = require('../src/integrations/models/IntegrationAction.model');
const SecretVault = require('../src/integrations/services/SecretVault');

async function seedGoogle() {
    try {
        // Connect to global DB
        await mongoose.connect(dbConfig.globalDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Get credentials from env
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.warn('⚠️  GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not found in .env');
            console.warn('   Provider will be created but OAuth will not work until credentials are added.');
        }

        // Create or update Google provider
        const providerData = {
            key: 'google',
            name: 'Google',
            logo: 'https://www.google.com/favicon.ico',
            category: 'Identity',
            baseUrl: 'https://www.googleapis.com',
            authType: 'oauth2',
            authInjection: {
                mode: 'header',
                name: 'Authorization',
                format: 'Bearer {{access_token}}'
            },
            oauth: {
                authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                scopes: ['openid', 'email', 'profile'],
                pkce: true,
                extraParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            },
            defaultHeaders: {
                'Accept': 'application/json'
            },
            status: 'published'
        };

        // Encrypt client credentials if provided
        if (clientId && clientSecret) {
            providerData.oauthClientSecrets = SecretVault.encrypt({
                clientId,
                clientSecret
            });
            console.log('✅ OAuth client credentials encrypted');
        }

        const provider = await IntegrationProvider.findOneAndUpdate(
            { key: 'google' },
            providerData,
            { upsert: true, new: true }
        );
        console.log('✅ Google provider created/updated:', provider.key);

        // Create get-userinfo action
        const actionData = {
            providerKey: 'google',
            actionKey: 'get-userinfo',
            name: 'Get User Info',
            description: 'Get the authenticated user\'s profile information',
            http: {
                method: 'GET',
                path: '/oauth2/v3/userinfo'
            },
            inputSchema: {
                type: 'object',
                properties: {}
            },
            requestTemplate: {
                query: {},
                headers: {},
                body: {}
            },
            responseMapping: {
                email: 'email',
                name: 'name',
                picture: 'picture',
                sub: 'sub'
            },
            testPayload: {},
            isPublished: true
        };

        const action = await IntegrationAction.findOneAndUpdate(
            { providerKey: 'google', actionKey: 'get-userinfo' },
            actionData,
            { upsert: true, new: true }
        );
        console.log('✅ Get User Info action created/updated:', action.actionKey);

        // Set as test action for the provider
        await IntegrationProvider.findByIdAndUpdate(provider._id, {
            testActionId: action._id
        });
        console.log('✅ Test action configured');

        console.log('\n🎉 Google OAuth provider seeded successfully!');
        console.log('\nTo use:');
        console.log('1. Go to https://console.cloud.google.com');
        console.log('2. Create OAuth 2.0 credentials (Web Application)');
        console.log('3. Add authorized redirect URI:');
        console.log('   http://localhost:3000/account/{account_number}/integrations/google/oauth/callback');
        console.log('4. Copy Client ID and Client Secret to .env:');
        console.log('   GOOGLE_CLIENT_ID=xxx');
        console.log('   GOOGLE_CLIENT_SECRET=xxx');
        console.log('5. Re-run this script OR update via Admin UI');
        console.log('6. Navigate to /account/{id}/integrations/google and click "Connect with Google"');

    } catch (error) {
        console.error('Error seeding Google:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedGoogle();

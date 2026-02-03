/**
 * Secret Vault Service
 * AES-256-GCM encryption for integration credentials
 * Uses versioned structure for future OAuth token support
 */

const crypto = require('crypto');

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;  // 96 bits for GCM
const AUTH_TAG_LENGTH = 16;  // 128 bits

/**
 * Get encryption key from environment
 * @returns {Buffer} - 32-byte key
 */
function getEncryptionKey() {
    const keyBase64 = process.env.INTEGRATION_SECRETS_KEY;

    if (!keyBase64) {
        throw new Error('INTEGRATION_SECRETS_KEY environment variable is required');
    }

    const key = Buffer.from(keyBase64, 'base64');

    if (key.length !== 32) {
        throw new Error('INTEGRATION_SECRETS_KEY must be 32 bytes (256 bits) base64-encoded');
    }

    return key;
}

/**
 * Encrypt secrets object
 * @param {object} secrets - Plain secrets object (e.g., { token: "xyz" })
 * @returns {object} - Versioned encrypted structure
 */
function encrypt(secrets) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH
    });

    const plaintext = JSON.stringify(secrets);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return {
        v: 1,  // Version for future migrations
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        ciphertext: encrypted.toString('base64')
    };
}

/**
 * Decrypt secrets
 * @param {object} encrypted - Versioned encrypted structure
 * @returns {object} - Decrypted secrets object
 */
function decrypt(encrypted) {
    if (!encrypted || !encrypted.ciphertext) {
        return {};
    }

    // Handle version migrations here in the future
    if (encrypted.v !== 1) {
        throw new Error(`Unsupported encryption version: ${encrypted.v}`);
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(encrypted.iv, 'base64');
    const authTag = Buffer.from(encrypted.authTag, 'base64');
    const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH
    });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
}

/**
 * Generate a new encryption key (for setup)
 * @returns {string} - Base64-encoded 32-byte key
 */
function generateKey() {
    return crypto.randomBytes(32).toString('base64');
}

module.exports = {
    encrypt,
    decrypt,
    generateKey
};

/**
 * Cockpit Configuration Loader
 * 
 * v1: Loads from JSON files
 * v2: Will load from database for tenant-specific configs
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Load cockpit configuration
 * @param {string} cockpitId - The cockpit identifier (e.g., 'consultation')
 * @param {string} tenantId - The tenant/account number (for future DB use)
 * @returns {Object} Cockpit configuration object
 */
async function loadCockpitConfig(cockpitId, tenantId) {
    // v1: Load from JSON file
    const configPath = path.join(__dirname, '../config/cockpits', `${cockpitId}.json`);

    try {
        const content = await fs.readFile(configPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`[CockpitLoader] Failed to load config: ${cockpitId}`, error.message);
        // Return minimal default config
        return {
            id: cockpitId,
            name: 'Default Cockpit',
            gridCols: 12,
            layout: { rows: [] },
            widgets: {},
            actions: []
        };
    }

    // v2: Load from database
    // const CockpitConfig = require('../models/cockpit-config.model');
    // return await CockpitConfig.findOne({ cockpitId, tenantId }) || defaultConfig;
}

/**
 * Get all available cockpit configs for a tenant
 * @param {string} tenantId 
 * @returns {Array} List of cockpit configs
 */
async function listCockpitConfigs(tenantId) {
    const configDir = path.join(__dirname, '../config/cockpits');

    try {
        const files = await fs.readdir(configDir);
        const configs = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(path.join(configDir, file), 'utf8');
                const config = JSON.parse(content);
                configs.push({
                    id: config.id,
                    name: config.name,
                    file
                });
            }
        }

        return configs;
    } catch (error) {
        console.error('[CockpitLoader] Failed to list configs', error.message);
        return [];
    }
}

module.exports = {
    loadCockpitConfig,
    listCockpitConfigs
};

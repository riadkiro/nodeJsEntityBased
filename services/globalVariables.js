/**
 * Global Variables Service
 * Provides nested object structure for global template variables
 */
const dayjs = require('dayjs');
require('dayjs/locale/fr');
dayjs.locale('fr');

/**
 * Returns nested object structure for global variables
 * @param {Object} context - { document, instance, user, workspace }
 * @returns {Object} - Nested globals: { date: {...}, doc: {...}, user: {...}, ... }
 */
function resolveAllGlobals(context = {}) {
    const now = dayjs();

    return {
        date: {
            today: now.format('DD/MM/YYYY'),
            yesterday: now.subtract(1, 'day').format('DD/MM/YYYY'),
            tomorrow: now.add(1, 'day').format('DD/MM/YYYY'),
            nextMonth: now.add(1, 'month').format('MMMM YYYY'),
            year: now.format('YYYY'),
            month: now.format('MMMM'),
            monthNum: now.format('MM'),
            day: now.format('DD'),
            dayName: now.format('dddd'),
            iso: now.toISOString(),
            timestamp: now.valueOf()
        },
        doc: {
            name: context.document?.name || '',
            number: context.document?.number ||
                context.instance?._id?.toString().slice(-6).toUpperCase() ||
                '',
            format: context.document?.format || 'A4',
            orientation: context.document?.orientation || 'portrait',
            createdAt: context.document?.createdAt
                ? dayjs(context.document.createdAt).format('DD/MM/YYYY')
                : '',
            updatedAt: context.document?.updatedAt
                ? dayjs(context.document.updatedAt).format('DD/MM/YYYY')
                : ''
        },
        user: {
            name: context.user?.name || '',
            email: context.user?.email || '',
            firstName: context.user?.firstName || '',
            lastName: context.user?.lastName || ''
        },
        workspace: {
            name: context.workspace?.name || ''
        },
        company: {
            name: context.workspace?.companyName || context.workspace?.company?.name || '',
            vat: context.workspace?.vat || context.workspace?.company?.vat || '',
            address: context.workspace?.address || context.workspace?.company?.address || '',
            phone: context.workspace?.phone || context.workspace?.company?.phone || '',
            email: context.workspace?.email || context.workspace?.company?.email || '',
            website: context.workspace?.website || context.workspace?.company?.website || ''
        }
    };
}

/**
 * Get list of available global variables for UI
 * @returns {Array} - List of { category, key, label }
 */
function getGlobalVariablesList() {
    return [
        // Date
        { category: 'date', key: 'date.today', label: "Date d'aujourd'hui" },
        { category: 'date', key: 'date.yesterday', label: 'Hier' },
        { category: 'date', key: 'date.tomorrow', label: 'Demain' },
        { category: 'date', key: 'date.nextMonth', label: 'Mois prochain' },
        { category: 'date', key: 'date.year', label: 'Année' },
        { category: 'date', key: 'date.month', label: 'Mois (nom)' },
        { category: 'date', key: 'date.monthNum', label: 'Mois (numéro)' },
        { category: 'date', key: 'date.day', label: 'Jour' },
        { category: 'date', key: 'date.dayName', label: 'Jour (nom)' },

        // Document
        { category: 'doc', key: 'doc.name', label: 'Nom du document' },
        { category: 'doc', key: 'doc.number', label: 'Numéro du document' },
        { category: 'doc', key: 'doc.format', label: 'Format' },
        { category: 'doc', key: 'doc.createdAt', label: 'Date de création' },

        // User
        { category: 'user', key: 'user.name', label: "Nom de l'utilisateur" },
        { category: 'user', key: 'user.email', label: 'Email utilisateur' },

        // Company
        { category: 'company', key: 'company.name', label: 'Nom société' },
        { category: 'company', key: 'company.vat', label: 'TVA société' },
        { category: 'company', key: 'company.address', label: 'Adresse société' },
        { category: 'company', key: 'company.phone', label: 'Téléphone société' },
        { category: 'company', key: 'company.email', label: 'Email société' },
        { category: 'company', key: 'company.website', label: 'Site web société' }
    ];
}

/**
 * Get variables grouped by category
 * @returns {Object} - { date: [...], doc: [...], ... }
 */
function getGlobalVariablesByCategory() {
    const list = getGlobalVariablesList();
    return list.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});
}

module.exports = {
    resolveAllGlobals,
    getGlobalVariablesList,
    getGlobalVariablesByCategory
};

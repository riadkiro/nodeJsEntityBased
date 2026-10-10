const LOCAL_PROVIDER_LOGOS = Object.freeze({
    openai: '/logos/ChatGPT-Logo.png',
    app: '/assets/images/logo.svg'
});

function getProviderLogo(provider = {}) {
    const key = String(provider.key || '').trim().toLowerCase();
    return LOCAL_PROVIDER_LOGOS[key] || String(provider.logo || '').trim();
}

function withProviderPresentation(provider = {}) {
    return {
        ...provider,
        logo: getProviderLogo(provider)
    };
}

module.exports = {
    LOCAL_PROVIDER_LOGOS,
    getProviderLogo,
    withProviderPresentation
};

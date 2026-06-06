export function currentReturnTo() {
    if (typeof window === 'undefined') return ''
    return `${window.location.pathname}${window.location.search || ''}`
}

export function withReturnTo(path, returnTo = currentReturnTo()) {
    if (!returnTo) return path
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}returnTo=${encodeURIComponent(returnTo)}`
}

export function cleanRecordId(value) {
    const raw = value?._id?.$oid
        || value?._id
        || value?.id?.$oid
        || value?.id
        || value?.recordId?.$oid
        || value?.recordId
        || value
    const id = String(raw ?? '').trim()
    if (!id || id.toLowerCase() === 'undefined' || id.toLowerCase() === 'null') return ''
    return id
}

export function recordModuleHref(accountNumber, entitySlug, recordId, moduleName = 'overview', returnTo) {
    const id = cleanRecordId(recordId)
    if (!id || !accountNumber || !entitySlug) return '#'
    return withReturnTo(`/account/${accountNumber}/record/${entitySlug}/${id}/${moduleName}`, returnTo)
}

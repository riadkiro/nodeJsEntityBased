/**
 * Document API Service
 * Handles save (POST/PUT) and PDF export endpoints
 * Mirrors Alpine.js saveDocument() and printDocument() behavior exactly
 */

/**
 * Save document to server
 * POST for new documents, PUT for existing
 * @param {Object} doc - Document object
 * @param {string} accountNumber - Account number
 * @returns {Promise<{success: boolean, document?: Object, error?: string}>}
 */
export async function saveDocument(doc, accountNumber) {
    const method = doc._id ? 'PUT' : 'POST'
    const url = doc._id
        ? `/account/${accountNumber}/documents/api/${doc._id}`
        : `/account/${accountNumber}/documents/api`

    console.log('Saving document...', { method, url, docId: doc._id })

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc)
        })

        const data = await response.json()
        console.log('Save response:', data)

        if (data.document) {
            // Handle new document: update URL if created
            if (!doc._id && data.document._id) {
                const newUrl = `/account/${accountNumber}/documents/${data.document._id}/edit`
                console.log('Updating URL to:', newUrl)
                window.history.replaceState({}, '', newUrl)
            }
            return { success: true, document: data.document }
        } else {
            console.warn('Response missing document property:', data)
            return { success: false, error: 'Response missing document' }
        }
    } catch (error) {
        console.error('Error saving document:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Export document as PDF
 * Cleans HTML and sends to Puppeteer endpoint
 * @param {string} docId - Document ID
 * @param {string} docName - Document name (for filename)
 * @param {string} html - HTML content of pages container
 * @param {string} accountNumber - Account number
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function exportPdf(docId, docName, html, accountNumber) {
    console.log('[PDF] Generating for doc:', docId)
    console.log('[PDF] HTML Input Size:', html.length, 'chars')

    try {
        const response = await fetch(`/account/${accountNumber}/documents/api/${docId}/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html })
        })

        if (!response.ok) {
            const text = await response.text()
            throw new Error(text)
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${docName}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)

        return { success: true }
    } catch (error) {
        console.error('[PDF] Critical Error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Upload image from paste (base64) to server
 * @param {string} accountNumber - Account number
 * @param {string} docId - Document ID
 * @param {string} base64Data - Base64 encoded image data URI
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadImage(accountNumber, docId, base64Data) {
    console.log('[Upload] Uploading pasted image for doc:', docId)

    try {
        const response = await fetch(`/account/${accountNumber}/documents/api/${docId}/upload-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Data })
        })

        const data = await response.json()

        if (data.success && data.url) {
            console.log('[Upload] Image uploaded:', data.url)
            return { success: true, url: data.url }
        } else {
            console.warn('[Upload] Failed:', data.error)
            return { success: false, error: data.error || 'Upload failed' }
        }
    } catch (error) {
        console.error('[Upload] Error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Quick test: Verify that gridColumnWidths can be saved/loaded via the API
 */
const http = require('http')

// 1. Login to get session cookie
const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' })

function request(opts, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(opts, (res) => {
            let body = ''
            res.on('data', chunk => body += chunk)
            res.on('end', () => {
                const cookies = res.headers['set-cookie'] || []
                resolve({ status: res.statusCode, body, cookies, location: res.headers['location'] })
            })
        })
        req.on('error', reject)
        if (data) req.write(data)
        req.end()
    })
}

async function run() {
    // Login
    const loginRes = await request({
        hostname: '127.0.0.1', port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, loginData)

    const sessionCookies = loginRes.cookies.map(c => c.split(';')[0]).join('; ')
    console.log('Login status:', loginRes.status)
    console.log('Cookies:', sessionCookies.substring(0, 60) + '...')

    // 2. Save column widths
    const viewId = 'dynamic-table:test123'
    const saveData = JSON.stringify({
        viewId,
        preferences: {
            gridColumnWidths: {
                'schema1': { '__relation': 300, 'code': 100, 'qty': 80 }
            }
        }
    })

    const saveRes = await request({
        hostname: '127.0.0.1', port: 3000,
        path: '/account/7846/api/user/view-preferences',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: sessionCookies }
    }, saveData)

    console.log('\nSave status:', saveRes.status)
    console.log('Save response:', saveRes.body)

    // 3. Load column widths
    const loadRes = await request({
        hostname: '127.0.0.1', port: 3000,
        path: `/account/7846/api/user/view-preferences/${encodeURIComponent(viewId)}`,
        method: 'GET',
        headers: { Cookie: sessionCookies }
    })

    console.log('\nLoad status:', loadRes.status)
    const loadData = JSON.parse(loadRes.body)
    console.log('Loaded gridColumnWidths:', JSON.stringify(loadData?.preferences?.gridColumnWidths, null, 2))

    // Verify
    if (loadData?.preferences?.gridColumnWidths?.schema1?.__relation === 300) {
        console.log('\n✅ Column width persistence WORKS!')
    } else {
        console.log('\n❌ Column width persistence FAILED')
        console.log('Full response:', JSON.stringify(loadData, null, 2))
    }

    process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })

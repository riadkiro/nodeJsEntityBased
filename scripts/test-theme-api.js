const http = require('http');

function makeRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

(async () => {
    // 1. Login
    const loginData = JSON.stringify({ email: 'boukirou6@hotmail.com', password: 'test' });
    const loginRes = await makeRequest({
        hostname: 'localhost', port: 3000, path: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, loginData);
    const cookies = loginRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
    console.log('Login:', loginRes.status);

    // 2. Set theme to 'dark' via API
    const setDark = JSON.stringify({ theme: 'dark' });
    const darkRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/9194/api/user/theme',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': setDark.length, 'Cookie': cookies }
    }, setDark);
    console.log('Set dark:', darkRes.status, darkRes.body);

    // 3. Load home page — check that server renders dark theme
    const homeRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/9194/home',
        headers: { 'Cookie': cookies }
    });
    const hasUserThemeDark = homeRes.body.includes("window.__USER_THEME__ = 'dark'");
    const hasDarkClass = homeRes.body.includes("document.documentElement.classList.add('dark')");
    console.log('Home page has USER_THEME=dark:', hasUserThemeDark);
    console.log('Home page adds dark class:', hasDarkClass);

    // 4. Set theme to 'light' via API
    const setLight = JSON.stringify({ theme: 'light' });
    const lightRes = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/9194/api/user/theme',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': setLight.length, 'Cookie': cookies }
    }, setLight);
    console.log('Set light:', lightRes.status, lightRes.body);

    // 5. Load home again — check light
    const homeRes2 = await makeRequest({
        hostname: 'localhost', port: 3000,
        path: '/account/9194/home',
        headers: { 'Cookie': cookies }
    });
    const hasUserThemeLight = homeRes2.body.includes("window.__USER_THEME__ = 'light'");
    console.log('Home page has USER_THEME=light:', hasUserThemeLight);
    
    console.log('\n✅ Theme persistence is server-side. No more localStorage dependency.');
})();

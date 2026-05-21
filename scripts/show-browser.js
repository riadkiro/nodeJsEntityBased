const puppeteer = require('puppeteer');

async function run() {
    console.log('Opening visible browser...');
    // Lancement en mode NON headless (visible) avec une fenêtre agrandie
    const browser = await puppeteer.launch({ 
        headless: false, 
        args: ['--no-sandbox', '--start-maximized'],
        defaultViewport: null 
    });
    
    const page = await browser.newPage();
    
    // 1. Navigation vers le Login
    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    
    // On ajoute un petit délai pour que tu aies le temps de voir l'écran
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. On tape les identifiants avec un léger délai entre chaque lettre pour l'effet "live"
    console.log('Typing credentials...');
    await page.type('input[name="email"]', 'boukirou6@hotmail.com', { delay: 80 });
    await page.type('input[name="password"]', 'test', { delay: 80 });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 3. Clic sur le bouton de connexion
    console.log('Clicking login...');
    await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Navigation vers le dossier problématique
    const url = 'http://localhost:3000/account/5096/drive/Factures/Ventes';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log('Done! The browser is now yours. Close it whenever you are finished.');
    // Le script ne se ferme pas intentionnellement pour te laisser le navigateur ouvert.
}

run().catch(e => console.error('Fatal Error:', e));

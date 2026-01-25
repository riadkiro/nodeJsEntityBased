const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://cdn.jsdelivr.net/npm/@iconify-json/solar/icons.json';
const destDir = path.join(__dirname, '../public/data');
const destFile = path.join(destDir, 'solar-icons.json');

// Create directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

console.log('Fetching Solar icons...');

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const icons = Object.keys(json.icons).map(name => `solar:${name}`);

            console.log(`Found ${icons.length} icons.`);

            fs.writeFileSync(destFile, JSON.stringify(icons, null, 2));
            console.log(`Saved to ${destFile}`);
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});

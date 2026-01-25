const fs = require('fs');
const https = require('https');
const path = require('path');

const library = 'tabler';
const url = `https://cdn.jsdelivr.net/npm/@iconify-json/${library}/icons.json`;
const destDir = path.join(__dirname, '../public/data');
const destFile = path.join(destDir, `${library}-icons.json`);

// Create directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

console.log(`Fetching ${library} icons...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            // Default iconify structure has 'icons' object with keys
            const icons = Object.keys(json.icons).map(name => `${library}:${name}`);

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

const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/account/5096/api/drive',
    method: 'GET',
    headers: {
        'Cookie': '' // We need session cookie - just check structure
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.success && json.entities) {
                console.log('=== ENTITIES ===');
                json.entities.forEach(e => {
                    console.log(`\nEntity: ${e.entityName} (${e.records.length} records, ${e.fileCount} files)`);
                    e.records.forEach(r => {
                        console.log(`  Record: ${r.recordTitle}`);
                        console.log(`    rootFiles: ${r.rootFiles ? r.rootFiles.length : 'UNDEFINED'}`);
                        console.log(`    folders: ${r.folders ? r.folders.length : 'UNDEFINED'}`);
                        if (r.folders && r.folders.length > 0) {
                            r.folders.forEach(f => {
                                console.log(`      Folder "${f.name}": ${f.files.length} files`);
                            });
                        }
                        if (r.rootFiles && r.rootFiles.length > 0) {
                            r.rootFiles.forEach(f => {
                                console.log(`      RootFile: ${f.originalName}`);
                            });
                        }
                    });
                });
            } else {
                console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500));
            }
        } catch(e) {
            console.log('Response status:', res.statusCode);
            console.log('Raw response:', data.substring(0, 500));
        }
    });
});

req.on('error', (e) => console.error('Error:', e));
req.end();

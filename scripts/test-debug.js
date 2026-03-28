fetch('http://localhost:3000/api/debug-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: true })
}).then(r => r.json()).then(console.log).catch(console.error);

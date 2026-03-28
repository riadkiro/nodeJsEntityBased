const express = require('express');
const router = express.Router();
const fs = require('fs');

router.post('/api/debug-log', express.json(), (req, res) => {
    const text = new Date().toISOString() + ' : ' + JSON.stringify(req.body, null, 2) + '\n';
    fs.appendFileSync('browser_debug.log', text);
    res.json({ ok: true });
});

module.exports = router;

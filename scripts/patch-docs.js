const fs = require('fs');
let content = fs.readFileSync('routes/document.routes.js', 'utf8');

const target = `        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, error: 'Document introuvable' });
        }

        res.json({ success: true });`;

const replacement = `        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, error: 'Document introuvable' });
        }

        // --- Cascade delete SmartDocTemplates ---
        try {
            const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
            if (SmartDocTemplate) {
                await SmartDocTemplate.deleteMany({ documentId: req.params.id });
            }
        } catch (cascadeErr) {
            console.error('[SmartDoc] Error in cascade delete:', cascadeErr);
        }

        res.json({ success: true });`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('routes/document.routes.js', content);
    console.log("Patched successfully with \n target.");
} else {
    // Try with \r\n
    const targetRN = target.split('\n').join('\r\n');
    const replacementRN = replacement.split('\n').join('\r\n');
    if (content.includes(targetRN)) {
        content = content.replace(targetRN, replacementRN);
        fs.writeFileSync('routes/document.routes.js', content);
        console.log("Patched successfully with \r\n target.");
    } else {
        console.error("Target not found!");
    }
}

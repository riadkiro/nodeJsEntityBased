const express = require('express');
const router = express.Router();
const { tenantCollection } = require('../middleware/tenant');
const uploadToDynamic = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Upload middleware for document files
const uploadDocFiles = uploadToDynamic((req) => `public/uploads/documents/files/${req.account_number}`);

// GET - Liste des documents
router.get('/', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const DocumentFolder = await tenantCollection(req, 'DocumentFolder');
        if (!Document) {
            return res.status(500).send('Erreur de connexion base de données');
        }

        // Normal documents (not templates, not uploaded files)
        const documents = await Document.find({
            isTemplate: false,
            createdBy: req.user._id,
            isGenerationSnapshot: { $ne: true },
            'uploadedFile.path': { $exists: false }
        })
            .sort({ updatedAt: -1 })
            .lean();

        // Fetch user's template documents
        const templateDocs = await Document.find({
            isTemplate: true,
            createdBy: req.user._id
        })
            .sort({ updatedAt: -1 })
            .lean();

        // Fetch user-created folders
        let folders = [];
        if (DocumentFolder) {
            folders = await DocumentFolder.find({ createdBy: req.user._id })
                .sort({ order: 1 })
                .lean();
        }

        // Fetch uploaded documents (files with uploadedFile.path)
        const uploadedDocs = await Document.find({
            createdBy: req.user._id,
            'uploadedFile.path': { $exists: true, $ne: null }
        })
            .sort({ createdAt: -1 })
            .lean();

        // ── Enrich all docs with relation/source display data ──
        try {
            const Entity = await tenantCollection(req, 'Entity');
            if (Entity) {
                // Collect entity IDs from templates (entityId/entityIds/collections)
                const allEntityIds = new Set();
                [...documents, ...templateDocs].forEach(d => {
                    if (d.entityId) allEntityIds.add(d.entityId.toString());
                    if (d.entityIds) d.entityIds.forEach(eid => allEntityIds.add(eid.toString()));
                    if (d.collections) d.collections.forEach(c => { if (c.entityId) allEntityIds.add(c.entityId.toString()); });
                });

                // Fetch entity names for template relation display
                let entityMap = {};
                if (allEntityIds.size > 0) {
                    const entities = await Entity.find({ _id: { $in: [...allEntityIds] } }).select('name icon slug color').lean();
                    entities.forEach(e => { entityMap[e._id.toString()] = e; });
                }

                const enrichDoc = (d) => {
                    // ── Relations ──
                    // Priority 1: Use v2 linkedRecords (generated docs with structured metadata)
                    if (d.linkedRecords && d.linkedRecords.length > 0) {
                        d._relations = d.linkedRecords.map(lr => ({
                            name: lr.recordTitle || lr.entityName || '',
                            icon: lr.entityIcon || 'solar:folder-bold-duotone',
                            slug: lr.entitySlug || '',
                            color: lr.entityColor || '',
                            recordTitle: lr.recordTitle || '',
                            entityName: lr.entityName || ''
                        }));
                    } else {
                        // Priority 2: Legacy entityId/entityIds/collections (for templates)
                        const relations = [];
                        if (d.entityId && entityMap[d.entityId.toString()]) {
                            const e = entityMap[d.entityId.toString()];
                            relations.push({ name: e.name, icon: e.icon, slug: e.slug, color: e.color || '' });
                        }
                        if (d.entityIds) {
                            d.entityIds.forEach(eid => {
                                const key = eid.toString();
                                if (entityMap[key] && !relations.find(r => r.slug === entityMap[key].slug)) {
                                    const e = entityMap[key];
                                    relations.push({ name: e.name, icon: e.icon, slug: e.slug, color: e.color || '' });
                                }
                            });
                        }
                        if (d.collections) {
                            d.collections.forEach(c => {
                                if (c.entityId && entityMap[c.entityId.toString()]) {
                                    const e = entityMap[c.entityId.toString()];
                                    if (!relations.find(r => r.slug === e.slug)) {
                                        relations.push({ name: e.name, icon: e.icon, slug: e.slug, color: e.color || '' });
                                    }
                                }
                            });
                        }
                        d._relations = relations;
                    }

                    // ── Source type ──
                    // Priority 1: v2 generatedFrom
                    if (d.generatedFrom?.templateName) {
                        d._source = { type: 'generated', name: d.generatedFrom.templateName };
                    }
                    // Priority 2: Legacy draftSourceTemplateId (for unmigrated docs)
                    else if (d.isDraft && d.draftSourceTemplateId) {
                        d._source = { type: 'generated', name: 'Modèle' };
                    }
                    // Priority 3: Uploaded file
                    else if (d.uploadedFile?.path) {
                        d._source = { type: 'upload' };
                    }
                    // Default: manually created
                };
                documents.forEach(enrichDoc);
                templateDocs.forEach(enrichDoc);
            }
        } catch (e) { /* entity enrichment is optional */ }

        // Fetch generated documents from TWO sources:
        // 1. Record attachments (isGenerated: true) — for record-bound generation
        // 2. Standalone finalized documents (status: 'finalized', generatedFile exists) — for Docs Hub context-free generation
        let generatedDocs = [];
        try {
            const Record = await tenantCollection(req, 'Record');
            const Entity = await tenantCollection(req, 'Entity');

            // Source 1: Record attachments
            if (Record) {
                // Aggregate across all records to find generated attachments
                const results = await Record.aggregate([
                    { $match: { 'attachments.isGenerated': true } },
                    { $unwind: '$attachments' },
                    { $match: { 'attachments.isGenerated': true } },
                    { $sort: { 'attachments.uploadedAt': -1 } },
                    { $limit: 50 },
                    {
                        $project: {
                            _id: '$attachments._id',
                            filename: '$attachments.filename',
                            originalName: '$attachments.originalName',
                            mimeType: '$attachments.mimeType',
                            size: '$attachments.size',
                            generatedFromName: '$attachments.generatedFromName',
                            generatedFromDocumentId: '$attachments.generatedFromDocumentId',
                            snapshotDocumentId: '$attachments.snapshotDocumentId',
                            uploadedAt: '$attachments.uploadedAt',
                            uploadedBy: '$attachments.uploadedBy',
                            recordId: '$_id',
                            recordTitle: '$title',
                            entityId: '$entityId'
                        }
                    }
                ]);

                // Enrich with entity names
                let entityMap = {};
                if (Entity) {
                    const entityIds = [...new Set(results.map(r => r.entityId?.toString()).filter(Boolean))];
                    if (entityIds.length > 0) {
                        const entities = await Entity.find({ _id: { $in: entityIds } }).select('name icon slug color').lean();
                        entities.forEach(e => { entityMap[e._id.toString()] = e; });
                    }
                }

                generatedDocs = results.map(doc => {
                    const entity = doc.entityId ? entityMap[doc.entityId.toString()] : null;
                    let docName = doc.originalName || 'Document généré';
                    if (doc.filename && doc.filename.toLowerCase().endsWith('.pdf') && !docName.toLowerCase().endsWith('.pdf')) {
                        docName += '.pdf';
                    }
                    return {
                        _id: doc._id,
                        name: docName,
                        templateName: doc.generatedFromName || '',
                        createdAt: doc.uploadedAt,
                        downloadUrl: `/account/${req.account_number}/uploads/attachments/${doc.filename}`,
                        snapshotDocumentId: doc.snapshotDocumentId || null,
                        generatedFromDocumentId: doc.generatedFromDocumentId || null,
                        recordId: doc.recordId,
                        recordTitle: doc.recordTitle || '',
                        entityName: entity?.name || '',
                        entityIcon: entity?.icon || '',
                        entitySlug: entity?.slug || '',
                        entityColor: entity?.color || '',
                        status: 'finalized'
                    };
                });
            }

            // Source 2: Standalone finalized documents (generated from Docs Hub without record context)
            const Document = await tenantCollection(req, 'Document');
            if (Document) {
                const standaloneDocs = await Document.find({
                    status: 'finalized',
                    'generatedFile.filename': { $exists: true },
                    $or: [
                        { 'generatedFile.recordId': { $exists: false } },
                        { 'generatedFile.recordId': null }
                    ]
                }).sort({ updatedAt: -1 }).limit(50).lean();

                for (const sdoc of standaloneDocs) {
                    const gf = sdoc.generatedFile || {};
                    let docName = gf.originalName || sdoc.name || 'Document généré';
                    generatedDocs.push({
                        _id: sdoc._id,
                        name: docName,
                        templateName: gf.generatedFromName || sdoc.generatedFrom?.templateName || '',
                        createdAt: gf.generatedAt || sdoc.updatedAt,
                        downloadUrl: gf.downloadUrl || `/account/${req.account_number}/uploads/attachments/${gf.filename}`,
                        snapshotDocumentId: sdoc._id,
                        generatedFromDocumentId: sdoc.generatedFrom?.templateId || null,
                        recordId: null,
                        recordTitle: '',
                        entityName: '',
                        entityIcon: '',
                        entitySlug: '',
                        entityColor: '',
                        status: 'finalized'
                    });
                }

                // Sort combined results by date, newest first
                generatedDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
        } catch (e) {
            console.warn('[Documents] Could not fetch generated docs:', e.message);
        }

        res.render('document/document-list', {
            title: 'Documents',
            documents,
            templateDocs,
            folders,
            uploadedDocs,
            generatedDocs,
            account_number: req.account_number,
            layout: 'layout-app'
        });
    } catch (error) {
        console.error('[Documents] Error loading list:', error);
        res.status(500).send('Erreur lors du chargement des documents');
    }
});

// GET - Liste des templates
router.get('/templates', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const Entity = await tenantCollection(req, 'Entity');
        if (!Document) {
            return res.status(500).send('Erreur de connexion base de données');
        }

        // User's own templates
        const myTemplates = await Document.find({
            isTemplate: true,
            createdBy: req.user._id
        })
            .sort({ updatedAt: -1 })
            .lean();

        // System/other templates (not created by user)
        const systemTemplates = await Document.find({
            isTemplate: true,
            createdBy: { $ne: req.user._id }
        })
            .sort({ updatedAt: -1 })
            .lean();

        // Fetch entities for linking info
        let entities = [];
        if (Entity) {
            entities = await Entity.find({}).select('name icon').lean();
        }

        res.render('document/template-list', {
            title: 'Mes Templates',
            myTemplates,
            systemTemplates,
            entities,
            account_number: req.account_number,
            layout: 'layout-app'
        });
    } catch (error) {
        console.error('[Documents] Error loading templates:', error);
        res.status(500).send('Erreur lors du chargement des templates');
    }
});

// GET - Éditeur de document (nouveau)
router.get('/new', async (req, res) => {
    const templateId = req.query.template;
    let documentData = null;
    let isTemplateMode = req.query.isTemplate === 'true';

    if (templateId) {
        try {
            const Document = await tenantCollection(req, 'Document');
            if (Document) {
                const template = await Document.findById(templateId);
                if (template && template.isTemplate && template.duplicate) {
                    documentData = template.duplicate(req.user._id);
                    isTemplateMode = true;
                }
            }
        } catch (error) {
            console.error('[Documents] Error loading template:', error);
        }
    }

    res.render('document/document-editor-react', {
        title: 'Nouveau Document',
        document: documentData,
        isNew: true,
        isTemplateMode: isTemplateMode,
        isFocusMode: true,
        account_number: req.account_number,
        layout: false
    });
});

// GET - Éditeur de document (édition)
router.get('/:id/edit', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).send('Erreur de connexion base de données');
        }

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).send('Document non trouvé');
        }

        res.render('document/document-editor', {
            title: `Éditer - ${document.name}`,
            document,
            isNew: false,
            isFocusMode: true,
            account_number: req.account_number,
            layout: false
        });
    } catch (error) {
        console.error('[Documents] Error loading document:', error);
        res.status(500).send('Erreur lors du chargement du document');
    }
});

// GET - React Editor (test route)
router.get('/:id/edit-react', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).send('Erreur de connexion base de données');
        }

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).send('Document non trouvé');
        }

        // Support minimal mode for iframe embedding (no app layout)
        const isMinimal = req.query.minimal === 'true';
        // Template mode: full-screen layout without app sidebar
        const isTemplateMode = !!document.isTemplate && !isMinimal;

        // Context-free bindings (from /generate redirect)
        let contextFreeBindings = null;
        if (req.query.contextFree === '1' && req.query.bindings) {
            try {
                contextFreeBindings = JSON.parse(req.query.bindings);
            } catch (e) {
                console.warn('[Documents] Failed to parse context-free bindings:', e.message);
            }
        }

        res.render('document/document-editor-react', {
            title: `Éditer - ${document.name}`,
            document,
            isNew: false,
            isMinimal: isMinimal,
            isTemplateMode: isTemplateMode,
            isFocusMode: true,
            contextFreeBindings: contextFreeBindings,
            account_number: req.account_number,
            layout: false
        });
    } catch (error) {
        console.error('[Documents] Error loading document (React):', error);
        res.status(500).send('Erreur lors du chargement du document');
    }
});

// API Routes

// GET - API templates list (for React modal)
router.get('/api/templates', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).json({ success: false, error: 'Erreur de connexion base de données' });
        }

        const templates = await Document.find({ isTemplate: true })
            .sort({ updatedAt: -1 })
            .lean();

        res.json({ success: true, templates });
    } catch (error) {
        console.error('[Documents] Error loading templates API:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST - Créer un document
router.post('/api', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).json({ success: false, error: 'Erreur de connexion base de données' });
        }

        const documentData = {
            ...req.body,
            createdBy: req.user._id
        };

        // Ensure we don't try to save an empty/null _id
        if (documentData._id === null || documentData._id === 'null' || documentData._id === '') {
            delete documentData._id;
        }

        const document = new Document(documentData);
        await document.save();

        console.log('[Documents] Created new document:', document._id, document.name);

        // Verify ID exists before sending
        if (!document._id) {
            console.error('[Documents] CRITICAL: Document saved but has no _id!', document);
        }

        res.json({ success: true, document });
    } catch (error) {
        console.error('[Documents] Error creating document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET - Récupérer un document
router.get('/api/:id', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).json({ success: false, error: 'Erreur de connexion base de données' });
        }

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document non trouvé' });
        }

        res.json({ success: true, document });
    } catch (error) {
        console.error('[Documents] Error loading document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT - Mettre à jour un document
router.put('/api/:id', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).json({ success: false, error: 'Erreur de connexion base de données' });
        }

        const document = await Document.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document non trouvé' });
        }

        // ── Mission 8: Auto-sync SmartDocTemplate entries ──
        // When a template document is linked/unlinked to entities, 
        // automatically create or remove the SmartDocTemplate registrations
        try {
            const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
            if (SmartDocTemplate) {
                const docId = document._id.toString();
                const isTemplate = document.isTemplate === true;
                const linkedEntityIds = (document.entityIds || []).map(id => id.toString());

                // If entityId is set but not in entityIds, include it
                if (document.entityId && !linkedEntityIds.includes(document.entityId.toString())) {
                    linkedEntityIds.push(document.entityId.toString());
                }

                // Get ALL existing SmartDocTemplate entries for this document
                const allExistingTemplates = await SmartDocTemplate.find({ documentId: docId }).lean();
                
                // For auto-sync of generic entity links, we only care about 'entity' scoped ones to delete
                const existingTemplates = allExistingTemplates.filter(t => !t.scopeType || t.scopeType === 'entity');
                
                // To prevent creating duplicate 'entity' templates when a 'record' template already exists for that entity
                const allExistingEntityIds = allExistingTemplates.map(t => t.entityId.toString());

                if (isTemplate && (linkedEntityIds.length > 0 || (document.linkedRecords && document.linkedRecords.length > 0))) {
                    // Create missing SmartDocTemplate entries for generic 'entity' scope
                    for (const entityId of linkedEntityIds) {
                        if (!allExistingEntityIds.includes(entityId)) {
                            await SmartDocTemplate.create({
                                name: document.name || 'Template',
                                documentId: docId,
                                entityId: entityId,
                                scopeType: 'entity',
                                outputFormat: 'pdf',
                                active: true,
                                createdBy: req.user?._id
                            });
                            console.log(`[SmartDoc] Auto-linked template "${document.name}" to entity ${entityId}`);
                        }
                    }

                    // Create missing SmartDocTemplate entries for 'record' scope
                    if (document.linkedRecords && document.linkedRecords.length > 0) {
                        for (const lr of document.linkedRecords) {
                            const exists = allExistingTemplates.some(t => 
                                t.scopeType === 'record' && 
                                t.scopeRecordId && t.scopeRecordId.toString() === lr.recordId.toString()
                            );
                            if (!exists) {
                                await SmartDocTemplate.create({
                                    name: document.name || 'Template',
                                    documentId: docId,
                                    entityId: lr.entityId,
                                    scopeType: 'record',
                                    scopeRecordId: lr.recordId,
                                    scopeRecordLabel: lr.recordTitle,
                                    outputFormat: 'pdf',
                                    active: true,
                                    createdBy: req.user?._id
                                });
                                console.log(`[SmartDoc] Auto-linked template "${document.name}" to record ${lr.recordId}`);
                            }
                        }
                    }

                    // Remove SmartDocTemplate entries for unlinked entities
                    for (const existing of existingTemplates) {
                        if (!linkedEntityIds.includes(existing.entityId.toString())) {
                            await SmartDocTemplate.findByIdAndDelete(existing._id);
                            console.log(`[SmartDoc] Auto-unlinked template "${document.name}" from entity ${existing.entityId}`);
                        }
                    }

                    // Remove SmartDocTemplate entries for unlinked records
                    const recordTemplates = allExistingTemplates.filter(t => t.scopeType === 'record');
                    const validRecordIds = (document.linkedRecords || []).map(r => r.recordId.toString());
                    for (const existing of recordTemplates) {
                        if (existing.scopeRecordId && !validRecordIds.includes(existing.scopeRecordId.toString())) {
                            await SmartDocTemplate.findByIdAndDelete(existing._id);
                            console.log(`[SmartDoc] Auto-unlinked template "${document.name}" from record ${existing.scopeRecordId}`);
                        }
                    }

                    // Update name if changed (for all scopes: entity, record, relation)
                    for (const existing of allExistingTemplates) {
                        if (existing.name !== document.name) {
                            await SmartDocTemplate.findByIdAndUpdate(existing._id, { name: document.name });
                        }
                    }
                } else if (!isTemplate && allExistingTemplates.length > 0) {
                    // Template mode was disabled → remove all SmartDocTemplate entries
                    await SmartDocTemplate.deleteMany({ documentId: docId });
                    console.log(`[SmartDoc] Template mode disabled → removed ${allExistingTemplates.length} SmartDocTemplate entries`);
                } else if (isTemplate && linkedEntityIds.length === 0 && (!document.linkedRecords || document.linkedRecords.length === 0) && allExistingTemplates.length > 0) {
                    // Template has no linked entities or records → remove orphan SmartDocTemplate entries
                    await SmartDocTemplate.deleteMany({ documentId: docId });
                    console.log(`[SmartDoc] Template unlinked from all entities and records → removed ${allExistingTemplates.length} SmartDocTemplate entries`);
                }
            }
        } catch (syncErr) {
            // Don't fail the save if sync fails — just log
            console.warn('[SmartDoc] Auto-sync error (non-blocking):', syncErr.message);
        }

        res.json({ success: true, document });
    } catch (error) {
        console.error('[Documents] Error updating document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST - Upload pasted image (base64)
router.post('/api/:id/upload-image', async (req, res) => {
    try {
        const { image } = req.body;

        if (!image || !image.startsWith('data:image')) {
            return res.status(400).json({ success: false, error: 'Image base64 invalide' });
        }

        const docId = req.params.id;
        const fs = require('fs');
        const path = require('path');
        const crypto = require('crypto');

        // Extract image type and data
        const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ success: false, error: 'Format image invalide' });
        }

        const imageType = matches[1].replace('+xml', ''); // svg+xml -> svg
        const imageData = matches[2];
        const buffer = Buffer.from(imageData, 'base64');

        // Create upload directory
        const uploadDir = path.join(__dirname, '../public/uploads/documents', docId);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const hash = crypto.createHash('md5').update(imageData).digest('hex').substring(0, 8);
        const filename = `img_${Date.now()}_${hash}.${imageType === 'jpeg' ? 'jpg' : imageType}`;
        const filepath = path.join(uploadDir, filename);

        // Write file
        fs.writeFileSync(filepath, buffer);

        // Return public URL
        const url = `/uploads/documents/${docId}/${filename}`;
        console.log('[Documents] Image uploaded:', url);

        res.json({ success: true, url });
    } catch (error) {
        console.error('[Documents] Error uploading image:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE - Supprimer un document
router.delete('/api/:id', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).json({ success: false, error: 'Erreur de connexion base de données' });
        }

        const document = await Document.findByIdAndDelete(req.params.id);

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document non trouvé' });
        }

        // --- Mission 8: Cascade delete SmartDocTemplates ---
        try {
            const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');
            if (SmartDocTemplate) {
                await SmartDocTemplate.deleteMany({ documentId: req.params.id });
            }
        } catch (cascadeErr) {
            console.error('[SmartDoc] Error in cascade delete:', cascadeErr);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[Documents] Error deleting document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST - Dupliquer un document
router.post('/api/:id/duplicate', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).json({ success: false, error: 'Erreur de connexion base de données' });
        }

        const original = await Document.findById(req.params.id);

        if (!original) {
            return res.status(404).json({ success: false, error: 'Document non trouvé' });
        }

        const duplicateData = original.duplicate(req.user._id);
        const duplicate = new Document(duplicateData);
        await duplicate.save();

        res.json({ success: true, document: duplicate });
    } catch (error) {
        console.error('[Documents] Error duplicating document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST - Générer PDF (Puppeteer)
router.post('/api/:id/pdf', async (req, res) => {
    let browser = null;
    try {
        const puppeteer = require('puppeteer');
        const htmlContent = req.body.html;

        if (!htmlContent) {
            console.error('[PDF] HTML content missing in request');
            return res.status(400).send('Contenu HTML manquant');
        }

        console.log('[PDF] Generating for doc:', req.params.id);
        console.log('[PDF] HTML Input Size:', htmlContent.length, 'chars');

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport to exactly match editor page dimensions (same as SmartDoc generatePDF)
        await page.setViewport({ width: 794, height: 1123 });

        // If HTML already contains a full document (built client-side matching SmartDoc format),
        // use it directly. This mirrors generatePDF() in api-smartdoc.router.js
        let wrappedHtml = htmlContent;
        if (!htmlContent.includes('<html') && !htmlContent.includes('<HTML')) {
            // Fallback wrapper for legacy callers that send raw HTML fragments
            wrappedHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 0; size: A4; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.6;
            color: #000000;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        p, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, figure, hr { margin: 0; }
        ul, ol { list-style: none; padding: 0; }
        img, svg { display: block; max-width: 100%; }
        h1 { font-size: 2em; font-weight: bold; margin-top: 0.67em; margin-bottom: 0.67em; line-height: 1.2; color: #000; }
        h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.83em; margin-bottom: 0.83em; line-height: 1.3; color: #000; }
        h3 { font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 1em; line-height: 1.4; color: #000; }
        h4 { font-size: 1em; font-weight: bold; margin-top: 1.33em; margin-bottom: 1.33em; color: #000; }
        p { margin-top: 0; margin-bottom: 0; line-height: 1.6; }
        ul { list-style-type: disc; padding-left: 40px; }
        ol { list-style-type: decimal; padding-left: 40px; }
        blockquote { border-left: 4px solid #cbd5e1; margin: 1em 0; padding-left: 1em; color: #475569; }
        strong, b { font-weight: bold; }
        em, i { font-style: italic; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
        }

        await page.setContent(wrappedHtml, {
            waitUntil: ['networkidle0', 'load'],
            timeout: 30000
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
            preferCSSPageSize: true
        });

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('Buffer PDF vide généré');
        }

        console.log('[PDF] Success. Size:', pdfBuffer.length, 'bytes');

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="document-${req.params.id}.pdf"`,
        });

        // FIX: Puppeteer returns Uint8Array, explicitly convert to Buffer to avoid JSON serialization
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('[PDF] Critical Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Génération PDF échouée: ' + error.message });
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

// ============================================
// DELETE - Delete a document
// ============================================
router.delete('/api/documents/:id', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }

        const result = await Document.deleteOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (result.deletedCount === 0) {
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

        res.json({ success: true });
    } catch (error) {
        console.error('[Documents] Error deleting document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// FOLDER API Routes
// ============================================

// POST - Create a folder
router.post('/api/folders', async (req, res) => {
    try {
        const DocumentFolder = await tenantCollection(req, 'DocumentFolder');
        if (!DocumentFolder) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }

        const { name, color } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'Nom requis' });
        }

        const count = await DocumentFolder.countDocuments({ createdBy: req.user._id });
        const folder = await DocumentFolder.create({
            name: name.trim(),
            color: color || '#e2a03f',
            createdBy: req.user._id,
            order: count
        });

        res.json({ success: true, folder });
    } catch (error) {
        console.error('[Documents] Error creating folder:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT - Rename a folder
router.put('/api/folders/:id', async (req, res) => {
    try {
        const DocumentFolder = await tenantCollection(req, 'DocumentFolder');
        if (!DocumentFolder) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }

        const { name, color } = req.body;
        const update = {};
        if (name) update.name = name.trim();
        if (color) update.color = color;

        const folder = await DocumentFolder.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            update,
            { new: true }
        );

        if (!folder) {
            return res.status(404).json({ success: false, error: 'Dossier introuvable' });
        }

        res.json({ success: true, folder });
    } catch (error) {
        console.error('[Documents] Error updating folder:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE - Delete a folder (documents inside go back to root)
router.delete('/api/folders/:id', async (req, res) => {
    try {
        const DocumentFolder = await tenantCollection(req, 'DocumentFolder');
        const Document = await tenantCollection(req, 'Document');
        if (!DocumentFolder || !Document) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }

        // Move documents from folder back to root
        await Document.updateMany(
            { folderId: req.params.id, createdBy: req.user._id },
            { $set: { folderId: null } }
        );

        const result = await DocumentFolder.deleteOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, error: 'Dossier introuvable' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[Documents] Error deleting folder:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// FILE UPLOAD API Routes
// ============================================

// POST - Upload document files (PDF, Word, images, etc.)
router.post('/api/upload-files', uploadDocFiles.array('files', 20), async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'Aucun fichier' });
        }

        const created = [];
        for (const file of req.files) {
            const relativePath = `/uploads/documents/files/${req.account_number}/${file.filename}`;
            const doc = await Document.create({
                name: file.originalname.replace(/\.[^/.]+$/, ''),  // Remove extension for display name
                createdBy: req.user._id,
                status: 'draft',
                isTemplate: false,
                uploadedFile: {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    path: relativePath
                }
            });
            created.push(doc);
        }

        res.json({ success: true, documents: created });
    } catch (error) {
        console.error('[Documents] Error uploading files:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CONTEXT-FREE DOCUMENT GENERATION
// ============================================

/**
 * GET /:id/generate
 * Context-free generation: opens the document template directly in the editor.
 * - System tokens ({{today}}, {{user.name}}) are resolved immediately
 * - Relational tokens ({{consultations.patients.nom}}) become interactive
 *   placeholders the user can click to bind data
 * - No wizard: the document opens directly like Word
 */
router.get('/:id/generate', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const Entity = await tenantCollection(req, 'Entity');
        const SmartDocTemplate = await tenantCollection(req, 'SmartDocTemplate');

        const doc = await Document.findById(req.params.id).lean();
        if (!doc || !doc.isTemplate) {
            return res.status(404).send('Template non trouvé');
        }

        // ── Check if document has an associated SmartDocTemplate ──
        // If yes, use the DocGenerateWizard which resolves variables properly
        if (SmartDocTemplate) {
            const smartDocTemplate = await SmartDocTemplate.findOne({ documentId: doc._id.toString(), active: true }).lean();
            if (smartDocTemplate) {
                // Build entity list: include entities from entityIds, entityId, and linkedRecords
                const allEntityIds = new Set();
                (doc.entityIds || []).forEach(id => allEntityIds.add(id.toString()));
                if (doc.entityId) allEntityIds.add(doc.entityId.toString());
                // Also include entities referenced via linkedRecords
                (doc.linkedRecords || []).forEach(lr => {
                    if (lr.entityId) allEntityIds.add(lr.entityId.toString());
                });

                let entities = [];
                if (allEntityIds.size > 0) {
                    entities = await Entity.find({ _id: { $in: [...allEntityIds] } })
                        .populate({
                            path: 'relations.targetEntity',
                            select: 'name icon slug color'
                        })
                        .lean();
                }

                return res.render('document/document-generate', {
                    title: `Générer - ${doc.name}`,
                    template: doc,
                    entities,
                    smartDocTemplate,
                    account_number: req.account_number,
                    layout: 'layout-app'
                });
            }
        }

        // ── Fallback: context-free generation (no SmartDocTemplate) ──
        // Get linked entities with relations populated
        const entityIds = [...(doc.entityIds || [])];
        if (doc.entityId && !entityIds.map(String).includes(doc.entityId.toString())) {
            entityIds.push(doc.entityId);
        }

        let entities = [];
        if (entityIds.length > 0) {
            entities = await Entity.find({ _id: { $in: entityIds } })
                .populate({
                    path: 'relations.targetEntity',
                    select: 'name icon slug color'
                })
                .lean();
        }

        const Account = require('../models/account.model');
        const account = await Account.findOne({ account_number: req.account_number }).lean();
        const company = account?.company || {};

        // Build system-only context (no record needed)
        const systemContext = {
            today: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
            currentYear: new Date().getFullYear().toString(),
            currentMonth: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            currentTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            user: {
                name: req.user ? (req.user.name || req.user.fullName || req.user.email || '') : '',
                email: req.user ? (req.user.email || '') : ''
            },
            company: {
                name: company.name || '',
                number: company.number || '',
                address: company.address || '',
                vat: company.vat || '',
                phone: company.phone || '',
                email: company.email || '',
                representative: company.representative || ''
            }
        };

        // Analyze tokens in the template to find which ones need bindings
        const allContent = JSON.stringify(doc.pages || []);
        const tokenRegex = /\{\{([^}]+)\}\}/g;
        const allTokens = new Set();
        let match;
        while ((match = tokenRegex.exec(allContent)) !== null) {
            allTokens.add(match[1]);
        }

        // Classify tokens: system vs relational
        const systemTokenKeys = ['today', 'currentYear', 'currentMonth', 'currentTime', 'user.name', 'user.email'];
        const unresolvedBindings = [];
        const bindingEntities = new Map(); // entitySlug -> entityInfo

        for (const token of allTokens) {
            const isSystem = systemTokenKeys.some(sk => token === sk || token.startsWith('user.')) || token.startsWith('company.') || token.startsWith('company_');
            if (!isSystem) {
                // Parse token patterns:
                //   "patients.patients.nom"  → self-referencing (entity.entity.field)
                //   "consultations.patients.nom" → relational (primary.related.field)
                //   "patients.nom" → direct entity field (entity.field)
                const parts = token.split('.');
                if (parts.length >= 2) {
                    const primarySlug = parts[0];
                    const primaryEntity = entities.find(e => e.slug === primarySlug);

                    if (primaryEntity) {
                        const relatedSlug = parts.length >= 3 ? parts[1] : null;

                        // Case 1: Self-referencing (patients.patients.field) or direct (patients.field)
                        if (!relatedSlug || relatedSlug === primarySlug) {
                            const key = primaryEntity.slug;
                            if (!bindingEntities.has(key)) {
                                bindingEntities.set(key, {
                                    entityId: primaryEntity._id?.toString(),
                                    entityName: primaryEntity.name || primarySlug,
                                    entityIcon: primaryEntity.icon || 'solar:user-bold-duotone',
                                    entitySlug: primaryEntity.slug,
                                    entityColor: primaryEntity.color || '#4f46e5',
                                    relationKey: null,
                                    relationLabel: null,
                                    primaryEntityId: primaryEntity._id?.toString(),
                                    primaryEntitySlug: primaryEntity.slug,
                                    primaryEntityName: primaryEntity.name,
                                    tokens: []
                                });
                            }
                            bindingEntities.get(key).tokens.push(token);
                        }
                        // Case 2: Relational token (consultations.patients.nom)
                        else {
                            const relation = (primaryEntity.relations || []).find(r => {
                                const target = r.targetEntity;
                                return target && (target.slug === relatedSlug || target.name?.toLowerCase() === relatedSlug);
                            });
                            if (relation && relation.targetEntity) {
                                const target = relation.targetEntity;
                                const key = target.slug || target._id?.toString();
                                if (!bindingEntities.has(key)) {
                                    bindingEntities.set(key, {
                                        entityId: target._id?.toString() || target.toString(),
                                        entityName: target.name || relatedSlug,
                                        entityIcon: target.icon || 'solar:user-bold-duotone',
                                        entitySlug: target.slug || relatedSlug,
                                        entityColor: target.color || '#4f46e5',
                                        relationKey: relation.key,
                                        relationLabel: relation.label,
                                        primaryEntityId: primaryEntity._id?.toString(),
                                        primaryEntitySlug: primaryEntity.slug,
                                        primaryEntityName: primaryEntity.name,
                                        tokens: []
                                    });
                                }
                                bindingEntities.get(key).tokens.push(token);
                            }
                        }
                    }
                }
            }
        }

        // Resolve system tokens in content
        const resolveSystemTokens = (str) => {
            if (!str) return str;
            return str.replace(/\{\{([^}]+)\}\}/g, (fullMatch, key) => {
                const trimmed = key.trim();
                // System tokens
                if (trimmed === 'today') return systemContext.today;
                if (trimmed === 'currentYear') return systemContext.currentYear;
                if (trimmed === 'currentMonth') return systemContext.currentMonth;
                if (trimmed === 'currentTime') return systemContext.currentTime;
                if (trimmed === 'user.name') return systemContext.user.name;
                if (trimmed === 'user.email') return systemContext.user.email;

                // Company tokens
                if (trimmed === 'company_name' || trimmed === 'company.name') return systemContext.company.name;
                if (trimmed === 'company_number' || trimmed === 'company.number') return systemContext.company.number;
                if (trimmed === 'company_address' || trimmed === 'company.address') return systemContext.company.address;
                if (trimmed === 'company_vat' || trimmed === 'company.vat') return systemContext.company.vat;
                if (trimmed === 'company_phone' || trimmed === 'company.phone') return systemContext.company.phone;
                if (trimmed === 'company_email' || trimmed === 'company.email') return systemContext.company.email;
                if (trimmed === 'company_representative' || trimmed === 'company.representative' || trimmed === 'company.representant') return systemContext.company.representative;

                // Relational token → convert to interactive placeholder
                const parts = trimmed.split('.');
                const fieldName = parts[parts.length - 1];
                // Find which entity this token belongs to
                let entityLabel = '';
                for (const [slug, info] of bindingEntities) {
                    if (info.tokens.includes(trimmed)) {
                        entityLabel = info.entityName;
                        break;
                    }
                }

                // Return a styled inline placeholder
                return `<span class="binding-placeholder" data-token="${trimmed}" contenteditable="false" style="display:inline-block;background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;padding:2px 10px;border-radius:6px;font-size:0.85em;font-weight:500;border:1px dashed #f59e0b;cursor:pointer;user-select:none;vertical-align:baseline;white-space:nowrap;"><span style="opacity:0.6;font-size:0.9em;">⚡</span> ${fieldName}</span>`;
            });
        };

        // Create draft pages with system tokens resolved
        const draftPages = (doc.pages || []).map(page => {
            const resolved = { ...page };
            if (resolved.content) {
                resolved.content = resolveSystemTokens(resolved.content);
            }
            return resolved;
        });

        // Create the draft document
        const draftDoc = new Document({
            name: `${doc.name} - ${systemContext.today}`,
            pages: draftPages,
            headerHtml: resolveSystemTokens(doc.headerHtml || ''),
            footerHtml: resolveSystemTokens(doc.footerHtml || ''),
            format: doc.format || 'A4',
            orientation: doc.orientation || 'portrait',
            dimensions: doc.dimensions,
            margins: doc.margins,
            isTemplate: false,
            isDraft: true,
            draftSourceTemplateId: doc._id,
            status: 'draft',
            // Store unresolved bindings metadata for the editor
            _contextFreeBindings: Array.from(bindingEntities.values()),
            createdBy: req.user?._id,
            createdAt: new Date()
        });

        await draftDoc.save();

        console.log(`[Documents] Context-free draft created: ${draftDoc._id} from template "${doc.name}" with ${bindingEntities.size} unresolved binding(s)`);

        // Redirect to the editor with context-free flag
        res.redirect(`/account/${req.account_number}/documents/${draftDoc._id}/edit-react?contextFree=1&templateId=${doc._id}&bindings=${encodeURIComponent(JSON.stringify(Array.from(bindingEntities.values())))}`);

    } catch (error) {
        console.error('[Documents] Error generating context-free document:', error);
        res.status(500).send('Erreur lors de la génération');
    }
});

/**
 * GET /api/:documentId/search-records
 * Search records of a given entity for the autocomplete picker.
 */
router.get('/api/:documentId/search-records', async (req, res) => {
    try {
        const Record = await tenantCollection(req, 'Record');
        const Entity = await tenantCollection(req, 'Entity');

        const { entityId, q = '', limit: limitStr = '10' } = req.query;
        const limitNum = Math.min(parseInt(limitStr) || 10, 50);

        if (!entityId) {
            return res.status(400).json({ error: 'entityId required' });
        }

        const entity = await Entity.findById(entityId).select('name icon slug').lean();
        if (!entity) return res.status(404).json({ error: 'Entity not found' });

        let query = { entityId };
        if (q && q.trim()) {
            query = {
                $and: [
                    { entityId },
                    {
                        $or: [
                            { title: { $regex: q, $options: 'i' } },
                            { computedTitle: { $regex: q, $options: 'i' } },
                            { 'customFields.value': { $regex: q, $options: 'i' } }
                        ]
                    }
                ]
            };
        }

        const records = await Record.find(query)
            .select('_id title computedTitle image createdAt')
            .sort({ updatedAt: -1 })
            .limit(limitNum)
            .lean();

        res.json({
            success: true,
            entity: { _id: entity._id, name: entity.name, icon: entity.icon, slug: entity.slug },
            records: records.map(r => ({
                _id: r._id,
                title: r.computedTitle || r.title || 'Sans titre',
                image: r.image,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('[Documents] Error searching records:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/:documentId/resolve-context
 * Find related context records (e.g. consultations) for the selected parent record.
 * Query params:
 *   - entityId: parent entity ID (e.g., patient entity ID)
 *   - recordId: parent record ID (e.g., the selected patient record's ID)
 */
router.get('/api/:documentId/resolve-context', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        const Entity = await tenantCollection(req, 'Entity');
        const Record = await tenantCollection(req, 'Record');
        const mongoose = require('mongoose');

        const { entityId: parentEntityId, recordId: parentRecordId } = req.query;
        if (!parentEntityId || !parentRecordId) {
            return res.status(400).json({ error: 'entityId and recordId are required' });
        }

        // 1. Get the template document
        const doc = await Document.findById(req.params.documentId).lean();
        if (!doc) {
            return res.status(404).json({ error: 'Template non trouvé' });
        }

        // 2. Identify the target entities for this template
        const targetEntityIds = [];
        if (doc.entityIds && doc.entityIds.length > 0) {
            doc.entityIds.forEach(id => targetEntityIds.push(id.toString()));
        }
        if (doc.entityId && !targetEntityIds.includes(doc.entityId.toString())) {
            targetEntityIds.push(doc.entityId.toString());
        }

        // 3. Find primary entity metadata
        let primaryEntity = null;
        if (targetEntityIds.length > 0) {
            const entityDoc = await Entity.findById(targetEntityIds[0]).select('name icon slug').lean();
            if (entityDoc) {
                primaryEntity = {
                    _id: entityDoc._id,
                    name: entityDoc.name,
                    icon: entityDoc.icon,
                    slug: entityDoc.slug
                };
            }
        }

        // 4. Query context records of the target entities that reference the parent record ID
        const parentRecordObjectId = mongoose.Types.ObjectId.isValid(parentRecordId) 
            ? new mongoose.Types.ObjectId(parentRecordId) 
            : null;

        const relationValues = [parentRecordId];
        if (parentRecordObjectId) {
            relationValues.push(parentRecordObjectId);
        }

        let contexts = [];
        if (targetEntityIds.length > 0) {
            const rawContexts = await Record.find({
                entityId: { $in: targetEntityIds },
                'relations.value': { $in: relationValues }
            })
            .select('_id title computedTitle createdAt')
            .sort({ createdAt: -1 })
            .lean();

            contexts = rawContexts.map(c => ({
                _id: c._id,
                title: c.computedTitle || c.title || 'Sans titre',
                createdAt: c.createdAt
            }));
        }

        res.json({
            success: true,
            primaryEntity,
            contexts
        });
    } catch (error) {
        console.error('[Documents] Error in resolve-context:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/:documentId/resolve-bindings
 * Resolve binding placeholders in a context-free document.
 * Called when the user picks a record (e.g. Patient) from the inline picker.
 * Replaces all matching {{...}} placeholder spans with actual data.
 * 
 * Body:
 *   - bindingEntitySlug: slug of the entity being bound (e.g. "patients")
 *   - recordId: the selected record ID 
 *   - primaryEntitySlug: slug of the template's primary entity (e.g. "consultations")
 */
router.post('/api/:documentId/resolve-bindings', async (req, res) => {
    try {
        const Entity = await tenantCollection(req, 'Entity');
        const Record = await tenantCollection(req, 'Record');
        const FieldTemplate = await tenantCollection(req, 'FieldTemplate');
        const mongoose = require('mongoose');

        const { bindingEntitySlug, recordId, primaryEntitySlug } = req.body;
        if (!bindingEntitySlug || !recordId) {
            return res.status(400).json({ error: 'bindingEntitySlug and recordId required' });
        }

        // Load the record 
        const record = await Record.findById(recordId).lean();
        if (!record) return res.status(404).json({ error: 'Record not found' });

        // Load entity WITH populated customFields (FieldTemplate refs)
        const entity = await Entity.findById(record.entityId)
            .populate('customFields')
            .lean();
        if (!entity) return res.status(404).json({ error: 'Entity not found' });

        // If populate didn't resolve (multi-tenant), load FieldTemplates manually
        let fieldDefs = entity.customFields || [];
        const needsManualLoad = fieldDefs.length > 0 && typeof fieldDefs[0] !== 'object';
        if (needsManualLoad) {
            fieldDefs = await FieldTemplate.find({
                _id: { $in: entity.customFields }
            }).lean();
        }

        // Build field values map using the SAME logic as extractCustomFields
        const fieldValues = {};

        // Standard record fields
        fieldValues.titre = record.computedTitle || record.title || '';
        fieldValues.title = fieldValues.titre;
        fieldValues.description = record.description || '';
        fieldValues.date = record.date ? new Date(record.date).toLocaleDateString('fr-FR') : '';

        // Custom fields (match by FieldTemplate name — same pattern as SmartDoc)
        if (record.customFields && Array.isArray(record.customFields)) {
            for (const cf of record.customFields) {
                if (!cf.field_id) continue;
                const fieldId = cf.field_id.toString();
                const fieldDef = fieldDefs.find(fd =>
                    fd._id && fd._id.toString() === fieldId
                );
                const value = cf.value !== undefined && cf.value !== null ? cf.value : '';

                // Format dates
                let formattedValue = value;
                if (fieldDef && fieldDef.type === 'date' && value) {
                    try {
                        formattedValue = new Date(value).toLocaleDateString('fr-FR');
                    } catch (e) {
                        formattedValue = String(value);
                    }
                } else {
                    formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                }

                if (fieldDef) {
                    // Key by name (token pattern: {{entity.relEntity.fieldName}})
                    const fieldName = fieldDef.name || fieldDef.label;
                    if (fieldName) fieldValues[fieldName] = formattedValue;
                    // Also by lowercased label for flexibility
                    if (fieldDef.label) {
                        fieldValues[fieldDef.label.toLowerCase()] = formattedValue;
                    }
                }
            }
        }

        // Build the token prefix to match (e.g. "consultations.patients.")
        const tokenPrefix = primaryEntitySlug
            ? `${primaryEntitySlug}.${bindingEntitySlug}.`
            : `${bindingEntitySlug}.`;

        // Build replacement map: token -> resolved value
        const replacements = {};
        for (const [fieldKey, fieldValue] of Object.entries(fieldValues)) {
            replacements[`${tokenPrefix}${fieldKey}`] = fieldValue;
            // Also add without primary entity prefix
            replacements[`${bindingEntitySlug}.${fieldKey}`] = fieldValue;
        }

        console.log('[Documents] Resolved bindings:', Object.keys(replacements).join(', '));

        // ─── Auto-discover primary entity record ───
        let contextRecord = null;
        if (primaryEntitySlug && primaryEntitySlug === bindingEntitySlug) {
            // Self-referencing case: the selected record IS the context record
            contextRecord = {
                _id: record._id.toString(),
                title: record.computedTitle || record.title || 'Sans titre',
                entityId: entity._id.toString(),
                entitySlug: entity.slug,
                entityName: entity.name
            };
            console.log(`[Documents] Self-referencing binding: ${entity.name} "${contextRecord.title}"`);
        } else if (primaryEntitySlug && primaryEntitySlug !== bindingEntitySlug) {
            try {
                const primaryEntity = await Entity.findOne({ slug: primaryEntitySlug })
                    .populate({ path: 'relations.targetEntity', select: 'name slug' })
                    .lean();

                if (primaryEntity) {
                    // Find the relation key from primary → bound entity
                    const relation = (primaryEntity.relations || []).find(r => {
                        const target = r.targetEntity;
                        return target && (target.slug === bindingEntitySlug || target.slug === entity.slug);
                    });

                    if (relation) {
                        // Find the latest primary entity record where relation points to our record
                        const latestPrimary = await Record.findOne({
                            entityId: primaryEntity._id,
                            'relations': {
                                $elemMatch: {
                                    relationKey: relation.key,
                                    $or: [
                                        { value: new mongoose.Types.ObjectId(recordId) },
                                        { value: recordId },
                                        { value: { $in: [new mongoose.Types.ObjectId(recordId), recordId] } }
                                    ]
                                }
                            }
                        })
                            .sort({ createdAt: -1 })
                            .select('_id title computedTitle createdAt')
                            .lean();

                        if (latestPrimary) {
                            contextRecord = {
                                _id: latestPrimary._id.toString(),
                                title: latestPrimary.computedTitle || latestPrimary.title || 'Sans titre',
                                entityId: primaryEntity._id.toString(),
                                entitySlug: primaryEntity.slug,
                                entityName: primaryEntity.name
                            };
                            console.log(`[Documents] Auto-discovered ${primaryEntity.name}: "${contextRecord.title}" for binding`);
                        }
                    }
                }
            } catch (ctxErr) {
                console.warn('[Documents] Context auto-discovery failed:', ctxErr.message);
            }
        }

        res.json({
            success: true,
            replacements,
            record: {
                _id: record._id,
                title: record.computedTitle || record.title || 'Sans titre'
            },
            contextRecord // latest consultation (or null)
        });

    } catch (error) {
        console.error('[Documents] Error resolving bindings:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

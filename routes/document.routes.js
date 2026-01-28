const express = require('express');
const router = express.Router();
const { tenantCollection } = require('../middleware/tenant');

// GET - Liste des documents
router.get('/', async (req, res) => {
    try {
        const Document = await tenantCollection(req, 'Document');
        if (!Document) {
            return res.status(500).send('Erreur de connexion base de données');
        }

        const documents = await Document.find({
            isTemplate: false,
            createdBy: req.user._id
        })
            .sort({ updatedAt: -1 })
            .lean();

        res.render('document/document-list', {
            title: 'Documents',
            documents,
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
        if (!Document) {
            return res.status(500).send('Erreur de connexion base de données');
        }

        const templates = await Document.find({ isTemplate: true })
            .sort({ updatedAt: -1 })
            .lean();

        res.render('document/template-list', {
            title: 'Templates',
            templates,
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

    if (templateId) {
        try {
            const Document = await tenantCollection(req, 'Document');
            if (Document) {
                const template = await Document.findById(templateId);
                if (template && template.isTemplate && template.duplicate) {
                    documentData = template.duplicate(req.user._id);
                }
            }
        } catch (error) {
            console.error('[Documents] Error loading template:', error);
        }
    }

    res.render('document/document-editor', {
        title: 'Nouveau Document',
        document: documentData,
        isNew: true,
        account_number: req.account_number,
        layout: 'layout-app'
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
            account_number: req.account_number,
            layout: 'layout-app'
        });
    } catch (error) {
        console.error('[Documents] Error loading document:', error);
        res.status(500).send('Erreur lors du chargement du document');
    }
});

// API Routes

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

        res.json({ success: true, document });
    } catch (error) {
        console.error('[Documents] Error updating document:', error);
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

module.exports = router;

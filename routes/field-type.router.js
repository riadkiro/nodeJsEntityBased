const express = require('express');
const router = express.Router();
const fieldTypeController = require('../controllers/field-type.controller');

// ==================== VUES ====================

// Liste des types de champs
router.get('/list', fieldTypeController.list);

// Formulaire d'ajout
router.get('/add', fieldTypeController.add);

// Formulaire de modification
router.get('/edit/:id', fieldTypeController.edit);

// ==================== ACTIONS ====================

// Créer un type
router.post('/create', fieldTypeController.create);

// Mettre à jour un type
router.post('/update/:id', fieldTypeController.update);

// Supprimer un type
router.get('/delete/:id', fieldTypeController.delete);

// ==================== API ====================

// API: Liste des types
router.get('/api/list', fieldTypeController.list_Api);

// API: Détails d'un type
router.get('/api/:id', fieldTypeController.getById_Api);

// API: Créer un type
router.post('/api/create', fieldTypeController.create_Api);

// API: Mettre à jour un type
router.post('/api/update/:id', fieldTypeController.update_Api);

// API: Supprimer un type
router.delete('/api/:id', fieldTypeController.delete_Api);

module.exports = router;

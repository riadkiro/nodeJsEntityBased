const express = require('express');
const router = express.Router();
//Load Product model

const accountController = require('../controllers/Account')

//Do not delete the comments
//Auto generated routers 
//Auto generated routers end

//Generated from template
//list
router.get('/list', accountController.list_Api);
//On post create new product
router.post('/add', accountController.save_Api);
//Single page
router.get('/:id', accountController.singlePage_Api)
//Delete
router.delete('/:id', accountController.delete_Api);

//Generated from template

module.exports = router;

const express = require('express');
const router = express.Router();
//Load Product model

const userController = require('../controllers/User')

//Do not delete the comments
//Auto generated routers 
//Auto generated routers end

//Generated from template
//list
router.get('/list', userController.list_Api);
//On post create new product
router.post('/add', userController.save_Api);
//Single page
router.get('/:id', userController.singlePage_Api)
//Delete
router.delete('/:id', userController.delete_Api);

//Generated from template

module.exports = router;

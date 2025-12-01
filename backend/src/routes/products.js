const express = require('express');
const router = express.Router();
const controller = require('../controllers/productsController');

router.get('/', controller.getProducts);
router.get('/:id', controller.getProduct);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);
router.patch('/:id/stock', controller.decreaseStock);

module.exports = router;

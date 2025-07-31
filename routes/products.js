const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct
} = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');

// We need a middleware to check if the user is an admin
// For now, we'll just use the 'auth' middleware to ensure the user is logged in
// In a real app, you'd create an 'adminAuth' middleware.

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Private/Admin route
router.post('/', auth, createProduct); // Protect this route

module.exports = router;
const express = require('express');
const router = express.Router();
const { generateDescription } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/ai/generate-description
// @desc    Generates a product description
// @access  Private/Admin (ensures only logged-in users can use it)
router.post('/generate-description', auth, generateDescription);

module.exports = router;
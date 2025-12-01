const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/upload')
const { createPortfolio, updatePortfolio, deletePortfolio, getPortfolio, getAllPortfolio } =
  require('../controllers/portfolioController');

// Public routes
router.get('/', getAllPortfolio);
router.get('/:id', getPortfolio);

// Admin routes
router.post('/', requireAuth, isAdmin, upload.single("image"), createPortfolio);
router.patch('/:id', requireAuth, isAdmin, upload.single("image"), updatePortfolio);
router.delete('/:id', requireAuth, isAdmin, deletePortfolio);

module.exports = router;

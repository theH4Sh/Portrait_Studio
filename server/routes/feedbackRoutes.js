const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const isAdmin = require('../middleware/isAdmin');
const { addFeedback, getFeedbacks, approveFeedback, getAllFeedbacks, deleteFeedback } =
  require('../controllers/feedbackController');

// Public (only approved feedback)
router.get('/', getFeedbacks);

//feedback (logged in)
router.post('/', requireAuth, addFeedback);
router.delete('/:id', requireAuth, deleteFeedback) //user or admin

// Admin approves feedback
router.patch('/:id/approve', requireAuth, isAdmin, approveFeedback);
router.get('/all', requireAuth, isAdmin, getAllFeedbacks)

module.exports = router;

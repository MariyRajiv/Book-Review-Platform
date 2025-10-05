const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.post('/', authMiddleware, reviewController.createReview);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

export default router;

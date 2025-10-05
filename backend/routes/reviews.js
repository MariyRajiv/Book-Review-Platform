// src/backend/routes/reviews.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', authMiddleware, reviewController.createReview);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

export default router;

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as bookController from '../controllers/bookController.js';

const router = express.Router();

// List books with filters: ?page=&limit=&search=&genre=&sort_by=&sort_order=
router.get('/', bookController.listBooks);

// Get genres for books
router.get('/genres', bookController.getGenres);

// Book CRUD
router.post('/', authMiddleware, bookController.createBook);
router.get('/:id', bookController.getBook);
router.get('/:id/reviews', bookController.getBookReviews);
router.get('/:id/stats', bookController.getBookStats);
router.put('/:id', authMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, bookController.deleteBook);

export default router;

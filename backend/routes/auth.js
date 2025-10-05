import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js'; // make sure you import your controller

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);

export default router;

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);

export default router;

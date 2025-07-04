import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', customerController.register.bind(customerController));
router.post('/login', customerController.login.bind(customerController));

// Protected routes
router.get('/profile', authenticateToken, customerController.getProfile.bind(customerController));

export default router;

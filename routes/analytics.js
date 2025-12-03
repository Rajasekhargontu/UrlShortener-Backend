import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authenticate.js';
const router = express.Router();
router.get('/:code', authenticate, getAnalytics);
export default router;
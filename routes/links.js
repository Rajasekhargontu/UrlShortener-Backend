import express from 'express';
import { body } from 'express-validator';
import { shorten, redirect, getUserLinks,deleteLink } from '../controllers/linkController.js';
import { authenticate } from '../middleware/authenticate.js';
const router = express.Router();
router.post('/shorten', authenticate, [
    body('url', 'Invalid URL').isURL(),
    body('custom', 'Custom code must be alphanumeric and between 4 to 10 characters').optional().isAlphanumeric().isLength({ min: 4, max: 10 }),
    body('expires_in', 'Expiration must be a number of days').optional().isInt({ min: 1 })
], shorten);
router.get('/:code', redirect);
router.get('/', authenticate,getUserLinks);
router.delete('/:code', authenticate,deleteLink);
export default router;
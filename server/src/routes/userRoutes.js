import { Router } from 'express';
import { getWatchHistory, updatePreferences } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/history', protect, getWatchHistory);
router.put('/preferences', protect, updatePreferences);

export default router;


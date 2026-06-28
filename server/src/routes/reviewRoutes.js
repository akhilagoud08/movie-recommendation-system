import { Router } from 'express';
import { listMovieReviews, upsertReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/movie/:movieId', listMovieReviews);
router.post('/', protect, upsertReview);

export default router;


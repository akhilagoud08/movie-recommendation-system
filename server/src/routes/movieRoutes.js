import { Router } from 'express';
import { createMovie, getMovie, listMovies, markWatched } from '../controllers/movieController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listMovies);
router.get('/:id', getMovie);
router.post('/', protect, adminOnly, createMovie);
router.post('/:id/watch', protect, markWatched);

export default router;


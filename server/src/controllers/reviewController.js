import Movie from '../models/Movie.js';
import Review from '../models/Review.js';

async function refreshMovieRating(movieId) {
  const [summary] = await Review.aggregate([
    { $match: { movie: movieId } },
    {
      $group: {
        _id: '$movie',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  await Movie.findByIdAndUpdate(movieId, {
    averageRating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
    ratingCount: summary?.ratingCount || 0
  });
}

export async function listMovieReviews(req, res, next) {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
}

export async function upsertReview(req, res, next) {
  try {
    const { movieId, rating, comment } = req.body;

    if (!movieId || !rating) {
      return res.status(400).json({ message: 'Movie and rating are required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const review = await Review.findOneAndUpdate(
      { movie: movieId, user: req.user._id },
      { rating, comment },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await refreshMovieRating(movie._id);
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
}


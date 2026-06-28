import Movie from '../models/Movie.js';
import Review from '../models/Review.js';

function buildScore(movie, preferredGenres) {
  const genreScore = movie.genres.filter((genre) => preferredGenres.has(genre)).length * 3;
  const ratingScore = movie.averageRating * 1.8;
  const popularityScore = Math.min(movie.popularity / 20, 5);
  return genreScore + ratingScore + popularityScore;
}

export async function getRecommendations(req, res, next) {
  try {
    const user = req.user;
    const userReviews = await Review.find({ user: user._id });
    const ratedMovieIds = new Set(userReviews.map((review) => review.movie.toString()));
    const likedMovieIds = userReviews
      .filter((review) => review.rating >= 4)
      .map((review) => review.movie);

    const likedMovies = await Movie.find({ _id: { $in: likedMovieIds } });
    const preferredGenres = new Set([
      ...(user.preferences?.genres || []),
      ...likedMovies.flatMap((movie) => movie.genres)
    ]);

    const candidateQuery = ratedMovieIds.size
      ? { _id: { $nin: Array.from(ratedMovieIds) } }
      : {};

    const candidates = await Movie.find(candidateQuery).limit(100);

    const recommendations = candidates
      .map((movie) => ({
        movie,
        score: buildScore(movie, preferredGenres),
        reason:
          movie.genres.find((genre) => preferredGenres.has(genre)) ||
          (movie.averageRating >= 4 ? 'Highly rated by viewers' : 'Popular with viewers')
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
}


import Movie from '../models/Movie.js';
import User from '../models/User.js';

export async function listMovies(req, res, next) {
  try {
    const { search, genre, year, minRating, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      const searchPattern = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchPattern },
        { overview: searchPattern },
        { genres: searchPattern }
      ];
    }

    if (genre) {
      query.genres = genre;
    }

    if (year) {
      query.releaseYear = Number(year);
    }

    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [movies, total] = await Promise.all([
      Movie.find(query).sort({ popularity: -1, averageRating: -1 }).skip(skip).limit(Number(limit)),
      Movie.countDocuments(query)
    ]);

    res.json({ movies, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
}

export async function getMovie(req, res, next) {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ movie });
  } catch (error) {
    next(error);
  }
}

export async function createMovie(req, res, next) {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ movie });
  } catch (error) {
    next(error);
  }
}

export async function markWatched(req, res, next) {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await User.updateOne(
      { _id: req.user._id },
      {
        $pull: { watchHistory: { movie: movie._id } }
      }
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          watchHistory: {
            $each: [{ movie: movie._id, watchedAt: new Date() }],
            $position: 0,
            $slice: 100
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json({ watchHistory: user.watchHistory });
  } catch (error) {
    next(error);
  }
}

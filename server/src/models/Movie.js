import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    overview: {
      type: String,
      required: true
    },
    genres: [{ type: String, trim: true, index: true }],
    language: {
      type: String,
      default: 'English'
    },
    releaseYear: {
      type: Number,
      index: true
    },
    posterUrl: String,
    trailerUrl: String,
    tmdbId: {
      type: Number,
      index: true
    },
    popularity: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);

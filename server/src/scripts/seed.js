import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import Movie from '../models/Movie.js';

dotenv.config();

const movies = [
  {
    title: 'Inception',
    overview: 'A skilled thief enters dreams to steal secrets and is offered a chance to erase his past.',
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    language: 'English',
    releaseYear: 2010,
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    popularity: 92,
    averageRating: 4.7,
    ratingCount: 1250
  },
  {
    title: 'Interstellar',
    overview: 'A team of explorers travels through a wormhole in search of a new home for humanity.',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    language: 'English',
    releaseYear: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    popularity: 88,
    averageRating: 4.8,
    ratingCount: 1430
  },
  {
    title: 'The Dark Knight',
    overview: 'Batman faces the Joker, a criminal mastermind who brings chaos to Gotham City.',
    genres: ['Action', 'Crime', 'Drama'],
    language: 'English',
    releaseYear: 2008,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    popularity: 95,
    averageRating: 4.8,
    ratingCount: 1750
  },
  {
    title: 'Spirited Away',
    overview: 'A young girl enters a magical world and must save her parents from a strange curse.',
    genres: ['Animation', 'Fantasy', 'Adventure'],
    language: 'Japanese',
    releaseYear: 2001,
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    popularity: 81,
    averageRating: 4.6,
    ratingCount: 920
  },
  {
    title: 'Parasite',
    overview: 'A poor family becomes entangled with a wealthy household in a tense social thriller.',
    genres: ['Drama', 'Thriller', 'Comedy'],
    language: 'Korean',
    releaseYear: 2019,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    popularity: 84,
    averageRating: 4.5,
    ratingCount: 1080
  },
  {
    title: 'Dune',
    overview: 'A gifted young man travels to a dangerous desert planet that holds the key to the future.',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    releaseYear: 2021,
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    popularity: 90,
    averageRating: 4.3,
    ratingCount: 870
  }
];

await connectDatabase();
await Movie.collection.drop().catch((error) => {
  if (error.codeName !== 'NamespaceNotFound') {
    throw error;
  }
});
await Movie.insertMany(movies);
console.log(`Seeded ${movies.length} movies`);
await mongoose.disconnect();

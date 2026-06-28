import { Film, Filter, Heart, LogIn, Search, Star, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Sci-Fi', 'Thriller'];

function AuthPanel({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', genres: [] });
  const [error, setError] = useState('');

  const toggleGenre = (genre) => {
    setForm((current) => ({
      ...current,
      genres: current.genres.includes(genre)
        ? current.genres.filter((item) => item !== genre)
        : [...current.genres, genre]
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload =
        mode === 'register'
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              preferences: { genres: form.genres }
            }
          : { email: form.email, password: form.password };

      const data = await api(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user);
    } catch (authError) {
      setError(authError.message);
    }
  };

  return (
    <section className="auth-panel">
      <div>
        <p className="eyebrow">MERN movie discovery</p>
        <h1>Find films that match the way you watch.</h1>
        <p>
          Browse movies, rate what you like, and get recommendations shaped by your genres,
          ratings, and watch history.
        </p>
      </div>
      <form onSubmit={submit} className="auth-form">
        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            <LogIn size={16} /> Login
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            <UserPlus size={16} /> Register
          </button>
        </div>

        <div className="form-heading">
          <h2>{mode === 'login' ? 'Login to your account' : 'Create your account'}</h2>
          <p>{mode === 'login' ? 'Use an account you already registered.' : 'Register first, then start rating movies.'}</p>
        </div>

        {mode === 'register' && (
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            minLength="6"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>

        {mode === 'register' && (
          <div>
            <span className="field-title">Favorite genres</span>
            <div className="chips">
              {genres.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  className={form.genres.includes(genre) ? 'selected' : ''}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit">
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
    </section>
  );
}

function MovieCard({ movie, onRate, onWatched, isWatched }) {
  return (
    <article className="movie-card">
      <img src={movie.posterUrl || 'https://placehold.co/500x750?text=Movie'} alt={movie.title} />
      <div className="movie-body">
        <div>
          <h3>{movie.title}</h3>
          <p>{movie.releaseYear} - {movie.genres?.join(', ')}</p>
        </div>
        <p className="overview">{movie.overview}</p>
        <div className="movie-actions">
          <span className="rating"><Star size={16} fill="currentColor" /> {movie.averageRating?.toFixed?.(1) || movie.averageRating}</span>
          <select defaultValue="" onChange={(event) => event.target.value && onRate(movie._id, Number(event.target.value))}>
            <option value="">Rate</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <button
            type="button"
            className={`icon-button ${isWatched ? 'active' : ''}`}
            onClick={() => onWatched(movie._id)}
            title={isWatched ? 'Watched' : 'Mark watched'}
          >
            <Heart size={17} fill={isWatched ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Dashboard({ user, onLogout }) {
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [watchedIds, setWatchedIds] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [filters, setFilters] = useState({ search: '', genre: '', minRating: '' });
  const [message, setMessage] = useState('');
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  async function loadMovies() {
    setIsLoadingMovies(true);
    const data = await api(`/movies?${queryString}`);
    setMovies(data.movies);
    setIsLoadingMovies(false);
  }

  async function loadRecommendations() {
    try {
      const data = await api('/recommendations');
      setRecommendations(data.recommendations);
    } catch {
      setRecommendations([]);
    }
  }

  async function loadWatchHistory() {
    const data = await api('/users/history');
    setWatchHistory(data.watchHistory);
    setWatchedIds(data.watchHistory.map((item) => item.movie?._id || item.movie));
  }

  useEffect(() => {
    loadMovies().catch((error) => {
      setIsLoadingMovies(false);
      setMessage(error.message);
    });
  }, [queryString]);

  useEffect(() => {
    loadRecommendations();
    loadWatchHistory().catch((error) => setMessage(error.message));
  }, []);

  const rateMovie = async (movieId, rating) => {
    try {
      await api('/reviews', {
        method: 'POST',
        body: JSON.stringify({ movieId, rating, comment: '' })
      });
      setMessage('Rating saved');
      await loadMovies();
      await loadRecommendations();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const markWatched = async (movieId) => {
    try {
      const data = await api(`/movies/${movieId}/watch`, { method: 'POST' });
      setWatchedIds(data.watchHistory.map((item) => item.movie?._id || item.movie));
      await loadWatchHistory();
      setMessage('Added to watch history');
      await loadRecommendations();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <Film size={24} />
          <span>MovieRec</span>
        </div>
        <div className="user-area">
          <span>{user.name}</span>
          <button type="button" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <section className="controls">
        <label className="search-box">
          <Search size={18} />
          <input
            placeholder="Search movie title, genre, or story"
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
        </label>
        <label>
          <Filter size={18} />
          <select value={filters.genre} onChange={(event) => setFilters({ ...filters, genre: event.target.value })}>
            <option value="">All genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </label>
        <label>
          <Star size={18} />
          <select
            value={filters.minRating}
            onChange={(event) => setFilters({ ...filters, minRating: event.target.value })}
          >
            <option value="">Any rating</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
          </select>
        </label>
        <button
          type="button"
          className="clear-button"
          onClick={() => setFilters({ search: '', genre: '', minRating: '' })}
          title="Clear filters"
        >
          <X size={18} />
        </button>
      </section>

      {message && <p className="toast">{message}</p>}

      <section className="section-block">
        <div className="section-heading">
          <h2>Watch history</h2>
          <p>{watchHistory.length} watched movie{watchHistory.length === 1 ? '' : 's'}</p>
        </div>
        {watchHistory.length ? (
          <div className="history-row">
            {watchHistory.map((item) => (
              <div className="history-item" key={`${item.movie?._id || item.movie}-${item.watchedAt}`}>
                <img
                  src={item.movie?.posterUrl || 'https://placehold.co/120x180?text=Movie'}
                  alt={item.movie?.title || 'Watched movie'}
                />
                <div>
                  <h3>{item.movie?.title || 'Movie removed'}</h3>
                  <p>{new Date(item.watchedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">Click a heart on any movie to add it here.</p>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Recommended for you</h2>
          <p>Based on preferred genres, ratings, and watch history.</p>
        </div>
        <div className="recommendation-row">
          {recommendations.length ? (
            recommendations.map(({ movie, reason }) => (
              <div className="recommendation" key={movie._id}>
                <img src={movie.posterUrl || 'https://placehold.co/300x450?text=Movie'} alt={movie.title} />
                <div>
                  <h3>{movie.title}</h3>
                  <p>{reason}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">Rate a few movies to unlock sharper recommendations.</p>
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Browse movies</h2>
          <p>{isLoadingMovies ? 'Loading movies...' : `${movies.length} movie${movies.length === 1 ? '' : 's'} found`}</p>
        </div>
        {movies.length ? (
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onRate={rateMovie}
                onWatched={markWatched}
                isWatched={watchedIds.includes(movie._id)}
              />
            ))}
          </div>
        ) : (
          <p className="empty">No movies found. Clear filters or try a title like Inception, Dune, Drama, or Sci-Fi.</p>
        )}
      </section>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return user ? <Dashboard user={user} onLogout={logout} /> : <AuthPanel onAuth={setUser} />;
}

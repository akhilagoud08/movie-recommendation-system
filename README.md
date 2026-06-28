# Movie Recommendation System

A MERN Stack movie recommendation web app built from the project abstract. It includes user authentication, movie browsing, ratings, reviews, search/filter tools, and personalized recommendations based on user preferences and rating history.

## Tech Stack

- MongoDB + Mongoose
- Express.js + Node.js
- React.js + Vite
- JWT authentication
- Optional TMDB API integration for importing movie data

## Project Structure

```text
movie-recommendation-system/
  client/     React frontend
  server/     Express API and recommendation engine
```

## Quick Start

1. Install backend dependencies:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

2. Install frontend dependencies in a second terminal:

```bash
cd client
npm install
npm run dev
```

3. Open the Vite URL shown in the frontend terminal.

## Environment

Create `server/.env` from `server/.env.example` and set:

- `MONGO_URI`
- `JWT_SECRET`
- `TMDB_API_KEY` if you want TMDB imports
- `CLIENT_URL`

## Main Modules

- User Management: register, login, profile preferences
- Movie Management: CRUD-style movie data, genres, metadata
- Search and Filter: search by title, genre, year, and minimum rating
- Review and Rating: authenticated user ratings and reviews
- Recommendation Engine: combines preferred genres, highly rated movies, popularity, and average rating


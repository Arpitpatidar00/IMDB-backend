import express from 'express';
import {
  getTopRatedMovies,
  getMostCommentedMovies,
  getMostAwardedMovies,
  getTrendingMovies,
  getMoviesByCastAndRating,
  getMoviesGroupedByDecade,
  getAwardsByCountry,
  getMoviesByReleasePeriod,
  getTrendingActors,
  getMovieById
} from '../controllers/MoviController.js';
import MoviSegession from '../controllers/MoviSession.js'

const router = express.Router();

// Route to get top-rated movies
router.get('/top-rated', getTopRatedMovies);

// Route to get most commented movies
router.get('/most-commented', getMostCommentedMovies);

// Route to get movies with the most awards
router.get('/most-awarded', getMostAwardedMovies);

// Route to get trending movies (based on recent comments and ratings)
router.get('/trending', getTrendingMovies);

// Route to get movies by specific cast members and a minimum rating
router.get('/cast', getMoviesByCastAndRating);

// Route to get movies grouped by decade with average IMDb rating
router.get('/decade-averages', getMoviesGroupedByDecade);

// Route to get total number of awards by country
router.get('/awards-by-country', getAwardsByCountry);

// Route to get movies released in a specific time period and count comments
router.get('/released-between', getMoviesByReleasePeriod);

// Route to get trending actors in recent movies
router.get('/trending-actors', getTrendingActors);

router.get('/Search/:id', getMovieById);

router.get('/movies/:id',MoviSegession)

export default router;

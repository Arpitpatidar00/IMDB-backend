import Movie from "../models/Movies.js";

// Get top-rated movies
export const getTopRatedMovies = async (req, res) => {
  try {
    const topRatedMovies = await Movie.aggregate([
      { $match: { "imdb.rating": { $gte: 7 } } },
      { $sort: { "imdb.rating": -1 } },
      { $limit: 100 },
    ]);
    res.json(topRatedMovies);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get most commented movies
export const getMostCommentedMovies = async (req, res) => {
  try {
    const mostCommentedMovies = await Movie.aggregate([
      { $sort: { num_mflix_comments: -1 } },
      { $limit: 120 },
    ]);
    res.json(mostCommentedMovies);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get most awarded movies
export const getMostAwardedMovies = async (req, res) => {
  try {
    const mostAwardedMovies = await Movie.aggregate([
      { $sort: { "awards.wins": -1 } },
      { $limit: 100 },
    ]);
    res.json(mostAwardedMovies);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get trending movies (based on comments and ratings in the last month)
export const getTrendingMovies = async (req, res) => {
  try {
    const trendingMovies = await Movie.aggregate([
      {
        $match: {
          "imdb.rating": { $exists: true },
          num_mflix_comments: { $exists: true },
        },
      },
      { $sort: { "imdb.rating": -1, num_mflix_comments: -1 } },
      { $limit: 10 },
    ]);
    res.json(trendingMovies);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
// Get movies by specific cast members and a minimum rating
export const getMoviesByCastAndRating = async (req, res) => {
  const { actor, rating } = req.query;
  try {
    const movies = await Movie.aggregate([
      { $match: { cast: actor, "imdb.rating": { $gte: parseFloat(rating) } } },
      { $sort: { "imdb.rating": -1 } },
    ]);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get movies grouped by decade with average IMDb rating
export const getMoviesGroupedByDecade = async (req, res) => {
  try {
    const moviesByDecade = await Movie.aggregate([
      {
        $project: {
          decade: {
            $subtract: [
              { $year: "$released" },
              { $mod: [{ $year: "$released" }, 10] },
            ],
          },
          imdbRating: "$imdb.rating",
        },
      },
      {
        $group: {
          _id: "$decade",
          averageRating: { $avg: "$imdbRating" },
          movies: { $push: "$title" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(moviesByDecade);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get total number of awards by country
export const getAwardsByCountry = async (req, res) => {
  try {
    const awardsByCountry = await Movie.aggregate([
      {
        $group: {
          _id: "$countries",
          totalWins: { $sum: "$awards.wins" },
          totalNominations: { $sum: "$awards.nominations" },
          totalAwards: {
            $sum: { $add: ["$awards.wins", "$awards.nominations"] },
          },
        },
      },
      { $unwind: "$_id" },
      { $sort: { totalAwards: -1 } },
    ]);
    res.json(awardsByCountry);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get movies released in a specific time period and count comments
export const getMoviesByReleasePeriod = async (req, res) => {
  const { start, end } = req.query;

  try {
    // Parse and validate dates
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check if dates are valid
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Aggregate the movies
    const moviesInPeriod = await Movie.aggregate([
      {
        $match: {
          released: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $project: {
          title: 1,
          releaseYear: { $year: "$released" },
          numComments: "$num_mflix_comments",
        },
      },
      { $sort: { numComments: -1 } },
    ]);

    res.json(moviesInPeriod);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Server Error" });
  }
};

// Get trending actors in recent movies
export const getTrendingActors = async (req, res) => {
  try {
    // Define the date range for recent movies
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    console.log("Date Range: ", oneYearAgo);

    // Aggregate the movies
     const trendingActors = await Movie.aggregate([
      {
        $match: {
          released: { $gte: oneYearAgo }, // Ensure the release date is within the last year
        },
      },
      { $unwind: "$cast" }, // Unwind the cast array
      {
        $group: {
          _id: "$cast", // Group by actor
          movieCount: { $sum: 1 }, // Count the number of movies each actor appears in
        },
      },
      { $sort: { movieCount: -1 } }, // Sort by movie count in descending order
      { $limit: 10 }, // Limit to top 10 actors
    ]);

    console.log("Trending Actors: ", trendingActors);

    res.json(trendingActors);
  } catch (error) {
    console.error("Error: ", error); // Log the error for debugging
    res.status(500).json({ error: "Server Error" });
  }
};

// Get a movie by its ID
export const getMovieById = async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json(movie);
  } catch (error) {
    console.error("Error fetching movie by ID: ", error);
    res.status(500).json({ error: "Server Error" });
  }
};

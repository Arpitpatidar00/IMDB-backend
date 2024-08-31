// import Movie from '../models/Movies.js';  // Import the Movie model

// // Function to normalize search terms
// const normalizeString = (str) => {
//   return str.trim().toLowerCase().replace(/\s+/g, ' ');
// };

// // Function to generate a regex pattern for fuzzy matching
// const createFuzzyPattern = (term) => {
//   const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//   return new RegExp(escapedTerm.split('').join('.*?'), 'i');
// };

// // Search movies based on title, genres, cast, directors, countries, or year
// export const SearchMoviData = async (req, res) => {
//   try {
//     const { searchTerm } = req.query;  // Get the search term from query params
//     console.log(req.query);
//     if (!searchTerm || searchTerm.trim() === '') {
//       return res.json([]);  // If no search term is provided, return an empty array
//     }

//     const normalizedSearchTerm = normalizeString(searchTerm);
//     const fuzzyPattern = createFuzzyPattern(normalizedSearchTerm);

//     const pipeline = [];

//     // Add match stages for each field to be searched
//     const matchConditions = [];

//     // Title search using $regex
//     matchConditions.push({ title: { $regex: fuzzyPattern } });

//     // Genres search - Exact match within the array
//     matchConditions.push({ genres: { $elemMatch: { $regex: fuzzyPattern } } });

//     // Cast search using $regex on each element of the array
//     matchConditions.push({ cast: { $elemMatch: { $regex: fuzzyPattern } } });

//     // Directors search using $regex
//     matchConditions.push({ directors: { $elemMatch: { $regex: fuzzyPattern } } });

//     // Countries search - Exact match within the array
//     matchConditions.push({ countries: { $elemMatch: { $regex: fuzzyPattern } } });

//     // Year search - only if the search term can be converted to a number
//     const year = parseInt(normalizedSearchTerm, 10);
//     if (!isNaN(year)) {
//       matchConditions.push({ year: year });
//     }

//     // Add $match stage to the pipeline
//     pipeline.push({
//       $match: {
//         $or: matchConditions
//       }
//     });

//     // Limit the results to 10
//     pipeline.push({
//       $limit: 100
//     });

//     // Add a $project stage to include only necessary fields
//     pipeline.push({
//       $project: {
//         _id: 1,
//         title: 1,
//         genres: 1,
//         poster: 1,
//         cast: 1,
//         directors: 1,
//         countries: 1,
//         year: 1,
//         plot: 1,
//         fullplot: 1,
//         released: 1,
//         imdb: 1,
//         tomatoes: 1,
//         viewer: 1
//       }
//     });

//     // Optionally, sort results if needed
//     pipeline.push({
//       $sort: { year: -1 }  // Sort by year, descending
//     });

//     // Execute the aggregation pipeline
//     const searchResults = await Movie.aggregate(pipeline);

//     res.json(searchResults);
//   } catch (error) {
//     console.error('Error searching movies:', error);
//     res.status(500).json({ error: 'Server Error' });
//   }
// };
import Movie from '../models/Movies.js';  // Import the Movie model

// Function to normalize search terms
const normalizeString = (str) => {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
};

// Function to generate a regex pattern for fuzzy matching
const createFuzzyPattern = (term) => {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedTerm.split('').join('.*?'), 'i');
};

// Search movies based on title, genres, cast, directors, countries, or year
export const SearchMoviData = async (req, res) => {
  try {
    const { searchTerm } = req.query;  // Get the search term from query params
    console.log(req.query);
    
    if (!searchTerm || searchTerm.trim() === '') {
      return res.json([]);  // If no search term is provided, return an empty array
    }

    const normalizedSearchTerm = normalizeString(searchTerm);
    const fuzzyPattern = createFuzzyPattern(normalizedSearchTerm);
    const pipeline = [];
    const matchConditions = [];

    // Search only by year if it's a valid number
    const year = parseInt(normalizedSearchTerm, 10);
    if (!isNaN(year)) {
      matchConditions.push({ year: year });
    } else {
      // If not a year, perform text searches

      // Title search using $regex
      matchConditions.push({ title: { $regex: fuzzyPattern } });

      // Genres, Cast, Directors, Countries - Exact match or regex within arrays
      ['genres', 'cast', 'directors', 'countries'].forEach(field => {
        matchConditions.push({ [field]: { $elemMatch: { $regex: fuzzyPattern } } });
      });
    }

    // Use $match with $or condition for all match criteria
    pipeline.push({
      $match: {
        $or: matchConditions
      }
    });

    // Add $project stage early to include only necessary fields and exclude others
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        genres: 1,
        poster: 1,
        cast: 1,
        directors: 1,
        countries: 1,
        year: 1,
        plot: 1,
        fullplot: 1,
        released: 1,
        imdb: 1,
        tomatoes: 1,
        'viewer.fresh': 1  // Specifically project nested fields if needed
      }
    });

    // Limit the results to a reasonable number
    pipeline.push({
      $limit: 1000
    });

    // Optionally, sort results by year in descending order
    pipeline.push({
      $sort: { year: -1 }
    });

    // Execute the aggregation pipeline
    const searchResults = await Movie.aggregate(pipeline);
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

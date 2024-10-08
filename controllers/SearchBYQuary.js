

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
//     const matchConditions = [];

//     // Search only by year if it's a valid number
//     const year = parseInt(normalizedSearchTerm, 10);
//     if (!isNaN(year)) {
//       matchConditions.push({ year: year });
//     } else {
//       // If not a year, perform text searches

//       // Title search using $regex
//       matchConditions.push({ title: { $regex: fuzzyPattern } });

//       // Genres, Cast, Directors, Countries - Exact match or regex within arrays
//       ['genres', 'cast', 'directors', 'countries'].forEach(field => {
//         matchConditions.push({ [field]: { $elemMatch: { $regex: fuzzyPattern } } });
//       });
//     }

//     // Use $match with $or condition for all match criteria
//     pipeline.push({
//       $match: {
//         $or: matchConditions
//       }
//     });

//     // Add $project stage early to include only necessary fields and exclude others
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
//         'viewer.fresh': 1  // Specifically project nested fields if needed
//       }
//     });

//     // Limit the results to a reasonable number
//     pipeline.push({
//       $limit: 1000
//     });

//     // Optionally, sort results by year in descending order
//     pipeline.push({
//       $sort: { year: -1 }
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
  return str.trim().toLowerCase().replace(/\b(the|a|an)\b\s*/g, '').replace(/\s+/g, ' ');
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

    // Add scoring to prioritize results that match more closely
    pipeline.push({
      $addFields: {
        titleScore: {
          $cond: [
            { $regexMatch: { input: "$title", regex: fuzzyPattern } },
            1, 0
          ]
        },
        genresScore: {
          $cond: [
            { $regexMatch: { input: { $arrayElemAt: ["$genres", 0] }, regex: fuzzyPattern } },
            1, 0
          ]
        },
        castScore: {
          $cond: [
            { $regexMatch: { input: { $arrayElemAt: ["$cast", 0] }, regex: fuzzyPattern } },
            1, 0
          ]
        },
        directorsScore: {
          $cond: [
            { $regexMatch: { input: { $arrayElemAt: ["$directors", 0] }, regex: fuzzyPattern } },
            1, 0
          ]
        },
        countriesScore: {
          $cond: [
            { $regexMatch: { input: { $arrayElemAt: ["$countries", 0] }, regex: fuzzyPattern } },
            1, 0
          ]
        },
        totalScore: {
          $add: [
            "$titleScore",
            "$genresScore",
            "$castScore",
            "$directorsScore",
            "$countriesScore"
          ]
        }
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
        'viewer.fresh': 1,  // Specifically project nested fields if needed
        totalScore: 1 // Include totalScore in the results
      }
    });

    // Sort results by totalScore and then by year
    pipeline.push({
      $sort: {
        totalScore: -1, // Highest score first
        year: -1 // Then sort by year in descending order
      }
    });

    // Limit the results to a reasonable number
    pipeline.push({
      $limit: 1000
    });

    // Execute the aggregation pipeline
    const searchResults = await Movie.aggregate(pipeline);
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

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
//     const { title, genres, cast, directors, countries, year } = req.query;
//     const pipeline = [];

//     // Handle title search
//     if (title) {
//       const normalizedTitle = normalizeString(title);
//       pipeline.push({
//         $match: { title: createFuzzyPattern(normalizedTitle) }
//       });
//     }

//     // Handle genres search
//     if (genres) {
//       const normalizedGenres = genres.split(',').map(normalizeString);
//       pipeline.push({
//         $match: {
//           genres: { $in: normalizedGenres.map(createFuzzyPattern) }
//         }
//       });
//     }

//     // Handle cast search
//     if (cast) {
//       const normalizedCast = cast.split(',').map(normalizeString);
//       pipeline.push({
//         $match: {
//           cast: { $in: normalizedCast.map(createFuzzyPattern) }
//         }
//       });
//     }

//     // Handle directors search
//     if (directors) {
//       const normalizedDirectors = directors.split(',').map(normalizeString);
//       pipeline.push({
//         $match: {
//           directors: { $in: normalizedDirectors.map(createFuzzyPattern) }
//         }
//       });
//     }

//     // Handle countries search
//     if (countries) {
//       const normalizedCountries = countries.split(',').map(normalizeString);
//       pipeline.push({
//         $match: {
//           countries: { $in: normalizedCountries.map(createFuzzyPattern) }
//         }
//       });
//     }

//     // Handle year search
//     if (year) {
//       const normalizedYear = parseInt(year, 10);
//       pipeline.push({
//         $match: { year: normalizedYear }
//       });
//     }

//     // If no valid search criteria is provided, return an empty array
//     if (pipeline.length === 0) {
//       return res.json([]);
//     }

//     // Add projection to only include necessary fields
//     pipeline.push({
//       $project: {
//         _id: 1,
//         title: 1,
//         genres: 1,
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
//       $sort: { year: -1 } // Sort by year, descending
//     });

//     // Execute the aggregation pipeline
//     const searchResults = await Movie.aggregate(pipeline);

//     res.json(searchResults);
//   } catch (error) {
//     console.error('Error searching movies:', error);
//     res.status(500).json({ error: 'Server Error' });
//   }
// };

// import express from 'express';
// import Movie from '../models/Movies.js'; // Adjust the import path as needed

// const router = express.Router();

// // Function to normalize search terms
// const normalizeString = (str) => {
//   return str.trim().toLowerCase();
// };

// // Suggestion endpoint
// export const SearchMoviData = async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query || query.length < 3) {
//       return res.json([]); // Only search if query length is 5 or more
//     }

//     const normalizedQuery = normalizeString(query);

//     // Regex pattern to match the beginning of words (exact match)
//     const exactMatchPattern = new RegExp(`^${normalizedQuery}`, 'i');

//     // Fuzzy match pattern (for content that's very similar)
//     const fuzzyPattern = new RegExp(normalizedQuery.split('').join('.*?'), 'i');

//     // Search for exact matches first
//     let results = await Movie.aggregate([
//       {
//         $match: {
//           $or: [
//             { title: { $regex: exactMatchPattern } },                      // Exact match for Title
//             { cast: { $elemMatch: { $regex: exactMatchPattern } } },        // Exact match for Cast
//             { directors: { $elemMatch: { $regex: exactMatchPattern } } },   // Exact match for Directors
//             { genres: { $elemMatch: { $regex: exactMatchPattern } } },      // Exact match for Genres
//           ]
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           suggestions: {
//             $setUnion: [
//               [{ $toLower: '$title' }],
//               { $map: { input: '$genres', as: 'g', in: { $toLower: '$$g' } } },
//               { $map: { input: '$cast', as: 'c', in: { $toLower: '$$c' } } },
//               { $map: { input: '$directors', as: 'd', in: { $toLower: '$$d' } } },
//               { $map: { input: '$countries', as: 'co', in: { $toLower: '$$co' } } }
//             ]
//           }
//         }
//       },
//       { $unwind: '$suggestions' },
//       { $group: { _id: '$suggestions', count: { $sum: 1 } } },
//       { $sort: { count: -1 } },  // Sort by frequency (optional)
//       { $limit: 100}  // Limit to top 10 suggestions
//     ]);

//     // If no exact matches, search for fuzzy matches
//     if (results.length === 0) {
//       results = await Movie.aggregate([
//         {
//           $match: {
//             $or: [
//               { title: { $regex: fuzzyPattern } },                      // Fuzzy match for Title
//               { cast: { $elemMatch: { $regex: fuzzyPattern } } },        // Fuzzy match for Cast
//               { directors: { $elemMatch: { $regex: fuzzyPattern } } },   // Fuzzy match for Directors
//               { genres: { $elemMatch: { $regex: fuzzyPattern } } },      // Fuzzy match for Genres
//             ]
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             suggestions: {
//               $setUnion: [
//                 [{ $toLower: '$title' }],
//                 { $map: { input: '$genres', as: 'g', in: { $toLower: '$$g' } } },
//                 { $map: { input: '$cast', as: 'c', in: { $toLower: '$$c' } } },
//                 { $map: { input: '$directors', as: 'd', in: { $toLower: '$$d' } } },
//                 { $map: { input: '$countries', as: 'co', in: { $toLower: '$$co' } } }
//               ]
//             }
//           }
//         },
//         { $unwind: '$suggestions' },
//         { $group: { _id: '$suggestions', count: { $sum: 1 } } },
//         { $sort: { count: -1 } },  // Sort by frequency (optional)
//         { $limit: 10 }  // Limit to top 10 suggestions
//       ]);
//     }

//     // Filter out results that are not very similar to the query (optional)
//     const filteredResults = results.filter(result => result._id.startsWith(normalizedQuery));

//     const suggestions = filteredResults.map(result => result._id);
//     res.json(suggestions);
//   } catch (error) {
//     console.error('Error fetching suggestions:', error);
//     res.status(500).json({ error: 'Server Error' });
//   }
// };

// export default router;


import express from 'express';
import Movie from '../models/Movies.js'; // Adjust the import path as needed

const router = express.Router();

// Function to normalize and clean search terms
const normalizeString = (str) => {
  return str.trim().replace(/\s+/g, ' ').toLowerCase(); // Trim spaces and reduce multiple spaces
};

// Suggestion endpoint
export const SearchMoviData = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 3) {
      return res.json([]); // Only search if query length is 3 or more
    }

    const normalizedQuery = normalizeString(query);

    // Regex pattern to match the beginning of words (exact match)
    const exactMatchPattern = new RegExp(`^${normalizedQuery}`, 'i');

    // Fuzzy match pattern (for content that's very similar)
    const fuzzyPattern = new RegExp(normalizedQuery.split('').join('.*?'), 'i');

    // Search for exact matches first
    let results = await Movie.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: exactMatchPattern } },                      // Exact match for Title
            { cast: { $elemMatch: { $regex: exactMatchPattern } } },        // Exact match for Cast
            { directors: { $elemMatch: { $regex: exactMatchPattern } } },   // Exact match for Directors
            { genres: { $elemMatch: { $regex: exactMatchPattern } } },      // Exact match for Genres
          ]
        }
      },
      {
        $project: {
          _id: 0,
          suggestions: {
            $setUnion: [
              [{ $toLower: '$title' }],
              { $map: { input: '$genres', as: 'g', in: { $toLower: '$$g' } } },
              { $map: { input: '$cast', as: 'c', in: { $toLower: '$$c' } } },
              { $map: { input: '$directors', as: 'd', in: { $toLower: '$$d' } } },
              { $map: { input: '$countries', as: 'co', in: { $toLower: '$$co' } } }
            ]
          }
        }
      },
      { $unwind: '$suggestions' },
      { $group: { _id: '$suggestions', count: { $sum: 1 } } },
      { $sort: { count: -1 } },  // Sort by frequency (optional)
      { $limit: 100 }  // Limit to top 100 suggestions
    ]);

    // If no exact matches, search for fuzzy matches
    if (results.length === 0) {
      results = await Movie.aggregate([
        {
          $match: {
            $or: [
              { title: { $regex: fuzzyPattern } },                      // Fuzzy match for Title
              { cast: { $elemMatch: { $regex: fuzzyPattern } } },        // Fuzzy match for Cast
              { directors: { $elemMatch: { $regex: fuzzyPattern } } },   // Fuzzy match for Directors
              { genres: { $elemMatch: { $regex: fuzzyPattern } } },      // Fuzzy match for Genres
            ]
          }
        },
        {
          $project: {
            _id: 0,
            suggestions: {
              $setUnion: [
                [{ $toLower: '$title' }],
                { $map: { input: '$genres', as: 'g', in: { $toLower: '$$g' } } },
                { $map: { input: '$cast', as: 'c', in: { $toLower: '$$c' } } },
                { $map: { input: '$directors', as: 'd', in: { $toLower: '$$d' } } },
                { $map: { input: '$countries', as: 'co', in: { $toLower: '$$co' } } }
              ]
            }
          }
        },
        { $unwind: '$suggestions' },
        { $group: { _id: '$suggestions', count: { $sum: 1 } } },
        { $sort: { count: -1 } },  // Sort by frequency (optional)
        { $limit: 20 }  // Limit to top 10 suggestions
      ]);
    }

    // Filter out results that are not very similar to the query (optional)
    const filteredResults = results.filter(result => normalizeString(result._id).startsWith(normalizedQuery));

    const suggestions = filteredResults.map(result => result._id);
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    next(error);
  }
};

export default router;


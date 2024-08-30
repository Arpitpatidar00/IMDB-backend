

import Movie from "../models/Movies.js";
import mongoose from "mongoose";
import AppError from '../ErrorManager/ErrorResponse.js';

const MoviSegession = async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const { cast = [], genres = [], directors = [] } = movie; // Default to empty arrays if fields are missing

    const similarMovies = await Movie.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(movieId) },
          $or: [
            { genres: { $in: genres } },
            { cast: { $in: cast } },
            { directors: { $in: directors } }
          ]
        }
      },
      {
        $addFields: {
          genreMatches: {
            $size: { $ifNull: [{ $setIntersection: ["$genres", genres] }, []] }
          },
          castMatches: {
            $size: { $ifNull: [{ $setIntersection: ["$cast", cast] }, []] }
          },
          directorMatches: {
            $size: { $ifNull: [{ $setIntersection: ["$directors", directors] }, []] }
          },
          totalMatchCount: {
            $add: [
              { $size: { $ifNull: [{ $setIntersection: ["$genres", genres] }, []] } },
              { $size: { $ifNull: [{ $setIntersection: ["$cast", cast] }, []] } },
              { $size: { $ifNull: [{ $setIntersection: ["$directors", directors] }, []] } }
            ]
          }
        }
      },
      {
        $sort: { totalMatchCount: -1 } // Sort by the highest total match count
      },
      {
        $limit: 12 // Limit the result to a maximum of 10 movies
      }
    ]);

    res.json(similarMovies);

  } catch (error) {
    next(error);
  }
};

export default MoviSegession;

import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: String,
  plot: String,
  genres: [String],
  runtime: Number,
  cast: [String],
  num_mflix_comments: Number,
  directors: [String],
  rated: String,
  awards: {
    wins: Number,
    nominations: Number,
    text: String,
  },
  year: Number,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number,
  },
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number,
    },
  },
  countries: [String],
  released: Date,
  lastupdated: String,
  type: String,
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;

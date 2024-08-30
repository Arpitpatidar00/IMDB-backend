import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: String,
  plot: String,
  genres: [String],
  runtime: Number,
  cast: [String],
  num_mflix_comments: Number,
  fullplot: String,
  countries: [String],
  released: Date,
  directors: [String],
  rated: String,
  awards: {
    wins: Number,
    nominations: Number,
    text: String
  },
  year: Number,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number
  },
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number,
    },
    lastUpdated: Date
  },
  lastupdated: Date,
  type: String,
});

const SearchMovies = mongoose.model('SearchMovies', movieSchema);

export default SearchMovies;
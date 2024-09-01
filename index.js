
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Import cookie-parser

import movieRoutes from './routes/movieController.js';
import SearchMovies from './routes/SearchRoute.js';
import authRoutes from './routes/Authroutes.js';
import errorHandler from './ErrorManager/errorHandler.js';
import SearchByQuary from './routes/SearchByQuary.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Define allowed origins
// const allowedOrigins = ['https://main--clone-amenses-i-m-d-b.netlify.app']; // Add your allowed origins here
const allowedOrigins = ['http://localhost:3000']; // Add your allowed origins here

// Configure CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow credentials (cookies) to be included in requests
}));

app.use(express.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Adjust the limit as needed
app.use(cookieParser()); // Use cookie-parser middleware

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/movies', SearchMovies);
app.use('/api/search', SearchByQuary);

// Error handling middleware should be added after all routes
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB database connected");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

app.listen(PORT, () => {
  console.log("Server listening on PORT ", PORT);
});

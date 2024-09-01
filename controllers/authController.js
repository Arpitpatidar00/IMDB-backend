// import mongoose from 'mongoose'; // Add this line at the top of your file

// import dotenv from 'dotenv';
// import User from '../models/Auth.js';
// import jwt from 'jsonwebtoken';
// import AppError from '../ErrorManager/ErrorResponse.js';
// import twilio from 'twilio';
// import Session from '../models/Session.js'; // Import the Session model
// import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 function

// // Load environment variables
// dotenv.config();

// // Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
// };

// // Twilio setup
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioClient = twilio(accountSid, authToken);

// // Generate OTP
// const generateOTP = () => {
//   return Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit OTP
// };

// // Signup Controller
// export const signupUser = async (req, res, next) => {
//   const { username, email, password, mobileno, image } = req.body;

//   try {
//     // Check if the user already exists
//     const userExists = await User.findOne({ email });

//     if (userExists) {
//       return next(new AppError('User already exists', 400));
//     }

//     const user = await User.create({
//       username,
//       email,
//       password,
//       mobileno,
//       image,
//     });

//     res.status(201).json({
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       mobileno: user.mobileno,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const loginUser = async (req, res, next) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });

//     if (user && (await user.matchPassword(password))) {
//       const otp = generateOTP();
//       user.otp = otp;
//       await user.save();

//       await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//         .verifications
//         .create({
//           to: `+${user.mobileno}`,
//           channel: 'sms'
//         });

//       // Inform the client that OTP has been sent
//       res.json({
//         message: 'OTP sent to your registered mobile number.'
//       });
//     } else {
//       return next(new AppError('Invalid email or password', 401));
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// // Resend OTP Controller
// export const resendOTP = async (req, res, next) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (user) {
//       const otp = generateOTP(); // Generate new OTP
//       user.otp = otp; // Update OTP in user model
//       await user.save();

//       // Resend OTP using Twilio Verification API
//       await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//         .verifications
//         .create({
//           to: `+${user.mobileno}`, // Ensure phone number is in E.164 format
//           channel: 'sms'
//         });

//       res.json({ message: 'OTP resent to your registered mobile number.' });
//     } else {
//       return next(new AppError('User not found', 404));
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// export const verifyOTP = async (req, res, next) => {
//   const { email, otp } = req.body;
//   console.log('Received OTP verification request:', { email, otp });

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return next(new AppError('User not found', 404));
//     }

//     // Verify OTP with Twilio
//     console.log('Verifying OTP with Twilio:', { to: `+${user.mobileno}`, code: otp });
//     const verificationCheck = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verificationChecks
//       .create({
//         to: `+${user.mobileno}`,
//         code: otp
//       });

//     if (verificationCheck.status === 'approved') {
//       // OTP verified successfully

//       // Create a session only after OTP is verified
//       const session = new Session({
//         userId: user._id,
//         createdAt: new Date(),
//         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Optional: Set custom expiry
//       });

//       await session.save();

//       // Send session ID and token to the client
//       res.cookie('sessionId', session._id, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
//         sameSite: 'Strict' // Add this if needed
//       });

//       res.json({
//         message: 'OTP verified successfully',
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         mobileno: user.mobileno,
//         image: user.image,
//         token: generateToken(user._id),
//         sessionId: session._id // Sending the session ID
//       });
//       res.json({ message: 'userdata is login Success' });
//     } else {
//       return next(new AppError('Invalid OTP', 401));
//     }
//   } catch (error) {
//     if (error.code === 60202) {
//       // Handle max check attempts error
//       return next(new AppError('Maximum OTP verification attempts reached. Please request a new OTP.', 429));
//     }
//     console.error('Error during OTP verification:', error);
//     next(error);
//   }
// };

// export const loginWithSession = async (req, res, next) => {
//   const { sessionId } = req.query; // Retrieve the sessionId from cookies

//   try {
//     // Ensure a session ID is provided
//     if (!sessionId) {
//       return next(new AppError('No session ID provided. Please log in again.', 400));
//     }

//     // Convert sessionId to ObjectId
//     const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

//     // Locate the session in the database using the sessionId
//     const session = await Session.findById(sessionObjectId); // Use ObjectId for querying with _id

//     // If no session is found, return an error
//     if (!session) {
//       return next(new AppError('Invalid session ID. Please log in again.', 401));
//     }

//     // Check if the session has expired
//     if (session.expiresAt < new Date()) {
//       await Session.deleteOne({ _id: sessionObjectId }); // Remove the expired session
//       return next(new AppError('Session expired. Please log in again.', 401));
//     }

//     // Find the user associated with the session
//     const user = await User.findById(session.userId);
//     if (!user) {
//       return next(new AppError('User not found. Please log in again.', 404));
//     }

//     // Respond with user details and a new JWT token if everything is valid
//     res.json({
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       mobileno: user.mobileno,
//       image: user.image,
//       token: generateToken(user._id), // Generate a new JWT token for the session
//       sessionId: session._id, // Sending the session ID
//     });

//   } catch (error) {
//     // Pass any errors to the error handling middleware
//     next(error);
//   }
// };
// export const Logout = async (req, res) => {
//   try {
//     const { sessionId } = req.body; // Get session ID from request body

//     if (!sessionId) {
//       return res.status(400).json({ message: 'No session ID provided' });
//     }

//     // Convert sessionId to ObjectId
//     const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

//     // Find and delete the session from the database
//     const result = await Session.findByIdAndDelete(sessionObjectId);

//     if (!result) {
//       return res.status(404).json({ message: 'Session not found' });
//     }

//     // Clear cookies if needed
//     res.clearCookie('sessionId');

//     res.status(200).json({ message: 'Logged out successfully' });
//   } catch (error) {
//     console.error('Logout error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
// controllers/authController.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../models/Auth.js";
import AppError from "../ErrorManager/ErrorResponse.js";
import Session from "../models/Session.js";
import { v4 as uuidv4 } from "uuid";
import TemporaryLogin from "../models/TemporaryLogin.js";

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getStoredOTP = async (email) => {
  try {
    const tempLogin = await TemporaryLogin.findOne({
      email,
      expiresAt: { $gt: new Date() },
    });
    if (!tempLogin) {
      throw new Error("OTP not found or expired");
    }

    return tempLogin.otp;
  } catch (error) {
    console.error("Error fetching stored OTP:", error);
    throw error;
  }
};

export const signupUser = async (req, res, next) => {
  const { username, email, password, mobileno, image } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new AppError("User already exists", 400));
    }

    const user = await User.create({
      username,
      email,
      password,
      mobileno,
      image,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      mobileno: user.mobileno,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      const tempLogin = await TemporaryLogin.create({
        email,
        otp,
        expiresAt: otpExpiry,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
      });

      res.json({
        message: "OTP sent to your registered email address.",
        tempLoginId: tempLogin._id, // Send tempLoginId to client
      });
    } else {
      return next(new AppError("Invalid email or password", 401));
    }
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    const tempLogin = await TemporaryLogin.findOne({ email });

    if (tempLogin) {
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      tempLogin.otp = otp;
      tempLogin.expiresAt = otpExpiry;
      await tempLogin.save();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
      });

      res.json({ message: "OTP resent to your registered email address." });
    } else {
      return next(new AppError("User not found", 404));
    }
  } catch (error) {
    next(error);
  }
};


export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Fetch the stored OTP and check if it has expired
    const tempLogin = await TemporaryLogin.findOne({
      email,
      expiresAt: { $gt: new Date() } // Ensure OTP is not expired
    });

    if (!tempLogin) {
      return next(new AppError('OTP not found or expired', 404));
    }

    // Trim and compare the OTP values
    const storedOTP = tempLogin.otp.trim();
    const userOTP = otp.trim();


    // Compare the stored OTP with the user-provided OTP
    if (storedOTP === userOTP) {
      // OTP verified successfully
      const session = new Session({
        userId: user._id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Optional: Set custom expiry
      });

      await session.save();

      // Delete the temporary OTP record
      await TemporaryLogin.findByIdAndDelete(tempLogin._id);

      res.cookie('sessionId', session._id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        sameSite: 'Strict' // Add this if needed
      });

      res.json({
        message: 'OTP verified successfully',
        _id: user._id,
        username: user.username,
        email: user.email,
        mobileno: user.mobileno,
        image: user.image,
        token: generateToken(user._id),
        sessionId: session._id // Sending the session ID
      });

    } else {
      return next(new AppError('Invalid OTP', 401));
    }
  } catch (error) {
    if (error.code === 60202) {
      return next(new AppError('Maximum OTP verification attempts reached. Please request a new OTP.', 429));
    }
    console.error('Error during OTP verification:', error);
    next(error);
  }
};


export const loginWithSession = async (req, res, next) => {
  const { sessionId } = req.query;

  try {
    if (!sessionId) {
      return next(
        new AppError("No session ID provided. Please log in again.", 400)
      );
    }

    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

    const session = await Session.findById(sessionObjectId);

    if (!session) {
      return next(
        new AppError("Invalid session ID. Please log in again.", 401)
      );
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: sessionObjectId });
      return next(new AppError("Session expired. Please log in again.", 401));
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return next(new AppError("User not found. Please log in again.", 404));
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      mobileno: user.mobileno,
      image: user.image,
      token: generateToken(user._id),
      sessionId: session._id,
    });
  } catch (error) {
    next(error);
  }
};

export const Logout = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "No session ID provided" });
    }

    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

    const result = await Session.findByIdAndDelete(sessionObjectId);

    if (!result) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.clearCookie("sessionId");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

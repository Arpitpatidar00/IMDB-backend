import express from 'express';
import {
  signupUser,
  loginUser,
  verifyOTP,
  resendOTP,
  loginWithSession,
  Logout
} from '../controllers/authController.js';
import { checkSession } from '../middleware/SessionMiddelware.js'; // Verify the path and name

const router = express.Router();

// Route for user signup
router.post('/signup', signupUser);

// Route for user login and sending OTP
router.post('/login', loginUser);

// Route for verifying OTP
router.post('/verify-otp', verifyOTP);

// Route for resending OTP
router.post('/resend-otp', resendOTP);

router.post('/logout', Logout);

router.use('/protected-route', checkSession, (req, res) => {
  res.send('This is a protected route');
});

export default router;

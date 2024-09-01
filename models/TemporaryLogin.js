import mongoose from 'mongoose';

const temporaryLoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TemporaryLogin = mongoose.model('TemporaryLogin', temporaryLoginSchema);

export default TemporaryLogin;

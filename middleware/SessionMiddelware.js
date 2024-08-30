import mongoose from "mongoose";
import Session from "../models/Session.js"; // Ensure you import the Session model

export const checkSession = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      console.log("No session ID provided in cookies");
      return res
        .status(401)
        .json({ message: "Unauthorized: No session ID provided." });
    }

    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);
    const session = await Session.findById(sessionObjectId);

    if (!session) {
      console.log("Invalid session ID");
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid session ID." });
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: sessionObjectId });
      console.log("Session expired");
      return res
        .status(401)
        .json({ message: "Unauthorized: Session expired." });
    }

    req.session = session;
    next();
  } catch (error) {
    console.error("Error checking session:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

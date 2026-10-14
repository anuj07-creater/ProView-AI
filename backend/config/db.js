const mongoose = require("mongoose");

let isConnected = false;
let connectionError = null;

const connectDB = async () => {
  // Check MONGO_URI first, then fall back to MONGODB_URI
  const uri = (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!uri) {
    if (isProduction) {
      console.error(
        "[Database] MONGO_URI / MONGODB_URI not provided. Persistent database unavailable in production."
      );
    } else {
      console.log(
        "[Database] No MongoDB URI specified. Operating in local in-memory store mode."
      );
    }
    isConnected = false;
    connectionError = "No connection string configured";
    return false;
  }

  try {
    mongoose.set("bufferCommands", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("[Database] Connected successfully to MongoDB Atlas cluster.");
    isConnected = true;
    connectionError = null;
    return true;
  } catch (err) {
    isConnected = false;
    const rawMessage = (err && err.message) ? err.message : "Unknown error";
    const sanitizedMessage = rawMessage.replace(
      /mongodb(\+srv)?:\/\/[^@]+@/gi,
      "mongodb$1://<credentials-hidden>@"
    );
    connectionError = sanitizedMessage;

    if (isProduction) {
      console.error(
        `[Database Error] MongoDB connection failed: ${sanitizedMessage}. Refusing silent in-memory fallback in production to protect data integrity.`
      );
    } else {
      console.log(
        `[Database Notice] MongoDB connection attempt failed (${sanitizedMessage}). Operating with local in-memory store for preview.`
      );
    }
    return false;
  }
};

const getIsConnected = () => isConnected;
const getConnectionError = () => connectionError;

connectDB.getIsConnected = getIsConnected;
connectDB.getConnectionError = getConnectionError;
connectDB.connectDB = connectDB;

module.exports = connectDB;
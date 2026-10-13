const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log("ℹ️ No MONGO_URI specified. Operating with in-memory data store.");
    isConnected = false;
    return false;
  }

  try {
    mongoose.set("bufferCommands", false);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log("MongoDB connected successfully");
    isConnected = true;
    return true;
  } catch (err) {
    console.warn("⚠️ MongoDB connection failed. Falling back to in-memory store:", err.message);
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

connectDB.getIsConnected = getIsConnected;
connectDB.connectDB = connectDB;

module.exports = connectDB;
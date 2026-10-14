const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { memoryUser } = require("../config/memoryStore");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

const MongooseUser = mongoose.models.User || mongoose.model("User", UserSchema);

// Hybrid proxy: uses real Mongoose when connected; in production fails safely if DB unavailable
const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (connectDB.getIsConnected && connectDB.getIsConnected()) {
      return target[prop];
    }
    const isProduction = process.env.NODE_ENV === "production";
    const hasConfiguredUri = !!(process.env.MONGO_URI || process.env.MONGODB_URI);

    if (isProduction && hasConfiguredUri) {
      if (["create", "save", "findOneAndUpdate"].includes(prop)) {
        return () =>
          Promise.reject(
            new Error(
              "Database service unavailable: MongoDB connection is not established in production."
            )
          );
      }
    }

    if (prop in memoryUser) {
      return memoryUser[prop];
    }
    return target[prop];
  },
});

module.exports = UserProxy;
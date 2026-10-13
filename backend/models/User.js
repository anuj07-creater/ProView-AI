const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { memoryUser } = require("../config/memoryStore");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

const MongooseUser = mongoose.models.User || mongoose.model("User", UserSchema);

// Hybrid proxy that delegates to Mongoose when connected or in-memory store otherwise
const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (connectDB.getIsConnected && connectDB.getIsConnected()) {
      return target[prop];
    }
    if (prop in memoryUser) {
      return memoryUser[prop];
    }
    return target[prop];
  },
});

module.exports = UserProxy;
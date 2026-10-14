const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { memorySession } = require("../config/memoryStore");

const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    role: { type: String },
    experience: { type: Number },
    topicsToFocus: [{ type: String }],
    description: { type: String },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

const MongooseSession = mongoose.models.Session || mongoose.model("Session", SessionSchema);

const SessionProxy = new Proxy(MongooseSession, {
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

    if (prop in memorySession) {
      return memorySession[prop];
    }
    return target[prop];
  },
});

module.exports = SessionProxy;

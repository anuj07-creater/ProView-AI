const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { memoryQuestion } = require("../config/memoryStore");

const questionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const MongooseQuestion = mongoose.models.Question || mongoose.model("Question", questionSchema);

const QuestionProxy = new Proxy(MongooseQuestion, {
  get(target, prop) {
    if (connectDB.getIsConnected && connectDB.getIsConnected()) {
      return target[prop];
    }
    const isProduction = process.env.NODE_ENV === "production";
    const hasConfiguredUri = !!(process.env.MONGO_URI || process.env.MONGODB_URI);

    if (isProduction && hasConfiguredUri) {
      if (["create", "save", "insertMany"].includes(prop)) {
        return () =>
          Promise.reject(
            new Error(
              "Database service unavailable: MongoDB connection is not established in production."
            )
          );
      }
    }

    if (prop in memoryQuestion) {
      return memoryQuestion[prop];
    }
    return target[prop];
  },
});

module.exports = QuestionProxy;

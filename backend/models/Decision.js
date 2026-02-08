const mongoose = require("mongoose");

const DecisionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: String,
  intent: String,
  constraints: [String],
  alternatives: [String],
  finalChoice: String,
  reasoning: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Decision", DecisionSchema);
const express = require("express");
const Decision = require("../models/Decision");
const generateAdvice = require("../services/aiRecall");
const auth = require("../middleware/auth");

const router = express.Router();

// Save decision (user-specific)
router.post("/", auth, async (req, res) => {
  const decision = new Decision({
    ...req.body,
    userId: req.userId
  });
  await decision.save();
  res.json(decision);
});

// Get user's decisions only
router.get("/", auth, async (req, res) => {
  const decisions = await Decision.find({ userId: req.userId });
  res.json(decisions);
});

// AI Recall
router.post("/ai-recall", auth, async (req, res) => {
  const { question, decisionId } = req.body;
  const decision = await Decision.findOne({ _id: decisionId, userId: req.userId });

  if (!decision) {
    return res.json({ advice: "Decision not found for this user." });
  }

  const advice = generateAdvice(question, decision);
  res.json({ advice });
});

// Update (Edit) decision
router.put("/:id", auth, async (req, res) => {
  const updated = await Decision.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Decision not found" });
  }

  res.json(updated);
});

// Delete decision
router.delete("/:id", auth, async (req, res) => {
  const deleted = await Decision.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });

  if (!deleted) {
    return res.status(404).json({ message: "Decision not found" });
  }

  res.json({ message: "Decision deleted" });
});

module.exports = router;
// Calculate human-friendly relative time
function getRelativeTime(date) {
  const today = new Date();
  const decisionDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  decisionDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (today - decisionDate) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return `${Math.floor(diffDays / 365)} years ago`;
}

// Generate age-aware reflection questions
function getReflectionQuestionsByAge(date) {
  const today = new Date();
  const decisionDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  decisionDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (today - decisionDate) / (1000 * 60 * 60 * 24)
  );

  // Recent decision (0–7 days)
  if (diffDays <= 7) {
    return [
      "Does this decision still feel aligned with your current situation?",
      "Have any small details or assumptions changed since you made this choice?",
      "Would you make the same decision today without hesitation?"
    ];
  }

  // Medium-aged decision (8–90 days)
  if (diffDays <= 90) {
    return [
      "Do the same constraints still apply today?",
      "Has your priority or situation changed since this decision was made?",
      "Would you approach this decision differently now?"
    ];
  }

  // Old decision (90+ days)
  return [
    "What has changed in your life since this decision was made?",
    "Are the original reasons behind this choice still relevant today?",
    "If you were deciding from scratch now, would this still be your choice?"
  ];
}

// Generate age-aware suggestion
function getSuggestionByAge(date) {
  const today = new Date();
  const decisionDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  decisionDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (today - decisionDate) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 7) {
    return "Since this decision was made recently, it likely still fits your current situation. You may just want to confirm that the original reasoning still feels right.";
  }

  if (diffDays <= 90) {
    return "As some time has passed, it could be helpful to reflect on whether your priorities or constraints have shifted since this decision.";
  }

  return "Because this decision was made quite some time ago, you might want to revisit it thoughtfully to see if it still aligns with your present goals and circumstances.";
}

// Main AI recall function
function generateAdvice(question, decision) {
  const relativeTime = getRelativeTime(decision.createdAt);
  const reflectionQuestions = getReflectionQuestionsByAge(decision.createdAt);
  const suggestion = getSuggestionByAge(decision.createdAt);

  return `
Recalled Decision Context:
• Decision: ${decision.title}
• Original intent: ${decision.intent}
• Constraints considered: ${decision.constraints.join(", ")}
• Alternatives explored: ${decision.alternatives.join(", ")}
• Final choice: ${decision.finalChoice}

Reflection:
You made this decision ${relativeTime} based on the above context.
At that time, the choice was made because ${decision.reasoning}.

Reflection Questions:
- ${reflectionQuestions[0]}
- ${reflectionQuestions[1]}
- ${reflectionQuestions[2]}

Suggestion:
${suggestion}

Note:
This information is recalled from your past decision to help you reflect — the final judgment remains yours.
`;
}

module.exports = generateAdvice;
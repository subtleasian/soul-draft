export async function extractIdentityNode({
  journalText,
  userReflection,
  selectedOption,
  userId,
  journalEntryId
}) {
  try {
    const response = await fetch("https://extractidentitynode-d5g54wgdxq-uc.a.run.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        journalText,
        userReflection,
        selectedOption
      })
    });

    const data = await response.json();

    if (
      !data.heuristicScores ||
      typeof data.heuristicScores !== "object" ||
      !data.inferred ||
      typeof data.inferred !== "object"
    ) {
      console.error("❌ Invalid response structure:", data);
      return null;
    }

    const timestamp = new Date();

    return {
      id: crypto.randomUUID(),
      userId,
      heuristicScores: data.heuristicScores,
      inferred: data.inferred,
      followUpPrompt: data.followUpPrompt || "",
      tokenReward: data.tokenReward ?? 0,
      origin: {
        excerpt: data.excerpt || "",
        journalEntryId,
        selectedOption,
        reflection: userReflection
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };
  } catch (error) {
    console.error("❌ Error extracting identity node:", error);
    return null;
  }
}

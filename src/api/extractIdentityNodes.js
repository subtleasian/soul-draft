export async function extractIdentityNodes(journalText, userReflection = "", journalEntryId = "", selectedOption = "", userId = "TEMP_USER_ID") {
  try {
    const response = await fetch("https://extractidentitynodes-d5g54wgdxq-uc.a.run.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ journalText, userReflection, selectedOption })
    });

    const result = await response.json();

    if (!result.identityNodes || !Array.isArray(result.identityNodes)) {
      throw new Error("identityNodes missing or invalid");
    }

    const timestamp = new Date();

    return result.identityNodes.map((node) => ({
      ...node,
      id: crypto.randomUUID(),
      userId,
      status: getStatusByConfidence(node.confidence),
      reviewedByUser: false,
      origin: {
        journalEntryId,
        excerpt: node.origin?.excerpt || "",
        reflection: userReflection,
        selectedOption
      },
      createdAt: timestamp,
      updatedAt: timestamp
    }));
  } catch (err) {
    console.error("extractIdentityNodes failed:", err);
    return []; // fallback
  }

  function getStatusByConfidence(confidence) {
  if (confidence >= 0.75) return "confirmed";
  if (confidence >= 0.4) return "suggested";
  return "dismissed";
}

}

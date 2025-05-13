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

    if (!data.identityNode || typeof data.identityNode !== "object") {
      console.error("❌ Invalid or missing identityNode in response:", data);
      return null;
    }

    const identityNode = data.identityNode;
    const followUpPrompt = data.followUpPrompt || null;

    const timestamp = new Date();

    return {
      ...identityNode,
      id: crypto.randomUUID(),
      userId,
      origin: {
        excerpt: identityNode.origin?.excerpt || "",
        journalEntryId,
        selectedOption,
        reflection: userReflection
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      followUpPrompt // 🧠 include the therapist-style follow-up
    };
  } catch (error) {
    console.error("Error extracting identity node:", error);
    return null;
  }
}

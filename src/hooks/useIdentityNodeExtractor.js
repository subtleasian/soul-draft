import { useState } from "react";
import { extractIdentityNode } from "../api/extractIdentityNode";
import { saveIdentityVectorNode } from "../utils/saveIdentityVectorNode";

export function useIdentityNodeExtractor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractNodes = async ({
    journalText,
    userReflection = "",
    journalEntryId = "",
    selectedOption = "",
    userId
  }) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🌐 Sending request to Cloud Run...");
      const node = await extractIdentityNode({
        journalText,
        userReflection,
        journalEntryId,
        selectedOption,
        userId
      });
      console.log("💰 tokenReward in node:", node.tokenReward);
      if (!node) {
        throw new Error("No identity node returned from API.");
      }

      console.log("✅ API response received:", node);

      await saveIdentityVectorNode(node, journalEntryId, journalText);

      return [node];
    } catch (err) {
      console.error("❌ extractNodes error:", err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { extractNodes, loading, error };
}
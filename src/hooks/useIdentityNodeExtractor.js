import { useState } from "react";
import { extractIdentityNode } from "../api/extractIdentityNode";
import { saveIdentityNode } from "../firebase/saveIdentityNode";


export function useIdentityNodeExtractor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Token reward calculator (put this above extractNodes)
  function calculateTokenReward(node) {
    const e = node.heuristicScores?.emotional?.emotionalIntensity || 0;
    const i = node.heuristicScores?.identity?.selfInsight || 0;
    return Math.round((e + i) * 10); // e.g., 0.6 + 0.8 = 14
  }

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
      const node = await extractIdentityNode({
        journalText,
        userReflection,
        journalEntryId,
        selectedOption,
        userId
      });

      if (!node) {
        throw new Error("No identity node returned from API.");
      }
      
      node.tokenReward = calculateTokenReward(node); // Add reward before saving
      await saveIdentityNode(node);
      return [node]; // still return an array for consistency in UI
    } catch (err) {
      console.error("❌ Error extracting or saving identity node:", err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { extractNodes, loading, error };
}

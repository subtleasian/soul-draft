// src/hooks/useIdentityNodeExtractor.js

import { useState } from "react";

export function useIdentityNodeExtractor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractNodes = async ({
    journalText,
    userReflection = "",
    journalEntryId = "",
    selectedOption = "",
    userId = "TEMP_USER_ID"
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://extractidentitynodev2-d5g54wgdxq-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalText, userReflection, selectedOption })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.heuristicScores) {
        console.warn("❌ No valid data returned from API.");
        return [];
      }

      const timestamp = new Date();
      const node = {
        id: crypto.randomUUID(),
        userId,
        heuristicScores: data.heuristicScores,
        inferred: data.inferred,
        followUpPrompt: data.followUpPrompt || "",
        tokenReward: data.tokenReward ?? { total: 0, byDimension: {} },
        origin: {
          excerpt: data.excerpt || "",
          journalEntryId,
          selectedOption,
          reflection: userReflection
        },
        createdAt: timestamp,
        updatedAt: timestamp
      };

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

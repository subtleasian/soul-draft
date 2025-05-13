import { useState } from "react";
import { extractIdentityNode } from "../api/extractIdentityNode";
import { saveIdentityNode } from "../firebase/saveIdentityNode";

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

      await saveIdentityNode(node);
      return node; // still return an array for consistency in UI
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

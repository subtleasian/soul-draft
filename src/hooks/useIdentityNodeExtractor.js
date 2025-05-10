import { useState } from "react";
import { extractIdentityNodes } from "../api/extractIdentityNodes";
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
      const nodes = await extractIdentityNodes(
        journalText,
        userReflection,
        journalEntryId,
        selectedOption,
        userId
      );

      // Save each node to Firestore
      await Promise.all(nodes.map(saveIdentityNode));

      return nodes; // You may still want to return them for UI purposes
    } catch (err) {
      console.error("Error extracting or saving identity nodes:", err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { extractNodes, loading, error };
}

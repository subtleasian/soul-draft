// hooks/useIdentityNodeExtractor.js
import { useState } from "react";

export function useIdentityNodeExtractor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractNodes = async (journalText) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://extractidentitynodes-d5g54wgdxq-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalText })
      });

      const data = await response.json();

      if (!data.identityNodes) {
        throw new Error("Invalid response format");
      }

      return data.identityNodes;
    } catch (err) {
      console.error("Error extracting identity nodes:", err);
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { extractNodes, loading, error };
}

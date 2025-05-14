import React, { useEffect, useReducer, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useIdentityNodeExtractor } from "../hooks/useIdentityNodeExtractor";
import { updateUserProgress } from "../utils/updateUserProgress";
import InsightSummary from "./InsightSummary";
import { conversationReducer, initialConversationState } from "../utils/conversationReducer";

export default function ConversationFlow({ category, categoryLabel, user, setDynamicTitle, onReset }) {
  // Local reducer for potential future state transitions
  const [state, dispatch] = useReducer(conversationReducer, initialConversationState);

  // Local state for the selected prompt, user input, and insight summary
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [lastNode, setLastNode] = useState(null);

  const { extractNodes, loading } = useIdentityNodeExtractor();

  // Fetch prompt list from Firestore filtered by selected category
  useEffect(() => {
    async function loadPrompts() {
      const q = query(collection(db, "prompts"), where("category", "==", category));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => doc.data());

      if (docs.length > 0) {
        const promptList = docs[0].prompts;
        setPrompts(promptList);

        // Select a random prompt from that category
        const randomPrompt = promptList[Math.floor(Math.random() * promptList.length)];
        setSelectedPrompt(randomPrompt);

        // Optional: dispatch to reducer for conversation state management
        dispatch({ type: "SELECT_PROMPT", promptText: randomPrompt });

          if (setDynamicTitle) {
          setDynamicTitle(`${categoryLabel}`);
        }
      }
    }

    loadPrompts();
  }, [category]);

  // Handle reflection submission
  const handleSubmitReflection = async () => {
    if (!reflectionText || reflectionText.trim().length < 3) return;

    const journalEntryId = `${category}-${Date.now()}`;
    const identityNodes = await extractNodes({
      journalText: selectedPrompt,
      userReflection: reflectionText,
      journalEntryId,
      selectedOption: selectedPrompt,
      userId: user.uid
    });

    // Update user progress for each identity node
    for (const node of identityNodes) {
      await updateUserProgress(user.uid, node);
    }

    // Store the most salient node for feedback (or fallback to first)
    const confirmed = identityNodes.find((n) => n.status === "confirmed") || identityNodes[0];
    setLastNode(confirmed);
    setReflectionText("");
    setDynamicTitle("✅ Insight Saved — Want to reflect again?");
  };

  // Restart same category with new prompt
  const handleRestartCategory = () => {
    setLastNode(null);
    setSelectedPrompt(null);
    setReflectionText("");

    const newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setSelectedPrompt(newPrompt);
    dispatch({ type: "SELECT_PROMPT", promptText: newPrompt });
  };

  // Start completely fresh with no category pre-selected
  const handleStartNewTopic = () => {
    setLastNode(null);
    setSelectedPrompt(null);
    setReflectionText("");
    dispatch({ type: "RESET_FLOW" });
    
    if (onReset) onReset(); // 👈 triggers return to category picker
  };

  // User pauses journaling session
  const handlePause = () => {
    setLastNode(null);
    setSelectedPrompt(null);
    setReflectionText("");
    // Optional: send user back to home or just collapse flow
  };

  return (
    <div className="space-y-6">
      {/* If a reflection has been submitted, show insight summary with next options */}
      {lastNode ? (
        <InsightSummary
          node={lastNode}
          onContinue={handleRestartCategory}
          onNewTopic={handleStartNewTopic}
          onPause={handlePause}
        />
      ) : (
        <>
          {/* Show selected prompt and text area */}
          {selectedPrompt && (
            <>
              <div className="p-4 border rounded-xl bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-blue-900">{selectedPrompt}</h3>
              </div>
                <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handleStartNewTopic}
                  className="text-sm text-gray-600 hover:underline"
                >
                  ← Back to Categories
                </button>

                <button
                  onClick={handleRestartCategory}
                  className="text-sm text-blue-600 hover:underline"
                >
                  🔄 New Prompt
                </button>

              </div>

              <textarea
                className="w-full p-3 border rounded-md"
                rows={5}
                placeholder="Write your reflection here..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
              />

              <button
                onClick={handleSubmitReflection}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                {loading ? "Saving..." : "Save Reflection"}
              </button>
            </>
          )}

          {/* If prompt is not loaded yet */}
          {!selectedPrompt && (
            <p className="text-gray-500 italic">Loading a prompt in {category}...</p>
          )}
        </>
      )}
    </div>
  );
}

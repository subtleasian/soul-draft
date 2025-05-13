// components/ConversationFlow.jsx
import React, { useEffect, useReducer, useState } from "react";
import { conversationReducer, initialConversationState } from "../utils/conversationReducer";
import { fetchPrompts } from "../utils/firestore";
import { useIdentityNodeExtractor } from "../hooks/useIdentityNodeExtractor";
import { updateUserProgress } from "../utils/updateUserProgress";
import { saveIdentityNode } from "../utils/firestore";

// Main component for guided AI journaling conversation flow
export default function ConversationFlow({ user }) {
  // useReducer for managing multi-step flow state
  const [state, dispatch] = useReducer(conversationReducer, initialConversationState);
  const [reflectionText, setReflectionText] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  // Custom hook for calling identity node extraction API
  const { extractNodes, loading, error } = useIdentityNodeExtractor();

  // Load available prompts from Firestore on mount
  useEffect(() => {
    async function load() {
      const loaded = await fetchPrompts();
      setPrompts(loaded);
      setSelectedPrompt(loaded[0] || null);
    }
    load();
  }, []);

  // User selects a category to start
  const handleCategorySelect = (category) => {
    dispatch({ type: "SELECT_CATEGORY", category });
  };

  // User selects a multiple-choice option
  const handleOptionSelect = (option) => {
    dispatch({
      type: "ANSWER_MULTIPLE_CHOICE",
      promptId: selectedPrompt.id,
      option
    });
  };

  // Submit initial freeform reflection → extract node → save → transition
  const handleReflectionSubmit = async () => {
  if (!user?.uid) {
    alert("Please sign in to save your reflection.");
    return;
  }

  if (!reflectionText || reflectionText.trim().length < 3) {
    alert("Please write more before submitting.");
    return;
  }

  try {
    const journalEntryId = `prompt-${Date.now()}`;

    const nodes = await extractNodes({
      journalText: state.currentOption,
      userReflection: reflectionText,
      journalEntryId,
      selectedOption: state.currentOption,
      userId: user.uid,
    });

    if (!Array.isArray(nodes) || nodes.length === 0) {
      console.warn("No identity nodes extracted.");
      return;
    }

    const node = nodes[0]; // Assume first node is most relevant


    dispatch({
      type: "ADD_IDENTITY_NODE",
      node: node,
    });

    setReflectionText("");
  } catch (error) {
    console.error("Error during reflection submit:", error);
    alert("There was a problem saving your insight.");
  }
};


  // Submit follow-up reflection → extract new node → save → wrap up
  const handleFollowUpSubmit = async () => {
    if (!reflectionText.trim()) return;
    const journalEntryId = `followup-${Date.now()}`;

    const nodes = await extractNodes({
      journalText: selectedPrompt.text,
      userReflection: reflectionText,
      journalEntryId,
      selectedOption: state.currentOption,
      userId: user.uid
    });

    for (const node of nodes) {
      await updateUserProgress(user.uid, node);
    }

    setReflectionText("");
    dispatch({ type: "ANSWER_FOLLOW_UP_REFLECTION", reflection: reflectionText });

    if (nodes.length > 0) {
      dispatch({
        type: "APPEND_IDENTITY_NODE",
        identityNode: nodes[0],
        tokenReward: nodes[0]?.tokenReward || 0
      });
    } else {
      dispatch({ type: "PAUSE_CONVERSATION" });
    }
  };

  // Pause the conversation session
  const handlePause = () => {
    dispatch({ type: "PAUSE_CONVERSATION" });
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-blue-800">🧠 Guided Conversation</h2>

      {/* Step 1: Category selection UI */}
      {state.state === "CATEGORY_SELECTION" && (
        <div>
          <p>Select a category to explore:</p>
          {["Career", "Self", "Relationships", "Emotions"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className="px-4 py-2 m-1 bg-gray-200 hover:bg-blue-100 rounded"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Show multiple-choice prompt options */}
      {state.state === "MULTIPLE_CHOICE_PROMPT" && (
        <div>
          <p className="font-medium text-gray-700">{selectedPrompt?.text || "Loading prompt..."}</p>
          {selectedPrompt?.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionSelect(opt)}
              className="px-4 py-2 m-1 bg-gray-100 hover:bg-blue-100 rounded"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Step 3: First reflection input */}
      {state.state === "REFLECTION_PROMPT" && (
        <div>
          <p className="font-medium">Want to reflect on that choice?</p>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full p-2 border rounded mt-2"
            placeholder="Write freely..."
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handlePause} className="text-sm px-4 py-2 bg-gray-300 rounded">
              Pause Conversation
            </button>
            <button onClick={handleReflectionSubmit} className="text-sm px-4 py-2 bg-blue-600 text-white rounded">
              Submit Reflection
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Follow-up reflection */}
      {state.state === "FOLLOW_UP_PROMPT" && (
        <div>
          <p className="font-medium">{state.currentFollowUpPrompt}</p>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full p-2 border rounded mt-2"
            placeholder="Your follow-up reflection..."
          />
          <div className="flex gap-2 mt-2">
          <button onClick={handlePause} className="text-sm px-4 py-2 bg-gray-300 rounded">
            Pause Conversation
          </button>
          <button onClick={handleFollowUpSubmit}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded">
            Submit Follow-Up
          </button>
          </div>
        </div>
      )}
      
      {state.state === "AI_INSIGHT" && (() => {
        const lastNode = state.identityNodes[state.identityNodes.length - 1];
        const inferred = lastNode?.heuristicScores?.inferred || {};

        return (
          <div className="bg-blue-50 p-4 rounded shadow space-y-4">
            <h3 className="text-lg font-bold text-blue-800">✨ Insight Saved</h3>

            <div className="space-y-2 text-gray-700">
              <p>
                You've earned <strong>{lastNode?.tokenReward || 0}</strong> tokens for your reflection.
              </p>

              {inferred.traits?.length > 0 && (
                <p>
                  <span className="font-semibold">🧬 Traits:</span> {inferred.traits.join(", ")}
                </p>
              )}
              {inferred.values?.length > 0 && (
                <p>
                  <span className="font-semibold">🌱 Values:</span> {inferred.values.join(", ")}
                </p>
              )}
              {inferred.emotions?.length > 0 && (
                <p>
                  <span className="font-semibold">💫 Emotions:</span> {inferred.emotions.join(", ")}
                </p>
              )}
            </div>

            <div className="pt-4 border-t text-sm text-gray-600">
              <p>What would you like to do next?</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={handlePause}
                  className="px-4 py-2 bg-gray-300 text-sm rounded"
                >
                  Pause
                </button>
                <button
                  onClick={() => dispatch({ type: "SELECT_CATEGORY", category: state.selectedCategory })}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded"
                >
            Continue in Same Category
          </button>
          <button
            onClick={() => dispatch({ type: "START_CONVERSATION" })}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded"
          >
            Start New Topic
          </button>
        </div>
      </div>
    </div>
  );
})()}

      {/* Step 5: Summary screen after all steps */}
      {state.state === "SUMMARY_REWARD_SCREEN" && (
        <div className="bg-green-50 p-4 rounded shadow">
          <h3 className="text-lg font-bold">🎉 Session Summary</h3>
          <p>Total Tokens Earned: {state.tokensEarned}</p>
          <p>Total Insights: {state.identityNodes.length}</p>
          <ul className="list-disc ml-6 mt-2 text-sm">
            {state.identityNodes.map((node, i) => (
              <li key={i}><strong>{node.label}</strong> ({node.type}, +{node.tokenReward} tokens)</li>
            ))}
          </ul>
        </div>
      )}

      {/* Optional: API loading/error indicators */}
      {loading && <p className="text-sm text-gray-500">⏳ Extracting insight…</p>}
      {error && <p className="text-sm text-red-500">⚠️ Something went wrong.</p>}

      {/* Debug viewer */}
      <section className="mt-6 border-t pt-4 text-sm text-gray-600">
        <h3 className="text-base font-semibold text-blue-900">🧠 Conversation Debug Info</h3>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      </section>
    </div>
  );
}

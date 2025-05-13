// components/ConversationFlow.jsx
import React, { useEffect, useReducer, useState } from "react";
import { conversationReducer, initialConversationState } from "../utils/conversationReducer";
import { fetchPrompts } from "../utils/firestore";



export default function ConversationFlow() {
    const [state, dispatch] = useReducer(conversationReducer, initialConversationState);
    const [reflectionText, setReflectionText] = useState("");
    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    useEffect(() => {
    async function load() {
        const loaded = await fetchPrompts();
        setPrompts(loaded);
        setSelectedPrompt(loaded[0] || null);
    }
    load();
    }, []);

    const handleCategorySelect = (category) => {
    dispatch({ type: "SELECT_CATEGORY", category });
    };

  const handleMultipleChoiceAnswer = () => {
    dispatch({
      type: "ANSWER_MULTIPLE_CHOICE",
      promptId: "examplePromptId",
      option: "Purpose"
    });
  };

  const handleReflectionSubmit = () => {
    if (!reflectionText.trim()) return;
    dispatch({ type: "SUBMIT_REFLECTION", reflection: reflectionText });

    // Simulate identityNode + follow-up from backend
    const fakeNode = {
      label: "Exploring deeper purpose",
      type: "goal",
      category: state.selectedCategory,
      confidence: 0.88,
      tokenReward: 25,
      followUpPrompt: "When did you first notice this desire taking shape?"
    };
    setReflectionText("");
    dispatch({ type: "RECEIVE_AI_INSIGHT", identityNode: fakeNode });
  };

  const handleFollowUpSubmit = () => {
    if (!reflectionText.trim()) return;
    dispatch({ type: "ANSWER_FOLLOW_UP_REFLECTION", reflection: reflectionText });
    setReflectionText("");
  };

  const handlePause = () => {
    dispatch({ type: "PAUSE_CONVERSATION" });
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-blue-800">🧠 Guided Conversation</h2>

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

      {state.state === "MULTIPLE_CHOICE_PROMPT" && (
        <div>
          <p className="font-medium text-gray-700">{selectedPrompt?.text || "Loading prompt..."}</p>
            {selectedPrompt?.options?.map((opt) => (
            <button
                key={opt}
                onClick={() =>
                dispatch({
                    type: "ANSWER_MULTIPLE_CHOICE",
                    promptId: selectedPrompt.id,
                    option: opt
                })
                }
                className="px-4 py-2 m-1 bg-gray-100 hover:bg-blue-100 rounded"
            >
                {opt}
            </button>
            ))}
        </div>
      )}

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

      {state.state === "FOLLOW_UP_PROMPT" && state.identityNodes.length > 0 && (
        <div>
          <p className="font-medium text-blue-800">{state.identityNodes.at(-1).followUpPrompt}</p>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full p-2 border rounded mt-2"
            placeholder="Your thoughts..."
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handlePause} className="text-sm px-4 py-2 bg-gray-300 rounded">
              Pause Conversation
            </button>
            <button onClick={handleFollowUpSubmit} className="text-sm px-4 py-2 bg-green-600 text-white rounded">
              Submit Follow-Up
            </button>
          </div>
        </div>
      )}

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

      {/* Error Handling */}
      
      <section className="mt-6 border-t pt-4 text-sm text-gray-600">
        <h3 className="text-base font-semibold text-blue-900">🧠 Conversation Debug Info</h3>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      </section>

    </div>
  );
}

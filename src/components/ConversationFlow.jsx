// components/ConversationFlow.jsx
import React, { useEffect, useReducer, useState } from "react";
import { fetchPrompts } from "../utils/firestore";
import { useIdentityNodeExtractor } from "../hooks/useIdentityNodeExtractor";
import { saveIdentityVectorNode } from "../utils/saveIdentityVectorNode";
import { rewardUserTokens } from "../utils/updateUserTokens";
import TokenRewardBreakdown from "./TokenRewardBreakdown";
import { conversationReducer, initialConversationState } from "../utils/conversationReducer";

export default function ConversationFlow({ user, category, categoryLabel, setDynamicTitle, onReset }) {
  const [state, dispatch] = useReducer(conversationReducer, initialConversationState);
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [tokenReward, setTokenReward] = useState(null);
  const { extractNodes, loading, error } = useIdentityNodeExtractor();

  useEffect(() => {
    async function load() {
      const loaded = await fetchPrompts();
      setPrompts(loaded);
    }
    load();
  }, []);

  useEffect(() => {
    if (category && prompts.length > 0 && !selectedPrompt) {
      selectRandomPrompt(category);
    }
  }, [category, prompts, selectedPrompt]);

  const selectRandomPrompt = (cat) => {
  const filtered = prompts.filter((p) => p.category === cat);
  const group = filtered[Math.floor(Math.random() * filtered.length)];

  if (!group?.prompts?.length) {
    setSelectedPrompt(null);
    return;
  }

  const randomText = group.prompts[Math.floor(Math.random() * group.prompts.length)];
  console.log("🎯 Final selected prompt text:", randomText);

  setSelectedPrompt({
    ...group,
    text: randomText
  });

  dispatch({ type: "RESET_FLOW" });
  setReflectionText("");
  setTokenReward(null);
};

  const handleSubmitReflection = async () => {
    if (!selectedPrompt || !reflectionText.trim()) return;
    const journalEntryId = `${selectedPrompt.id || selectedPrompt.text.slice(0, 10)}-${Date.now()}`;

    const nodes = await extractNodes({
      journalText: selectedPrompt.text,
      userReflection: reflectionText,
      journalEntryId,
      selectedOption: state.currentOption,
      userId: user.uid
    });

    if (!nodes.length) return;
    for (const node of nodes) {
      await saveIdentityVectorNode(node, journalEntryId, selectedPrompt.text);
      const rewardAmount = node.tokenReward?.total || node.tokenReward || 0;
      const byDimension = node.tokenReward?.byDimension || {};
      setTokenReward({ total: rewardAmount, byDimension });

      await rewardUserTokens({
        userId: user.uid,
        amount: rewardAmount,
        byDimension,
        journalEntryId,
        reason: `Reflection on '${selectedPrompt.text}'`
      });
    }

    dispatch({ type: "COMPLETE_REFLECTION" });
  };

  const handleStartNewTopic = () => {
    setSelectedPrompt(null);
    setReflectionText("");
    setTokenReward(null);
    dispatch({ type: "RESET_FLOW" });
    if (onReset) onReset();
  };

  const handleRefreshPrompt = () => {
    if (category) selectRandomPrompt(category);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {!selectedPrompt ? (
        <>
          <h2 className="text-xl font-semibold">Loading prompt...</h2>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-blue-800">{selectedPrompt?.text}</h2>

          {selectedPrompt?.options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => dispatch({ type: "SELECT_OPTION", option })}
              className={`block w-full text-left px-4 py-2 rounded ${
                state.currentOption === option ? "bg-blue-200" : "bg-gray-100"
              }`}
            >
              {option}
            </button>
          ))}

          {(state.currentOption || !selectedPrompt?.options?.length) && (
            <div className="mt-4 space-y-2">
              <textarea
                className="w-full border rounded p-2"
                rows={5}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Reflect freely..."
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSubmitReflection}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {loading ? "Saving..." : "Save Reflection"}
                </button>
                <button
                  onClick={handleStartNewTopic}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Back to Categories
                </button>
                <button
                  onClick={handleRefreshPrompt}
                  className="px-4 py-2 bg-yellow-200 rounded"
                >
                  New Prompt in Same Category
                </button>
              </div>
              {error && <p className="text-sm text-red-600">Something went wrong.</p>}
              {state.completed && <p className="text-green-600">Insight saved.</p>}
              {tokenReward && <TokenRewardBreakdown reward={tokenReward} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

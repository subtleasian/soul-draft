import React, { useState } from "react";
import {
  generateConversationFlowTemplate,
  inferIdentityTraitsFromInput
} from "../utils/conversationUtils";
import { updateUserProgress } from "../utils/updateUserProgress";
import { useIdentityNodeExtractor } from "../hooks/useIdentityNodeExtractor";

export default function Prompt({ prompt, user }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [conversationFlow, setConversationFlow] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const [userReflection, setUserReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { extractNodes, loading, error } = useIdentityNodeExtractor();
  const [extractedNode, setExtractedNode] = useState(null);

  if (!prompt || !Array.isArray(prompt.options)) {
    return <div className="text-red-600">⚠️ Prompt data missing or invalid.</div>;
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowReflection(false);
    setUserReflection("");
    setSubmitted(false);

    const traits = { inferredTrait: "", inferredTheme: "" }; // placeholder
    const flow =
      prompt.conversationFlows?.[option] ||
      generateConversationFlowTemplate({
        selectedOption: option,
        ...traits
      });

    setConversationFlow(flow);
  };

  const handleStartReflection = () => {
    setShowReflection(true);
  };

  const handleSubmit = async () => {
    console.log("Submitting insight:", {
      selectedOption,
      userReflection,
      showReflection
    });

    if (!selectedOption || !showReflection) return;

    if (!userReflection || userReflection.trim().length < 3) {
      alert("Please write a bit more to save your insight.");
      return;
    }

    const journalEntryId = `${prompt.id || prompt.text?.slice(0, 10)}-${Date.now()}`;

    const nodes = await extractNodes({
      journalText: prompt.text,
      userReflection,
      journalEntryId,
      selectedOption,
      userId: user.uid
    });

    for (const node of nodes) {
      await updateUserProgress(user.uid, node);
    }

    setSubmitted(true);
  };

  return (
    <div className="p-4 border rounded-xl shadow bg-white space-y-4">
      <h2 className="text-xl font-semibold">{prompt.text}</h2>

      <div className="space-y-2">
        {prompt.options.map((option, i) => (
          <button
            key={i}
            className={`block w-full text-left px-4 py-2 rounded ${
              selectedOption === option ? "bg-blue-200" : "bg-gray-100"
            }`}
            onClick={() => handleOptionSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {conversationFlow && (
        <div className="mt-4 space-y-3">
          <p className="italic text-gray-600">{conversationFlow.acknowledgment}</p>

          {!showReflection ? (
            <button
              className="text-blue-600 underline"
              onClick={handleStartReflection}
            >
              {conversationFlow.reflectionPrompt}
            </button>
          ) : (
            <>
              <textarea
                className="w-full mt-2 border rounded p-2"
                rows={4}
                placeholder="Write as much or as little as you’d like..."
                value={userReflection}
                onChange={(e) => setUserReflection(e.target.value)}
              />
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Insight"}
              </button>
            </>
          )}

          {loading && (
            <p className="text-sm text-gray-500">⏳ Extracting and saving insight…</p>
          )}
          {error && (
            <p className="text-sm text-red-500">⚠️ Something went wrong. Please try again.</p>
          )}
          {!userReflection && showReflection && (
            <p className="text-sm text-gray-500">
              {conversationFlow.followUpIfSkipped}
            </p>
          )}

          {submitted && (
            <p className="text-green-600">✅ Insight saved to your map.</p>
          )}
        </div>
      )}
    </div>
  );
}

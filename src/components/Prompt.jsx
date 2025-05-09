import React, { useState } from "react";
import {
  generateConversationFlowTemplate,
  inferIdentityTraitsFromInput,
} from "../utils/conversationUtils";
import { saveIdentityNode } from "../utils/firestore";
import { updateUserProgress } from "../utils/updateUserProgress";

export default function Prompt({ prompt, user }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [conversationFlow, setConversationFlow] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const [userReflection, setUserReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!prompt || !Array.isArray(prompt.options)) {
    return <div className="text-red-600">⚠️ Prompt data missing or invalid.</div>;
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowReflection(false);
    setUserReflection("");
    setSubmitted(false);

    const traits = { inferredTrait: "", inferredTheme: "" }; // don’t guess yet
    // const traits = inferIdentityTraitsFromInput("", option);
    const flow =
      prompt.conversationFlows?.[option] ||
      generateConversationFlowTemplate({
        selectedOption: option,
        ...traits,
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
      showReflection,
    });

    if (!selectedOption || !showReflection) return;
    if (!userReflection || userReflection.trim().length < 3) {
      alert("Please write a bit more to save your insight.");
      return;
    }

    const { inferredTrait, inferredTheme, dominantEmotion } =
      inferIdentityTraitsFromInput(userReflection, selectedOption) || {};

    const identityNode = {
      userId: user.uid,
      label: selectedOption, // this repeats in origin, find a different label?
      type: prompt.type === "multipleChoice" ? "belief" : "value", //find a way to fix this
      category: "Self",
      confidence: 0.9,
      origin: {
        promptText: prompt.text,
        selectedOption: selectedOption,
        excerpt: `${prompt.text} → ${selectedOption}`,
        reflection: userReflection
      },
      status: "",
      reviewedByUser: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };


    if (inferredTrait) identityNode.trait = inferredTrait;
    if (inferredTheme) identityNode.theme = inferredTheme;
    if (dominantEmotion) identityNode.emotion = dominantEmotion;

    await saveIdentityNode(identityNode);
    if (user?.uid) await updateUserProgress(user.uid, identityNode);

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
              >
                Save Insight
              </button>
            </>
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
// Note: The above code assumes that the `inferIdentityTraitsFromInput` function
// is capable of inferring traits, themes, and emotions from the user's reflection.
// You may need to adjust the logic based on your actual implementation.
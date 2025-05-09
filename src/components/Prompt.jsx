import React, { useState } from "react";
import { generateConversationFlowTemplate, inferIdentityTraitsFromInput } from "../utils/conversationUtils";
import { saveIdentityNode } from "../utils/firestore";

export default function Prompt({ prompt }) {
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

    const flow =
      prompt.conversationFlows?.[option] ||
      generateConversationFlowTemplate({
        selectedOption: option,
        ...inferIdentityTraitsFromInput("", option)
      });

    setConversationFlow(flow);
  };

  const handleSubmit = async () => {
    const { inferredTrait, inferredTheme, dominantEmotion } = inferIdentityTraitsFromInput(
      userReflection,
      selectedOption
    );

    const identityNode = {
      label: selectedOption,
      type: prompt.type === "multipleChoice" ? "belief" : "value",
      category: "Self",
      confidence: 0.9,
      origin: {
        excerpt: `${prompt.text} → ${selectedOption}`,
        reflection: userReflection
      },
      status: "confirmed",
      reviewedByUser: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveIdentityNode(identityNode);
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
              onClick={() => setShowReflection(true)}
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

          {!userReflection && (
            <p className="text-sm text-gray-500">{conversationFlow.followUpIfSkipped}</p>
          )}

          {submitted && <p className="text-green-600">✅ Insight saved to your map.</p>}
        </div>
      )}
    </div>
  );
}
// Compare this snippet from src/utils/conversationUtils.js:
// // src/utils/conversationUtils.js
// import { v4 as uuidv4 } from "uuid";
//
// export function generateConversationFlowTemplate({ selectedOption, inferredTrait, inferredTheme }) {
//   return {
//     acknowledgment: `That’s a meaningful choice. Thanks for naming something like "${selectedOption}".`,
//     reflectionPrompt: `Want to share what "${selectedOption}" looked like for you?`,
//     followUpIfSkipped: `No pressure. Want help naming what "${selectedOption}" might have shaped in you?`,
//     insightTemplate: `This may have shaped your ${inferredTrait} or your relationship with ${inferredTheme}.`,
//     timeCheckPrompt: `Pause here or go one layer deeper into your ${inferredTrait}?`
//     id: uuidv4(), // Unique ID for the flow
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };
// }
//
// export function inferIdentityTraitsFromInput(userText = "", selectedOption = "") {
//   const lowerText = userText.toLowerCase();
//   const inferredTrait = lowerText.includes("resilience") ? "resilience" : "curiosity";
//   const inferredTheme = lowerText.includes("belonging") ? "belonging" : "connection";
//   return { inferredTrait, inferredTheme };
// }
//
// export function saveIdentityNode(identityNode) {
//   // Function to save the identity node to the database
//   // This is a placeholder and should be replaced with actual database logic
//   console.log("Saving identity node:", identityNode);
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       console.log("Identity node saved!");
//       resolve();
//     }, 1000);
//   });
//   // In a real application, you would use Firestore or another database to save the node
//   // For example:
//   // return db.collection("identityNodes").add(identityNode);
// }
//
// export function fetchPrompts() {
//   // Function to fetch prompts from the database
//   // This is a placeholder and should be replaced with actual database logi
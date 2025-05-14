// components/InsightSummary.jsx
import React from "react";

export default function InsightSummary({ node, onContinue, onNewTopic, onPause }) {
  const inferred = node?.inferred || {};

  return (
    <div className="bg-blue-50 p-4 rounded shadow space-y-4">
      <h3 className="text-lg font-bold text-blue-800">✨ Insight Saved</h3>

      <div className="space-y-2 text-gray-700">
        <p>
          You've earned <strong>{node?.tokenReward?.total || 0}</strong> tokens for your reflection.
        </p>

        {inferred.traits?.length > 0 && (
          <p>
            <span className="font-semibold">🧬 Traits:</span>{" "}
            {inferred.traits.map(t => t.trait).join(", ")}
          </p>
        )}
        {inferred.values?.length > 0 && (
          <p>
            <span className="font-semibold">🌱 Values:</span>{" "}
            {inferred.values.map(v => v.value).join(", ")}
          </p>
        )}
        {inferred.emotions?.length > 0 && (
          <p>
            <span className="font-semibold">💫 Emotions:</span>{" "}
            {inferred.emotions.map(e => e.emotion).join(", ")}
          </p>
        )}
      </div>

      {/* Save logic for the inferred.traits, values, emotions?? */}

      <div className="pt-4 border-t text-sm text-gray-600">
        <p>What would you like to do next?</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={onPause} className="px-4 py-2 bg-gray-300 text-sm rounded">
            Pause
          </button>
          <button onClick={onContinue} className="px-4 py-2 bg-blue-600 text-white text-sm rounded">
            Continue in Same Category
          </button>
          <button onClick={onNewTopic} className="px-4 py-2 bg-green-600 text-white text-sm rounded">
            Start New Topic
          </button>
        </div>
      </div>
    </div>
  );
}

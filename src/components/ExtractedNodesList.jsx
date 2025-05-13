import NodeReviewActions from "./NodeReviewActions";

export default function ExtractedNodesList({ nodes, onReview }) {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-blue-900">
        🧠 Extracted Identity Insight{nodes.length > 1 ? "s" : ""}
      </h3>

      {nodes.map((node, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-gray-50 border shadow-sm space-y-2"
        >
          <div>
            <p className="text-md font-semibold text-gray-800">{node.label}</p>
            <p className="text-sm text-gray-600 italic">
              {node.type} in {node.category}
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Confidence: {(node.confidence * 100).toFixed(1)}%
          </p>

          {node.tokenReward !== undefined && (
            <p className="text-sm text-yellow-700">
              ⭐ <strong>{node.tokenReward}</strong> Emotigraf Tokens earned
            </p>
          )}

          {node.reviewedByUser ? (
            <p
              className={`text-sm mt-1 ${
                node.status === "confirmed"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              You {node.status === "confirmed" ? "confirmed" : "dismissed"} this insight.
            </p>
          ) : (
            <NodeReviewActions
              onConfirm={() => onReview(idx, "confirm")}
              onDismiss={() => onReview(idx, "dismiss")}
            />
          )}
        </div>
      ))}
    </div>
  );
}

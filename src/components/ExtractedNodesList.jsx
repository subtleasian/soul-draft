import NodeReviewActions from "./NodeReviewActions";

export default function ExtractedNodesList({ nodes, onReview }) {
  return (
    <div className="mt-4 space-y-2">
      <h3 className="font-semibold">Extracted Identity Nodes</h3>
      {nodes.map((node, idx) => (
        <div key={idx} className="p-2 rounded bg-gray-100">
          <p>
            <strong>{node.label}</strong>{" "}
            <em>({node.type}, {node.category})</em>
          </p>
          <p className="text-sm text-gray-600">
            Confidence: {(node.confidence * 100).toFixed(1)}%
          </p>

          {node.reviewedByUser ? (
            <p className="text-green-600 text-sm mt-1">
              You {node.status === "confirmed" ? "confirmed" : "dismissed"} this.
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

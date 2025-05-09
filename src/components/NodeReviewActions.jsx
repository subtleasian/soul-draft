
export default function NodeReviewActions({ onConfirm, onDismiss }) {
  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={onConfirm}
        className="px-2 py-1 bg-green-500 text-white text-sm rounded"
      >
        Confirm
      </button>
      <button
        onClick={onDismiss}
        className="px-2 py-1 bg-red-500 text-white text-sm rounded"
      >
        Dismiss
      </button>
    </div>
  );
}

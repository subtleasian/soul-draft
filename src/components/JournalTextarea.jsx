export default function JournalTextarea({ entry, setEntry, onSave, loading }) {
  return (
    <div>
      <textarea
        className="w-full h-36 p-2 border border-gray-300"
        placeholder="Write your thoughts..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white"
        onClick={onSave}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Entry"}
      </button>
    </div>
  );
}


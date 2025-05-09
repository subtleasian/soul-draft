// components/EntryItem.jsx
import React from "react";

export default function EntryItem({ entry }) {
  return (
    <div className="mb-2 p-2 border">
      <div>
        {entry.time instanceof Object && entry.time.toDate
          ? entry.time.toDate().toLocaleString()
          : entry.time || "Saving..."}
      </div>
      <div>{entry.text}</div>

      <p className="text-sm italic text-gray-500">
        🧠 Insight: {entry.identityNode?.label} ({entry.identityNode?.type})
      </p>
    </div>
  );
}
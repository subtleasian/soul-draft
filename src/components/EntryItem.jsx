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
    </div>
  );
}
// components/EntryItem.jsx
import React from "react";

export default function EntryItem({ entry }) {
  return (
    <div className="mt-4 border-t pt-2">
      <div className="text-gray-500 text-sm">{entry.time}</div>
      <div>{entry.text}</div>
    </div>
  );
}
import React from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function EntryItem({ entry }) {
  const timestamp =
    entry.createdAt instanceof Object && entry.createdAt.toDate
      ? entry.createdAt.toDate().toLocaleString()
      : "Unknown date";

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this insight?")) {
      await deleteDoc(doc(db, "identityNodes", entry.id));
    }
  };

  // Placeholder: HandleEdit would open a modal or toggle an editing UI
  const handleEdit = () => {
    alert("Edit functionality coming soon ✍️");
  };

  return (
    <div className="mb-4 p-4 rounded-xl shadow-sm border bg-white space-y-2">
      <div className="flex justify-between items-start">
        <div className="text-xs text-gray-400">{timestamp}</div>
        <div className="space-x-2">
          <button
            onClick={handleEdit}
            className="text-blue-600 text-xs hover:underline"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 text-xs hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-blue-900">
          {entry.label || "Unnamed Insight"}
        </h3>
        <span className="text-sm text-gray-500 capitalize">
          {entry.type || "Type unknown"}
        </span>
      </div>

      {entry.origin?.promptText && (
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-400">Original Prompt:</span> {entry.origin.promptText}
        </p>
      )}
      
      {entry.origin?.selectedOption && (
        <p className="text-sm text-gray-700">
          <span className="font-medium text-gray-500">Selected Option: </span>{entry.origin.selectedOption}
        </p>
      )}

      {/* {entry.origin?.excerpt && (
        <p className="text-sm text-gray-700">
          <span className="font-medium text-gray-500">Prompt →</span>{" "}
          {entry.origin.excerpt}
        </p>
      )} */}

      {entry.origin?.reflection && (
        <blockquote className="mt-2 border-l-4 border-blue-300 pl-4 italic text-gray-600">
          “{entry.origin.reflection}”
        </blockquote>
      )}
    </div>
  );
}

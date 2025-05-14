// components/PromptCategoryPicker.jsx
import React from "react";

export default function PromptCategoryPicker({ categories, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className="px-4 py-3 rounded-xl shadow bg-white hover:bg-blue-50 border text-left"
        >
          <span className="text-lg">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}

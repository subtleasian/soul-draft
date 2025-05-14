// components/TokenRewardBreakdown.jsx
import React from "react";

export default function TokenRewardBreakdown({ reward }) {
  if (!reward || typeof reward !== "object") return null;

  const { total, byDimension = {} } = reward;

  return (
    <div className="mt-4 p-4 border rounded bg-blue-50 text-blue-900 shadow-sm">
      <h3 className="text-lg font-semibold">🎟️ Tokens Earned: {total}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {Object.entries(byDimension).map(([dimension, amount]) => (
          <li key={dimension} className="flex justify-between">
            <span className="capitalize">{dimension}</span>
            <span className="font-semibold">{amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

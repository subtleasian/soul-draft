// components/UserProgress.jsx
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function UserProgress({ user }) {
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    async function load() {
      const ref = doc(db, "userTokens", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      const tokensByDimension = data.tokensByDimension || {};

      const tally = {
        cognitive: tokensByDimension.cognitive || 0,
        emotional: tokensByDimension.emotional || 0,
        identity: tokensByDimension.identity || 0,
        linguistic: tokensByDimension.linguistic || 0,
        socialEthical: tokensByDimension.socialEthical || 0
      };

      setTotals(tally);
    }

    if (user?.uid) load();
  }, [user]);

  if (!totals) return null;

  return (
    <div className="p-4 bg-white border rounded-lg shadow mt-4">
      <h2 className="text-xl font-bold text-blue-900 mb-2">🎯 Total Emotigraf Tokens by Dimension</h2>
      <ul className="space-y-1 text-sm">
        {Object.entries(totals).map(([dimension, amount]) => (
          <li key={dimension} className="flex justify-between">
            <span className="capitalize text-gray-700">{dimension}</span>
            <span className="font-semibold text-blue-700">{amount} Emotigraf tokens</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

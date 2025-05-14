import React, { useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import JournalTextarea from "./JournalTextarea";
import ExtractedNodesList from "./ExtractedNodesList";
import { extractIdentityNode } from "../api/extractIdentityNode";
import { saveIdentityVectorNode } from "../utils/saveIdentityVectorNode";

export default function EntryForm({ user, entry, setEntry }) {
  const [extractedNode, setExtractedNode] = useState(null);
  const [loading, setLoading] = useState(false);

  const saveEntry = async () => {
    if (!entry.trim()) return;
    setLoading(true);

    try {
      // Step 1: Save the journal entry itself
      const journalRef = await addDoc(collection(db, "journalEntries"), {
        text: entry,
        time: serverTimestamp(),
        userId: user.uid
      });

      const journalEntryId = journalRef.id;

      // Step 2: Call Cloud Function to extract one enriched node
      const node = await extractIdentityNode({
        journalText: entry,
        userReflection: entry,
        selectedOption: "",
        userId: user.uid,
        journalEntryId
      });

      if (!node) throw new Error("No identity node returned");

      // Step 3: Save modular identity insight
      await saveIdentityVectorNode(node, journalEntryId, "");

      // Step 4: Show it in the UI
      setExtractedNode(node);
      setEntry("");
    } catch (err) {
      console.error("❌ Error saving entry or extracting identity node:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeReview = async (action) => {
    if (!extractedNode) return;

    const newStatus = action === "confirm" ? "confirmed" : "dismissed";
    const updatedNode = {
      ...extractedNode,
      status: newStatus,
      reviewedByUser: true
    };

    setExtractedNode(updatedNode);

    try {
      const ref = doc(db, "identityNodes", updatedNode.id);
      await updateDoc(ref, {
        status: newStatus,
        reviewedByUser: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("❌ Failed to update node status:", error);
    }
  };

  return (
    <div>
      <JournalTextarea
        entry={entry}
        setEntry={setEntry}
        onSave={saveEntry}
        loading={loading}
      />

      {extractedNode && (
        <div className="mt-6 p-4 rounded-xl bg-gray-50 border">
          <h3 className="text-lg font-semibold text-blue-900">🧠 Insight Extracted</h3>
          <p className="text-sm text-gray-700">
            <strong>Follow-Up Prompt:</strong> {extractedNode.followUpPrompt}
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            ⭐ <strong>{extractedNode.tokenReward}</strong> Emotigraf Tokens earned
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleNodeReview("confirm")}
              className="px-4 py-1 text-sm rounded bg-green-100 text-green-800 hover:bg-green-200"
            >
              Confirm
            </button>
            <button
              onClick={() => handleNodeReview("dismiss")}
              className="px-4 py-1 text-sm rounded bg-red-100 text-red-800 hover:bg-red-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

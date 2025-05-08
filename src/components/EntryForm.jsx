// components/EntryForm.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { doc, setDoc, updateDoc } from "firebase/firestore";

export default function EntryForm({ user, entry, setEntry }) {
  const [extractedNodes, setExtractedNodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const saveEntry = async () => {
    if (!entry.trim()) return;
    setLoading(true);

    try {
      const journalRef = await addDoc(collection(db, "journalEntries"), {
        text: entry,
        time: serverTimestamp(),
        userId: user.uid,
      });

      // Call identity extraction API
      const response = await fetch("https://extractidentitynodes-d5g54wgdxq-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalText: entry }),
      });

      const data = await response.json();
      setExtractedNodes(data.identityNodes);



      data.identityNodes.forEach(async (node, index) => {
        const nodeId = `${journalRef.id}_${index}`; // or use crypto.randomUUID() if preferred
        await setDoc(doc(db, "identityNodes", nodeId), {
          ...node,
          userId: user.uid,
          journalEntryId: journalRef.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: node.confidence >= 0.75
            ? "confirmed"
            : node.confidence >= 0.4
            ? "suggested"
            : "dismissed",
          reviewedByUser: false,
        });
      });

      setEntry(""); // Clear entry
    } catch (err) {
      console.error("Error saving entry or extracting nodes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeReview = async (index, action) => {
    const newStatus = action === "confirm" ? "confirmed" : "dismissed";
    
    const updatedNode = {
      ...extractedNodes[index],
      status: newStatus,
      reviewedByUser: true,
    };
  
    
    setExtractedNodes((prev) =>
      prev.map((node, i) => (i === index ? updatedNode : node))
    );
  
    // Save the review status to Firestore (optional if already saved)
    try {
      const nodeId = `${updatedNode.origin?.journalEntryId || "manual"}_${index}`;
      await updateDoc(doc(db, "identityNodes", nodeId), {
        status: newStatus,
        reviewedByUser: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to update node:", error);
    }
  };
  
  

  return (
    <div>
      <textarea
        className="w-full h-36 p-2 border border-gray-300"
        placeholder="Write your thoughts..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      ></textarea>
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white"
        onClick={saveEntry}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Entry"}
      </button>

      {extractedNodes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Extracted Identity Nodes</h3>
          {extractedNodes.map((node, idx) => (
            <div key={idx} className="p-2 rounded bg-gray-100">
              <p><strong>{node.label}</strong> <em>({node.type}, {node.category})</em></p>
              <p className="text-sm text-gray-600">Confidence: {(node.confidence * 100).toFixed(1)}%</p>

              {node.reviewedByUser ? (
                <p className="text-green-600 text-sm mt-1">
                  You {node.status === "confirmed" ? "confirmed" : "dismissed"} this.
                </p>
              ) : (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleNodeReview(idx, "confirm")}
                    className="px-2 py-1 bg-green-500 text-white text-sm rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleNodeReview(idx, "dismiss")}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

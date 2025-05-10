import React, { useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { saveIdentityNode } from "../utils/firestore";
import JournalTextarea from "./JournalTextarea";
import ExtractedNodesList from "./ExtractedNodesList";
import { useIdentityNodeExtractor } from "../hooks/useIdentityNodeExtractor";



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
        userId: user.uid
      });

      const response = await fetch("https://extractidentitynodes-d5g54wgdxq-uc.a.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalText: entry })
      });

      const data = await response.json();
      setExtractedNodes(data.identityNodes);

      data.identityNodes.forEach(async (node, index) => {
        const nodeId = `${journalRef.id}_${index}`;
        await saveIdentityNode({
          ...node,
          userId: user.uid,
          journalEntryId: journalRef.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          status:
            node.confidence >= 0.75
              ? "confirmed"
              : node.confidence >= 0.4
              ? "suggested"
              : "dismissed",
          reviewedByUser: false
        }, nodeId);
      });

      setEntry("");
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
      reviewedByUser: true
    };

    setExtractedNodes((prev) =>
      prev.map((node, i) => (i === index ? updatedNode : node))
    );

    try {
      const nodeId = `${updatedNode.origin?.journalEntryId || "manual"}_${index}`;
      await updateDoc(doc(db, "identityNodes", nodeId), {
        status: newStatus,
        reviewedByUser: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Failed to update node:", error);
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

      {extractedNodes.length > 0 && (
        <ExtractedNodesList nodes={extractedNodes} onReview={handleNodeReview} />
      )}
    </div>
  );
}

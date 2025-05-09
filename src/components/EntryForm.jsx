import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { saveIdentityNode } from "../utils/firestore";
import { useIdentityNodeExtractor } from "../hooks/useIdentityNodeExtractor";
import JournalTextarea from "./JournalTextarea";
import ExtractedNodesList from "./ExtractedNodesList";

export default function EntryForm({ user, entry, setEntry }) {
  const [extractedNodes, setExtractedNodes] = useState([]);
  const [saving, setSaving] = useState(false);

  const { extractNodes, loading: extracting, error } = useIdentityNodeExtractor();

  const saveEntry = async () => {
    if (!entry.trim()) return;
    setSaving(true);

    try {
      // Step 1: Save raw journal entry
      const journalRef = await addDoc(collection(db, "journalEntries"), {
        text: entry,
        time: serverTimestamp(),
        userId: user.uid
      });

      // Step 2: Extract identity nodes via API
      const nodes = await extractNodes(entry);
      setExtractedNodes(nodes);

      // Step 3: Save each identity node
      await Promise.all(nodes.map(async (node, index) => {
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
      }));

      setEntry("");
    } catch (err) {
      console.error("Error saving entry or processing nodes:", err);
    } finally {
      setSaving(false);
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
        loading={saving || extracting}
      />

      {error && <p className="text-red-500 mt-2">⚠️ Failed to extract identity nodes.</p>}

      {extractedNodes.length > 0 && (
        <ExtractedNodesList nodes={extractedNodes} onReview={handleNodeReview} />
      )}
    </div>
  );
}

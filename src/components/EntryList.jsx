import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import EntryItem from "./EntryItem";

export default function EntryList({ user }) {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "identityNode"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc") // orderBy desc needs to be indexed with firebase to works
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log("📦 Loaded identity nodes:", snapshot.docs.length);
      console.log("🧠 Sample node:", snapshot.docs[0]?.data());
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [user]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium">Your Identity Insights</h3>
      {nodes.length === 0 ? (
        <p className="text-gray-500 mt-2">No insights yet — start journaling to unlock your map.</p>
      ) : (
        nodes.map((node) => <EntryItem key={node.id} entry={node} />)
      )}
    </div>
  );
}

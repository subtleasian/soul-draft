// components/EntryList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import EntryItem from "./EntryItem";

export default function EntryList({ user }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "journalEntries"),
      where("userId", "==", user.uid),
      orderBy("time", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe(); // clean up on unmount
  }, [user]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium">Your Past Entries</h3>
      {entries.map(entry => <EntryItem key={entry.id} entry={entry} />)}
    </div>
  );
}

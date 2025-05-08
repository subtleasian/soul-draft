// components/EntryList.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import EntryItem from "./EntryItem";

export default function EntryList({ user }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const q = query(
        collection(db, "journalEntries"),
        where("userId", "==", user.uid),
        orderBy("time", "desc")
      );
      const snapshot = await getDocs(q);
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEntries();
  }, [user]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium">Your Past Entries</h3>
      {entries.map(entry => <EntryItem key={entry.id} entry={entry} />)}
    </div>
  );
}

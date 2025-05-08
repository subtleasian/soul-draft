// components/EntryForm.jsx
import React from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function EntryForm({ user, entry, setEntry }) {
  const saveEntry = async () => {
    if (!entry.trim()) return;
    await addDoc(collection(db, "journalEntries"), {
      text: entry,
      time: serverTimestamp(),
      userId: user.uid,
    });
    setEntry(""); // Clear the entry after saving
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
      >
        Save Entry
      </button>
    </div>
  );
}

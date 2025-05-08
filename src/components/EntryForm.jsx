// components/EntryForm.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function EntryForm({ user }) {
  const [text, setText] = useState("");

  const saveEntry = async () => {
    if (!text.trim()) return;
    const timestamp = new Date().toLocaleString();
    await addDoc(collection(db, "journalEntries"), {
      text,
      time: timestamp,
      userId: user.uid
    });
    setText("");
  };

  return (
    <div>
      <textarea
        className="w-full h-36 p-2 border border-gray-300"
        placeholder="Write your thoughts..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white" onClick={saveEntry}>Save Entry</button>
    </div>
  );
}
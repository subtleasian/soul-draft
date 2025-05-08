// components/Journal.jsx
import React, { useState } from "react";
import Prompt from "./Prompt";
import PromptChips from './PromptChips';
import EntryForm from "./EntryForm";
import EntryList from "./EntryList";

export default function Journal({ user }) {
  const [entry, setEntry] = useState("");

  const handlePromptSelect = (prompt) => {
    setEntry(prev => prev ? `${prev}\n${prompt}` : prompt); // Fixed string interpolation
  };

  return (
    <div className="mt-4">
      <Prompt />
      <PromptChips onSelect={handlePromptSelect} />
      <EntryForm user={user} entry={entry} setEntry={setEntry} />
      <EntryList user={user} />
    </div>
  );
}

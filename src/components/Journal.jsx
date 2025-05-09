// src/components/Journal.jsx
import React, { useState, useEffect } from "react";
import Prompt from "./Prompt";
import EntryForm from "./EntryForm";
import EntryList from "./EntryList";
import { fetchPrompts } from "../utils/firestore"; // assumes a util that loads prompts

export default function Journal({ user }) {
  const [activeTab, setActiveTab] = useState("prompt"); // "prompt" or "freeform"
  const [prompts, setPrompts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    async function loadPrompts() {
      const loaded = await fetchPrompts();
      setPrompts(loaded);
      setActivePrompt(loaded[0] || null); // Make sure it's a valid prompt object
    }
    loadPrompts();
  }, []);

  
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex space-x-4 border-b pb-2">
        <button
          onClick={() => setActiveTab("prompt")}
          className={`px-3 py-1 rounded ${
            activeTab === "prompt" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Guided Prompt
        </button>
        <button
          onClick={() => setActiveTab("freeform")}
          className={`px-3 py-1 rounded ${
            activeTab === "freeform" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Free Journal
        </button>
      </div>

      {activeTab === "prompt" && activePrompt && Array.isArray(activePrompt.options) && (
        <Prompt prompt={activePrompt} />
      )}

      {activeTab === "freeform" && (
        <EntryForm user={user} entry={entry} setEntry={setEntry} />
      )}

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold mb-2">Previous Entries</h3>
        <EntryList user={user} />
      </div>
    </div>
  );
}

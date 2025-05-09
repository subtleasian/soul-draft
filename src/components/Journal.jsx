import React, { useState, useEffect } from "react";
import Prompt from "./Prompt";
import EntryForm from "./EntryForm";
import EntryList from "./EntryList";
import { fetchPrompts } from "../utils/firestore";

export default function Journal({ user }) {
  const [activeTab, setActiveTab] = useState("prompt"); // "prompt" or "freeform"
  const [prompts, setPrompts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrompts() {
      const loaded = await fetchPrompts();
      setPrompts(loaded);
      setActivePrompt(loaded[0] || null);
    }
    loadPrompts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-10 px-4">
      {/* Tabs */}
      <div className="flex justify-center space-x-4 border-b pb-4">
        <button
          onClick={() => setActiveTab("prompt")}
          className={`px-4 py-2 rounded-full transition font-medium ${
            activeTab === "prompt"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          🧭 Guided Prompts
        </button>
        <button
          onClick={() => setActiveTab("freeform")}
          className={`px-4 py-2 rounded-full transition font-medium ${
            activeTab === "freeform"
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ✍️ Free Journal
        </button>
      </div>

      {/* Input Section */}
      <section>
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          {activeTab === "prompt" ? "Explore What’s Shaped You" : "Write Freely From Within"}
        </h2>

        {activeTab === "prompt" && activePrompt && Array.isArray(activePrompt.options) && (
          <Prompt prompt={activePrompt} user={user} />
        )}

        {activeTab === "freeform" && (
          <EntryForm user={user} entry={entry} setEntry={setEntry} />
        )}
      </section>

      {/* Past Entries Section */}
      <section className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🧠 Your Identity Insights</h3>
        <EntryList user={user} />
      </section>
    </div>
  );
}

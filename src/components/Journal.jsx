import React, { useState } from "react";
import EntryList from "./EntryList";
import PromptCategoryPicker from "./PromptCategoryPicker";
import ConversationFlow from "./ConversationFlow";

export default function Journal({ user }) {
  const [dynamicTitle, setDynamicTitle] = useState("How would you like to begin?");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const promptCategories = [
    { label: "🧠 Explore Something New", value: "exploration" },
    { label: "🌞 Reflect on the Good", value: "positive" },
    { label: "🖤 Process Hard Stuff", value: "deep_work" },
    { label: "🧩 Challenge Your Thinking", value: "cognitive" },
    { label: "🔎 Find Meaning in Patterns", value: "meta" },
    { label: "🎲 Freeform / Surprise Me", value: "freeform" },
    { label: "🔁 Revisit a Past Insight", value: "revisit" }
  ];

  const handleCategorySelect = (categoryValue) => {
    const categoryObj = promptCategories.find(c => c.value === categoryValue);
    setSelectedCategory(categoryObj);
    setDynamicTitle(categoryObj?.label || "Reflect");
  };

  const handleResetToCategories = () => {
  setSelectedCategory(null);
  setDynamicTitle("How would you like to begin?");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 px-4">
      <section>
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          {dynamicTitle}
        </h2>

        {!selectedCategory ? (
          <PromptCategoryPicker
            categories={promptCategories}
            onSelect={handleCategorySelect}
          />
        ) : (
          <ConversationFlow
            category={selectedCategory.value}
            categoryLabel={selectedCategory.label}
            user={user}
            setDynamicTitle={setDynamicTitle} // 👈 pass down for deeper updates
            onReset={handleResetToCategories} // 👈 new prop
          />
        )}
      </section>

      <section className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🧠 Your Identity Insights</h3>
        <EntryList user={user} />
      </section>
    </div>
  );
}

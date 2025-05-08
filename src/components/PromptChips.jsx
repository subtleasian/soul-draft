// components/PromptChips.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";


export default function PromptChips({ onSelect }) {
    const [prompts, setPrompts] = useState([]);
  
    useEffect(() => {
      async function fetchPrompts() {
        try {
          const q = query(collection(db, "prompts"), where("active", "==", true));
          const snapshot = await getDocs(q);
          const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPrompts(loaded);
        } catch (error) {
          console.error("Error fetching prompts:", error);
        }
      }
  
      fetchPrompts();
    }, []);
  
    return (
      <div className="flex flex-wrap gap-2 my-4">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelect(prompt.text)}
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-blue-100 text-sm transition"
          >
            {prompt.text}
          </button>
        ))}
      </div>
    );
  }

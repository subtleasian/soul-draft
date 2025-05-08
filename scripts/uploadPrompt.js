// scripts/uploadPrompts.js
import { db } from "../src/firebase.js";
import { collection, addDoc } from "firebase/firestore";

const prompts = [
    {
      text: "What energizes you lately?",
      category: "Self",
      tags: ["energy", "motivation", "self-awareness"],
      order: 1,
      active: true,
    },
    {
      text: "Who in your life inspires you?",
      category: "Relationships",
      tags: ["connection", "gratitude", "inspiration"],
      order: 2,
      active: true,
    },
    {
      text: "What’s something you’ve learned recently?",
      category: "Growth",
      tags: ["learning", "reflection", "growth-mindset"],
      order: 3,
      active: true,
    },
    {
      text: "What emotions are you holding back?",
      category: "Emotions",
      tags: ["emotions", "vulnerability", "release"],
      order: 4,
      active: true,
    },
    {
      text: "Where do you feel most at home?",
      category: "Spirituality",
      tags: ["belonging", "comfort", "identity"],
      order: 5,
      active: true,
    },
  ];

async function uploadPrompts() {
  for (const prompt of prompts) {
    try {
      await addDoc(collection(db, "prompts"), prompt);
      console.log(`Uploaded: ${prompt.text}`);
    } catch (error) {
      console.error("Error uploading prompt:", error);
    }
  }
}

uploadPrompts();

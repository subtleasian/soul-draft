// scripts/uploadPrompts.cjs
const { db, admin } = require("./firebase-admin.js");

const promptCategories = [
  {
    category: "exploration",
    label: "🧠 Explore Something New",
    prompts: [
      "What’s a part of yourself you’ve never fully explored—and why do you think that is?",
      "What’s something you’ve always been curious about but never pursued?",
      "What do you think your life would be like if you followed your strangest impulse?",
      "What part of your personality might surprise people if they knew it better?",
      "What does your intuition keep nudging you to look at more closely?"
    ]
  },
  {
    category: "positive",
    label: "🌞 Reflect on the Good",
    prompts: [
      "What small moment recently brought you a surprising amount of joy?",
      "What are you deeply proud of, even if you don’t often talk about it?",
      "Who in your life deserves more appreciation—and why?",
      "What part of yourself do you like the most right now?",
      "When do you feel most like the person you’re meant to be?"
    ]
  },
  {
    category: "deep_work",
    label: "🖤 Process Hard Stuff",
    prompts: [
      "What’s something painful you don’t usually let yourself feel fully?",
      "What’s a memory that still stings—and what meaning have you made of it?",
      "What have you been carrying alone that needs to be shared, even just here?",
      "What belief about yourself has been quietly hurting you?",
      "What’s something you’ve been avoiding, and what might happen if you faced it?"
    ]
  },
  {
    category: "cognitive",
    label: "🧩 Challenge Your Thinking",
    prompts: [
      "What’s a belief you used to hold that no longer feels true?",
      "Where in your life might your assumptions be limiting your growth?",
      "What story do you keep telling yourself that might need rewriting?",
      "How has someone else’s viewpoint challenged your worldview recently?",
      "What’s something you know logically but still struggle to internalize emotionally?"
    ]
  },
  {
    category: "meta",
    label: "🔎 Find Meaning in Patterns",
    prompts: [
      "What patterns do you notice repeating in your relationships or decisions?",
      "What’s something that keeps showing up in your life lately—coincidence or something deeper?",
      "How does your past keep echoing into your present?",
      "What do you think life has been trying to teach you recently?",
      "What recurring theme might be asking for your attention?"
    ]
  },
  {
    category: "freeform",
    label: "🎲 Freeform / Surprise Me",
    prompts: [
      "Start writing whatever’s on your mind—don’t filter, just flow.",
      "What’s the weirdest thing you’ve thought about lately?",
      "If you could say one true thing without judgment, what would it be?",
      "Write a letter to a version of yourself from another timeline.",
      "What’s the most emotionally honest sentence you can write right now?"
    ]
  },
  {
    category: "revisit",
    label: "🔁 Revisit a Past Insight",
    prompts: [
      "Last time you wrote about feeling [X]. How has that feeling shifted—or stayed the same?",
      "What’s something you said recently that you want to explore more deeply now?",
      "Re-read your past insight. What stands out now that didn’t before?",
      "What has changed since you last reflected on this topic?",
      "If that old insight were a seed, what might it be growing into today?"
    ]
  }
];

async function uploadPromptCategories() {
  for (let i = 0; i < promptCategories.length; i++) {
    const { category, label, prompts } = promptCategories[i];
    const docRef = db.collection("prompts").doc(category); // ✅ Admin SDK version

    try {
      await docRef.set({
        category,
        label,
        prompts,
        active: true,
        order: i + 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Uploaded category: ${category}`);
    } catch (error) {
      console.error(`❌ Failed to upload category ${category}:`, error);
    }
  }

  console.log("🚀 All prompt categories uploaded.");
}

uploadPromptCategories();

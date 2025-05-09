const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("../../serviceAccountKey.json");
const prompts = JSON.parse(fs.readFileSync("identity_prompts_conversation_ready.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadPrompts() {
  const batch = db.batch();
  prompts.forEach((prompt) => {
    const docRef = db.collection("prompts").doc(); // or use prompt.text as ID for deduplication
    batch.set(docRef, prompt);
  });

  try {
    await batch.commit();
    console.log("✅ Prompts uploaded successfully.");
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
}

uploadPrompts();

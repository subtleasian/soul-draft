import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // Ensure this exports initialized Firestore instance

export async function saveIdentityNode(node) {
  try {
    const nodeRef = doc(db, "identityNodes", node.id);

    const nodeData = {
      ...node,
      followUpPrompt: node.followUpPrompt || null, // 🧠 store therapist question
      updatedAt: new Date()
    };

    await setDoc(nodeRef, nodeData);
    console.log("✅ Identity node saved with follow-up:", node);
  } catch (error) {
    console.error("❌ Error saving identity node:", error);
    throw error;
  }
}

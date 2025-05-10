import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // make sure this exports your initialized Firestore instance

export async function saveIdentityNode(node) {
  try {
    const nodeRef = doc(db, "identityNodes", node.id);
    await setDoc(nodeRef, node);
    console.log("✅ Identity node saved:", node);
  } catch (error) {
    console.error("❌ Error saving identity node:", error);
    throw error;
  }
}

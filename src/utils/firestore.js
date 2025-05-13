// src/utils/firestore.js
import { db } from "../firebase/firebase";
import { collection, addDoc, doc, setDoc, updateDoc, getDocs } from "firebase/firestore";

// Save a new identity node to Firestore
export async function saveIdentityNode(node, nodeId = null) {
  try {
    const ref = nodeId
      ? doc(db, "identityNodes", nodeId)
      : doc(collection(db, "identityNodes"));

    await setDoc(ref, {
      ...node,
      followUpPrompt: node.followUpPrompt || null,
      updatedAt: new Date()
    });

    return ref.id;
  } catch (error) {
    console.error("Failed to save identity node:", error);
    throw error;
  }
}

// Fetch all prompts from Firestore
export async function fetchPrompts() {
  try {
    const snapshot = await getDocs(collection(db, "prompts"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return [];
  }
}

// Optional: update identity node (e.g. status review)
export async function updateIdentityNode(nodeId, updates) {
  try {
    const ref = doc(db, "identityNodes", nodeId);
    await updateDoc(ref, updates);
  } catch (error) {
    console.error("Failed to update identity node:", error);
  }
}

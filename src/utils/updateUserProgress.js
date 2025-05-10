import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function updateUserProgress(userId, identityNode) {
  const userDocRef = doc(db, "userProgress", userId);
  const docSnap = await getDoc(userDocRef);

  const { category, type } = identityNode;

  if (!category || !type) return;

  let currentData = {
    categoryProgress: {},
    typeProgress: {},
    totalPromptsAnswered: 0,
    milestones: {},
  };

  if (docSnap.exists()) {
    currentData = docSnap.data();
  }

  const updatedCategory = {
    ...currentData.categoryProgress,
    [category]: (currentData.categoryProgress?.[category] || 0) + 1,
  };

  const updatedType = {
    ...currentData.typeProgress,
    [type]: (currentData.typeProgress?.[type] || 0) + 1,
  };

  const updatedTotal = (currentData.totalPromptsAnswered || 0) + 1;

  // Optional: Check for milestone unlocks here
  const updatedMilestones = { ...currentData.milestones };
  if (updatedCategory["Self"] >= 3) {
    updatedMilestones["Self Explorer"] = true;
  }
  if (updatedCategory["Emotions"] >= 5) {
    updatedMilestones["Emotional Clarity I"] = true;
  }

  await setDoc(userDocRef, {
    categoryProgress: updatedCategory,
    typeProgress: updatedType,
    totalPromptsAnswered: updatedTotal,
    milestones: updatedMilestones,
  });
}

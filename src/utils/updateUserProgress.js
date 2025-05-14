import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { calculateTokenReward } from "./calculateTokenReward";

export async function updateUserProgress(userId, identityNode) {
  const userDocRef = doc(db, "userProgress", userId);
  const docSnap = await getDoc(userDocRef);

  const { category, type, id: nodeId, heuristicScores } = identityNode;
  if (!category || !type || !heuristicScores) return;

  let currentData = {
    categoryProgress: {},
    typeProgress: {},
    totalPromptsAnswered: 0,
    milestones: {},
    tokens: 0,
    tokenHistory: []
  };

  if (docSnap.exists()) {
    currentData = docSnap.data();
  }

  const updatedCategory = {
    ...currentData.categoryProgress,
    [category]: (currentData.categoryProgress?.[category] || 0) + 1
  };

  const updatedType = {
    ...currentData.typeProgress,
    [type]: (currentData.typeProgress?.[type] || 0) + 1
  };

  const updatedTotal = (currentData.totalPromptsAnswered || 0) + 1;

  const { total: rewardAmount, byDimension } = calculateTokenReward(heuristicScores);
  const updatedTokens = (currentData.tokens || 0) + rewardAmount;

  const updatedTokenHistory = [
    ...(currentData.tokenHistory || []),
    {
      nodeId,
      amount: rewardAmount,
      byDimension,
      timestamp: new Date().toISOString()
    }
  ];

  await setDoc(userDocRef, {
    categoryProgress: updatedCategory,
    typeProgress: updatedType,
    totalPromptsAnswered: updatedTotal,
    milestones: currentData.milestones || {},
    tokens: updatedTokens,
    tokenHistory: updatedTokenHistory
  });
}
// Note: This function assumes that the `identityNode` object contains the necessary fields.
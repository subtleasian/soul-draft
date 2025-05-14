import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

/**
 * Calculates token reward based on average of all heuristic scores
 */
export function calculateTokenReward(scores = {}) {
  const allValues = [];

  for (const domain of Object.values(scores)) {
    if (domain && typeof domain === "object") {
      for (const value of Object.values(domain)) {
        if (typeof value === "number") {
          allValues.push(value);
        }
      }
    }
  }

  const avg = allValues.length
    ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length
    : 0;

  const reward = Math.round(avg * 20);

  return { reward, debug: { avg, count: allValues.length, reward } };
}

/**
 * Adds tokens to a user’s balance and logs the transaction
 */
export async function rewardUserTokens({
  userId,
  amount,
  journalEntryId,
  reason = ""
}) {
  if (!userId || !amount || !journalEntryId) return;

  const userRef = doc(db, "userTokens", userId);
  const txRef = doc(collection(db, "tokenTransactions"));

  const userSnap = await getDoc(userRef);
  const current = userSnap.exists()
    ? userSnap.data()
    : { balance: 0, earned: 0, spent: 0 };

  const newBalance = current.balance + amount;
  const newEarned = current.earned + amount;

  await setDoc(userRef, {
    userId,
    balance: newBalance,
    earned: newEarned,
    spent: current.spent || 0,
    lastUpdated: new Date()
  });

  await setDoc(txRef, {
    txId: txRef.id,
    userId,
    type: "earn",
    amount,
    reason,
    journalEntryId,
    timestamp: new Date()
  });

  console.log(`✅ Rewarded ${amount} tokens to ${userId} for: ${reason}`);
}

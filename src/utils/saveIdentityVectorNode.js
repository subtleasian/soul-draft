import { db } from "../firebase/firebase";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

/**
 * Save an identity insight using modular, split-schema design.
 * This function writes to:
 * - identityNodes/{nodeId}
 * - heuristicScores/{journalEntryId}
 * - nodeOrigins/{journalEntryId}
 * - inferredInsights/{journalEntryId}
 * - userTokens/{userId}
 * - tokenTransactions/{autoId}
 */
export async function saveIdentityVectorNode(node, journalEntryId, promptText = "") {
  console.log("🧪 saveIdentityVectorNode: received node =", node);
  const {
    id,
    userId,
    heuristicScores = {},
    inferred = {},
    followUpPrompt = "",
    origin = {},
    tokenReward = 0,
    createdAt = new Date(),
    updatedAt = new Date()
  } = node;

  try {
    const tokenTxRef = doc(collection(db, "tokenTransactions"));
    const userRef = doc(db, "userTokens", userId);
    const userSnap = await getDoc(userRef);
    const current = userSnap.exists()
      ? userSnap.data()
      : { balance: 0, earned: 0, spent: 0 };

    const newBalance = current.balance + tokenReward;
    const newEarned = current.earned + tokenReward;

    await Promise.all([
      setDoc(doc(db, "identityNodes", id), {
        id,
        userId,
        tokenReward,
        createdAt,
        updatedAt
      }),

      setDoc(doc(db, "heuristicScores", journalEntryId), {
        userId,
        journalEntryId,
        heuristicScores,
        createdAt
      }),

      setDoc(doc(db, "nodeOrigins", journalEntryId), {
        userId,
        journalEntryId,
        promptText,
        reflection: origin.reflection || "",
        excerpt: origin.excerpt || "",
        selectedOption: origin.selectedOption || "",
        followUpPrompt,
        createdAt
      }),

      setDoc(doc(db, "inferredInsights", journalEntryId), {
        userId,
        journalEntryId,
        inferred,
        createdAt
      }),

      setDoc(userRef, {
        userId,
        balance: newBalance,
        earned: newEarned,
        spent: current.spent || 0,
        lastUpdated: updatedAt
      }),

      setDoc(tokenTxRef, {
        txId: tokenTxRef.id,
        userId,
        type: "earn",
        amount: tokenReward,
        reason: `Reflection on '${promptText}'`,
        journalEntryId,
        timestamp: updatedAt
      })
    ]);

    console.log("✅ Identity vector node and token data saved.");
  } catch (error) {
    console.error("❌ Failed to save identity vector node and tokens:", error);
    throw error;
  }
}

import { db } from "../firebase/firebase";
import { doc, setDoc, collection, getDoc, Timestamp } from "firebase/firestore";
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
  if (!node) {
    throw new Error("Node is missing required data for embedding.");
  }
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
      : { balance: 0, earned: 0, spent: 0, tokensByDimension: {} };

    const rewardAmount = tokenReward.total || tokenReward;

    // Write identity node
    try {
      await setDoc(doc(db, "identityNodes", id), {
        id,
        userId,
        tokenReward,
        createdAt,
        updatedAt
      });
      console.log("✅ identityNodes saved");
    } catch (err) {
      console.error("❌ Failed to save identityNodes:", err);
    }

    // Write heuristic scores
    try {
      await setDoc(doc(db, "heuristicScores", journalEntryId), {
        userId,
        journalEntryId,
        heuristicScores,
        createdAt
      });
      console.log("✅ heuristicScores saved");
    } catch (err) {
      console.error("❌ Failed to save heuristicScores:", err);
    }

    // Write node origin
    try {
      await setDoc(doc(db, "nodeOrigins", journalEntryId), {
        userId,
        journalEntryId,
        promptText,
        reflection: origin.reflection || "",
        excerpt: origin.excerpt || "",
        selectedOption: origin.selectedOption || "",
        followUpPrompt,
        createdAt
      });
      console.log("✅ nodeOrigins saved");
    } catch (err) {
      console.error("❌ Failed to save nodeOrigins:", err);
    }

    // Write inferred insights
    try {
      await setDoc(doc(db, "inferredInsights", journalEntryId), {
        userId,
        journalEntryId,
        inferred,
        createdAt
      });
      console.log("✅ inferredInsights saved");
    } catch (err) {
      console.error("❌ Failed to save inferredInsights:", err);
    }

    // Write userTokens
    try {
      await setDoc(userRef, {
        userId,
        balance: current.balance + rewardAmount,
        earned: current.earned + rewardAmount,
        spent: current.spent || 0,
        tokensByDimension: {
          cognitive: (current.tokensByDimension?.cognitive || 0) + (tokenReward.byDimension?.cognitive || 0),
          emotional: (current.tokensByDimension?.emotional || 0) + (tokenReward.byDimension?.emotional || 0),
          identity: (current.tokensByDimension?.identity || 0) + (tokenReward.byDimension?.identity || 0),
          linguistic: (current.tokensByDimension?.linguistic || 0) + (tokenReward.byDimension?.linguistic || 0),
          socialEthical: (current.tokensByDimension?.socialEthical || 0) + (tokenReward.byDimension?.socialEthical || 0)
        },
        lastUpdated: updatedAt
      });
      console.log("✅ userTokens updated");
    } catch (err) {
      console.error("❌ Failed to save userTokens:", err);
    }

    // Write token transaction
    try {
      await setDoc(tokenTxRef, {
        txId: tokenTxRef.id,
        userId,
        type: "earn",
        amount: rewardAmount,
        reason: `Reflection on '${promptText}'`,
        journalEntryId,
        timestamp: updatedAt
      });
      console.log("✅ tokenTransaction saved");
    } catch (err) {
      console.error("❌ Failed to save tokenTransaction:", err);
    }

    console.log("✅ All vector node data processed.");
  } catch (error) {
    console.error("🔥 Uncaught error in saveIdentityVectorNode:", error);
    throw error;
  }
}

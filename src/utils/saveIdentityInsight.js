import { db } from "../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Save heuristic scores from a single journal entry.
 */
export async function saveHeuristicScore({ userId, journalEntryId, scores, inferred }) {
  const ref = doc(db, "heuristicScores", journalEntryId);
  await setDoc(ref, {
    userId,
    journalEntryId,
    scores,
    inferred,
    createdAt: new Date()
  });
}

/**
 * Save the origin metadata associated with a journal reflection.
 */
export async function saveNodeOrigin({
  userId,
  journalEntryId,
  promptText,
  selectedOption,
  reflection,
  followUpPrompt,
  excerpt
}) {
  const ref = doc(db, "nodeOrigins", journalEntryId);
  await setDoc(ref, {
    userId,
    journalEntryId,
    promptText,
    selectedOption,
    reflection,
    followUpPrompt,
    excerpt,
    createdAt: new Date()
  });
}

/**
 * Update the long-term identity vector by averaging across past entries.
 */
export async function updateIdentityNodeVector({ userId, scores, inferred }) {
  const ref = doc(db, "identityNodes", userId);
  const snapshot = await getDoc(ref);

  let previous = {
    dimensions: {},
    inferredTraits: {},
    inferredEmotions: {},
    inferredValues: {}
  };

  if (snapshot.exists()) {
    previous = snapshot.data();
  }

  const updated = {
    dimensions: updateDimensionAverages(previous.dimensions, scores),
    inferredTraits: updateInferredMap(previous.inferredTraits, inferred.traits),
    inferredEmotions: updateInferredMap(previous.inferredEmotions, inferred.emotions),
    inferredValues: updateInferredMap(previous.inferredValues, inferred.values),
    updatedAt: new Date()
  };

  await setDoc(ref, {
    userId,
    ...updated
  });
}

// --- Helper Functions ---

function updateDimensionAverages(prev = {}, next = {}) {
  const out = { ...prev };
  for (const domain in next) {
    out[domain] = out[domain] || {};
    for (const metric in next[domain]) {
      const newVal = next[domain][metric];
      const prevVal = out[domain][metric]?.value || 0;
      const prevCount = out[domain][metric]?.count || 0;

      const avg = (prevVal * prevCount + newVal) / (prevCount + 1);
      out[domain][metric] = { value: avg, count: prevCount + 1 };
    }
  }
  return out;
}

function updateInferredMap(prev = {}, items = []) {
  const out = { ...prev };

  for (const item of items) {
    const key = item.trait || item.emotion || item.value;
    const confidence = item.confidence || 0;

    const existing = out[key] || { avgConfidence: 0, count: 0 };
    const newAvg = (existing.avgConfidence * existing.count + confidence) / (existing.count + 1);
    out[key] = {
      avgConfidence: newAvg,
      count: existing.count + 1
    };
  }

  return out;
}

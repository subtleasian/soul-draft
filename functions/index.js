require("dotenv").config();
const functions = require("firebase-functions");
const OpenAI = require("openai");
const cors = require("cors")({ origin: true });

exports.extractIdentityNode = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { userReflection = "", selectedOption = "", journalText = "" } = req.body;

    if (!userReflection || userReflection.trim().length < 10) {
      return res.status(400).json({ error: "Missing or insufficient userReflection" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      // === STEP 1: Score heuristics + inference ===
      const fullAnalysis = await getHeuristicScores(openai, userReflection);
      const { inferred = {}, ...heuristicScores } = fullAnalysis;

      // === STEP 2: Calculate token reward ===
      const tokenReward = calculateTokenReward(heuristicScores);

      // === STEP 3: Generate follow-up prompt ===
      let followUpPrompt = "";
      try {
        const followUpRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: `
You are a warm, emotionally intelligent mentor.
Given the user's reflection, write a thoughtful follow-up question that invites them to explore more deeply.

Reflection:
"""${userReflection}"""

Return only the question.
              `.trim(),
            },
          ],
          temperature: 0.5,
        });
        followUpPrompt = followUpRes.choices[0].message.content.trim();
      } catch (err) {
        console.error("❌ Failed to generate follow-up prompt:", err.message);
      }

      // === STEP 4: Extract first sentence as excerpt ===
      const excerpt = getExcerpt(userReflection);
      console.log("🪙 Final tokenReward to return:", tokenReward);
      // === STEP 5: Final response object ===
      return res.status(200).json({
        heuristicScores,
        inferred,
        followUpPrompt,
        excerpt,
        tokenReward,
      });
    } catch (error) {
      console.error("🔥 Extraction or scoring failed:", error.message);
      return res.status(500).json({ error: "Failed to process identity insight" });
    }
  });
});

// === Helper: Heuristic Scoring ===
async function getHeuristicScores(openai, reflection) {
  const prompt = `You are an emotionally and cognitively intelligent AI. Your task is to evaluate a user's written reflection and return a structured JSON object scoring it across multiple dimensions of cognition, emotion, identity, language, and ethics.

Each score should range from 0.0 to 1.0 and reflect your best estimate of the degree to which that quality is present in the reflection.

You must also infer any traits, values, and emotions that are clearly expressed or implied by the user.

Reflection:
"""${reflection}"""

Return only valid JSON in the following format:

{
  "cognitive": {
    "conceptualComplexity": 0.0,
    "clarity": 0.0,
    "originality": 0.0,
    "criticalThinking": 0.0,
    "metaphorDensity": 0.0,
    "temporalReasoning": 0.0,
    "counterfactualThinking": 0.0
  },
  "emotional": {
    "emotionalGranularity": 0.0,
    "emotionalIntensity": 0.0,
    "polarityRange": 0.0,
    "emotionalRisk": 0.0,
    "empathy": 0.0,
    "selfCompassion": 0.0,
    "emotionalInversion": 0.0
  },
  "identity": {
    "selfInsight": 0.0,
    "valueSalience": 0.0,
    "agency": 0.0,
    "traitInferenceConfidence": 0.0
  },
  "linguistic": {
    "lexicalRichness": 0.0,
    "syntacticComplexity": 0.0,
    "fluency": 0.0,
    "verbosity": 0.0,
    "repetitiveness": 0.0
  },
  "socialEthical": {
    "moralReasoning": 0.0,
    "perspectiveTaking": 0.0,
    "culturalAwareness": 0.0,
    "socialDesirabilityBias": 0.0
  },
  "inferred": {
    "traits": [ { "trait": "example", "confidence": 0.0 } ],
    "values": [ { "value": "example", "confidence": 0.0 } ],
    "emotions": [ { "emotion": "example", "confidence": 0.0 } ]
  }
}`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const raw = res.choices[0].message.content.trim();
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "");
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Heuristic scoring failed:", err.message);
    return {};
  }
}

// === Helper: Token Reward Logic ===
function calculateTokenReward(scores = {}) {
  const values = [];
  for (const domain of Object.values(scores)) {
    if (domain && typeof domain === "object") {
      for (const value of Object.values(domain)) {
        if (typeof value === "number") values.push(value);
      }
    }
  }
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  return Math.round(avg * 20);
}

// === Helper: Extract Excerpt ===
function getExcerpt(text) {
  const sentences = text.match(/[^.!?]+[.!?]*/g);
  return (sentences && sentences.length) ? sentences[0].trim() : text.slice(0, 100);
}

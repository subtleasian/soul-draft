require("dotenv").config(); // Load env variables
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

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      // === STEP 1: Generate Identity Node ===
      const insightPrompt = `
You are a helpful therapist AI. Given the user reflection and optional journal text + selected option, extract **one** meaningful identity node.

This node should represent a value, belief, trait, emotion, goal, or tension that the user is exploring.

Avoid repeating exact words from the reflection. Rephrase or interpret in more abstract or insightful terms.

Use this schema:

{
  "label": "short rephrased phrase",
  "type": "value | belief | trait | emotion | goal | tension",
  "category": "Self | Career | Relationships | Emotions | etc.",
  "confidence": number (0.0 - 1.0),
  "origin": {
    "excerpt": "exact sentence or short phrase from the reflection"
  }
}

Context:
- Journal entry: """${journalText}"""
- Selected option (if any): "${selectedOption}"
- User reflection: """${userReflection}"""

Return exactly one JSON object using the schema above. No explanation.
`;

      const insightRes = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: insightPrompt }],
        temperature: 0.4,
      });

      let content = insightRes.choices[0].message.content.trim();
      content = content.replace(/^```json\s*/i, "").replace(/```$/, "");

      // ✅ Add these logs here:
      console.log("🧠 GPT raw response:", insightRes.choices[0].message.content);
      console.log("🧼 Cleaned JSON:", content);
      try {
        console.log("✅ Parsed result:", JSON.parse(content));
      } catch (err) {
        console.error("❌ Failed to parse OpenAI content:", err.message);
      }

      content = insightRes.choices[0].message.content.trim();
      content = content.replace(/^```json\s*/i, "").replace(/```$/, "");

      console.log("🧠 GPT raw response:", insightRes.choices[0].message.content);
      console.log("🧼 Cleaned JSON:", content);

      let parsed;
      try {
        parsed = JSON.parse(content);
        console.log("✅ Parsed result:", parsed);
      } catch (err) {
        console.error("❌ Failed to parse OpenAI content:", err.message);
        return res.status(500).json({ error: "Failed to parse OpenAI response" });
      }

      const identityNode = Array.isArray(parsed) ? parsed[0] : parsed;

      if (!identityNode || typeof identityNode !== "object") {
        console.error("❌ No usable identity node found:", parsed);
        return res.status(500).json({ error: "No identity node returned" });
      }



      // === STEP 2: Score for Heuristics ===
      const heuristicScores = await getHeuristicScores(openai, userReflection);

      // === STEP 3: Calculate Token Reward ===
      const tokenReward = calculateTokenReward(heuristicScores);

      // === STEP 4: Combine into one node ===
      const enrichedNode = {
        ...identityNode,
        heuristicScores,
        tokenReward,
        reviewedByUser: false,
        status: getStatusByConfidence(identityNode.confidence),
        origin: {
          excerpt: identityNode.origin?.excerpt || "",
          selectedOption,
          reflection: userReflection,
          journalEntry: journalText,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("✅ Final enriched node:", enrichedNode);
      
      let followUpPrompt = null;
      try {
        const followUpRes = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "user",
            content: `
      You are a warm, emotionally intelligent mentor.
      Given the user's reflection, write a thoughtful follow-up question that invites the user to explore their emotions, beliefs, or past experiences more deeply.

      Reflection:
      """${userReflection}"""

      Return only the question. No preamble or extra words.
            `.trim()
          }],
          temperature: 0.5
        });

        followUpPrompt = followUpRes.choices[0].message.content.trim();
        console.log("🧠 Follow-up question generated:", followUpPrompt);
      } catch (error) {
        console.error("❌ Failed to generate follow-up prompt:", error.message);
      }

      return res.status(200).json({
        identityNode: enrichedNode,
        followUpPrompt
      });

return res.status(200).json({ 
    identityNode: enrichedNode,
    followUpPrompt: followUpQuestion
  });

    } catch (error) {
      console.error("🔥 Extraction or scoring failed:", error.message);
      return res.status(500).json({ error: "Failed to generate identity node" });
    }
  });
});


// === Helper: Heuristic Scoring ===
async function getHeuristicScores(openai, reflection) {
  const prompt = `You are an emotionally and cognitively intelligent AI. Your task is to evaluate a user's written reflection and return a structured JSON object scoring it across multiple dimensions of cognition, emotion, identity, language, and ethics.

Each score should range from 0.0 to 1.0 and reflect your best estimate of the degree to which that quality is present in the reflection.

You must also infer any traits, values, and emotions that are clearly expressed or implied by the user.

Reflection:
"""
{{user_input_text}}
"""

Return only valid JSON in the following format:

{
  "cognitive": {
    "conceptualComplexity": 0.0,
    "clarity": 0.0,
    "originality": 0.0,
    "criticalThinking": 0.0,,
    "metaphorDensity": 0.0,
    temporalReasoning: 0.0,
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
    "traits": ["example_trait_1", "example_trait_2"],
    "values": ["example_value_1", "example_value_2"],
    "emotions": ["example_emotion_1", "example_emotion_2"]
  }
}

Guidance:
- Traits might include: curiosity, discipline, vulnerability, ambition, patience, etc.
- Values might include: honesty, growth, family, independence, justice, loyalty, etc.
- Emotions might include: anxiety, excitement, joy, guilt, confusion, pride, etc.
- If something is not clearly present in the reflection, leave it blank or assign a low score.
- Do not infer or fabricate if the reflection is too short or vague — be conservative in your scoring.
- Output nothing but the JSON response.`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
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
function calculateTokenReward(scores) {
  if (!scores || !scores.emotional || !scores.cognitive || !scores.engagement) return 0;

  const {
    emotional: { selfDisclosure = 0, intensity = 0 },
    cognitive: { conceptualComplexity = 0 },
    engagement: { lengthScore = 0 },
  } = scores;

  const weightedScore =
    0.4 * selfDisclosure +
    0.3 * intensity +
    0.2 * conceptualComplexity +
    0.1 * lengthScore;

  return Math.round(weightedScore * 100);
}

// === Helper: Confidence to Status ===
function getStatusByConfidence(confidence) {
  if (confidence >= 0.75) return "confirmed";
  if (confidence >= 0.4) return "suggested";
  return "dismissed";
}

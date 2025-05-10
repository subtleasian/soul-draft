require("dotenv").config(); // Load env variables
const functions = require("firebase-functions");
const OpenAI = require("openai");
const cors = require("cors")({ origin: true });

exports.extractIdentityNodes = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { journalText, userReflection = "", selectedOption = "" } = req.body;

    if (!journalText) {
      return res.status(400).json({ error: "Missing journalText" });
    }

    // ✅ Initialize OpenAI safely here
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a helpful mentor and therapist that extracts self-knowledge insights from journaling.

Given the following journal entry and optional user reflection + selected option, extract up to 5 "identity nodes." Each node should be a meaningful piece of self-knowledge, categorized as a value, belief, trait, emotion, goal, or tension.

Use this exact schema for each node:

{
  "label": "short phrase",
  "type": "value | belief | trait | emotion | goal | tension",
  "category": "Self | Career | Relationships | Spirituality | etc.",
  "confidence": number (0.0 - 1.0),
  "origin": {
    "excerpt": "exact sentence or short phrase from the entry"
  }
}

Context:
- Journal entry: """${journalText}"""
- Selected option (if any): "${selectedOption}"
- User reflection (if any): """${userReflection}"""

Return only a valid JSON array.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });

      let content = response.choices[0].message.content;
      content = content.trim().replace(/^```json\s*/i, "").replace(/```$/, "");

      const identityNodes = JSON.parse(content);

      return res.status(200).json({ identityNodes });
    } catch (error) {
      console.error("OpenAI error:", error.message);
      console.error("Full error:", error);
      return res.status(500).json({ error: "Failed to extract identity nodes" });
    }
  });
});

require("dotenv").config();

const functions = require("firebase-functions");
const OpenAI = require("openai");
const cors = require("cors")({ origin: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.extractIdentityNodes = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { journalText } = req.body;
    if (!journalText) {
      return res.status(400).json({ error: "Missing journalText" });
    }

    const prompt = `
You are a helpful assistant that extracts self-knowledge insights from journaling.

Given the following journal entry, extract up to 5 "identity nodes." Each node should be a meaningful piece of self-knowledge, categorized as a value, belief, trait, emotion, goal, or tension. Use this schema:

{
  "label": "short phrase",
  "type": "value | belief | trait | emotion | goal | tension",
  "category": "Self | Career | Relationships | Spirituality | etc.",
  "confidence": number (0.0 - 1.0),
  "origin": {
    "excerpt": "exact sentence or short phrase from the entry"
  }
}

Journal entry:
"""
${journalText}
"""

Return only a JSON array.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });

      let content = response.choices[0].message.content;
      // Strip Markdown code block formatting if present
      content = content.trim().replace(/^```json\s*/i, "").replace(/```$/, "");

      const identityNodes = JSON.parse(content);

      return res.status(200).json({ identityNodes });
    } catch (error) {
      console.error("OpenAI error:", error.message);
      return res.status(500).json({ error: "Failed to extract identity nodes" });
    }
  });
});

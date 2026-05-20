const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const EMBEDDING_MODEL = "text-embedding-004";
const CHAT_MODEL = "gemini-2.0-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch(
    `${BASE_URL}/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
      }),
    }
  );
  if (!res.ok) throw new Error(`Embedding API error: ${res.status}`);
  const data = await res.json();
  return data.embedding?.values || [];
}

export async function chatWithContext(
  userMessage: string,
  context: string,
  sources: { name: string; slug: string }[]
): Promise<string> {
  const systemPrompt = `You are a Bangladesh medication assistant. Answer ONLY using the drug data provided below.

RULES:
- If the data doesn't contain the answer, say "I don't have enough information about that in our database."
- Never recommend a specific dosage or give medical advice.
- Always end with: "This information is for educational purposes only. Consult your doctor."
- Reply in the same language the user wrote in (Bengali or English).
- Cite the drug name as source when possible.
- Keep answers concise and factual.

DRUG DATA:
${context}`;

  const res = await fetch(
    `${BASE_URL}/models/${CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
}

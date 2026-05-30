const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.Groq_API_Key || "";
const EMBEDDING_MODEL = "gemini-embedding-001";
const CHAT_MODEL = "llama-3.3-70b-versatile";
const GROQ_BASE = "https://api.groq.com/openai/v1";

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    }
  );
  if (!res.ok) throw new Error(`Embedding API error: ${res.status}`);
  const data = await res.json();
  return data.embedding?.values || [];
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

async function groqChat(messages: { role: string; content: string }[], stream = false) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 500,
      stream,
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("429");
    throw new Error(`Groq API error: ${res.status}`);
  }
  return res;
}

export async function chatWithContext(
  history: ChatMessage[],
  context: string,
  _sources: { name: string; slug: string }[],
  isPriceQuery = false
): Promise<string> {
  const systemPrompt = makeSystemPrompt(context, isPriceQuery);
  const res = await groqChat([{ role: "system", content: systemPrompt }, ...history]);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "I couldn't generate a response.";
}

export async function* chatWithContextStream(
  history: ChatMessage[],
  context: string,
  _sources: { name: string; slug: string }[],
  isPriceQuery = false
): AsyncGenerator<string> {
  const systemPrompt = makeSystemPrompt(context, isPriceQuery);
  const res = await groqChat([{ role: "system", content: systemPrompt }, ...history], true);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ") && !line.includes("[DONE]")) {
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices?.[0]?.delta?.content || "";
          if (content) yield content;
        } catch {}
      }
    }
  }
}

function makeSystemPrompt(context: string, isPriceQuery: boolean): string {
  if (isPriceQuery && context) {
    return context;
  }

  const base = `You are a health assistant.

RULES:
- Answer ONLY health, medical, biology, diet, nutrition, food, workout, wellness questions.
- For any other question, say: "I can only help with health and medical questions."
- For Bangladesh medicines (Napa, Fexo, Seclo, etc.), explain what the brand is.
- Be short and direct. No greetings. No filler.
- Remember the conversation context. Refer back to previous messages when relevant.
- Only add a disclaimer when discussing serious symptoms or treatments.`;

  if (!context) return base;

  return `${base}

DATABASE REFERENCE:
${context}`;
}

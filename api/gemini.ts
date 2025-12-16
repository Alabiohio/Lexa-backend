import type { VercelRequest, VercelResponse } from "@vercel/node";

const model = "gemini-2.5-flash";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEYS[i]}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: message }],
              },
            ],
          }),
        }
      );

      // 🔁 rotate only for key / quota issues
      if ([401, 403, 429, 500].includes(response.status)) {
        continue;
      }

      if (!response.ok) {
        return res.status(response.status).json({
          error: "Invalid request",
        });
      }

      const data = await response.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        return res.status(200).json({ reply });
      }

    } catch {
      continue;
    }
  }

  return res.status(503).json({
    error: "All AI providers unavailable",
  });
}

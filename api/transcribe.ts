import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import FormData from "form-data";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Expo sends multipart/form-data → Vercel parses it automatically
    const file = (req as any).files?.audio;

    if (!file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    const elevenForm = new FormData();
    elevenForm.append("file", file.data, {
      filename: file.name || "voice.m4a",
      contentType: file.mimetype,
    });
    elevenForm.append("model_id", "scribe_v1");
    elevenForm.append("language", "en");

    const elevenRes = await axios.post(
      "https://api.elevenlabs.io/v1/speech-to-text",
      elevenForm,
      {
        headers: {
          ...elevenForm.getHeaders(),
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        timeout: 60000,
      }
    );

    return res.status(200).json({
      transcription: elevenRes.data.text,
    });
  } catch (err: any) {
    console.error("ElevenLabs STT error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Transcription failed" });
  }
}

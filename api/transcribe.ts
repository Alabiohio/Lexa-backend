import type { VercelRequest, VercelResponse } from "@vercel/node";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const upload = multer({ dest: "/tmp" });

export const config = {
  api: {
    bodyParser: false, // REQUIRED for multer
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  upload.single("audio")(req as any, res as any, async (err: any) => {
    if (err) {
      return res.status(400).json({ error: "Upload failed" });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    try {
      const formData = new FormData();
      formData.append(
        "audio",
        fs.createReadStream(file.path),
        file.originalname
      );
      formData.append("model", "large");
      formData.append("language", "en");

      const gladiaRes = await axios.post(
        "https://api.gladia.io/audio/text/audio-transcription/",
        formData,
        {
          headers: {
            "x-gladia-key": process.env.GLADIA_API_KEY!,
            ...formData.getHeaders(),
          },
          timeout: 60_000,
        }
      );

      fs.unlinkSync(file.path);

      const transcription =
        gladiaRes.data.transcription ||
        gladiaRes.data.result?.transcription ||
        "";

      return res.status(200).json({ transcription });
    } catch (e: any) {
      console.error("Gladia error:", e.response?.data || e.message);
      return res.status(500).json({ error: "Transcription failed" });
    }
  });
}

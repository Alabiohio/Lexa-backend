import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import fs from "fs";

export async function transcribeWithElevenLabs(filePath: string) {
  // Initialize ElevenLabs client with your API key
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY!,
    environment: "https://api.elevenlabs.io",
  });

  try {
    // Read audio file into a buffer
    const audioFile = fs.readFileSync(filePath);

    // Send to ElevenLabs speech-to-text
    const result = await client.speechToText.convert({
      file: audioFile,           // required
      modelId: "scribe_v2",       // recommended STT model
      languageCode: "en",         // ISO 639-1 (optional, can auto-detect)
    });

    console.log("Transcription text:", result.text);
    return result.text ?? "";
  } catch (error) {
    console.error("ElevenLabs STT errors:", error);
    throw error;
  }
}

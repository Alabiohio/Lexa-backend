import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import fs from "fs";

export async function transcribeWithElevenLabs(filePath: string) {
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY!,
    environment: "https://api.elevenlabs.io",
  });

  const audioBuffer = fs.readFileSync(filePath);

  const response = await client.speechToText.convert({
    file: audioBuffer,
    modelId: "scribe_v2",
    languageCode: "en",
  });

  // Access transcription correctly
  const transcription =
    (response as any).result?.transcription ?? "Could not transcribe audio";

  return transcription;
}

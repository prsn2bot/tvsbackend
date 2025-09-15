import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEYS } from "./env";

const modelId = "gemini-2.0-flash";
const config = {
  responseMimeType: "text/plain",
  // System instruction moved out of contents array
};

let currentKeyIndex = 0;

function getNextGeminiApiKey() {
  if (!GEMINI_API_KEYS.length) throw new Error("No Gemini API keys configured");
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

// Factory function to get a new GoogleGenAI instance with the next key
function getAiInstance() {
  return new GoogleGenAI({
    apiKey: getNextGeminiApiKey(),
  });
}

export { getAiInstance, modelId, config };

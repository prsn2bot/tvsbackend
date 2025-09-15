"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.modelId = exports.getAiInstance = void 0;
const genai_1 = require("@google/genai");
const env_1 = require("./env");
const modelId = "gemini-2.0-flash";
exports.modelId = modelId;
const config = {
    responseMimeType: "text/plain",
    // System instruction moved out of contents array
};
exports.config = config;
let currentKeyIndex = 0;
function getNextGeminiApiKey() {
    if (!env_1.GEMINI_API_KEYS.length)
        throw new Error("No Gemini API keys configured");
    const key = env_1.GEMINI_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % env_1.GEMINI_API_KEYS.length;
    return key;
}
// Factory function to get a new GoogleGenAI instance with the next key
function getAiInstance() {
    return new genai_1.GoogleGenAI({
        apiKey: getNextGeminiApiKey(),
    });
}
exports.getAiInstance = getAiInstance;
//# sourceMappingURL=ai.js.map
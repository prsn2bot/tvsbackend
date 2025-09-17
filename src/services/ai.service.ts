import logger from "../utils/logger";

/**
 * Result interface for AI draft generation
 */
export interface AiResult {
  draftContent: string;
  defenceScore: number;
  confidenceScore: number;
}

import { getAiInstance } from "../config/ai";

/**
 * Configuration for retry logic
 */
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second

/**
 * Retry function with exponential backoff for rate limiting
 */
async function callApiWithRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.code === 429 || error.status === 429)) {
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, MAX_RETRIES - retries);
      logger.warn(
        `Rate limit hit. Retrying in ${delay}ms... (Retries left: ${retries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callApiWithRetry(fn, retries - 1);
    } else {
      throw error;
    }
  }
}

/**
 * Generates a defence draft using AI based on the provided text.
 * Uses Google Gemini AI with proper error handling and retry logic.
 *
 * @param text - The extracted OCR text from the document
 * @returns Promise<AiResult> - The generated draft with scores
 */
export const generateDraftWithAI = async (text: string): Promise<AiResult> => {
  logger.info(`Sending text to AI for draft generation...`);

  try {
    const config = {
      responseMimeType: "text/plain",
      systemInstruction: [
        {
          text: `You are a professional legal assistant specializing in government officer defence drafting. Your task is to analyze the provided document text and generate a comprehensive defence response.

Writing Style Instructions:
- Write like a confident, experienced legal professional speaking to another professional
- Avoid robotic phrases like 'in today's fast-paced world', 'leveraging synergies', or 'furthermore'
- Skip unnecessary dashes (—), quotation marks (""), and corporate buzzwords
- No AI tone. No fluff. No filler
- Use natural transitions like 'here's the thing', 'let's break it down', or 'what this really means is…'
- Keep sentences varied in length and rhythm, like how real people speak or write
- Prioritize clarity, professionalism, and legal accuracy

Your task:
1. Analyze the provided document text for key allegations and facts
2. Generate a professional defence response that addresses all major points
3. Include specific references to procedures, regulations, and evidence
4. Provide a defence score (0-100) based on strength of the case
5. Provide a confidence score (0-100) based on completeness of information

Return the response in this exact JSON format:
{
  "draftContent": "The full defence draft text here...",
  "defenceScore": 85.5,
  "confidenceScore": 92.1
}

Do NOT include any additional text, explanations, or formatting outside this JSON structure.`,
        },
      ],
    };

    const model = "gemini-2.0-flash";
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `Please analyze this document and generate a defence draft:\n\n${text}`,
          },
        ],
      },
    ];

    const response = await callApiWithRetry(() =>
      getAiInstance().models.generateContentStream({
        model,
        config,
        contents,
      })
    );

    let finalText = "";
    for await (const chunk of response) {
      finalText += chunk.text;
    }

    // Clean up the response
    const cleanedText = finalText.trim();

    if (!cleanedText) {
      throw new Error("Empty response from AI model.");
    }

    // Clean the response by removing markdown code blocks if present
    let jsonText = cleanedText;
    if (cleanedText.startsWith("```json")) {
      jsonText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      jsonText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parse the JSON response
    try {
      const result = JSON.parse(jsonText);

      // Validate the response structure
      if (
        !result.draftContent ||
        typeof result.defenceScore !== "number" ||
        typeof result.confidenceScore !== "number"
      ) {
        throw new Error("Invalid response structure from AI model");
      }

      logger.info(`AI draft generation completed successfully`);
      return {
        draftContent: result.draftContent,
        defenceScore: Math.max(0, Math.min(100, result.defenceScore)), // Clamp between 0-100
        confidenceScore: Math.max(0, Math.min(100, result.confidenceScore)), // Clamp between 0-100
      };
    } catch (parseError) {
      logger.error(`Failed to parse AI response:`, parseError);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    logger.error(`Failed to generate AI draft:`, error);
    throw new Error("AI draft generation failed");
  }
};

/**
 * Creates a vector embedding for the given text.
 * This is used for semantic search and similarity matching.
 * This is a mock service. In a real application, you would use an embedding model
 * like OpenAI's text-embedding-ada-002 or similar.
 *
 * @param text - The text to create embeddings for
 * @returns Promise<number[]> - The vector embedding array
 */
export const createVectorEmbedding = async (
  text: string
): Promise<number[]> => {
  logger.info(`Creating vector embedding for text...`);

  try {
    // MOCK LOGIC: Simulate an API call to an embedding model
    // In production, you would:
    // 1. Use an embedding service (OpenAI, Cohere, etc.)
    // 2. Send the text to generate embeddings
    // 3. Return the vector array

    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate embedding generation time

    // Return a mock 1536-dimensional vector (similar to OpenAI's ada-002)
    // In reality, this would be the actual embedding from your AI service
    const mockEmbedding = Array(1536)
      .fill(0)
      .map(() => Math.random() * 2 - 1);

    logger.info(`Vector embedding created successfully`);
    return mockEmbedding;
  } catch (error) {
    logger.error(`Failed to create vector embedding:`, error);
    throw new Error("Vector embedding creation failed");
  }
};

import logger from "../utils/logger";

/**
 * Extracts OCR text from a document stored in Cloudinary.
 * This is a mock service. In a real application, you would use the Cloudinary SDK
 * and their OCR add-on to extract text from the uploaded document.
 *
 * @param publicId - The Cloudinary public ID of the uploaded document
 * @returns Promise<string> - The extracted text from the document
 */
export const getOcrTextFromCloudinary = async (
  publicId: string
): Promise<string> => {
  logger.info(`Extracting OCR text for Cloudinary ID: ${publicId}`);

  try {
    // MOCK LOGIC: Simulate an API call to Cloudinary's OCR add-on
    // In production, you would:
    // 1. Use Cloudinary SDK to call their OCR API
    // 2. Handle authentication with your Cloudinary credentials
    // 3. Process the response to extract the text

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

    // Mock OCR result - in reality this would come from Cloudinary's OCR service
    const mockOcrText = `This is the extracted text from the document with public ID ${publicId}.
The main allegation is undue favoritism in the procurement process.
The officer has been accused of showing preferential treatment to certain vendors.
Evidence suggests that the bidding process was not conducted fairly.
The defence argues that all procedures were followed according to established guidelines.
Supporting documents include procurement records, vendor communications, and audit reports.`;

    logger.info(`OCR text extraction completed for ${publicId}`);
    return mockOcrText;
  } catch (error) {
    logger.error(`Failed to extract OCR text for ${publicId}:`, error);
    throw new Error(`OCR extraction failed for document ${publicId}`);
  }
};

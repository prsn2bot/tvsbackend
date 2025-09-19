import { OcrResult, OcrOptions, OcrMethod, OcrError } from "./types/ocr.types";
import { ocrConfig } from "./ocrConfig";
import logger from "../../utils/logger";

export class OcrOrchestrator {
  private defaultOptions: OcrOptions;

  constructor() {
    const config = ocrConfig.getConfiguration();
    this.defaultOptions = {
      enablePdfExtraction: config.pdf_extraction_enabled,
      enableTesseractOcr: config.tesseract_enabled,
      enableCloudinaryFallback: config.cloudinary_fallback_enabled,
      timeout: config.default_timeout,
      retryAttempts: config.max_retry_attempts,
    };
  }

  /**
   * Main OCR processing method that coordinates between different OCR approaches
   * @param documentUrl - URL or path to the document to process
   * @param options - OCR processing options
   * @returns Promise<OcrResult> - The extracted text and metadata
   */
  public async extractText(
    documentUrl: string,
    options: Partial<OcrOptions> = {}
  ): Promise<OcrResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    logger.info(`Starting OCR extraction for document: ${documentUrl}`);

    // Validate configuration
    if (!ocrConfig.validateConfiguration()) {
      throw new OcrError(
        "Invalid OCR configuration",
        "pdf-extraction",
        undefined,
        false
      );
    }

    // Determine document type and processing strategy
    const documentType = this.getDocumentType(documentUrl);
    const processingChain = this.buildProcessingChain(
      documentType,
      mergedOptions
    );

    if (processingChain.length === 0) {
      throw new OcrError(
        "No OCR methods available",
        "pdf-extraction",
        undefined,
        false
      );
    }

    // Execute OCR processing chain with fallback
    let lastError: Error | undefined;

    for (const method of processingChain) {
      try {
        logger.info(`Attempting OCR extraction using method: ${method}`);
        const result = await this.executeOcrMethod(
          method,
          documentUrl,
          mergedOptions
        );

        const processingTime = Date.now() - startTime;
        logger.info(
          `OCR extraction successful using ${method} in ${processingTime}ms`
        );

        return {
          ...result,
          method,
          processingTime,
        };
      } catch (error) {
        lastError = error as Error;
        logger.warn(`OCR method ${method} failed: ${lastError.message}`);

        // If this is a non-retryable error, don't try other methods
        if (error instanceof OcrError && !error.retryable) {
          break;
        }
      }
    }

    // All methods failed
    const processingTime = Date.now() - startTime;
    throw new OcrError(
      `All OCR methods failed. Last error: ${lastError?.message}`,
      processingChain[processingChain.length - 1],
      lastError,
      false
    );
  }

  private getDocumentType(documentUrl: string): "pdf" | "image" | "unknown" {
    const extension = documentUrl.toLowerCase().split(".").pop();

    if (extension === "pdf") {
      return "pdf";
    } else if (
      ["jpg", "jpeg", "png", "tiff", "bmp", "webp"].includes(extension || "")
    ) {
      return "image";
    }

    return "unknown";
  }

  private buildProcessingChain(
    documentType: "pdf" | "image" | "unknown",
    options: OcrOptions
  ): OcrMethod[] {
    const chain: OcrMethod[] = [];

    if (documentType === "pdf" && options.enablePdfExtraction) {
      chain.push("pdf-extraction");
    }

    if (options.enableTesseractOcr) {
      chain.push("tesseract-ocr");
    }

    if (options.enableCloudinaryFallback) {
      chain.push("cloudinary-fallback");
    }

    return chain;
  }

  private async executeOcrMethod(
    method: OcrMethod,
    documentUrl: string,
    options: OcrOptions
  ): Promise<Omit<OcrResult, "method" | "processingTime">> {
    const { pdfExtractor } = await import("./pdfExtractor.service");
    const { tesseractOcr } = await import("./tesseractOcr.service");
    const { getOcrTextFromCloudinary } = await import("../cloudinary.service");
    const { pdfToImageConverter } = await import(
      "./pdfToImageConverter.service"
    );

    switch (method) {
      case "pdf-extraction":
        return await this.executePdfExtraction(
          documentUrl,
          options,
          pdfExtractor,
          pdfToImageConverter,
          tesseractOcr
        );

      case "tesseract-ocr":
        return await this.executeTesseractOcr(
          documentUrl,
          options,
          tesseractOcr
        );

      case "cloudinary-fallback":
        return await this.executeCloudinaryFallback(
          documentUrl,
          getOcrTextFromCloudinary
        );

      default:
        throw new OcrError(
          `Unknown OCR method: ${method}`,
          method,
          undefined,
          false
        );
    }
  }

  private async executePdfExtraction(
    documentUrl: string,
    options: OcrOptions,
    pdfExtractor: any,
    pdfToImageConverter: any,
    tesseractOcr: any
  ): Promise<Omit<OcrResult, "method" | "processingTime">> {
    try {
      // First attempt: Extract native text from PDF
      const pdfResult = await pdfExtractor.extractText(documentUrl, {
        qualityThreshold: 0.5,
        enableFallbackRendering: false,
      });

      // Check if we got good quality text
      if (pdfResult.text.length > 50 && pdfResult.hasSelectableText) {
        return {
          text: pdfResult.text,
          confidence: 0.9, // High confidence for native PDF text
          metadata: {
            pageCount: pdfResult.pageCount,
            processingSteps: ["pdf-native-text-extraction"],
          },
        };
      }

      // Fallback: Convert PDF to images and use Tesseract OCR
      logger.info("PDF has minimal text, attempting image conversion + OCR");

      const conversionResult = await pdfToImageConverter.convertPdfToImages(
        documentUrl,
        {
          dpi: 150,
          format: "png",
          maxPages: 5, // Limit to first 5 pages for performance
        }
      );

      const ocrResults: string[] = [];
      let totalConfidence = 0;

      for (const page of conversionResult.pages) {
        try {
          const tesseractResult = await tesseractOcr.recognizeBuffer(
            page.imageBuffer
          );
          if (tesseractResult.text.trim().length > 0) {
            ocrResults.push(tesseractResult.text);
            totalConfidence += tesseractResult.confidence;
          }
        } catch (error) {
          logger.warn(`Failed to OCR page ${page.pageNumber}:`, error);
        }
      }

      const combinedText = ocrResults.join("\n\n");
      const averageConfidence =
        ocrResults.length > 0 ? totalConfidence / ocrResults.length : 0;

      return {
        text: combinedText,
        confidence: averageConfidence,
        metadata: {
          pageCount: conversionResult.totalPages,
          imageCount: conversionResult.pages.length,
          processingSteps: ["pdf-to-image-conversion", "tesseract-ocr"],
        },
      };
    } catch (error) {
      throw new OcrError(
        `PDF extraction failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "pdf-extraction",
        error instanceof Error ? error : undefined
      );
    }
  }

  private async executeTesseractOcr(
    documentUrl: string,
    options: OcrOptions,
    tesseractOcr: any
  ): Promise<Omit<OcrResult, "method" | "processingTime">> {
    try {
      // Use Tesseract with fallback for better accuracy
      const result = await tesseractOcr.preprocessAndRecognize(documentUrl, {
        enhanceContrast: true,
        removeNoise: true,
      });

      return {
        text: result.text,
        confidence: result.confidence,
        metadata: {
          processingSteps: ["tesseract-ocr-with-preprocessing"],
        },
      };
    } catch (error) {
      throw new OcrError(
        `Tesseract OCR failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "tesseract-ocr",
        error instanceof Error ? error : undefined
      );
    }
  }

  private async executeCloudinaryFallback(
    documentUrl: string,
    getOcrTextFromCloudinary: any
  ): Promise<Omit<OcrResult, "method" | "processingTime">> {
    try {
      // Extract public ID from Cloudinary URL or use the URL directly
      const publicId = this.extractCloudinaryPublicId(documentUrl);
      const text = await getOcrTextFromCloudinary(publicId);

      return {
        text: text,
        confidence: 0.8, // Assume good confidence for Cloudinary OCR
        metadata: {
          processingSteps: ["cloudinary-ocr-service"],
        },
      };
    } catch (error) {
      throw new OcrError(
        `Cloudinary OCR failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "cloudinary-fallback",
        error instanceof Error ? error : undefined
      );
    }
  }

  private extractCloudinaryPublicId(documentUrl: string): string {
    // If it's already a public ID, return as is
    if (!documentUrl.includes("/") && !documentUrl.includes("http")) {
      return documentUrl;
    }

    // Extract public ID from Cloudinary URL
    const urlParts = documentUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      // Skip version if present (starts with 'v' followed by numbers)
      let publicIdIndex = uploadIndex + 1;
      if (urlParts[publicIdIndex].match(/^v\d+$/)) {
        publicIdIndex++;
      }

      // Join remaining parts and remove file extension
      const publicIdWithExt = urlParts.slice(publicIdIndex).join("/");
      return publicIdWithExt.replace(/\.[^/.]+$/, ""); // Remove extension
    }

    // Fallback: use the URL as is
    return documentUrl;
  }

  /**
   * Processes a document with performance monitoring and quality assessment
   */
  async processDocumentWithMetrics(
    documentUrl: string,
    options: Partial<OcrOptions> = {}
  ): Promise<OcrResult & { qualityAssessment: any; performanceMetrics: any }> {
    const startTime = Date.now();
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      const result = await this.extractText(documentUrl, mergedOptions);

      // Import quality assessment utility
      const { assessTextQuality } = await import("./utils/ocrUtils");
      const qualityAssessment = assessTextQuality(
        result.text,
        result.confidence
      );

      const performanceMetrics = {
        totalProcessingTime: result.processingTime,
        method: result.method,
        confidence: result.confidence,
        textLength: result.text.length,
        qualityScore: qualityAssessment.estimatedAccuracy,
        timestamp: new Date(),
      };

      logger.info("Document processing completed with metrics", {
        method: result.method,
        processingTime: result.processingTime,
        textLength: result.text.length,
        confidence: result.confidence,
      });

      return {
        ...result,
        qualityAssessment,
        performanceMetrics,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error("Document processing failed", {
        documentUrl,
        processingTime,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Batch processes multiple documents
   */
  async processDocumentsBatch(
    documentUrls: string[],
    options: Partial<OcrOptions> = {}
  ): Promise<
    Array<{
      documentUrl: string;
      result?: OcrResult;
      error?: Error;
    }>
  > {
    logger.info(
      `Starting batch processing of ${documentUrls.length} documents`
    );

    const results = await Promise.allSettled(
      documentUrls.map(async (url) => {
        try {
          const result = await this.extractText(url, options);
          return { documentUrl: url, result };
        } catch (error) {
          return { documentUrl: url, error: error as Error };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          documentUrl: documentUrls[index],
          error: result.reason,
        };
      }
    });
  }

  /**
   * Gets processing statistics and health metrics
   */
  getProcessingStats(): {
    configurationStatus: any;
    availableMethods: OcrMethod[];
    systemHealth: "healthy" | "degraded" | "unhealthy";
  } {
    const config = ocrConfig.getConfiguration();
    const availableMethods: OcrMethod[] = [];

    if (config.pdf_extraction_enabled) {
      availableMethods.push("pdf-extraction");
    }
    if (config.tesseract_enabled) {
      availableMethods.push("tesseract-ocr");
    }
    if (config.cloudinary_fallback_enabled) {
      availableMethods.push("cloudinary-fallback");
    }

    let systemHealth: "healthy" | "degraded" | "unhealthy" = "healthy";

    if (availableMethods.length === 0) {
      systemHealth = "unhealthy";
    } else if (availableMethods.length === 1) {
      systemHealth = "degraded";
    }

    return {
      configurationStatus: config,
      availableMethods,
      systemHealth,
    };
  }
}

// Export singleton instance
export const ocrOrchestrator = new OcrOrchestrator();

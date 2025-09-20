import Tesseract from "tesseract.js";
import {
  TesseractResult,
  TesseractOptions,
  OcrMethod,
} from "./types/ocr.types";
import {
  EnhancedOcrError,
  OcrErrorFactory,
  OCR_ERROR_CODES,
  withErrorHandling,
} from "./utils/errorHandling";
import {
  sanitizeExtractedText,
  assessTextQuality,
  getDocumentType,
} from "./utils/ocrUtils";
import { ocrConfig } from "./ocrConfig";
import logger from "../../utils/logger";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import os from "os";

export class TesseractOcrService {
  private readonly method: OcrMethod = "tesseract-ocr";
  private worker: Tesseract.Worker | null = null;

  constructor() {
    this.initializeWorker();
  }

  /**
   * Initializes Tesseract worker with configuration
   */
  private async initializeWorker(): Promise<void> {
    try {
      const config = ocrConfig.getConfiguration();

      this.worker = await Tesseract.createWorker(config.tesseract_language, 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            logger.debug(
              `Tesseract progress: ${Math.round(m.progress * 100)}%`
            );
          }
        },
        errorHandler: (err: any) => {
          logger.error("Tesseract worker error:", err);
        },
      });

      // Configure OCR parameters
      await this.worker.setParameters({
        tessedit_ocr_engine_mode:
          config.tesseract_engine_mode === "OEM_LSTM_ONLY"
            ? Tesseract.OEM.LSTM_ONLY
            : Tesseract.OEM.TESSERACT_LSTM_COMBINED,
        tessedit_pageseg_mode: Tesseract.PSM.AUTO as any,
      });

      logger.info("Tesseract worker initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Tesseract worker:", error);
      throw new EnhancedOcrError(
        "Failed to initialize Tesseract OCR worker",
        this.method,
        OCR_ERROR_CODES.PROCESSING_FAILED,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Performs OCR on an image file
   */
  async recognizeText(
    filePath: string,
    options: Partial<TesseractOptions> = {}
  ): Promise<TesseractResult> {
    const startTime = Date.now();

    return withErrorHandling(
      async () => {
        logger.info(`Starting Tesseract OCR for: ${filePath}`);

        // Validate file
        await this.validateFile(filePath);

        // Ensure worker is ready
        if (!this.worker) {
          await this.initializeWorker();
        }

        // Configure worker for this recognition
        await this.configureWorker(options);

        try {
          // Perform OCR recognition
          const result = await this.worker!.recognize(filePath);

          const processingTime = Date.now() - startTime;
          const sanitizedText = sanitizeExtractedText(result.data.text);

          logger.info(
            `Tesseract OCR completed: ${sanitizedText.length} characters, confidence: ${result.data.confidence}%`
          );

          return {
            text: sanitizedText,
            confidence: result.data.confidence / 100, // Convert to 0-1 scale
            processingTime,
          };
        } catch (error) {
          logger.error(`Tesseract OCR failed for ${filePath}:`, error);

          if (error instanceof Error && error.message.includes("timeout")) {
            throw OcrErrorFactory.createProcessingError(
              this.method,
              OCR_ERROR_CODES.TIMEOUT,
              { filePath, processingTime: Date.now() - startTime },
              error
            );
          }

          throw OcrErrorFactory.createProcessingError(
            this.method,
            OCR_ERROR_CODES.PROCESSING_FAILED,
            { filePath, processingTime: Date.now() - startTime },
            error instanceof Error ? error : new Error(String(error))
          );
        }
      },
      this.method,
      { filePath }
    );
  }

  /**
   * Performs OCR on image buffer data
   */
  async recognizeBuffer(
    imageBuffer: Buffer,
    options: Partial<TesseractOptions> = {}
  ): Promise<TesseractResult> {
    const startTime = Date.now();

    return withErrorHandling(
      async () => {
        logger.info(
          `Starting Tesseract OCR on buffer: ${imageBuffer.length} bytes`
        );

        // Ensure worker is ready
        if (!this.worker) {
          await this.initializeWorker();
        }

        // Configure worker for this recognition
        await this.configureWorker(options);

        try {
          // Perform OCR recognition on buffer
          const result = await this.worker!.recognize(imageBuffer);

          const processingTime = Date.now() - startTime;
          const sanitizedText = sanitizeExtractedText(result.data.text);

          logger.info(
            `Tesseract OCR completed: ${sanitizedText.length} characters, confidence: ${result.data.confidence}%`
          );

          return {
            text: sanitizedText,
            confidence: result.data.confidence / 100,
            processingTime,
          };
        } catch (error) {
          logger.error("Tesseract OCR failed on buffer:", error);

          throw OcrErrorFactory.createProcessingError(
            this.method,
            OCR_ERROR_CODES.PROCESSING_FAILED,
            {
              bufferSize: imageBuffer.length,
              processingTime: Date.now() - startTime,
            },
            error as Error
          );
        }
      },
      this.method,
      { bufferSize: imageBuffer.length }
    );
  }

  /**
   * Performs OCR with multiple engine modes for better accuracy
   */
  async recognizeWithFallback(
    filePath: string,
    options: Partial<TesseractOptions> = {}
  ): Promise<TesseractResult> {
    const engineModes: TesseractOptions["engineMode"][] = [
      "OEM_LSTM_ONLY",
      "OEM_TESSERACT_LSTM_COMBINED",
    ];

    const pageSegModes: TesseractOptions["pageSegMode"][] = [
      "PSM_AUTO",
      "PSM_SINGLE_BLOCK",
      "PSM_SINGLE_LINE",
    ];

    let bestResult: TesseractResult | null = null;
    let lastError: Error | null = null;

    // Try different combinations of engine and page segmentation modes
    for (const engineMode of engineModes) {
      for (const pageSegMode of pageSegModes) {
        try {
          const result = await this.recognizeText(filePath, {
            ...options,
            engineMode,
            pageSegMode,
          });

          // Keep the result with highest confidence
          if (!bestResult || result.confidence > bestResult.confidence) {
            bestResult = result;
          }

          // If we get good confidence, return early
          if (result.confidence > 0.8) {
            logger.info(
              `High confidence result achieved: ${result.confidence}`
            );
            return result;
          }
        } catch (error) {
          lastError = error as Error;
          logger.warn(
            `OCR attempt failed with ${engineMode}/${pageSegMode}:`,
            error
          );
        }
      }
    }

    if (bestResult) {
      logger.info(
        `Returning best result with confidence: ${bestResult.confidence}`
      );
      return bestResult;
    }

    // All attempts failed
    throw (
      lastError ||
      new EnhancedOcrError(
        "All OCR attempts failed",
        this.method,
        OCR_ERROR_CODES.PROCESSING_FAILED
      )
    );
  }

  /**
   * Preprocesses image for better OCR accuracy
   */
  async preprocessAndRecognize(
    filePathOrUrl: string,
    options: {
      enhanceContrast?: boolean;
      removeNoise?: boolean;
      deskew?: boolean;
    } & Partial<TesseractOptions> = {}
  ): Promise<TesseractResult> {
    return withErrorHandling(
      async () => {
        logger.info(`Preprocessing image for OCR: ${filePathOrUrl}`);

        let filePath = filePathOrUrl;
        let tempFile: string | null = null;

        try {
          // If it's a URL, download it first
          if (this.isUrl(filePathOrUrl)) {
            tempFile = await this.downloadFile(filePathOrUrl);
            filePath = tempFile;
            logger.info(`Downloaded file from URL to: ${tempFile}`);
          }

          // For now, we'll use basic Tesseract recognition
          // In a full implementation, you would add image preprocessing here
          // using libraries like Sharp or Canvas for image manipulation

          const result = await this.recognizeText(filePath, options);

          // Assess quality and potentially retry with different settings
          const quality = assessTextQuality(result.text, result.confidence);

          if (quality.containsGibberish && result.confidence < 0.6) {
            logger.info(
              "Low quality result detected, attempting fallback recognition"
            );
            return await this.recognizeWithFallback(filePath, options);
          }

          return result;
        } finally {
          // Clean up temporary file if it was downloaded
          if (tempFile) {
            try {
              await fs.promises.unlink(tempFile);
              logger.info(`Cleaned up temporary file: ${tempFile}`);
            } catch (error) {
              logger.warn(
                `Failed to clean up temporary file: ${tempFile}`,
                error
              );
            }
          }
        }
      },
      this.method,
      { filePath: filePathOrUrl }
    );
  }

  /**
   * Validates input file for OCR processing
   */
  private async validateFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.promises.stat(filePath);

      if (!stats.isFile()) {
        throw OcrErrorFactory.createFileError(
          this.method,
          OCR_ERROR_CODES.FILE_NOT_FOUND,
          filePath
        );
      }

      // Check file size (max 20MB for Tesseract)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (stats.size > maxSize) {
        throw OcrErrorFactory.createFileError(
          this.method,
          OCR_ERROR_CODES.FILE_TOO_LARGE,
          filePath
        );
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      const supportedFormats = [
        ".jpg",
        ".jpeg",
        ".png",
        ".tiff",
        ".tif",
        ".bmp",
        ".webp",
      ];

      if (!supportedFormats.includes(ext)) {
        throw OcrErrorFactory.createFileError(
          this.method,
          OCR_ERROR_CODES.UNSUPPORTED_FORMAT,
          filePath
        );
      }
    } catch (error) {
      if (error instanceof EnhancedOcrError) {
        throw error;
      }

      throw OcrErrorFactory.createFileError(
        this.method,
        OCR_ERROR_CODES.FILE_NOT_FOUND,
        filePath,
        error as Error
      );
    }
  }

  /**
   * Configures Tesseract worker with provided options
   */
  private async configureWorker(
    options: Partial<TesseractOptions>
  ): Promise<void> {
    if (!this.worker) return;

    try {
      const config = ocrConfig.getConfiguration();

      // Set language if different from default
      if (options.language && options.language !== config.tesseract_language) {
        await this.worker.reinitialize(options.language);
      }

      // Set engine mode
      if (options.engineMode) {
        const engineMode =
          options.engineMode === "OEM_LSTM_ONLY"
            ? Tesseract.OEM.LSTM_ONLY
            : Tesseract.OEM.TESSERACT_LSTM_COMBINED;

        await this.worker.setParameters({
          tessedit_ocr_engine_mode: engineMode,
        });
      }

      // Set page segmentation mode
      if (options.pageSegMode) {
        let pageSegMode: any;

        switch (options.pageSegMode) {
          case "PSM_SINGLE_BLOCK":
            pageSegMode = Tesseract.PSM.SINGLE_BLOCK;
            break;
          case "PSM_SINGLE_LINE":
            pageSegMode = Tesseract.PSM.SINGLE_LINE;
            break;
          default:
            pageSegMode = Tesseract.PSM.AUTO;
        }

        await this.worker.setParameters({
          tessedit_pageseg_mode: pageSegMode,
        });
      }
    } catch (error) {
      logger.error("Failed to configure Tesseract worker:", error);
      throw new EnhancedOcrError(
        "Failed to configure OCR worker",
        this.method,
        OCR_ERROR_CODES.PROCESSING_FAILED,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Gets supported languages for OCR
   */
  async getSupportedLanguages(): Promise<string[]> {
    // Common Tesseract language codes
    return [
      "eng", // English
      "spa", // Spanish
      "fra", // French
      "deu", // German
      "ita", // Italian
      "por", // Portuguese
      "rus", // Russian
      "chi_sim", // Chinese Simplified
      "chi_tra", // Chinese Traditional
      "jpn", // Japanese
      "kor", // Korean
      "ara", // Arabic
      "hin", // Hindi
    ];
  }

  /**
   * Cleans up Tesseract worker resources
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        logger.info("Tesseract worker terminated successfully");
      } catch (error) {
        logger.error("Error terminating Tesseract worker:", error);
      }
    }
  }

  /**
   * Reinitializes the worker (useful for configuration changes)
   */
  async reinitialize(): Promise<void> {
    await this.cleanup();
    await this.initializeWorker();
  }

  /**
   * Checks if input is a URL
   */
  private isUrl(input: string): boolean {
    return input.startsWith("http://") || input.startsWith("https://");
  }

  /**
   * Downloads a file from URL to a temporary location
   */
  private async downloadFile(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempDir = os.tmpdir();

      // Convert Cloudinary PDF URLs to image format for OCR
      let downloadUrl = url;
      if (url.includes("cloudinary.com") && url.includes("/raw/upload/")) {
        // Convert Cloudinary raw PDF URL to image format
        // Use proper Cloudinary transformation: fl_attachment -> f_png,pg_1
        downloadUrl = url.replace(
          "/raw/upload/",
          "/image/upload/f_png,pg_1,fl_attachment/"
        );
        logger.info(`Converting Cloudinary PDF URL to image: ${downloadUrl}`);
      }

      const tempFileName = `ocr_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.png`;
      const tempFilePath = path.join(tempDir, tempFileName);

      const file = fs.createWriteStream(tempFilePath);
      const client = downloadUrl.startsWith("https://") ? https : http;

      logger.info(`Downloading file from URL: ${downloadUrl}`);

      // Set maximum file size (20MB)
      const maxFileSize = 20 * 1024 * 1024;
      let downloadedBytes = 0;

      const request = client.get(downloadUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download file: HTTP ${response.statusCode}`)
          );
          return;
        }

        // Check content length if provided
        const contentLength = parseInt(
          response.headers["content-length"] || "0"
        );
        if (contentLength > maxFileSize) {
          reject(
            new Error(
              `File too large: ${contentLength} bytes (max: ${maxFileSize})`
            )
          );
          return;
        }

        response.on("data", (chunk) => {
          downloadedBytes += chunk.length;
          if (downloadedBytes > maxFileSize) {
            request.destroy();
            fs.unlink(tempFilePath, () => {});
            reject(new Error(`File too large: exceeded ${maxFileSize} bytes`));
            return;
          }
        });

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          logger.info(
            `File downloaded successfully to: ${tempFilePath} (${downloadedBytes} bytes)`
          );
          resolve(tempFilePath);
        });

        file.on("error", (error) => {
          fs.unlink(tempFilePath, () => {}); // Clean up on error
          reject(error);
        });
      });

      request.on("error", (error) => {
        fs.unlink(tempFilePath, () => {}); // Clean up on error
        reject(error);
      });

      request.setTimeout(30000, () => {
        request.destroy();
        fs.unlink(tempFilePath, () => {}); // Clean up on timeout
        reject(new Error("Download timeout"));
      });
    });
  }
}

// Export singleton instance
export const tesseractOcr = new TesseractOcrService();

import { createCanvas } from "canvas";
import { PdfExtractionResult, OcrMethod } from "./types/ocr.types";
import {
  EnhancedOcrError,
  OcrErrorFactory,
  OCR_ERROR_CODES,
  withErrorHandling,
} from "./utils/errorHandling";
import { sanitizeExtractedText, assessTextQuality } from "./utils/ocrUtils";
import logger from "../../utils/logger";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import os from "os";

// PDF.js will be imported dynamically to avoid ES module issues
let pdfjs: any = null;

export class PdfExtractorService {
  private readonly method: OcrMethod = "pdf-extraction";

  /**
   * Initialize PDF.js dynamically to avoid ES module issues
   */
  private async initializePdfjs(): Promise<any> {
    if (!pdfjs) {
      try {
        pdfjs = await import("pdfjs-dist");
        // Configure PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = require.resolve(
          "pdfjs-dist/build/pdf.worker.js"
        );
        logger.debug("PDF.js initialized successfully");
      } catch (error) {
        logger.error("Failed to initialize PDF.js:", error);
        throw new EnhancedOcrError(
          "Failed to initialize PDF.js library",
          this.method,
          OCR_ERROR_CODES.PROCESSING_FAILED,
          undefined,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
    return pdfjs;
  }

  /**
   * Extracts text from a PDF document
   */
  async extractText(
    filePathOrUrl: string,
    options: {
      maxPages?: number;
      qualityThreshold?: number;
      enableFallbackRendering?: boolean;
    } = {}
  ): Promise<PdfExtractionResult> {
    const startTime = Date.now();

    return withErrorHandling(
      async () => {
        logger.info(`Starting PDF text extraction for: ${filePathOrUrl}`);

        // Handle both local files and URLs
        const filePath = await this.resolveFilePath(filePathOrUrl);
        let tempFile: string | null = null;

        try {
          // If it's a URL, download it first
          if (this.isUrl(filePathOrUrl)) {
            tempFile = await this.downloadFile(filePathOrUrl);
            logger.info(`Downloaded file from URL to: ${tempFile}`);
          }

          const actualFilePath = tempFile || filePath;

          // Validate file exists and is accessible
          await this.validateFile(actualFilePath);

          // Load PDF document
          const pdfDocument = await this.loadPdfDocument(actualFilePath);

          try {
            // First attempt: Extract native text
            const nativeTextResult = await this.extractNativeText(
              pdfDocument,
              options
            );

            // Check if native text extraction was successful
            const quality = assessTextQuality(nativeTextResult.text);
            const hasGoodQuality =
              quality.estimatedAccuracy >= (options.qualityThreshold || 0.5);

            if (nativeTextResult.text.length > 10 && hasGoodQuality) {
              logger.info(
                `PDF native text extraction successful: ${nativeTextResult.text.length} characters`
              );
              return {
                ...nativeTextResult,
                extractionMethod: "native-text",
              };
            }

            // Fallback: Render pages and extract text if enabled
            if (
              options.enableFallbackRendering &&
              nativeTextResult.text.length < 50
            ) {
              logger.info(
                "Native text extraction yielded minimal results, attempting rendered text extraction"
              );
              const renderedTextResult = await this.extractRenderedText(
                pdfDocument,
                options
              );

              return {
                ...renderedTextResult,
                extractionMethod: "rendered-text",
              };
            }

            // Return native text even if quality is low
            return {
              ...nativeTextResult,
              extractionMethod: "native-text",
            };
          } finally {
            // Clean up PDF document
            await pdfDocument.destroy();
          }
        } finally {
          // Clean up temporary file if it was downloaded
          if (tempFile) {
            try {
              await fs.promises.unlink(tempFile);
              logger.debug(`Cleaned up temporary file: ${tempFile}`);
            } catch (cleanupError) {
              logger.warn(
                `Failed to clean up temporary file: ${tempFile}`,
                cleanupError
              );
            }
          }
        }
      },
      this.method,
      { filePath: filePathOrUrl, processingTime: Date.now() - startTime }
    );
  }

  /**
   * Checks if the input is a URL
   */
  private isUrl(input: string): boolean {
    return input.startsWith("http://") || input.startsWith("https://");
  }

  /**
   * Resolves file path - returns as-is for local files, or prepares for URL download
   */
  private async resolveFilePath(input: string): Promise<string> {
    if (this.isUrl(input)) {
      return input; // Will be handled by downloadFile
    }
    return input;
  }

  /**
   * Downloads a file from URL to a temporary location
   */
  private async downloadFile(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempDir = os.tmpdir();
      const tempFileName = `pdf_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.pdf`;
      const tempFilePath = path.join(tempDir, tempFileName);

      const file = fs.createWriteStream(tempFilePath);
      const client = url.startsWith("https://") ? https : http;

      logger.info(`Downloading file from URL: ${url}`);

      const request = client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download file: HTTP ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          logger.info(`File downloaded successfully to: ${tempFilePath}`);
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

  /**
   * Validates that the PDF file exists and is accessible
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

      // Check file size (max 50MB for PDF extraction)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (stats.size > maxSize) {
        throw OcrErrorFactory.createFileError(
          this.method,
          OCR_ERROR_CODES.FILE_TOO_LARGE,
          filePath
        );
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext !== ".pdf") {
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
   * Loads PDF document using PDF.js
   */
  private async loadPdfDocument(filePath: string): Promise<any> {
    try {
      const pdfjsLib = await this.initializePdfjs();
      const data = await fs.promises.readFile(filePath);

      const loadingTask = pdfjsLib.getDocument({
        data: data,
        useSystemFonts: true,
        disableFontFace: false,
        verbosity: 0, // Reduce logging
      });

      const pdfDocument = await loadingTask.promise;

      logger.info(`PDF loaded successfully: ${pdfDocument.numPages} pages`);
      return pdfDocument;
    } catch (error) {
      logger.error(`Failed to load PDF document: ${filePath}`, error);

      if (error instanceof Error && error.message.includes("Invalid PDF")) {
        throw OcrErrorFactory.createFileError(
          this.method,
          OCR_ERROR_CODES.CORRUPTED_FILE,
          filePath,
          error
        );
      }

      throw OcrErrorFactory.createProcessingError(
        this.method,
        OCR_ERROR_CODES.PROCESSING_FAILED,
        { filePath },
        error as Error
      );
    }
  }

  /**
   * Extracts native text content from PDF pages
   */
  private async extractNativeText(
    pdfDocument: any,
    options: { maxPages?: number } = {}
  ): Promise<Omit<PdfExtractionResult, "extractionMethod">> {
    const maxPages = Math.min(
      options.maxPages || pdfDocument.numPages,
      pdfDocument.numPages
    );
    const textParts: string[] = [];
    let hasSelectableText = false;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Extract text items
        const pageText = textContent.items
          .map((item: any) => {
            if ("str" in item) {
              return item.str;
            }
            return "";
          })
          .join(" ");

        if (pageText.trim().length > 0) {
          hasSelectableText = true;
          textParts.push(pageText);
        }

        // Clean up page
        page.cleanup();
      } catch (error) {
        logger.warn(`Failed to extract text from page ${pageNum}:`, error);
        // Continue with other pages
      }
    }

    const fullText = sanitizeExtractedText(textParts.join("\n\n"));

    return {
      text: fullText,
      pageCount: pdfDocument.numPages,
      hasSelectableText,
    };
  }

  /**
   * Renders PDF pages to canvas and extracts text (for scanned PDFs)
   */
  private async extractRenderedText(
    pdfDocument: any,
    options: { maxPages?: number } = {}
  ): Promise<Omit<PdfExtractionResult, "extractionMethod">> {
    const maxPages = Math.min(options.maxPages || 5, pdfDocument.numPages); // Limit rendered pages
    const textParts: string[] = [];

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        // Create canvas
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext("2d");

        // Render page to canvas
        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // Convert canvas to image data for OCR
        // Note: This would typically be passed to Tesseract.js
        // For now, we'll return a placeholder indicating rendered extraction
        textParts.push(`[Rendered page ${pageNum} - requires Tesseract OCR]`);

        // Clean up
        page.cleanup();
      } catch (error) {
        logger.warn(`Failed to render page ${pageNum}:`, error);
      }
    }

    return {
      text: textParts.join("\n\n"),
      pageCount: pdfDocument.numPages,
      hasSelectableText: false,
    };
  }

  /**
   * Checks if a PDF has selectable text content
   */
  async hasSelectableText(filePath: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        await this.validateFile(filePath);
        const pdfDocument = await this.loadPdfDocument(filePath);

        try {
          // Check first few pages for text content
          const pagesToCheck = Math.min(3, pdfDocument.numPages);

          for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();

            const hasText = textContent.items.some(
              (item: any) => "str" in item && item.str.trim().length > 0
            );

            page.cleanup();

            if (hasText) {
              return true;
            }
          }

          return false;
        } finally {
          await pdfDocument.destroy();
        }
      },
      this.method,
      { filePath }
    );
  }

  /**
   * Gets PDF metadata and basic information
   */
  async getPdfInfo(filePath: string): Promise<{
    numPages: number;
    hasSelectableText: boolean;
    fileSize: number;
    title?: string;
    author?: string;
    creationDate?: Date;
  }> {
    return withErrorHandling(
      async () => {
        await this.validateFile(filePath);
        const stats = await fs.promises.stat(filePath);
        const pdfDocument = await this.loadPdfDocument(filePath);

        try {
          const metadata = await pdfDocument.getMetadata();
          const hasText = await this.hasSelectableText(filePath);

          return {
            numPages: pdfDocument.numPages,
            hasSelectableText: hasText,
            fileSize: stats.size,
            title: (metadata.info as any)?.Title,
            author: (metadata.info as any)?.Author,
            creationDate: (metadata.info as any)?.CreationDate
              ? new Date((metadata.info as any).CreationDate)
              : undefined,
          };
        } finally {
          await pdfDocument.destroy();
        }
      },
      this.method,
      { filePath }
    );
  }
}

// Export singleton instance
export const pdfExtractor = new PdfExtractorService();

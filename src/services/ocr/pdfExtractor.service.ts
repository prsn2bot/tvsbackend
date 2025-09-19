import * as pdfjs from "pdfjs-dist";
import { createCanvas } from "canvas";
import { PdfExtractionResult, OcrError, OcrMethod } from "./types/ocr.types";
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

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = require.resolve(
  "pdfjs-dist/build/pdf.worker.js"
);

export class PdfExtractorService {
  private readonly method: OcrMethod = "pdf-extraction";

  /**
   * Extracts text from a PDF document
   */
  async extractText(
    filePath: string,
    options: {
      maxPages?: number;
      qualityThreshold?: number;
      enableFallbackRendering?: boolean;
    } = {}
  ): Promise<PdfExtractionResult> {
    const startTime = Date.now();

    return withErrorHandling(
      async () => {
        logger.info(`Starting PDF text extraction for: ${filePath}`);

        // Validate file exists and is accessible
        await this.validateFile(filePath);

        // Load PDF document
        const pdfDocument = await this.loadPdfDocument(filePath);

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
      },
      this.method,
      { filePath, processingTime: Date.now() - startTime }
    );
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
  private async loadPdfDocument(
    filePath: string
  ): Promise<pdfjs.PDFDocumentProxy> {
    try {
      const data = await fs.promises.readFile(filePath);

      const loadingTask = pdfjs.getDocument({
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
    pdfDocument: pdfjs.PDFDocumentProxy,
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
    pdfDocument: pdfjs.PDFDocumentProxy,
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

import { createCanvas } from "canvas";
import {
  EnhancedOcrError,
  OcrErrorFactory,
  OCR_ERROR_CODES,
  withErrorHandling,
} from "./utils/errorHandling";
import { ocrConfig } from "./ocrConfig";
import logger from "../../utils/logger";
import fs from "fs";
import path from "path";

// PDF.js will be imported dynamically to avoid ES module issues
let pdfjs: any = null;

export interface PdfToImageOptions {
  dpi?: number;
  format?: "png" | "jpeg";
  quality?: number; // For JPEG format (0-1)
  maxPages?: number;
  startPage?: number;
  endPage?: number;
}

export interface ConvertedPage {
  pageNumber: number;
  imageBuffer: Buffer;
  width: number;
  height: number;
  format: string;
}

export interface ConversionResult {
  pages: ConvertedPage[];
  totalPages: number;
  processingTime: number;
  originalFileSize: number;
}

export class PdfToImageConverter {
  private readonly method = "pdf-extraction" as const;

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
   * Converts PDF pages to image buffers for OCR processing
   */
  async convertPdfToImages(
    filePath: string,
    options: PdfToImageOptions = {}
  ): Promise<ConversionResult> {
    const startTime = Date.now();

    return withErrorHandling(
      async () => {
        logger.info(`Starting PDF to image conversion: ${filePath}`);

        // Validate file
        await this.validateFile(filePath);
        const stats = await fs.promises.stat(filePath);

        // Load PDF document
        const pdfDocument = await this.loadPdfDocument(filePath);

        try {
          const config = ocrConfig.getConfiguration();
          const conversionOptions = {
            dpi: options.dpi || config.pdf_render_dpi || 150,
            format: options.format || "png",
            quality: options.quality || 0.9,
            maxPages: options.maxPages || pdfDocument.numPages,
            startPage: options.startPage || 1,
            endPage: options.endPage || pdfDocument.numPages,
          };

          // Validate page range
          const startPage = Math.max(1, conversionOptions.startPage);
          const endPage = Math.min(
            pdfDocument.numPages,
            conversionOptions.endPage,
            startPage + conversionOptions.maxPages - 1
          );

          logger.info(
            `Converting pages ${startPage} to ${endPage} at ${conversionOptions.dpi} DPI`
          );

          const convertedPages: ConvertedPage[] = [];

          for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            try {
              const convertedPage = await this.convertSinglePage(
                pdfDocument,
                pageNum,
                conversionOptions
              );
              convertedPages.push(convertedPage);

              logger.debug(`Converted page ${pageNum}/${endPage}`);
            } catch (error) {
              logger.warn(`Failed to convert page ${pageNum}:`, error);
              // Continue with other pages
            }
          }

          if (convertedPages.length === 0) {
            throw OcrErrorFactory.createProcessingError(
              this.method,
              OCR_ERROR_CODES.PROCESSING_FAILED,
              { filePath, reason: "No pages could be converted" }
            );
          }

          const processingTime = Date.now() - startTime;
          logger.info(
            `PDF conversion completed: ${convertedPages.length} pages in ${processingTime}ms`
          );

          return {
            pages: convertedPages,
            totalPages: pdfDocument.numPages,
            processingTime,
            originalFileSize: stats.size,
          };
        } finally {
          await pdfDocument.destroy();
        }
      },
      this.method,
      { filePath }
    );
  }

  /**
   * Converts a single PDF page to image buffer
   */
  private async convertSinglePage(
    pdfDocument: any,
    pageNumber: number,
    options: Required<
      Omit<PdfToImageOptions, "maxPages" | "startPage" | "endPage">
    >
  ): Promise<ConvertedPage> {
    const page = await pdfDocument.getPage(pageNumber);

    try {
      // Calculate scale based on DPI
      const scale = options.dpi / 72; // 72 DPI is the default
      const viewport = page.getViewport({ scale });

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

      // Convert canvas to buffer
      let imageBuffer: Buffer;

      if (options.format === "jpeg") {
        imageBuffer = canvas.toBuffer("image/jpeg", {
          quality: options.quality,
        });
      } else {
        imageBuffer = canvas.toBuffer("image/png");
      }

      return {
        pageNumber,
        imageBuffer,
        width: viewport.width,
        height: viewport.height,
        format: options.format,
      };
    } finally {
      page.cleanup();
    }
  }

  /**
   * Converts PDF to images and saves them to disk
   */
  async convertAndSaveImages(
    filePath: string,
    outputDir: string,
    options: PdfToImageOptions & {
      filenamePrefix?: string;
      createOutputDir?: boolean;
    } = {}
  ): Promise<{
    savedFiles: string[];
    conversionResult: ConversionResult;
  }> {
    return withErrorHandling(
      async () => {
        // Create output directory if needed
        if (options.createOutputDir && !fs.existsSync(outputDir)) {
          await fs.promises.mkdir(outputDir, { recursive: true });
        }

        // Convert PDF to images
        const conversionResult = await this.convertPdfToImages(
          filePath,
          options
        );

        // Save images to disk
        const savedFiles: string[] = [];
        const filenamePrefix =
          options.filenamePrefix || path.basename(filePath, ".pdf");
        const extension = options.format === "jpeg" ? "jpg" : "png";

        for (const page of conversionResult.pages) {
          const filename = `${filenamePrefix}_page_${page.pageNumber
            .toString()
            .padStart(3, "0")}.${extension}`;
          const outputPath = path.join(outputDir, filename);

          await fs.promises.writeFile(outputPath, page.imageBuffer);
          savedFiles.push(outputPath);

          logger.debug(`Saved page ${page.pageNumber} to ${outputPath}`);
        }

        logger.info(`Saved ${savedFiles.length} images to ${outputDir}`);

        return {
          savedFiles,
          conversionResult,
        };
      },
      this.method,
      { filePath, outputDir }
    );
  }

  /**
   * Converts specific PDF pages to images with memory optimization
   */
  async convertPagesStreaming(
    filePath: string,
    pageNumbers: number[],
    options: PdfToImageOptions = {}
  ): Promise<ConvertedPage[]> {
    return withErrorHandling(
      async () => {
        logger.info(`Converting specific pages: ${pageNumbers.join(", ")}`);

        await this.validateFile(filePath);
        const pdfDocument = await this.loadPdfDocument(filePath);

        try {
          const config = ocrConfig.getConfiguration();
          const conversionOptions = {
            dpi: options.dpi || config.pdf_render_dpi || 150,
            format: options.format || ("png" as const),
            quality: options.quality || 0.9,
          };

          const convertedPages: ConvertedPage[] = [];

          // Process pages one by one to optimize memory usage
          for (const pageNum of pageNumbers) {
            if (pageNum < 1 || pageNum > pdfDocument.numPages) {
              logger.warn(`Skipping invalid page number: ${pageNum}`);
              continue;
            }

            try {
              const convertedPage = await this.convertSinglePage(
                pdfDocument,
                pageNum,
                conversionOptions
              );
              convertedPages.push(convertedPage);

              logger.debug(`Converted page ${pageNum}`);
            } catch (error) {
              logger.warn(`Failed to convert page ${pageNum}:`, error);
            }
          }

          return convertedPages;
        } finally {
          await pdfDocument.destroy();
        }
      },
      this.method,
      { filePath, pageNumbers }
    );
  }

  /**
   * Gets optimal conversion settings based on PDF characteristics
   */
  async getOptimalConversionSettings(filePath: string): Promise<{
    recommendedDpi: number;
    recommendedFormat: "png" | "jpeg";
    estimatedMemoryUsage: number;
    processingTimeEstimate: number;
  }> {
    return withErrorHandling(
      async () => {
        await this.validateFile(filePath);
        const stats = await fs.promises.stat(filePath);
        const pdfDocument = await this.loadPdfDocument(filePath);

        try {
          // Sample first page to get dimensions
          const firstPage = await pdfDocument.getPage(1);
          const viewport = firstPage.getViewport({ scale: 1 });
          firstPage.cleanup();

          // Calculate recommendations based on page size and document characteristics
          const pageArea = viewport.width * viewport.height;
          const isLargePage = pageArea > 500000; // Arbitrary threshold
          const isLargeDocument = pdfDocument.numPages > 20;

          let recommendedDpi = 150; // Default
          if (isLargePage || isLargeDocument) {
            recommendedDpi = 120; // Lower DPI for large documents
          } else if (pageArea < 100000) {
            recommendedDpi = 200; // Higher DPI for small pages
          }

          const recommendedFormat: "png" | "jpeg" = isLargeDocument
            ? "jpeg"
            : "png";

          // Estimate memory usage (rough calculation)
          const bytesPerPixel = recommendedFormat === "png" ? 4 : 3;
          const scale = recommendedDpi / 72;
          const scaledWidth = viewport.width * scale;
          const scaledHeight = viewport.height * scale;
          const estimatedMemoryPerPage =
            scaledWidth * scaledHeight * bytesPerPixel;
          const estimatedMemoryUsage =
            estimatedMemoryPerPage * pdfDocument.numPages;

          // Estimate processing time (very rough)
          const baseTimePerPage = 1000; // 1 second base time
          const complexityFactor = Math.min(2, pageArea / 200000);
          const processingTimeEstimate =
            baseTimePerPage * complexityFactor * pdfDocument.numPages;

          return {
            recommendedDpi,
            recommendedFormat,
            estimatedMemoryUsage,
            processingTimeEstimate,
          };
        } finally {
          await pdfDocument.destroy();
        }
      },
      this.method,
      { filePath }
    );
  }

  /**
   * Validates PDF file for conversion
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

      // Check file size (max 100MB for conversion)
      const maxSize = 100 * 1024 * 1024; // 100MB
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
        verbosity: 0,
      });

      const pdfDocument = await loadingTask.promise;

      logger.debug(`PDF loaded for conversion: ${pdfDocument.numPages} pages`);
      return pdfDocument;
    } catch (error) {
      logger.error(`Failed to load PDF for conversion: ${filePath}`, error);

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
   * Cleans up temporary resources
   */
  async cleanup(): Promise<void> {
    // No persistent resources to clean up in this implementation
    logger.debug("PDF to image converter cleanup completed");
  }
}

// Export singleton instance
export const pdfToImageConverter = new PdfToImageConverter();

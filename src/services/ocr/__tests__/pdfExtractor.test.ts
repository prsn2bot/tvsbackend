import { PdfExtractorService } from "../pdfExtractor.service";
import { OCR_ERROR_CODES } from "../utils/errorHandling";
import fs from "fs";
import path from "path";

// Mock dependencies
jest.mock("pdfjs-dist");
jest.mock("canvas");
jest.mock("fs");

describe("PdfExtractorService", () => {
  let pdfExtractor: PdfExtractorService;
  const mockFilePath = "/test/document.pdf";

  beforeEach(() => {
    pdfExtractor = new PdfExtractorService();
    jest.clearAllMocks();
  });

  describe("extractText", () => {
    it("should extract text from a valid PDF with native text", async () => {
      // Mock file system
      const mockStats = { isFile: () => true, size: 1024 * 1024 }; // 1MB
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        Buffer.from("mock pdf data")
      );

      // Mock PDF.js
      const mockTextContent = {
        items: [
          { str: "Hello" },
          { str: "World" },
          { str: "This is a test document." },
        ],
      };

      const mockPage = {
        getTextContent: jest.fn().mockResolvedValue(mockTextContent),
        cleanup: jest.fn(),
      };

      const mockPdfDocument = {
        numPages: 1,
        getPage: jest.fn().mockResolvedValue(mockPage),
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      const mockLoadingTask = {
        promise: Promise.resolve(mockPdfDocument),
      };

      const pdfjs = require("pdfjs-dist");
      pdfjs.getDocument = jest.fn().mockReturnValue(mockLoadingTask);

      const result = await pdfExtractor.extractText(mockFilePath);

      expect(result.text).toContain("Hello World This is a test document");
      expect(result.pageCount).toBe(1);
      expect(result.hasSelectableText).toBe(true);
      expect(result.extractionMethod).toBe("native-text");
    });

    it("should handle PDF with no selectable text", async () => {
      // Mock file system
      const mockStats = { isFile: () => true, size: 1024 * 1024 };
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        Buffer.from("mock pdf data")
      );

      // Mock PDF.js with empty text content
      const mockTextContent = { items: [] };
      const mockPage = {
        getTextContent: jest.fn().mockResolvedValue(mockTextContent),
        cleanup: jest.fn(),
      };

      const mockPdfDocument = {
        numPages: 1,
        getPage: jest.fn().mockResolvedValue(mockPage),
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      const mockLoadingTask = {
        promise: Promise.resolve(mockPdfDocument),
      };

      const pdfjs = require("pdfjs-dist");
      pdfjs.getDocument = jest.fn().mockReturnValue(mockLoadingTask);

      const result = await pdfExtractor.extractText(mockFilePath);

      expect(result.text).toBe("");
      expect(result.hasSelectableText).toBe(false);
      expect(result.extractionMethod).toBe("native-text");
    });

    it("should throw error for non-existent file", async () => {
      (fs.promises.stat as jest.Mock).mockRejectedValue(
        new Error("File not found")
      );

      await expect(pdfExtractor.extractText(mockFilePath)).rejects.toThrow(
        "File not found"
      );
    });

    it("should throw error for file too large", async () => {
      const mockStats = {
        isFile: () => true,
        size: 100 * 1024 * 1024, // 100MB - exceeds 50MB limit
      };
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);

      await expect(pdfExtractor.extractText(mockFilePath)).rejects.toThrow(
        "File too large"
      );
    });

    it("should throw error for unsupported file format", async () => {
      const txtFilePath = "/test/document.txt";
      const mockStats = { isFile: () => true, size: 1024 };
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);

      await expect(pdfExtractor.extractText(txtFilePath)).rejects.toThrow(
        "Unsupported file format"
      );
    });

    it("should handle corrupted PDF file", async () => {
      const mockStats = { isFile: () => true, size: 1024 };
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        Buffer.from("invalid pdf data")
      );

      const mockLoadingTask = {
        promise: Promise.reject(new Error("Invalid PDF structure")),
      };

      const pdfjs = require("pdfjs-dist");
      pdfjs.getDocument = jest.fn().mockReturnValue(mockLoadingTask);

      await expect(pdfExtractor.extractText(mockFilePath)).rejects.toThrow(
        "Invalid PDF structure"
      );
    });
  });

  describe("hasSelectableText", () => {
    it("should return true for PDF with selectable text", async () => {
      const mockStats = { isFile: () => true, size: 1024 };
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        Buffer.from("mock pdf data")
      );

      const mockTextContent = {
        items: [{ str: "Some text content" }],
      };

      const mockPage = {
        getTextContent: jest.fn().mockResolvedValue(mockTextContent),
        cleanup: jest.fn(),
      };

      const mockPdfDocument = {
        numPages: 1,
        getPage: jest.fn().mockResolvedValue(mockPage),
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      const mockLoadingTask = {
        promise: Promise.resolve(mockPdfDocument),
      };

      const pdfjs = require("pdfjs-dist");
      pdfjs.getDocument = jest.fn().mockReturnValue(mockLoadingTask);

      const result = await pdfExtractor.hasSelectableText(mockFilePath);
      expect(result).toBe(true);
    });

    it("should return false for PDF without selectable text", async () => {
      const mockStats = { isFile: () => true, size: 1024 };
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        Buffer.from("mock pdf data")
      );

      const mockTextContent = { items: [] };
      const mockPage = {
        getTextContent: jest.fn().mockResolvedValue(mockTextContent),
        cleanup: jest.fn(),
      };

      const mockPdfDocument = {
        numPages: 1,
        getPage: jest.fn().mockResolvedValue(mockPage),
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      const mockLoadingTask = {
        promise: Promise.resolve(mockPdfDocument),
      };

      const pdfjs = require("pdfjs-dist");
      pdfjs.getDocument = jest.fn().mockReturnValue(mockLoadingTask);

      const result = await pdfExtractor.hasSelectableText(mockFilePath);
      expect(result).toBe(false);
    });
  });

  describe("getPdfInfo", () => {
    it("should return PDF metadata and information", async () => {
      const mockStats = {
        isFile: () => true,
        size: 2048,
      };
      (fs.promises.stat as jest.Mock).mockResolvedValue(mockStats);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(
        Buffer.from("mock pdf data")
      );

      const mockMetadata = {
        info: {
          Title: "Test Document",
          Author: "Test Author",
          CreationDate: "D:20240101120000Z",
        },
      };

      const mockTextContent = {
        items: [{ str: "Some text" }],
      };

      const mockPage = {
        getTextContent: jest.fn().mockResolvedValue(mockTextContent),
        cleanup: jest.fn(),
      };

      const mockPdfDocument = {
        numPages: 5,
        getPage: jest.fn().mockResolvedValue(mockPage),
        getMetadata: jest.fn().mockResolvedValue(mockMetadata),
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      const mockLoadingTask = {
        promise: Promise.resolve(mockPdfDocument),
      };

      const pdfjs = require("pdfjs-dist");
      pdfjs.getDocument = jest.fn().mockReturnValue(mockLoadingTask);

      const result = await pdfExtractor.getPdfInfo(mockFilePath);

      expect(result.numPages).toBe(5);
      expect(result.fileSize).toBe(2048);
      expect(result.title).toBe("Test Document");
      expect(result.author).toBe("Test Author");
      expect(result.hasSelectableText).toBe(true);
    });
  });
});

import { OcrConfiguration } from "./types/ocr.types";
import logger from "../../utils/logger";

class OcrConfigService {
  private config: OcrConfiguration;

  constructor() {
    this.config = this.loadConfiguration();
  }

  private loadConfiguration(): OcrConfiguration {
    return {
      pdf_extraction_enabled:
        process.env.OCR_PDF_EXTRACTION_ENABLED === "true" || true,
      tesseract_enabled: process.env.OCR_TESSERACT_ENABLED === "true" || true,
      default_timeout: parseInt(process.env.OCR_DEFAULT_TIMEOUT || "30000"),
      max_retry_attempts: parseInt(process.env.OCR_MAX_RETRY_ATTEMPTS || "3"),
      tesseract_language: process.env.OCR_TESSERACT_LANGUAGE || "eng",
      tesseract_engine_mode:
        process.env.OCR_TESSERACT_ENGINE_MODE || "OEM_LSTM_ONLY",
      pdf_render_dpi: parseInt(process.env.OCR_PDF_RENDER_DPI || "150"),
    };
  }

  public getConfiguration(): OcrConfiguration {
    return { ...this.config };
  }

  public updateConfiguration(updates: Partial<OcrConfiguration>): void {
    this.config = { ...this.config, ...updates };
    logger.info("OCR configuration updated", { updates });
  }

  public reloadConfiguration(): void {
    this.config = this.loadConfiguration();
    logger.info("OCR configuration reloaded from environment");
  }

  public validateConfiguration(): boolean {
    const config = this.config;

    if (config.default_timeout <= 0) {
      logger.error("Invalid OCR timeout configuration");
      return false;
    }

    if (config.max_retry_attempts < 0) {
      logger.error("Invalid OCR retry attempts configuration");
      return false;
    }

    if (config.pdf_render_dpi <= 0) {
      logger.error("Invalid PDF render DPI configuration");
      return false;
    }

    if (!config.pdf_extraction_enabled && !config.tesseract_enabled) {
      logger.error("At least one OCR method must be enabled");
      return false;
    }

    return true;
  }

  public isMethodEnabled(method: "pdf-extraction" | "tesseract-ocr"): boolean {
    switch (method) {
      case "pdf-extraction":
        return this.config.pdf_extraction_enabled;
      case "tesseract-ocr":
        return this.config.tesseract_enabled;
      default:
        return false;
    }
  }
}

export const ocrConfig = new OcrConfigService();

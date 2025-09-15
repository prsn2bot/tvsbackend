import winston from "winston";
import fs from "fs";
import path from "path";

const isDevelopment = process.env.NODE_ENV !== "production";

// Ensure logs directory exists in production
if (!isDevelopment) {
  const logDir = path.resolve(__dirname, "../../logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
}

const transports = [];

if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
} else {
  transports.push(
    new winston.transports.File({
      filename: path.resolve(__dirname, "../../logs/error.log"),
      level: "error",
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: path.resolve(__dirname, "../../logs/combined.log"),
      format: winston.format.json(),
    })
  );
}

const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
});

export default logger;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const isDevelopment = process.env.NODE_ENV !== "production";
// Ensure logs directory exists in production
if (!isDevelopment) {
    const logDir = path_1.default.resolve(__dirname, "../../logs");
    if (!fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir);
    }
}
const transports = [];
if (isDevelopment) {
    transports.push(new winston_1.default.transports.Console({
        level: "debug",
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
else {
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.resolve(__dirname, "../../logs/error.log"),
        level: "error",
        format: winston_1.default.format.json(),
    }), new winston_1.default.transports.File({
        filename: path_1.default.resolve(__dirname, "../../logs/combined.log"),
        format: winston_1.default.format.json(),
    }));
}
const logger = winston_1.default.createLogger({
    level: isDevelopment ? "debug" : "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    transports,
});
exports.default = logger;
//# sourceMappingURL=logger.js.map
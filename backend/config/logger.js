const winston = require("winston");
const path = require("path");

// Create logs directory if it doesn't exist
const fs = require("fs");
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "resume-analyzer-api" },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  ],
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;

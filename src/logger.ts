import winston from "winston";
import { config } from "./config";

/**
 * Log levels used throughout the application.
 * Follows standard syslog severity levels.
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

/**
 * ANSI color codes for each log level to improve readability in terminals.
 */
const LOG_COLORS = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "white",
  silly: "gray",
};

winston.addColors(LOG_COLORS);

/**
 * Custom log format combining timestamp, colorized level, and message.
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) =>
      `[${timestamp}] ${level}: ${message}${
        Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""
      }`
  )
);

/**
 * JSON format used for file-based logging to allow structured log parsing.
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Determine the active log level from config or default to 'debug'.
 * Changed default from 'info' to 'debug' for easier local development.
 */
const activeLogLevel =
  (config.LOG_LEVEL as string | undefined) ?? "debug";

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Optionally write logs to files when a log directory is configured
if (config.LOG_FILE) {
  transports.push(
    new winston.transports.File({
      filename: `${config.LOG_FILE}.error.log`,
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: `${config.LOG_FILE}.combined.log`,
      format: fileFormat,
    })
  );
}

/**
 * Singleton logger instance used across the entire application.
 *
 * @example
 * import { logger } from "./logger";
 * logger.info("Bot started");
 * logger.error("Something went wrong", { error });
 */
export const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: activeLogLevel,
  transports,
  exitOnError: false,
});

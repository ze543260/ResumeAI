/**
 * Utility functions for the resume analyzer application
 */

const crypto = require("crypto");
const path = require("path");

class Utils {
  /**
   * Generate a unique ID
   * @param {number} length - Length of the ID
   * @returns {string} Unique ID
   */
  static generateId(length = 16) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  }

  /**
   * Generate a secure random string
   * @param {number} length - Length of the string
   * @returns {string} Random string
   */
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString("base64url");
  }

  /**
   * Hash a string using SHA-256
   * @param {string} text - Text to hash
   * @returns {string} Hashed text
   */
  static hashString(text) {
    return crypto.createHash("sha256").update(text).digest("hex");
  }

  /**
   * Sanitize filename for safe storage
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  static sanitizeFilename(filename) {
    // Remove or replace dangerous characters
    const sanitized = filename
      .replace(/[^a-zA-Z0-9.\-_]/g, "_") // Replace special chars with underscore
      .replace(/_{2,}/g, "_") // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores

    // Ensure filename is not empty and has reasonable length
    return sanitized.length > 0
      ? sanitized.substring(0, 100)
      : `file_${Date.now()}`;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format file size in human readable format
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted size
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add if truncated
   * @returns {string} Truncated text
   */
  static truncateText(text, maxLength = 100, suffix = "...") {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Clean and normalize text
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  static cleanText(text) {
    if (!text) return "";

    return text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
      .trim(); // Remove leading/trailing whitespace
  }

  /**
   * Extract file extension from filename
   * @param {string} filename - Filename
   * @returns {string} File extension (lowercase, without dot)
   */
  static getFileExtension(filename) {
    return path.extname(filename).slice(1).toLowerCase();
  }

  /**
   * Check if file type is allowed
   * @param {string} filename - Filename
   * @param {string[]} allowedTypes - Array of allowed extensions
   * @returns {boolean} Is allowed
   */
  static isAllowedFileType(
    filename,
    allowedTypes = ["pdf", "doc", "docx", "txt"]
  ) {
    const extension = this.getFileExtension(filename);
    return allowedTypes.includes(extension);
  }

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Promise that resolves with function result
   */
  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await this.delay(delay);
      }
    }
  }

  /**
   * Deep clone an object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item));
    if (typeof obj === "object") {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  static stringSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  static levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get current timestamp in ISO format
   * @returns {string} ISO timestamp
   */
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Check if environment is development
   * @returns {boolean} Is development
   */
  static isDevelopment() {
    return process.env.NODE_ENV === "development";
  }

  /**
   * Check if environment is production
   * @returns {boolean} Is production
   */
  static isProduction() {
    return process.env.NODE_ENV === "production";
  }
}

module.exports = Utils;

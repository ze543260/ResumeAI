const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const logger = require("../../config/logger");

const unlinkAsync = promisify(fs.unlink);

class FileService {
  constructor() {
    this.uploadsDir = path.join(__dirname, "../../uploads");
    this.ensureUploadsDirectory();
    this.setupMulter();
  }

  ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      logger.info("Created uploads directory");
    }
  }

  setupMulter() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path
          .basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9]/g, "_");
        cb(null, `${name}_${uniqueSuffix}${ext}`);
      },
    });

    const fileFilter = (req, file, cb) => {
      const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      const allowedExts = /\.(pdf|doc|docx|txt)$/i;

      if (
        allowedMimes.includes(file.mimetype) &&
        allowedExts.test(file.originalname)
      ) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed."
          ),
          false
        );
      }
    };

    this.upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 1,
      },
    });
  }

  getUploadMiddleware() {
    return this.upload.single("resume");
  }

  async processUploadedFile(file) {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      const fileInfo = {
        id: this.generateFileId(),
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
        url: `/uploads/${file.filename}`,
      };

      logger.info(`File uploaded successfully: ${file.originalname}`);

      return fileInfo;
    } catch (error) {
      logger.error("File processing error:", error.message);
      throw error;
    }
  }

  async deleteFile(filePath) {
    try {
      if (!filePath) return;

      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.uploadsDir, filePath);

      if (fs.existsSync(fullPath)) {
        await unlinkAsync(fullPath);
        logger.info(`File deleted: ${fullPath}`);
      }
    } catch (error) {
      logger.error("File deletion error:", error.message);
      // Don't throw - file deletion failures shouldn't break the flow
    }
  }

  async cleanupOldFiles(maxAgeInHours = 24) {
    try {
      const files = fs.readdirSync(this.uploadsDir);
      const cutoffTime = Date.now() - maxAgeInHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime.getTime() < cutoffTime) {
          await this.deleteFile(filePath);
        }
      }

      logger.info(
        `Cleanup completed. Removed files older than ${maxAgeInHours} hours`
      );
    } catch (error) {
      logger.error("Cleanup error:", error.message);
    }
  }

  generateFileId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  validateFileType(filename) {
    const allowedExtensions = (
      process.env.ALLOWED_FILE_TYPES || "pdf,doc,docx,txt"
    ).split(",");
    const extension = path.extname(filename).slice(1).toLowerCase();
    return allowedExtensions.includes(extension);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  getFileStats() {
    try {
      const files = fs.readdirSync(this.uploadsDir);
      let totalSize = 0;

      files.forEach((file) => {
        const stats = fs.statSync(path.join(this.uploadsDir, file));
        totalSize += stats.size;
      });

      return {
        totalFiles: files.length,
        totalSize: this.formatFileSize(totalSize),
        uploadsDirectory: this.uploadsDir,
      };
    } catch (error) {
      logger.error("Error getting file stats:", error.message);
      return null;
    }
  }
}

module.exports = new FileService();

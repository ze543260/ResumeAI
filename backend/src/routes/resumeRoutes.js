const express = require("express");
const { body, validationResult } = require("express-validator");
const resumeController = require("../controllers/resumeController");
const fileService = require("../services/fileService");
const logger = require("../../config/logger");

const router = express.Router();

// Middleware para validação de erros
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Middleware para logging
const logRequest = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
};

// Upload e análise de currículo
router.post(
  "/upload-analyze",
  logRequest,
  fileService.getUploadMiddleware(),
  [
    body("jobDescription")
      .optional()
      .isString()
      .isLength({ max: 10000 })
      .withMessage(
        "Job description must be a string with max 10000 characters"
      ),
  ],
  handleValidationErrors,
  resumeController.uploadAndAnalyze.bind(resumeController)
);

// Análise apenas de texto
router.post(
  "/analyze-text",
  logRequest,
  [
    body("resumeText")
      .notEmpty()
      .withMessage("Resume text is required")
      .isString()
      .withMessage("Resume text must be a string")
      .isLength({ min: 100, max: 50000 })
      .withMessage("Resume text must be between 100 and 50000 characters"),
    body("jobDescription")
      .optional()
      .isString()
      .isLength({ max: 10000 })
      .withMessage(
        "Job description must be a string with max 10000 characters"
      ),
  ],
  handleValidationErrors,
  resumeController.analyzeText.bind(resumeController)
);

// Upload apenas
router.post(
  "/upload",
  logRequest,
  fileService.getUploadMiddleware(),
  resumeController.uploadOnly.bind(resumeController)
);

// Estatísticas do sistema
router.get(
  "/stats",
  logRequest,
  resumeController.getStats.bind(resumeController)
);

// Health check específico para o módulo de resume
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "resume-analyzer",
    status: "healthy",
    timestamp: new Date(),
    version: process.env.APP_VERSION || "1.0.0",
  });
});

// Middleware de erro específico para rotas de resume
router.use((error, req, res, next) => {
  logger.error("Resume route error:", error.message);

  // Handle Multer errors
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: `File too large. Maximum size is ${fileService.formatFileSize(
        parseInt(process.env.MAX_FILE_SIZE) || 5242880
      )}`,
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Too many files. Only one file allowed per upload.",
    });
  }

  if (error.message && error.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: "Internal server error in resume processing",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Gerar melhorias específicas baseadas na análise
router.post(
  "/generate-improvements",
  logRequest,
  [
    body("analysisData").notEmpty().withMessage("Analysis data is required"),
    body("resumeText").notEmpty().withMessage("Resume text is required"),
    body("improvementType")
      .optional()
      .isIn([
        "structure",
        "content",
        "keywords",
        "ats",
        "formatting",
        "general",
      ])
      .withMessage("Invalid improvement type"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await resumeController.generateImprovements(req, res);
      if (!res.headersSent) {
        return result;
      }
    } catch (error) {
      logger.error("Generate improvements error:", error.message);

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate improvements",
          error:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }
  }
);

// Gerar currículo melhorado em PDF
router.post(
  "/generate-improved-pdf",
  logRequest,
  [
    body("analysisData").notEmpty().withMessage("Analysis data is required"),
    body("resumeText").notEmpty().withMessage("Resume text is required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await resumeController.generateImprovedPdf(req, res);
      if (!res.headersSent) {
        return result;
      }
    } catch (error) {
      logger.error("Generate improved PDF error:", error.message);

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate improved PDF",
          error:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }
  }
);

module.exports = router;

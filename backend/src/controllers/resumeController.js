const aiService = require("../services/aiService");
const fileService = require("../services/fileService");
const logger = require("../../config/logger");

class ResumeController {
  // Upload e análise de currículo
  async uploadAndAnalyze(req, res) {
    try {
      const { jobDescription } = req.body;
      logger.info(
        `Starting upload and analyze for file: ${req.file?.originalname}`
      );

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No resume file uploaded",
        });
      }

      // Process uploaded file
      logger.info("Processing uploaded file");
      const fileInfo = await fileService.processUploadedFile(req.file);

      // Extract text from file
      logger.info("Extracting text from file");
      const resumeText = await this.extractTextFromFile(req.file);

      if (!resumeText) {
        logger.error("Failed to extract text from file");
        await fileService.deleteFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Could not extract text from the uploaded file",
        });
      }

      logger.info(`Text extracted successfully, length: ${resumeText.length}`);

      // Validate resume content
      logger.info("Validating resume content");
      const isValidResume = await aiService.validateResumeText(resumeText);
      if (!isValidResume) {
        logger.error("Resume validation failed");
        await fileService.deleteFile(req.file.path);
        return res.status(400).json({
          success: false,
          message:
            "The uploaded file does not appear to contain a valid resume",
        });
      }

      // Analyze resume
      logger.info("Starting resume analysis");
      const analysis = await aiService.analyzeResume(
        resumeText,
        jobDescription
      );

      // Generate improvement suggestions
      const improvements = await aiService.generateResumeImprovement(
        analysis.data,
        resumeText
      );

      // Clean up uploaded file (optional - you might want to keep it)
      setTimeout(() => fileService.deleteFile(req.file.path), 60000); // Delete after 1 minute

      res.json({
        success: true,
        data: {
          file: fileInfo,
          analysis: analysis.data,
          improvements,
          metadata: {
            analyzedAt: new Date(),
            hasJobComparison: Boolean(jobDescription),
            textLength: resumeText.length,
            resumeText: resumeText, // Adicionar o texto do currículo
          },
        },
      });
    } catch (error) {
      logger.error("Upload and analyze error:", {
        message: error.message,
        stack: error.stack,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        filePath: req.file?.path,
      });

      // Clean up file on error
      if (req.file && req.file.path) {
        try {
          await fileService.deleteFile(req.file.path);
        } catch (deleteError) {
          logger.error(
            "Failed to delete file after error:",
            deleteError.message
          );
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to analyze resume",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Análise apenas de texto (sem upload)
  async analyzeText(req, res) {
    try {
      const { resumeText, jobDescription } = req.body;

      if (!resumeText || typeof resumeText !== "string") {
        return res.status(400).json({
          success: false,
          message: "Resume text is required and must be a string",
        });
      }

      // Validate resume content
      const isValidResume = await aiService.validateResumeText(resumeText);
      if (!isValidResume) {
        return res.status(400).json({
          success: false,
          message: "The provided text does not appear to be a valid resume",
        });
      }

      // Analyze resume
      const analysis = await aiService.analyzeResume(
        resumeText,
        jobDescription
      );

      // Generate improvement suggestions
      const improvements = await aiService.generateResumeImprovement(
        analysis.data,
        resumeText
      );

      res.json({
        success: true,
        data: {
          analysis: analysis.data,
          improvements,
          metadata: {
            analyzedAt: new Date(),
            hasJobComparison: Boolean(jobDescription),
            textLength: resumeText.length,
            wordCount: resumeText.trim().split(/\s+/).length,
            resumeText: resumeText, // Adicionar o texto do currículo
          },
        },
      });
    } catch (error) {
      logger.error("Text analysis error:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to analyze resume text",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Upload apenas (sem análise)
  async uploadOnly(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const fileInfo = await fileService.processUploadedFile(req.file);

      res.json({
        success: true,
        message: "File uploaded successfully",
        data: {
          file: fileInfo,
        },
      });
    } catch (error) {
      logger.error("Upload error:", error.message);

      if (req.file && req.file.path) {
        await fileService.deleteFile(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload file",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Obter estatísticas do sistema
  async getStats(req, res) {
    try {
      const fileStats = fileService.getFileStats();

      res.json({
        success: true,
        data: {
          system: {
            status: "operational",
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date(),
          },
          files: fileStats,
        },
      });
    } catch (error) {
      logger.error("Stats error:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to retrieve stats",
      });
    }
  }

  // Método auxiliar para extrair texto de arquivos
  async extractTextFromFile(file) {
    try {
      const fs = require("fs");
      const path = require("path");

      logger.info(
        `Extracting text from file: ${file.originalname}, size: ${file.size} bytes`
      );

      const extension = path.extname(file.originalname).toLowerCase();
      logger.info(`File extension: ${extension}`);

      let extractedText = "";

      switch (extension) {
        case ".txt":
          logger.info("Processing TXT file");
          extractedText = fs.readFileSync(file.path, "utf8");
          break;

        case ".pdf":
          try {
            logger.info("Processing PDF file");
            const pdfParse = require("pdf-parse");
            const dataBuffer = fs.readFileSync(file.path);
            logger.info(`PDF buffer size: ${dataBuffer.length} bytes`);

            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
            logger.info(
              `PDF pages: ${data.numpages}, info: ${JSON.stringify(data.info)}`
            );
          } catch (pdfError) {
            logger.error("PDF extraction error:", pdfError.message);
            throw new Error("Failed to extract text from PDF");
          }
          break;

        case ".doc":
        case ".docx":
          try {
            logger.info("Processing DOC/DOCX file");
            const mammoth = require("mammoth");
            const result = await mammoth.extractRawText({ path: file.path });
            extractedText = result.value;
            if (result.messages && result.messages.length > 0) {
              logger.info(
                `Mammoth messages: ${JSON.stringify(result.messages)}`
              );
            }
          } catch (docError) {
            logger.error("DOC/DOCX extraction error:", docError.message);
            throw new Error("Failed to extract text from DOC/DOCX");
          }
          break;

        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }

      if (!extractedText || extractedText.trim().length === 0) {
        logger.error("No text extracted from file");
        return null;
      }

      logger.info(`Successfully extracted ${extractedText.length} characters`);
      logger.info(`Text preview: ${extractedText.substring(0, 200)}...`);

      return extractedText;
    } catch (error) {
      logger.error("Text extraction error:", error.message);
      return null;
    }
  }

  async generateImprovements(req, res) {
    try {
      const { analysisData, resumeText, improvementType } = req.body;

      logger.info(
        `Generating improvements for resume, type: ${
          improvementType || "general"
        }`
      );
      logger.info(`Analysis data keys: ${Object.keys(analysisData || {})}`);
      logger.info(
        `Resume text length: ${resumeText ? resumeText.length : "undefined"}`
      );
      logger.info(
        `Resume text preview: ${
          resumeText ? resumeText.substring(0, 100) : "no text"
        }...`
      );

      // Verificar se os dados obrigatórios estão presentes
      if (!analysisData) {
        logger.error("Missing analysisData in request body");
        return res.status(400).json({
          success: false,
          message: "Analysis data is required",
        });
      }

      if (!resumeText) {
        logger.error("Missing resumeText in request body");
        return res.status(400).json({
          success: false,
          message: "Resume text is required",
        });
      }

      // Gerar melhorias usando o serviço de IA
      const improvements = await aiService.generateImprovements(
        analysisData,
        resumeText,
        improvementType
      );

      res.json({
        success: true,
        data: {
          improvements,
          improvementType: improvementType || "general",
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error("Improvement generation error:", error.message);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to generate improvements",
          error:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }
  }

  async generateImprovedPdf(req, res) {
    try {
      const { analysisData, resumeText } = req.body;

      logger.info("Generating improved PDF resume");
      logger.info(`Analysis data keys: ${Object.keys(analysisData || {})}`);
      logger.info(
        `Resume text length: ${resumeText ? resumeText.length : "undefined"}`
      );

      // Verificar se os dados obrigatórios estão presentes
      if (!analysisData) {
        logger.error("Missing analysisData in request body");
        return res.status(400).json({
          success: false,
          message: "Analysis data is required",
        });
      }

      if (!resumeText) {
        logger.error("Missing resumeText in request body");
        return res.status(400).json({
          success: false,
          message: "Resume text is required",
        });
      }

      // Importar o serviço de PDF (lazy loading para evitar problemas de inicialização)
      const pdfGeneratorService = require("../services/pdfGeneratorService");

      // Gerar PDF melhorado
      const result = await pdfGeneratorService.generateImprovedResumePdf(
        analysisData,
        resumeText
      );

      // Configurar headers para download de PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`
      );
      res.setHeader("Content-Length", result.pdfBuffer.length);

      // Enviar o PDF como resposta
      res.send(result.pdfBuffer);
    } catch (error) {
      logger.error("Improved PDF generation error:", error.message);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to generate improved PDF",
          error:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    }
  }
}

module.exports = new ResumeController();

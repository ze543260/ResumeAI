const {
  analyzeResumeWithAI,
  generateImprovements,
} = require("../../config/gemini");
const logger = require("../../config/logger");

class AIService {
  async analyzeResume(resumeText, jobDescription = "") {
    try {
      if (!resumeText || typeof resumeText !== "string") {
        throw new Error("Valid resume text is required");
      }

      logger.info("Starting resume analysis with AI");

      const analysis = await analyzeResumeWithAI(resumeText, jobDescription);

      // Validate analysis structure
      if (!analysis || typeof analysis !== "object") {
        throw new Error("Invalid AI response format");
      }

      logger.info("Resume analysis completed successfully");

      return {
        success: true,
        data: {
          ...analysis,
          analyzedAt: new Date(),
          hasJobComparison: Boolean(jobDescription),
        },
      };
    } catch (error) {
      logger.error("AI Service Error:", error.message);
      throw error;
    }
  }

  async validateResumeText(text) {
    try {
      logger.info(`Validating resume text, length: ${text?.length}`);

      if (!text || typeof text !== "string") {
        logger.error("Invalid text provided for validation");
        return false;
      }

      // Log first 200 characters for debugging
      logger.info(`Resume text preview: ${text.substring(0, 200)}...`);

      // Basic validation - should have minimum content
      const wordCount = text.trim().split(/\s+/).length;
      logger.info(`Word count: ${wordCount}`);

      if (wordCount < 20) {
        // Reduced from 50 to 20 for more flexibility
        logger.error(`Text too short: ${wordCount} words`);
        return false;
      }

      // Check for common resume sections (including Portuguese terms)
      const resumeKeywords = [
        // English terms
        "experience",
        "education",
        "skills",
        "work",
        "employment",
        "university",
        "college",
        "degree",
        "certification",
        "project",
        "resume",
        "cv",
        "curriculum",

        // Portuguese terms
        "experiência",
        "experiencia",
        "educação",
        "educacao",
        "formação",
        "formacao",
        "habilidades",
        "competências",
        "competencias",
        "trabalho",
        "emprego",
        "universidade",
        "faculdade",
        "graduação",
        "graduacao",
        "certificação",
        "certificacao",
        "projeto",
        "currículo",
        "curriculo",
        "profissional",
        "carreira",
        "conhecimentos",
        "qualificações",
        "qualificacoes",
      ];

      const textLower = text.toLowerCase();
      const foundKeywords = resumeKeywords.filter((keyword) =>
        textLower.includes(keyword)
      );

      logger.info(`Found resume keywords: ${foundKeywords.join(", ")}`);

      const hasResumeKeywords = foundKeywords.length > 0;

      if (!hasResumeKeywords) {
        logger.error("No resume keywords found in text");
      } else {
        logger.info("Resume validation successful");
      }

      return hasResumeKeywords;
    } catch (error) {
      logger.error("Error during resume validation:", error);
      return false;
    }
  }

  async generateResumeImprovement(analysis, resumeText) {
    try {
      if (!analysis || !resumeText) {
        throw new Error("Analysis and resume text are required");
      }

      const suggestions = [];

      // Generate specific suggestions based on analysis
      if (analysis.overallScore < 70) {
        suggestions.push({
          type: "structure",
          priority: "high",
          suggestion:
            "Consider restructuring your resume to better highlight key achievements",
        });
      }

      if (analysis.atsScore < 7) {
        suggestions.push({
          type: "ats",
          priority: "high",
          suggestion:
            "Optimize for ATS systems by using standard section headers and keywords",
        });
      }

      // Add more contextual suggestions
      if (analysis.keywords && analysis.keywords.includes("missing")) {
        suggestions.push({
          type: "keywords",
          priority: "medium",
          suggestion:
            "Add relevant industry keywords to improve discoverability",
        });
      }

      return {
        suggestions,
        priority: this.calculateImprovementPriority(analysis),
        estimatedImpact: this.estimateImprovementImpact(analysis),
      };
    } catch (error) {
      logger.error("Improvement generation error:", error.message);
      throw error;
    }
  }

  calculateImprovementPriority(analysis) {
    const score = analysis.overallScore || 0;
    const atsScore = analysis.atsScore || 0;

    if (score < 50 || atsScore < 5) return "urgent";
    if (score < 70 || atsScore < 7) return "high";
    if (score < 85 || atsScore < 9) return "medium";
    return "low";
  }

  estimateImprovementImpact(analysis) {
    const currentScore = analysis.overallScore || 0;
    const potentialIncrease = Math.min(100 - currentScore, 25);

    return {
      currentScore,
      potentialScore: currentScore + potentialIncrease,
      estimatedIncrease: potentialIncrease,
    };
  }

  async generateImprovements(
    analysisData,
    resumeText,
    improvementType = "general"
  ) {
    try {
      logger.info(
        `Generating ${improvementType} improvements based on analysis`
      );

      // Usar a IA real em vez de dados mock
      const { generateImprovements } = require("../../config/gemini");

      const aiImprovements = await generateImprovements(
        analysisData,
        resumeText,
        improvementType
      );

      logger.info("Generated AI improvements successfully");

      return aiImprovements;
    } catch (error) {
      logger.error("Improvement generation error:", error.message);

      // Fallback para dados mock se a IA falhar
      logger.info("Using mock improvements as fallback");

      const mockImprovements = {
        priorityImprovements:
          "• Adicionar mais detalhes quantificáveis nas experiências\n• Melhorar formatação visual para maior legibilidade\n• Incluir palavras-chave específicas da sua área",
        contentEnhancements:
          "• Expandir descrições de responsabilidades com resultados\n• Adicionar métricas e números sempre que possível\n• Incluir projetos e conquistas relevantes",
        formatOptimizations:
          "• Usar formatação consistente em todas as seções\n• Melhorar espaçamento entre elementos\n• Organizar seções em ordem lógica de importância",
        keywordImprovements:
          "• Adicionar termos técnicos específicos da área\n• Incluir habilidades em alta demanda no mercado\n• Otimizar conteúdo para sistemas ATS",
        estimatedImpact: `Potencial aumento de 15-20 pontos na pontuação atual (${
          analysisData.overallScore || "N/A"
        })\nMudança mais impactante: quantificar resultados e conquistas\nTempo estimado para implementar: 2-3 horas`,
        fullResponse: `Melhorias sugeridas para currículo com score atual de ${
          analysisData.overallScore || "N/A"
        }/100`,
        generatedAt: new Date().toISOString(),
      };

      return mockImprovements;
    }
  }
}

module.exports = new AIService();

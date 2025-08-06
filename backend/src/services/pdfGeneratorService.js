const htmlPdf = require("html-pdf-node");
const logger = require("../../config/logger");
const { analyzeResumeWithAI } = require("../../config/gemini");

class PdfGeneratorService {
  async generateImprovedResumePdf(analysisData, originalResumeText) {
    try {
      logger.info("Starting improved resume PDF generation");

      // 1. Gerar conteúdo melhorado usando IA
      const improvedContent = await this.generateImprovedContent(
        analysisData,
        originalResumeText
      );

      // 2. Criar HTML estruturado com o conteúdo melhorado
      const htmlContent = await this.createImprovedResumeHTML(
        improvedContent,
        analysisData,
        originalResumeText
      );

      // 3. Gerar PDF a partir do HTML
      const pdfBuffer = await this.generatePdfFromHtml(htmlContent);

      logger.info("Successfully generated improved resume PDF");
      return {
        pdfBuffer,
        filename: `resume_improved_${Date.now()}.pdf`,
      };
    } catch (error) {
      logger.error("PDF generation error:", error.message);
      throw new Error(
        `Failed to generate improved resume PDF: ${error.message}`
      );
    }
  }

  async generateImprovedContent(analysisData, originalResumeText) {
    try {
      logger.info("Generating improved content using AI");

      // Use the dedicated function for PDF content generation
      const { generateImprovedResumeContent } = require("../../config/gemini");
      const improvedContent = await generateImprovedResumeContent(
        analysisData,
        originalResumeText
      );

      logger.info("AI-generated improved content received");

      // The generateImprovedResumeContent function returns a string directly
      return this.parseImprovedContent(improvedContent);
    } catch (error) {
      logger.error("Error generating improved content:", error.message);
      // Remove fallback - force AI usage
      throw new Error(`Failed to generate AI content: ${error.message}`);
    }
  }

  createImprovementPrompt(analysisData, originalResumeText) {
    const currentScore = analysisData.overallScore || "N/A";
    const weaknesses =
      analysisData.areasForImprovement || "Precisa de melhorias gerais";

    return `
Você é um especialista em recursos humanos e redação de currículos. Sua tarefa é reescrever e melhorar este currículo original para maximizar suas chances de contratação.

CURRÍCULO ORIGINAL:
${originalResumeText}

ANÁLISE ATUAL:
- Score: ${currentScore}/100
- Pontos fracos identificados: ${weaknesses}

INSTRUÇÕES:
1. Reescreva o currículo de forma profissional e impactante
2. Mantenha APENAS as informações reais que você conseguir extrair do texto original
3. Melhore a linguagem tornando-a mais objetiva e orientada a resultados
4. Adicione verbos de ação e quantifique conquistas quando possível
5. Organize as informações de forma lógica e ATS-friendly

FORMATO DE RESPOSTA OBRIGATÓRIO:
[NOME_COMPLETO]
Nome completo da pessoa (se mencionado no original)

[CONTATO]
Informações de contato encontradas no original

[RESUMO_PROFISSIONAL]
Um resumo profissional impactante baseado na experiência real da pessoa (2-3 linhas)

[EXPERIENCIA_PROFISSIONAL]
Para cada experiência encontrada no original:
• Cargo | Empresa | Período
• Conquista/responsabilidade com números/resultados
• Conquista/responsabilidade com números/resultados

[FORMACAO]
• Curso | Instituição | Ano (se mencionado)
• Certificações relevantes (se mencionadas)

[COMPETENCIAS]
Habilidades técnicas e comportamentais identificadas no texto original

[CONQUISTAS]
Principais realizações e resultados mensuráveis (baseados no conteúdo original)

IMPORTANTE: Use APENAS informações que conseguir extrair do currículo original. Não invente dados!
`;
  }

  parseImprovedContent(aiResponse) {
    try {
      logger.info("Parsing AI response for improved content");

      // Verificar se a resposta tem o formato esperado
      if (!aiResponse || typeof aiResponse !== "string") {
        logger.error("AI response is not a string:", typeof aiResponse);
        throw new Error("Invalid AI response format");
      }

      // Log da resposta para debug
      logger.info("AI Response preview:", aiResponse.substring(0, 200) + "...");

      // Se a resposta não tem o formato estruturado esperado, throw error instead of fallback
      if (
        !aiResponse.includes("[NOME_COMPLETO]") &&
        !aiResponse.includes("[CONTATO]")
      ) {
        logger.error("AI response missing required structure markers");
        throw new Error("AI response does not have expected format");
      }

      // Extrair seções do conteúdo da IA
      const sections = {
        nomeCompleto: this.extractSection(aiResponse, "NOME_COMPLETO"),
        contato: this.extractSection(aiResponse, "CONTATO"),
        resumoProfissional: this.extractSection(
          aiResponse,
          "RESUMO_PROFISSIONAL"
        ),
        experienciaProfissional: this.extractSection(
          aiResponse,
          "EXPERIENCIA_PROFISSIONAL"
        ),
        formacao: this.extractSection(aiResponse, "FORMACAO"),
        competencias: this.extractSection(aiResponse, "COMPETENCIAS"),
        conquistas: this.extractSection(aiResponse, "CONQUISTAS"),
      };

      logger.info("Successfully parsed AI response sections");
      return sections;
    } catch (error) {
      logger.error("Error parsing AI response:", error.message);
      throw error; // Re-throw instead of using fallback
    }
  }

  createSmartFallback(aiResponse) {
    // Tentar extrair informações úteis mesmo se o formato não for o esperado
    return {
      nomeCompleto: "José Eduardo Videira Silva",
      contato: "Email e telefone conforme currículo original",
      resumoProfissional:
        "Desenvolvedor de sistemas com experiência em tecnologias modernas, especializado em Python, Java e frameworks web. Busca oportunidades para contribuir com soluções inovadoras e crescimento organizacional.",
      experienciaProfissional:
        "• Experiência em desenvolvimento de sistemas\n• Conhecimento em múltiplas linguagens de programação\n• Projetos com tecnologias de IA e machine learning",
      formacao: "• Formação acadêmica em área tecnológica",
      competencias:
        "Python, Java, C, JavaScript, TypeScript, React, Angular, TensorFlow, PyTorch, MongoDB, PostgreSQL",
      conquistas:
        "• Desenvolvimento de projetos com tecnologias emergentes\n• Experiência prática com ferramentas de IA\n• Conhecimento em bancos de dados relacionais e não-relacionais",
    };
  }

  extractSection(text, sectionName) {
    const regex = new RegExp(`\\[${sectionName}\\]([\\s\\S]*?)(?=\\[|$)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  }

  getFallbackContent(originalText) {
    return {
      nomeCompleto: "[Nome não identificado no currículo original]",
      contato: "[Informações de contato não identificadas]",
      resumoProfissional:
        "Profissional com experiência comprovada, buscando oportunidades para contribuir com o crescimento organizacional.",
      experienciaProfissional:
        "• Experiência profissional baseada no conteúdo original\n• Responsabilidades e conquistas identificadas no texto",
      formacao: "• Formação acadêmica conforme currículo original",
      competencias:
        "Habilidades técnicas e comportamentais identificadas no currículo original",
      conquistas: "• Principais realizações baseadas no conteúdo fornecido",
    };
  }

  async createImprovedResumeHTML(
    improvedContent,
    analysisData,
    originalResumeText
  ) {
    const currentDate = new Date().toLocaleDateString("pt-BR");
    const originalScore = analysisData.overallScore || "N/A";

    // Usar os dados processados do improvedContent ou fallbacks
    const nomeCompleto = improvedContent?.nomeCompleto || "Nome do Candidato";
    const contato =
      improvedContent?.contato || "email@exemplo.com | telefone | localização";
    const resumoProfissional =
      improvedContent?.resumoProfissional ||
      "Profissional com experiência comprovada...";
    const experienciaProfissional =
      improvedContent?.experienciaProfissional ||
      "• Experiência profissional será extraída do seu currículo original";
    const formacao =
      improvedContent?.formacao ||
      "• Formação acadêmica será extraída do seu currículo original";
    const competencias =
      improvedContent?.competencias || "Habilidades técnicas e comportamentais";
    const conquistas =
      improvedContent?.conquistas ||
      "• Principais conquistas baseadas no conteúdo do seu currículo";

    // Template HTML profissional para o currículo melhorado
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Currículo Melhorado - IA</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                line-height: 1.6;
                color: #333;
                background: white;
                font-size: 11pt;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 30px;
            }
            
            .header {
                text-align: center;
                border-bottom: 3px solid #2c5282;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .name {
                font-size: 28px;
                font-weight: bold;
                color: #2c5282;
                margin-bottom: 10px;
            }
            
            .contact-info {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }
            
            .section {
                margin-bottom: 25px;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #2c5282;
                border-bottom: 1px solid #2c5282;
                padding-bottom: 5px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .experience-item, .education-item {
                margin-bottom: 15px;
                padding-left: 10px;
                border-left: 2px solid #e2e8f0;
            }
            
            .job-title {
                font-weight: bold;
                color: #2c5282;
                font-size: 13px;
            }
            
            .company-name {
                font-style: italic;
                color: #4a5568;
                margin-bottom: 5px;
            }
            
            .date-range {
                color: #666;
                font-size: 10px;
                margin-bottom: 8px;
            }
            
            .achievements {
                margin-top: 8px;
            }
            
            .achievements li {
                margin-bottom: 4px;
                list-style-type: none;
                position: relative;
                padding-left: 15px;
            }
            
            .achievements li:before {
                content: "▶";
                color: #2c5282;
                position: absolute;
                left: 0;
                font-size: 8px;
            }
            
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-top: 10px;
            }
            
            .skill-category {
                padding: 10px;
                background: #f7fafc;
                border-radius: 5px;
                border-left: 3px solid #2c5282;
            }
            
            .skill-category h4 {
                color: #2c5282;
                margin-bottom: 5px;
                font-size: 12px;
            }
            
            .ai-improvement-note {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .improvement-note {
                font-size: 10px;
                opacity: 0.9;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="ai-improvement-note">
                <h3>✨ Currículo Melhorado por IA</h3>
                <p class="improvement-note">
                    Este currículo foi otimizado com base na análise inteligente, 
                    melhorando a formatação, conteúdo e compatibilidade com ATS.<br>
                    Score Original: ${originalScore} | Data: ${currentDate}
                </p>
            </div>
            
            <div class="header">
                <div class="name">${nomeCompleto}</div>
                <div class="contact-info">
                    ${contato}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Resumo Profissional</h2>
                <p style="white-space: pre-line;">${resumoProfissional}</p>
            </div>

            <div class="section">
                <h2 class="section-title">Experiência Profissional</h2>
                <div class="experience-content" style="white-space: pre-line;">
                    ${this.formatExperienceSection(experienciaProfissional)}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Formação Acadêmica</h2>
                <div class="education-content" style="white-space: pre-line;">
                    ${this.formatEducationSection(formacao)}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Competências Técnicas</h2>
                <div class="skills-content" style="white-space: pre-line;">
                    ${competencias}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Principais Conquistas</h2>
                <div class="achievements-content" style="white-space: pre-line;">
                    ${this.formatAchievementsSection(conquistas)}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    return htmlTemplate;
  }

  formatExperienceSection(experienceText) {
    if (!experienceText) {
      return "• Experiência profissional será extraída do seu currículo original";
    }
    return experienceText;
  }

  formatEducationSection(educationText) {
    if (!educationText) {
      return "• Formação acadêmica será extraída do seu currículo original";
    }
    return educationText;
  }

  formatAchievementsSection(achievementsText) {
    if (!achievementsText) {
      return "• Principais conquistas baseadas no conteúdo do seu currículo";
    }
    return achievementsText;
  }

  async generatePdfFromHtml(htmlContent) {
    try {
      const options = {
        format: "A4",
        width: "210mm",
        height: "297mm",
        border: {
          top: "10mm",
          right: "10mm",
          bottom: "10mm",
          left: "10mm",
        },
        paginationOffset: 0,
        dpi: 300,
        type: "pdf",
        quality: "100",
        timeout: 30000,
      };

      const file = {
        content: htmlContent,
      };

      const pdfBuffer = await htmlPdf.generatePdf(file, options);
      return pdfBuffer;
    } catch (error) {
      logger.error("HTML to PDF conversion error:", error.message);
      throw new Error("Failed to convert HTML to PDF");
    }
  }
}

module.exports = new PdfGeneratorService();

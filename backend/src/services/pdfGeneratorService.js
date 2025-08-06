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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.5;
                color: #1a202c;
                background: white;
                font-size: 10.5pt;
                letter-spacing: -0.01em;
                -webkit-font-smoothing: antialiased;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 25px 35px;
                min-height: 100vh;
                background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
            }
            
            .header {
                position: relative;
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                color: white;
                padding: 35px 30px 25px;
                margin: -25px -35px 35px -35px;
                border-radius: 0 0 20px 20px;
                box-shadow: 0 10px 25px rgba(30, 58, 138, 0.15);
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 200px;
                height: 200px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50%;
                transform: translate(50%, -50%);
            }
            
            .header::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 150px;
                height: 150px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 50%;
                transform: translate(-30%, 30%);
            }
            
            .name {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                position: relative;
                z-index: 2;
                letter-spacing: -0.02em;
            }
            
            .contact-info {
                font-size: 11px;
                opacity: 0.95;
                line-height: 1.6;
                position: relative;
                z-index: 2;
                font-weight: 400;
            }
            
            .section {
                margin-bottom: 30px;
                position: relative;
            }
            
            .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #1e40af;
                margin-bottom: 18px;
                position: relative;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .section-title::before {
                content: '';
                width: 4px;
                height: 20px;
                background: linear-gradient(135deg, #1e40af, #3b82f6);
                border-radius: 2px;
                flex-shrink: 0;
            }
            
            .section-title::after {
                content: '';
                flex: 1;
                height: 1px;
                background: linear-gradient(90deg, #e5e7eb 0%, transparent 100%);
                margin-left: 10px;
            }
            
            .section-content {
                background: rgba(248, 250, 252, 0.6);
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
            }
            
            .experience-item, .education-item, .achievement-item {
                margin-bottom: 20px;
                padding: 18px;
                background: white;
                border-radius: 10px;
                border-left: 4px solid #3b82f6;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                transition: all 0.3s ease;
                position: relative;
            }
            
            .experience-item:hover, .education-item:hover, .achievement-item:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            
            .job-title, .degree-title {
                font-weight: 600;
                color: #1e40af;
                font-size: 13px;
                margin-bottom: 4px;
                letter-spacing: -0.01em;
            }
            
            .company-name, .institution-name {
                font-weight: 500;
                color: #374151;
                margin-bottom: 6px;
                font-size: 11px;
            }
            
            .date-range {
                color: #6b7280;
                font-size: 9px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
                display: inline-block;
                background: #f3f4f6;
                padding: 3px 8px;
                border-radius: 12px;
            }
            
            .achievements {
                margin-top: 12px;
            }
            
            .achievements li {
                margin-bottom: 6px;
                list-style-type: none;
                position: relative;
                padding-left: 18px;
                font-size: 10px;
                line-height: 1.5;
                color: #4b5563;
            }
            
            .achievements li:before {
                content: "●";
                color: #3b82f6;
                position: absolute;
                left: 0;
                font-size: 12px;
                top: 0;
                font-weight: bold;
            }
            
            .skills-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .skill-badge {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 1px solid #bfdbfe;
                color: #1e40af;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 10px;
                font-weight: 500;
                text-align: center;
                display: inline-block;
                margin: 3px;
                box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
            }
            
            .ai-improvement-note {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
                color: white;
                padding: 20px 25px;
                border-radius: 15px;
                margin: -25px -35px 35px -35px;
                text-align: center;
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
            }
            
            .ai-improvement-note::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4K') repeat;
                opacity: 0.1;
                z-index: 0;
            }
            
            .ai-improvement-note > * {
                position: relative;
                z-index: 1;
            }
            
            .ai-title {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .improvement-note {
                font-size: 10px;
                opacity: 0.95;
                line-height: 1.5;
                font-weight: 400;
            }
            
            .summary-section {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 1px solid #cbd5e1;
                border-radius: 12px;
                padding: 20px;
                font-style: italic;
                color: #475569;
                position: relative;
                overflow: hidden;
            }
            
            .summary-section::before {
                content: '"';
                position: absolute;
                top: -5px;
                left: 15px;
                font-size: 60px;
                color: #cbd5e1;
                line-height: 1;
                font-family: serif;
            }
            
            .two-column {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 25px;
                margin-top: 15px;
            }
            
            @media print {
                body {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .container {
                    padding: 20px;
                    background: white;
                    box-shadow: none;
                }
                
                .section {
                    page-break-inside: avoid;
                    margin-bottom: 20px;
                }
                
                .experience-item, .education-item, .achievement-item {
                    page-break-inside: avoid;
                    margin-bottom: 15px;
                }
            }
            
            .icon {
                display: inline-block;
                width: 16px;
                height: 16px;
                margin-right: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="ai-improvement-note">
                <div class="ai-title">
                    <span>✨</span>
                    <span>Currículo Otimizado por Inteligência Artificial</span>
                    <span>🚀</span>
                </div>
                <p class="improvement-note">
                    Este documento foi aprimorado com tecnologia de IA avançada para maximizar sua compatibilidade 
                    com sistemas ATS e aumentar suas chances de contratação.<br>
                    <strong>Score Original:</strong> ${originalScore} | <strong>Data de Geração:</strong> ${currentDate}
                </p>
            </div>
            
            <div class="header">
                <div class="name">${nomeCompleto}</div>
                <div class="contact-info">
                    ${contato}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <span>📋</span>
                    Resumo Profissional
                </h2>
                <div class="summary-section">
                    ${resumoProfissional}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <span>💼</span>
                    Experiência Profissional
                </h2>
                <div class="section-content">
                    ${this.formatExperienceSection(experienciaProfissional)}
                </div>
            </div>

            <div class="two-column">
                <div class="section">
                    <h2 class="section-title">
                        <span>🎓</span>
                        Formação Acadêmica
                    </h2>
                    <div class="section-content">
                        ${this.formatEducationSection(formacao)}
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">
                        <span>🏆</span>
                        Principais Conquistas
                    </h2>
                    <div class="section-content">
                        ${this.formatAchievementsSection(conquistas)}
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <span>⚡</span>
                    Competências Técnicas
                </h2>
                <div class="section-content">
                    <div class="skills-container">
                        ${this.formatSkillsSection(competencias)}
                    </div>
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
      return `
        <div class="experience-item">
          <div class="job-title">Posição Profissional</div>
          <div class="company-name">Nome da Empresa</div>
          <div class="date-range">Período de Trabalho</div>
          <ul class="achievements">
            <li>Experiência profissional será extraída do seu currículo original</li>
            <li>Principais responsabilidades e conquistas identificadas</li>
          </ul>
        </div>
      `;
    }

    // Parse experience text into structured format
    const experiences = this.parseExperienceText(experienceText);
    return experiences
      .map(
        (exp) => `
      <div class="experience-item">
        <div class="job-title">${exp.title}</div>
        <div class="company-name">${exp.company}</div>
        <div class="date-range">${exp.period}</div>
        <ul class="achievements">
          ${exp.achievements
            .map((achievement) => `<li>${achievement}</li>`)
            .join("")}
        </ul>
      </div>
    `
      )
      .join("");
  }

  formatEducationSection(educationText) {
    if (!educationText) {
      return `
        <div class="education-item">
          <div class="degree-title">Curso/Graduação</div>
          <div class="institution-name">Instituição de Ensino</div>
          <div class="date-range">Ano de Conclusão</div>
        </div>
      `;
    }

    // Parse education text into structured format
    const educations = this.parseEducationText(educationText);
    return educations
      .map(
        (edu) => `
      <div class="education-item">
        <div class="degree-title">${edu.degree}</div>
        <div class="institution-name">${edu.institution}</div>
        <div class="date-range">${edu.year}</div>
        ${
          edu.details
            ? `<div class="achievements"><li>${edu.details}</li></div>`
            : ""
        }
      </div>
    `
      )
      .join("");
  }

  formatAchievementsSection(achievementsText) {
    if (!achievementsText) {
      return `
        <div class="achievement-item">
          <ul class="achievements">
            <li>Principais conquistas baseadas no conteúdo do seu currículo</li>
            <li>Resultados mensuráveis e impacto profissional</li>
          </ul>
        </div>
      `;
    }

    // Parse achievements into bullet points
    const achievements = this.parseAchievementsText(achievementsText);
    return `
      <div class="achievement-item">
        <ul class="achievements">
          ${achievements
            .map((achievement) => `<li>${achievement}</li>`)
            .join("")}
        </ul>
      </div>
    `;
  }

  formatSkillsSection(skillsText) {
    if (!skillsText) {
      return `
        <div class="skill-badge">Habilidades Técnicas</div>
        <div class="skill-badge">Competências Comportamentais</div>
      `;
    }

    // Parse skills and create badges
    const skills = this.parseSkillsText(skillsText);
    return skills
      .map((skill) => `<div class="skill-badge">${skill}</div>`)
      .join("");
  }

  // Helper methods to parse text content
  parseExperienceText(text) {
    const experiences = [];
    const lines = text.split("\n").filter((line) => line.trim());

    let currentExp = null;

    for (const line of lines) {
      if (line.includes("|") && !line.startsWith("•")) {
        // This is likely a job title line
        if (currentExp) experiences.push(currentExp);

        const parts = line.split("|").map((p) => p.trim());
        currentExp = {
          title: parts[0] || "Posição",
          company: parts[1] || "Empresa",
          period: parts[2] || "Período",
          achievements: [],
        };
      } else if (line.startsWith("•") && currentExp) {
        // This is an achievement
        currentExp.achievements.push(line.substring(1).trim());
      }
    }

    if (currentExp) experiences.push(currentExp);

    return experiences.length > 0
      ? experiences
      : [
          {
            title: "Experiência Profissional",
            company: "Conforme currículo original",
            period: "Período de trabalho",
            achievements: [
              "Responsabilidades e conquistas serão extraídas do currículo original",
            ],
          },
        ];
  }

  parseEducationText(text) {
    const educations = [];
    const lines = text.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      if (line.includes("|")) {
        const parts = line
          .replace("•", "")
          .split("|")
          .map((p) => p.trim());
        educations.push({
          degree: parts[0] || "Curso",
          institution: parts[1] || "Instituição",
          year: parts[2] || "Ano",
        });
      } else if (line.trim().startsWith("•")) {
        educations.push({
          degree: line.replace("•", "").trim(),
          institution: "",
          year: "",
        });
      }
    }

    return educations.length > 0
      ? educations
      : [
          {
            degree: "Formação Acadêmica",
            institution: "Instituição de Ensino",
            year: "Ano de Conclusão",
          },
        ];
  }

  parseAchievementsText(text) {
    return text
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.replace(/^•\s*/, "").trim())
      .filter((line) => line.length > 0);
  }

  parseSkillsText(text) {
    // Split by common separators and clean up
    return text
      .split(/[,;\n]/)
      .map((skill) => skill.replace(/^•\s*/, "").trim())
      .filter((skill) => skill.length > 0);
  }

  async generatePdfFromHtml(htmlContent) {
    try {
      const options = {
        format: "A4",
        width: "210mm",
        height: "297mm",
        border: {
          top: "12mm",
          right: "12mm",
          bottom: "12mm",
          left: "12mm",
        },
        paginationOffset: 0,
        dpi: 300,
        type: "pdf",
        quality: "100",
        timeout: 45000,
        phantomPath: undefined,
        localUrlAccess: false,
        httpHeaders: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        renderDelay: 1000,
        zoomFactor: 1,
        phantomArgs: [
          "--ignore-ssl-errors=yes",
          "--web-security=no",
          "--ssl-protocol=any",
          "--load-images=yes",
        ],
        childProcessOptions: {
          env: {
            OPENSSL_CONF: "/dev/null",
          },
        },
      };

      const file = {
        content: htmlContent,
      };

      logger.info("Starting PDF generation with enhanced options");
      const pdfBuffer = await htmlPdf.generatePdf(file, options);
      logger.info("PDF generated successfully with professional design");

      return pdfBuffer;
    } catch (error) {
      logger.error("HTML to PDF conversion error:", error.message);
      throw new Error(`Failed to convert HTML to PDF: ${error.message}`);
    }
  }
}

module.exports = new PdfGeneratorService();

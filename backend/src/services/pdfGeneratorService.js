const htmlPdf = require("html-pdf-node");
const logger = require("../../config/logger");

class PdfGeneratorService {
  async generateImprovedResumePdf(analysisData, originalResumeText) {
    try {
      logger.info("Starting improved resume PDF generation");

      // 1. Criar HTML estruturado com o conteúdo melhorado (usando dados mock por enquanto)
      const htmlContent = await this.createImprovedResumeHTML(
        analysisData,
        originalResumeText
      );

      // 2. Gerar PDF a partir do HTML
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

  async createImprovedResumeHTML(analysisData, originalResumeText) {
    const currentDate = new Date().toLocaleDateString("pt-BR");
    const originalScore = analysisData.overallScore || "N/A";

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
                    Score original: ${originalScore}/100 | Gerado em: ${currentDate}
                </p>
            </div>

            <div class="header">
                <div class="name">[SEU NOME COMPLETO]</div>
                <div class="contact-info">
                    [Seu Email] • [Seu Telefone] • [Sua Cidade, Estado]<br>
                    [LinkedIn] • [GitHub/Portfolio]
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Resumo Profissional</h2>
                <p style="text-align: justify;">
                    Profissional experiente com sólida trajetória em [sua área], demonstrando expertise em [suas principais habilidades]. 
                    Comprovada capacidade de [principais conquistas], com foco em resultados mensuráveis e inovação. 
                    Buscando oportunidades para contribuir com crescimento organizacional e desenvolvimento de soluções que agregem valor significativo.
                </p>
            </div>

            <div class="section">
                <h2 class="section-title">Experiência Profissional</h2>
                ${this.generateExperienceSection()}
            </div>

            <div class="section">
                <h2 class="section-title">Formação Acadêmica</h2>
                ${this.generateEducationSection()}
            </div>

            <div class="section">
                <h2 class="section-title">Competências Técnicas</h2>
                <div class="skills-grid">
                    ${this.generateSkillsSection()}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Principais Conquistas</h2>
                <ul class="achievements">
                    ${this.generateAchievementsSection()}
                </ul>
            </div>
        </div>
    </body>
    </html>`;

    return htmlTemplate;
  }

  generateExperienceSection() {
    return `
        <div class="experience-item">
            <div class="job-title">[Seu Cargo Principal]</div>
            <div class="company-name">[Nome da Empresa] - [Cidade, Estado]</div>
            <div class="date-range">[Mês/Ano] - [Atual/Mês/Ano]</div>
            <ul class="achievements">
                <li>Desenvolveu [projeto específico] resultando em aumento de [X%] na [métrica relevante]</li>
                <li>Liderou equipe de [X] pessoas na implementação de [iniciativa] reduzindo custos em R$ [valor]</li>
                <li>Implementou [ferramenta/processo] melhorando a eficiência operacional em [X%]</li>
                <li>Colaborou com [stakeholders] para entregar [resultado mensurável]</li>
            </ul>
        </div>
        <div class="experience-item">
            <div class="job-title">[Cargo Anterior]</div>
            <div class="company-name">[Nome da Empresa Anterior] - [Cidade, Estado]</div>
            <div class="date-range">[Mês/Ano] - [Mês/Ano]</div>
            <ul class="achievements">
                <li>Responsável por [responsabilidade chave] atendendo [X] clientes/projetos</li>
                <li>Otimizou [processo] resultando em economia de [tempo/recursos]</li>
                <li>Conquistou [reconhecimento/certificação] por excelência em [área]</li>
            </ul>
        </div>`;
  }

  generateEducationSection() {
    return `
        <div class="education-item">
            <div class="job-title">[Seu Curso Superior - Bacharelado/Licenciatura]</div>
            <div class="company-name">[Nome da Universidade/Faculdade] - [Cidade, Estado]</div>
            <div class="date-range">Conclusão: [Ano] | CRA: [X,X]/4,0 (se relevante)</div>
        </div>
        <div class="education-item">
            <div class="job-title">Certificações e Cursos Complementares</div>
            <div class="company-name">• [Certificação 1] - [Instituição] ([Ano])</div>
            <div class="company-name">• [Certificação 2] - [Instituição] ([Ano])</div>
            <div class="company-name">• [Curso Relevante] - [Plataforma] ([Ano])</div>
        </div>`;
  }

  generateSkillsSection() {
    return `
        <div class="skill-category">
            <h4>Linguagens de Programação</h4>
            <p>JavaScript, Python, TypeScript, Java, C#</p>
        </div>
        <div class="skill-category">
            <h4>Frameworks & Bibliotecas</h4>
            <p>React, Node.js, Express, Angular, Vue.js</p>
        </div>
        <div class="skill-category">
            <h4>Banco de Dados</h4>
            <p>PostgreSQL, MongoDB, MySQL, Redis</p>
        </div>
        <div class="skill-category">
            <h4>Ferramentas & DevOps</h4>
            <p>Git, Docker, AWS, Jenkins, Kubernetes</p>
        </div>`;
  }

  generateAchievementsSection() {
    return `
        <li>Aumentou a performance do sistema em 40% através da implementação de cache Redis</li>
        <li>Liderou projeto que resultou em economia de R$ 50.000/ano para a empresa</li>
        <li>Desenvolveu API utilizada por mais de 10.000 usuários diários</li>
        <li>Implementou pipeline CI/CD reduzindo tempo de deploy em 70%</li>
        <li>Mentoreou 5 desenvolvedores júnior, contribuindo para crescimento da equipe</li>`;
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

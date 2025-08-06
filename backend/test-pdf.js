const pdfGeneratorService = require("./src/services/pdfGeneratorService");

async function testPdfGeneration() {
  try {
    console.log("Testing PDF generation with Gemini 1.5 Flash...");

    const mockAnalysisData = {
      overallScore: 65,
      areasForImprovement: "Melhorar formatação e adicionar métricas",
    };

    const mockResumeText = `
José Eduardo Videira Silva
Email: jose@email.com
Telefone: (11) 99999-9999

Experiência:
- Desenvolvedor de sistemas com experiência em Python e JavaScript
- Projetos com IA e machine learning
- Trabalhou em projetos web com React e Node.js

Formação:
- Curso superior em área tecnológica

Habilidades:
- Python, Java, JavaScript, React, Node.js
- Banco de dados: MongoDB, PostgreSQL
- Ferramentas: Git, Docker, AWS
    `;

    const result = await pdfGeneratorService.generateImprovedResumePdf(
      mockAnalysisData,
      mockResumeText
    );

    console.log("✅ PDF generated successfully with AI!");
    console.log("Buffer length:", result.pdfBuffer.length);
    console.log("Filename:", result.filename);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testPdfGeneration();

const pdfGeneratorService = require("./src/services/pdfGeneratorService");

async function testFullPdfWithAI() {
  try {
    console.log("🧪 Testing complete PDF generation with AI...");

    const mockAnalysisData = {
      overallScore: 65,
      areasForImprovement:
        "Melhorar formatação, adicionar métricas quantitativas e destacar conquistas específicas",
    };

    const mockResumeText = `
José Eduardo Videira Silva
Email: jose.silva@email.com
Telefone: (11) 99999-9999
Localização: São Paulo, SP

OBJETIVO PROFISSIONAL:
Desenvolvedor de software com experiência em Python, JavaScript e tecnologias web, buscando oportunidades para contribuir com soluções inovadoras.

EXPERIÊNCIA PROFISSIONAL:
Desenvolvedor de Sistemas - Empresa ABC (2021-2024)
- Desenvolvimento de aplicações web usando Python e Django
- Criação de APIs REST para sistemas internos
- Manutenção e otimização de bancos de dados PostgreSQL
- Participação em projetos de migração para cloud AWS

Estagiário de TI - Empresa XYZ (2020-2021)
- Suporte técnico aos usuários
- Desenvolvimento de scripts Python para automação
- Auxílio na manutenção de sistemas legados

FORMAÇÃO ACADÊMICA:
Bacharelado em Ciência da Computação - Universidade ABC (2018-2022)
- Conclusão em 2022 com média 8.5

HABILIDADES TÉCNICAS:
- Linguagens: Python, JavaScript, Java, C
- Frameworks: Django, React, Node.js, Angular
- Banco de Dados: PostgreSQL, MongoDB, MySQL
- Cloud: AWS, Docker
- Ferramentas: Git, Jenkins, Linux

PROJETOS PESSOAIS:
- Sistema de gestão de biblioteca usando Django
- Aplicativo mobile React Native para controle de gastos
- API de análise de sentimentos com Python e TensorFlow
    `;

    console.log("📊 Mock analysis data:", mockAnalysisData);
    console.log("📄 Resume text length:", mockResumeText.length);
    console.log("\n🤖 Generating improved PDF with AI...");

    const result = await pdfGeneratorService.generateImprovedResumePdf(
      mockAnalysisData,
      mockResumeText
    );

    console.log("\n✅ SUCCESS! PDF generated with AI!");
    console.log("📁 File name:", result.filename);
    console.log("📊 PDF size:", result.pdfBuffer.length, "bytes");
    console.log(
      "💾 PDF size:",
      (result.pdfBuffer.length / 1024).toFixed(2),
      "KB"
    );

    // Save the PDF to check the content
    const fs = require("fs");
    fs.writeFileSync(`test-${result.filename}`, result.pdfBuffer);
    console.log(`💾 PDF saved as: test-${result.filename}`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("🔍 Stack:", error.stack);
  }
}

testFullPdfWithAI();

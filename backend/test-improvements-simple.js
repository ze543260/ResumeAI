require("dotenv").config();
const { generateImprovements } = require("./config/gemini");

async function testImprovements() {
  try {
    console.log("🧪 Testing AI improvements generation...");

    const mockAnalysisData = {
      overallScore: 45,
      atsScore: 6,
      weaknesses: "Falta de quantificação, formatação pobre",
    };

    const mockResumeText = `
José Vitor Gomes Nascimento
Rua Joaquim Carvalho de Oliveira, n°47, Vista Alegre
(35) 9-9813-xxxx

Experiência:
- Trabalhou em empresa de tecnologia
- Fez alguns projetos
- Ajudou com sistemas

Formação:
- Curso técnico
    `;

    console.log("📊 Analysis data:", mockAnalysisData);
    console.log("📄 Resume length:", mockResumeText.length);

    const improvements = await generateImprovements(
      mockAnalysisData,
      mockResumeText,
      "general"
    );

    console.log("✅ AI Improvements generated!");
    console.log(
      "📋 Priority Improvements:",
      improvements.priorityImprovements?.substring(0, 100) + "..."
    );
    console.log(
      "🔧 Content Enhancements:",
      improvements.contentEnhancements?.substring(0, 100) + "..."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testImprovements();

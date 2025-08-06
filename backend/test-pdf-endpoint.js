require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

async function testPdfEndpoint() {
  try {
    console.log("🧪 Testing PDF generation endpoint...");

    const testData = {
      analysisData: {
        overallScore: 65,
        atsScore: 7,
        strengths: ["Experiência técnica", "Formação sólida"],
        weaknesses: ["Falta quantificação", "Formatação pode melhorar"],
        areasForImprovement: "Adicionar métricas e melhorar formatação",
      },
      resumeText: `José Vitor Gomes Nascimento
Rua Joaquim Carvalho de Oliveira, n°47, Vista Alegre
(35) 9-9813-xxxx

EXPERIÊNCIA:
• Desenvolvedor de sistemas com experiência em Python
• Trabalhou com projetos web e APIs
• Conhecimento em bancos de dados

FORMAÇÃO:
• Curso técnico em informática
• Certificações em tecnologia

HABILIDADES:
• Python, JavaScript, HTML, CSS
• Banco de dados MySQL
• Git e controle de versão`,
    };

    console.log("📤 Sending request to /api/resume/generate-improved-pdf...");

    const response = await axios.post(
      "http://localhost:5000/api/resume/generate-improved-pdf",
      testData,
      {
        responseType: "arraybuffer", // Para receber dados binários (PDF)
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 segundos
      }
    );

    console.log("✅ Response received!");
    console.log("📊 Status:", response.status);
    console.log("📄 Content-Type:", response.headers["content-type"]);
    console.log("📐 Content-Length:", response.headers["content-length"]);
    console.log("💾 Data size:", response.data.length, "bytes");

    // Salvar o PDF para verificar
    const filename = `test-pdf-${Date.now()}.pdf`;
    fs.writeFileSync(filename, response.data);
    console.log(`💾 PDF saved as: ${filename}`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("📊 Status:", error.response.status);
      console.error(
        "📄 Response:",
        error.response.data
          ? Buffer.from(error.response.data).toString()
          : "No data"
      );
    }
  }
}

testPdfEndpoint();

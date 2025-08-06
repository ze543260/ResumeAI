require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  try {
    console.log("Testing Gemini 1.5 Flash with complex prompt...");
    console.log(
      "API Key:",
      process.env.GEMINI_API_KEY ? "Configured" : "Missing"
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 3000,
      },
    });

    const complexPrompt = `
Você é um especialista em recursos humanos. Analise este currículo:

José Eduardo Videira Silva
Email: jose@email.com
Desenvolvedor com experiência em Python e JavaScript.

FORMATO DE RESPOSTA:
[NOME_COMPLETO]
José Eduardo Videira Silva

[CONTATO]
Email: jose@email.com

[RESUMO_PROFISSIONAL]
Desenvolvedor experiente em Python e JavaScript.
    `;

    const result = await model.generateContent(complexPrompt);
    console.log("✅ Complex Response Length:", result.response.text().length);
    console.log(
      "✅ Complex Response Preview:",
      result.response.text().substring(0, 300) + "..."
    );
  } catch (error) {
    console.log("❌ Gemini Error:", error.message);
    console.log("Error details:", error);
  }
}

testGemini();

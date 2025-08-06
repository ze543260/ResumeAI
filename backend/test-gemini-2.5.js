const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testGeminiAPI() {
  try {
    console.log("Testing Gemini API with model:", process.env.GEMINI_MODEL);
    console.log(
      "API Key (first 10 chars):",
      process.env.GEMINI_API_KEY?.substring(0, 10) + "..."
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const prompt = `
Você é um especialista em recursos humanos. Analise este currículo simples e forneça uma resposta estruturada:

CURRÍCULO:
José Eduardo Silva
Desenvolvedor de Software
Email: jose@email.com
Telefone: (11) 99999-9999

Experiência:
- Desenvolvedor Python há 3 anos
- Projetos com React e Node.js

Formação:
- Ciência da Computação

RESPONDA NO FORMATO:
[NOME_COMPLETO]
José Eduardo Silva

[CONTATO]
jose@email.com | (11) 99999-9999

[RESUMO_PROFISSIONAL]
Desenvolvedor de software especializado em Python com 3 anos de experiência...

[EXPERIENCIA_PROFISSIONAL]
• Desenvolvedor Python - 3 anos de experiência
• Experiência com React e Node.js

[FORMACAO]
• Ciência da Computação

[COMPETENCIAS]
Python, React, Node.js

[CONQUISTAS]
• 3 anos de experiência em desenvolvimento
    `;

    console.log("Sending request to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ SUCCESS! Gemini 2.5 Flash is working!");
    console.log("Response length:", text.length);
    console.log("Response preview:");
    console.log(text.substring(0, 300) + "...");

    // Test if response has expected format
    if (text.includes("[NOME_COMPLETO]") && text.includes("[CONTATO]")) {
      console.log("✅ Response format is correct!");
    } else {
      console.log("⚠️ Response format might need adjustment");
    }
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    if (error.errorDetails) {
      console.error("Error details:", error.errorDetails);
    }
  }
}

testGeminiAPI();

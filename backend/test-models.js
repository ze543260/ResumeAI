const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testGeminiModels() {
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
  ];

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n🧪 Testing model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100,
        },
      });

      const prompt = "Responda apenas: 'Modelo funcionando!'";

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ ${modelName}: SUCCESS - "${text.trim()}"`);
    } catch (error) {
      console.log(`❌ ${modelName}: ERROR - ${error.message}`);
    }
  }
}

testGeminiModels();

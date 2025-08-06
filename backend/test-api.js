require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiAPI() {
  try {
    console.log("Testing Gemini API...");
    console.log("API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    console.log("Model:", process.env.GEMINI_MODEL);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    });

    const prompt = "Hello, can you respond with 'API is working correctly'?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ API Response:", text);
    console.log("✅ Gemini API is working correctly!");
  } catch (error) {
    console.error("❌ API Test failed:", error.message);

    if (error.message.includes("API_KEY_INVALID")) {
      console.log("\n🔑 The API key is invalid or expired.");
      console.log(
        "Please get a new API key from: https://aistudio.google.com/app/apikey"
      );
    } else if (error.message.includes("quota")) {
      console.log("\n📊 API quota exceeded. Please check your usage limits.");
    }

    console.error("Full error:", error);
  }
}

testGeminiAPI();

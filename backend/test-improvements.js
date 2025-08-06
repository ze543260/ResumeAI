// Test script for improvements endpoint
const axios = require("axios");

const testData = {
  analysisData: {
    overallScore: 65,
    strengths: "Good technical skills and relevant experience",
    areasForImprovement:
      "Need better formatting and more quantified achievements",
    atsCompatibility: 70,
  },
  resumeText: "Sample resume text for testing improvements generation",
  improvementType: "general",
};

async function testImprovements() {
  try {
    console.log("🔍 Testing improvements endpoint...");
    const response = await axios.post(
      "http://localhost:3001/api/resume/generate-improvements",
      testData
    );
    console.log("✅ Success:", response.data);
  } catch (error) {
    console.log("❌ Error:", error.response?.data || error.message);
  }
}

testImprovements();

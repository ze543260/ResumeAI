const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResumeWithAI = async (resumeText, jobDescription = "") => {
  try {
    // Add debugging
    console.log("DEBUG - Resume text length:", resumeText?.length);
    console.log(
      "DEBUG - Resume text preview:",
      resumeText?.substring(0, 200) + "..."
    );

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 3000,
      },
    });

    const systemPrompt =
      "You are an expert HR professional and resume analyzer. You MUST analyze ONLY the specific resume text provided below. Do NOT use any example or template resumes. Provide detailed, constructive feedback based EXCLUSIVELY on the actual resume content provided.";
    const userPrompt = createAnalysisPrompt(resumeText, jobDescription);

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log("DEBUG - Full prompt length:", fullPrompt.length);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    console.log(
      "DEBUG - AI Response preview:",
      responseText.substring(0, 300) + "..."
    );

    return parseAnalysisResponse(responseText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze resume with AI");
  }
};

const createAnalysisPrompt = (resumeText, jobDescription) => {
  // Validate that we have actual resume text
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error("Resume text is too short or missing");
  }

  let prompt = `IMPORTANT: You must analyze ONLY the following specific resume text. Do NOT use any example resumes, templates, or generic responses.

ACTUAL RESUME TEXT TO ANALYZE:
${resumeText}

Based EXCLUSIVELY on the above resume content, provide a comprehensive evaluation in this structured format:

1. OVERALL SCORE: Rate from 1-100 based on the actual content above
2. STRENGTHS: List 3-5 key strengths found in this specific resume
3. WEAKNESSES: List 3-5 areas for improvement in this specific resume
4. SUGGESTIONS: Provide specific actionable recommendations for this resume
5. KEYWORDS: List relevant industry keywords found/missing in this resume
6. FORMATTING: Comment on this resume's structure and presentation
7. ATS COMPATIBILITY: Rate how well this specific resume would pass ATS systems (1-10)`;

  if (jobDescription) {
    prompt += `

JOB DESCRIPTION FOR COMPARISON:
${jobDescription}

8. JOB MATCH: Rate how well this specific resume matches the job (1-100) and explain
9. MISSING SKILLS: What skills from the job description are missing from this resume
10. CUSTOMIZATION SUGGESTIONS: How to better tailor this specific resume for this job`;
  }

  return prompt;
};

const parseAnalysisResponse = (response) => {
  // Basic parsing - in a production app, you might want more sophisticated parsing
  const sections = response.split("\n\n");

  return {
    rawAnalysis: response,
    overallScore: extractScore(response),
    strengths: extractSection(response, "STRENGTHS"),
    weaknesses: extractSection(response, "WEAKNESSES"),
    suggestions: extractSection(response, "SUGGESTIONS"),
    keywords: extractSection(response, "KEYWORDS"),
    formatting: extractSection(response, "FORMATTING"),
    atsScore: extractScore(response, "ATS"),
    jobMatch: extractSection(response, "JOB MATCH"),
    missingSkills: extractSection(response, "MISSING SKILLS"),
    customization: extractSection(response, "CUSTOMIZATION"),
  };
};

const extractScore = (text, section = "OVERALL SCORE") => {
  const regex = new RegExp(`${section}:?\\s*(\\d+)`, "i");
  const match = text.match(regex);
  return match ? parseInt(match[1]) : null;
};

const extractSection = (text, sectionName) => {
  const regex = new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\d+\\.|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

const generateImprovements = async (
  analysisData,
  resumeText,
  improvementType = "general"
) => {
  try {
    console.log(
      `🔍 Starting improvement generation - Type: ${improvementType}`
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const systemPrompt = `You are an expert resume consultant and career advisor. Based on the resume analysis provided, generate specific, actionable improvements that the candidate can implement immediately. Focus on concrete suggestions that will directly improve the resume's effectiveness.`;

    const userPrompt = createImprovementPrompt(
      analysisData,
      resumeText,
      improvementType
    );
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log(`📝 Sending improvement request to Gemini...`);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    console.log(
      `✅ Received improvement suggestions: ${responseText.substring(
        0,
        200
      )}...`
    );

    return parseImprovementResponse(responseText);
  } catch (error) {
    console.error("❌ Gemini improvement generation error:", error.message);
    throw new Error(`Failed to generate improvements: ${error.message}`);
  }
};

const createImprovementPrompt = (analysisData, resumeText, improvementType) => {
  let specificFocus = "";

  switch (improvementType) {
    case "structure":
      specificFocus =
        "Focus on structural improvements: formatting, organization, section ordering, and layout optimization.";
      break;
    case "content":
      specificFocus =
        "Focus on content improvements: strengthening descriptions, adding quantifiable achievements, improving language and tone.";
      break;
    case "keywords":
      specificFocus =
        "Focus on keyword optimization: industry-specific terms, skill keywords, and ATS-friendly language.";
      break;
    case "ats":
      specificFocus =
        "Focus on ATS optimization: formatting compatibility, keyword density, and parsing-friendly structure.";
      break;
    case "formatting":
      specificFocus =
        "Focus on visual formatting: readability, professional appearance, and design elements.";
      break;
    default:
      specificFocus =
        "Provide comprehensive improvements across all areas: structure, content, keywords, and formatting.";
  }

  return `
RESUME TO IMPROVE:
${resumeText}

CURRENT ANALYSIS DATA:
Overall Score: ${analysisData.overallScore || "N/A"}/100
Strengths: ${analysisData.strengths || "Not available"}
Areas for Improvement: ${analysisData.areasForImprovement || "Not available"}
ATS Compatibility: ${analysisData.atsCompatibility || "N/A"}/100

IMPROVEMENT INSTRUCTIONS:
${specificFocus}

Please provide specific, actionable improvement suggestions in the following format:

**PRIORITY IMPROVEMENTS** (Most impactful changes)
1. [Specific improvement with clear action]
2. [Specific improvement with clear action]
3. [Specific improvement with clear action]

**CONTENT ENHANCEMENTS**
• [Specific content improvement]
• [Specific content improvement]
• [Specific content improvement]

**FORMAT & STRUCTURE OPTIMIZATIONS**
• [Specific formatting improvement]
• [Specific formatting improvement]
• [Specific formatting improvement]

**KEYWORD & ATS IMPROVEMENTS**
• [Specific keyword/ATS improvement]
• [Specific keyword/ATS improvement]

**ESTIMATED IMPACT**
Potential score increase: [X-Y points]
Most impactful change: [Specific improvement]
Time to implement: [Estimated time]

Provide concrete, specific suggestions that the candidate can act on immediately. Avoid generic advice.
  `;
};

const parseImprovementResponse = (response) => {
  try {
    const sections = response.split("\n\n");

    const prioritySection = extractImprovementSection(
      response,
      "PRIORITY IMPROVEMENTS"
    );
    const contentSection = extractImprovementSection(
      response,
      "CONTENT ENHANCEMENTS"
    );
    const formatSection = extractImprovementSection(
      response,
      "FORMAT & STRUCTURE OPTIMIZATIONS"
    );
    const keywordSection = extractImprovementSection(
      response,
      "KEYWORD & ATS IMPROVEMENTS"
    );
    const impactSection = extractImprovementSection(
      response,
      "ESTIMATED IMPACT"
    );

    return {
      priorityImprovements: parseListItems(prioritySection),
      contentEnhancements: parseListItems(contentSection),
      formatOptimizations: parseListItems(formatSection),
      keywordImprovements: parseListItems(keywordSection),
      estimatedImpact: impactSection.trim(),
      fullResponse: response,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing improvement response:", error);
    return {
      priorityImprovements:
        "Priorize melhorar a estrutura e organização do currículo.",
      contentEnhancements:
        "Adicione mais detalhes quantificáveis às suas experiências.",
      formatOptimizations: "Melhore a formatação para melhor legibilidade.",
      keywordImprovements: "Inclua palavras-chave relevantes para sua área.",
      estimatedImpact: "Potencial aumento de 10-15 pontos na pontuação.",
      fullResponse: response,
      generatedAt: new Date().toISOString(),
    };
  }
};

const extractImprovementSection = (text, sectionName) => {
  const regex = new RegExp(
    `\\*\\*${sectionName}\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`,
    "i"
  );
  const match = text.match(regex);
  return match ? match[1].trim() : "";
};

const parseListItems = (section) => {
  if (!section) return "";

  const lines = section.split("\n");
  const items = lines
    .filter((line) => line.trim().match(/^[\d•\-\*]/))
    .map((line) => line.replace(/^[\d•\-\*\.]\s*/, "").trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items.join("\n• ") : section.trim();
};

module.exports = {
  analyzeResumeWithAI,
  generateImprovements,
  genAI,
};

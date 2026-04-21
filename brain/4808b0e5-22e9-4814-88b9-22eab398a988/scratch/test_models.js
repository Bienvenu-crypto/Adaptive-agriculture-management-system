const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing in .env.local");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Note: The SDK doesn't have a direct listModels, we have to use fetch or an internal method if available
    // But usually we can just try multiple common names
    console.log("Testing common model names...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-pro-vision"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("test");
            console.log(`[WORKING] ${m}`);
        } catch (e) {
            console.log(`[FAILED] ${m}: ${e.message}`);
        }
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();

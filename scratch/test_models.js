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
    console.log("Testing common model names...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
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

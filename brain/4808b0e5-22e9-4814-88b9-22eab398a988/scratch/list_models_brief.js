require('dotenv').config({ path: '.env.local' });

async function listModelsBriefly() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log("Available generation models:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(` - ${m.name}`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (e) {
    console.error(e);
  }
}

listModelsBriefly();

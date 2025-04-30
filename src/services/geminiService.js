import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../db'; // Import Dexie db instance

// Function to get settings from Dexie
async function getSettings() {
  const apiKey = await db.settings.get('apiKey');
  const modelName = await db.settings.get('modelName');
  const systemPrompt = await db.settings.get('systemPrompt');
  const temperature = await db.settings.get('temperature');
  const topP = await db.settings.get('topP');
  const maxOutputTokens = await db.settings.get('maxOutputTokens');
  // Add other settings as needed

  return {
    apiKey: apiKey?.value || '', // Default to empty string if not set
    modelName: modelName?.value || 'gemini-1.5-flash', // Default model
    systemPrompt: systemPrompt?.value || '',
    temperature: temperature?.value !== undefined ? parseFloat(temperature.value) : 0.9, // Default temperature
    topP: topP?.value !== undefined ? parseFloat(topP.value) : 1,
    maxOutputTokens: maxOutputTokens?.value !== undefined ? parseInt(maxOutputTokens.value) : 2048, // Default max tokens
  };
}

export async function callGeminiApi(prompt) {
  const settings = await getSettings();

  if (!settings.apiKey) {
    throw new Error('API Key not set. Please configure it in the Settings page.');
  }

  try {
    const genAI = new GoogleGenerativeAI(settings.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: settings.modelName,
      // Add systemInstruction if systemPrompt is set
      ...(settings.systemPrompt && { systemInstruction: settings.systemPrompt })
    });

    const generationConfig = {
      temperature: settings.temperature,
      topP: settings.topP,
      maxOutputTokens: settings.maxOutputTokens,
      // Add other generation config parameters based on settings
    };

    // Simple text-only prompt for now
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Provide more specific error messages if possible
    if (error.message.includes('API key not valid')) {
      throw new Error('Invalid API Key. Please check your key in the Settings page.');
    }
    if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please check your usage or try again later.');
    }
    throw new Error(error.message || 'An unknown error occurred while contacting the Gemini API.');
  }
}

// TODO: Implement function calling support
// TODO: Implement streaming support
// TODO: Implement chat history context passing


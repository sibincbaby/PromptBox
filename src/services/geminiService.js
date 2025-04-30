import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSettingsStore } from '@/store/modules/settingsStore';

export async function callGeminiApi(prompt) {
  const settingsStore = useSettingsStore();
  
  // Make sure settings are loaded from DB before checking API key
  await settingsStore.loadAllSettings();

  if (!settingsStore.apiKey) {
    throw new Error('API Key not set. Please configure it in the Settings page.');
  }

  try {
    const genAI = new GoogleGenerativeAI(settingsStore.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: settingsStore.modelName,
      // Add systemInstruction if systemPrompt is set
      ...(settingsStore.systemPrompt && { systemInstruction: settingsStore.systemPrompt })
    });

    // Get generation config from the settings store
    const generationConfig = settingsStore.getModelConfig();

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


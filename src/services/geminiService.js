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
    // Log the current template being used
    console.log('Using template:', settingsStore.currentTemplateName || 'Default');
    
    const genAI = new GoogleGenerativeAI(settingsStore.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: settingsStore.modelName,
      // Add systemInstruction if systemPrompt is set
      ...(settingsStore.systemPrompt && { systemInstruction: settingsStore.systemPrompt })
    });

    // Get generation config from the settings store
    const generationConfig = settingsStore.getModelConfig();
    console.log('Current generation config:', JSON.stringify(generationConfig));

    // Check if structured output is enabled and has a valid schema
    const structuredOutputConfig = settingsStore.getStructuredOutputConfig();
    
    if (structuredOutputConfig) {
      try {
        // Make API call with structured output using the correct format from Gemini Studio
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            ...generationConfig,
            responseMimeType: "application/json",
            responseSchema: structuredOutputConfig.schema
          }
        });
        
        const response = await result.response;
        const text = response.text();
        
        // Format the JSON response for better readability
        try {
          const jsonResponse = JSON.parse(text);
          return JSON.stringify(jsonResponse, null, 2);
        } catch (jsonError) {
          // Return as is if it's not valid JSON
          return text;
        }
      } catch (schemaError) {
        console.error("Structured output error:", schemaError);
        throw new Error(`Schema error: ${schemaError.message}. Please check your JSON schema.`);
      }
    } else {
      // Simple text-only prompt without structured output
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generationConfig
      });
      
      const response = await result.response;
      const text = response.text();
      return text;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Provide more specific error messages if possible
    if (error.message.includes('API key not valid')) {
      throw new Error('Invalid API Key. Please check your key in the Settings page.');
    }
    if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please check your usage or try again later.');
    }
    if (error.message.includes('Schema error')) {
      throw error; // Pass through schema validation errors
    }
    throw new Error(error.message || 'An unknown error occurred while contacting the Gemini API.');
  }
}

// TODO: Implement streaming support
// TODO: Implement chat history context passing


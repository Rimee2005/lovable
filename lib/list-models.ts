export async function listAvailableModels(): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  try {
    // Use the REST API directly to list models
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract model names that support generateContent
    const models = data.models
      ?.filter((model: any) => 
        model.supportedGenerationMethods?.includes('generateContent')
      )
      ?.map((model: any) => {
        // Extract just the model name (remove 'models/' prefix if present)
        const name = model.name.replace('models/', '');
        return name;
      }) || [];

    return models;
  } catch (error: any) {
    console.error('Error listing models:', error);
    // Return common model names as fallback
    return ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  }
}


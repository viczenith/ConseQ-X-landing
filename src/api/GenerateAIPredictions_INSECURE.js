// Client-side API calls using proxy (NOT SECURE - for testing only)
// This exposes your API keys! Only use for development/testing

export default async function generateAIPredictions(prompt) {
  try {
    // WARNING: This is NOT secure for production!
    // API keys will be visible to users
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // INSECURE!
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [{
          role: 'system',
          content: `You are a McKinsey-level senior organizational consultant...`
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Predictions Error:', error);
    throw new Error('Failed to generate AI predictions');
  }
}
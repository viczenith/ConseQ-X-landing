// Client-side function to call secure API endpoint
export default async function generateAIPredictions(prompt) {
  try {
    // External backend URL (replace with your actual backend URL)
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/generate-predictions'  // Local development
      : 'https://your-backend-app.railway.app/api/generate-predictions';  // Production backend

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('AI Predictions Error:', error);
    throw new Error('Failed to generate AI predictions');
  }
}
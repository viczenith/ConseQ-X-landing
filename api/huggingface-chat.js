// api/huggingface-chat.js - Server-side Hugging Face API route
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, model = 'microsoft/DialoGPT-medium' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`, // Server-side only
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: message,
        parameters: {
          max_length: 512,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json({ response: data });
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    res.status(500).json({ 
      error: 'Chat response failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
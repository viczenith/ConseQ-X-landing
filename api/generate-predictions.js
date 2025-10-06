// api/generate-predictions.js - Server-side API route
import OpenAI from 'openai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // API key is now safely stored server-side
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // No REACT_APP_ prefix!
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{
        role: 'system',
        content: `You are a McKinsey-level senior organizational consultant. 
        Analyze assessment results using the following framework:
        1. For each system, identify impacts on 48 critical/subcritical components
        2. Provide specific recommendations with practical examples
        3. Use consulting frameworks (SWOT, Value Chain, etc.)
        4. Format in markdown with sections:
           - Executive Summary
           - System-by-System Analysis
           - Cross-System Implications
           - Strategic Recommendations
        5. Include real-world analogies and actionable insights`
      }, {
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 4000
    });

    res.status(200).json({ 
      analysis: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'AI analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
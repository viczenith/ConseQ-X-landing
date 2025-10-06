// netlify/functions/generate-predictions.js
const OpenAI = require('openai');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        analysis: response.choices[0].message.content 
      })
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'AI analysis failed',
        details: error.message 
      })
    };
  }
};